












const jwt = require('jsonwebtoken');
const { body } = require('express-validator');

const User = require('../models/User');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const { verifyWomanImage } = require('../services/nyckelService');
const { validateAadhaar } = require('../services/aadhaarService');

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;
  user.fcmToken = undefined;
  user.aadhaarNumber = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 }),

  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit mobile number'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain uppercase, lowercase, and a number'
    ),

  body('role')
    .isIn(['woman', 'volunteer'])
    .withMessage('Role must be woman or volunteer'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// @desc    Register user
// @route   POST /api/auth/register
const register = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    fcmToken,
    aadhaarNumber,
  } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(
      new AppError('Email already registered', 400)
    );
  }

  // =========================
  // Default woman verification values
  // =========================
  let isWomanVerified = false;
  let verificationConfidence = 0;
  let verificationStatus = 'not_required';

  // =========================
  // Default Aadhaar values
  // =========================
  let aadhaarVerified = false;
  let aadhaarStatus = 'not_required';
  let aadhaarLast4 = '';

  // =========================
  // Verify only woman accounts
  // =========================
  if (role === 'woman') {
    // Selfie required
    if (!req.file) {
      return next(
        new AppError(
          'Selfie image is required for woman verification',
          400
        )
      );
    }

    // Send image to Nyckel
    const prediction =
      await verifyWomanImage(
        req.file.buffer
      );

    console.log(
      'NYCKEL RESULT:',
      prediction
    );

    const label =
      prediction?.labelName
        ?.toLowerCase()
        ?.trim() || '';

    const confidence =
      prediction?.confidence || 0;

    const threshold = Number(
      process.env
        .NYCKEL_CONFIDENCE_THRESHOLD || 0.7
    );

    verificationConfidence =
      confidence;

    // =========================
    // Verification passed
    // =========================
    if (
      label === 'women' &&
      confidence >= threshold
    ) {
      isWomanVerified = true;

      verificationStatus =
        'verified';
    }

    // =========================
    // Verification failed
    // =========================
    else {
      verificationStatus =
        'rejected';

      return next(
        new AppError(
          'Woman verification failed. Please try again with a clear selfie.',
          403
        )
      );
    }
  }

  // =========================
  // Verify volunteer Aadhaar
  // =========================
  if (role === 'volunteer') {
    if (!aadhaarNumber) {
      return next(
        new AppError(
          'Aadhaar number is required for volunteers',
          400
        )
      );
    }

    // Basic format validation
    if (!/^[2-9]\d{11}$/.test(aadhaarNumber)) {
      return next(
        new AppError(
          'Please enter a valid Aadhaar number',
          400
        )
      );
    }

    // Check duplicate Aadhaar
    const existingAadhaar =
      await User.findOne({
        aadhaarNumber,
      });

    if (existingAadhaar) {
      return next(
        new AppError(
          'This Aadhaar number is already registered',
          400
        )
      );
    }

    // Validate via ApyHub
    const isValidAadhaar =
      await validateAadhaar(
        aadhaarNumber
      );

    if (!isValidAadhaar) {
      return next(
        new AppError(
          'Aadhaar verification failed',
          400
        )
      );
    }

    aadhaarVerified = true;
    aadhaarStatus = 'verified';

    aadhaarLast4 =
      aadhaarNumber.slice(-4);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,

    fcmToken: fcmToken || '',

    // Woman verification
    isWomanVerified,
    verificationConfidence,
    verificationStatus,

    // Aadhaar verification
    aadhaarNumber:
      role === 'volunteer'
        ? aadhaarNumber
        : '',

    aadhaarVerified,
    aadhaarStatus,
    aadhaarLast4,
  });

  sendToken(user, 201, res);
});

// @desc    Login
// @route   POST /api/auth/login
const login = catchAsync(async (req, res, next) => {
  const {
    email,
    password,
    fcmToken,
  } = req.body;

  const user = await User.findOne({ email })
    .select(
      '+password +fcmToken +aadhaarNumber'
    );

  if (
    !user ||
    !(await user.comparePassword(password))
  ) {
    return next(
      new AppError(
        'Invalid email or password',
        401
      )
    );
  }

  // Update FCM token if provided
  if (
    fcmToken &&
    fcmToken !== user.fcmToken
  ) {
    user.fcmToken = fcmToken;

    await user.save({
      validateBeforeSave: false,
    });
  }

  await user.updateLastSeen();

  sendToken(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @desc    Get current user
// @route   GET /api/auth/me
const getMe = catchAsync(async (req, res) => {

  const user =
    await User.findById(
      req.user.id
    ).select('+aadhaarNumber');

  res.json({
    success: true,
    user,
  });
});

// @desc    Update profile
// @route   PUT /api/auth/me
// @desc    Update profile
// @route   PUT /api/auth/me
const updateProfile = catchAsync(async (req, res) => {
  const {
    name,
    phone,
    emergencyContacts,

    // Volunteer profile fields
    bio,
    city,
    occupation,
    languages,
  } = req.body;

  const updateData = {
    name,
    phone,
    emergencyContacts,
  };

  // =========================
  // Volunteer-only profile data
  // =========================
  if (req.user.role === 'volunteer') {

    updateData.bio = bio || '';

    updateData.city = city || '';

    updateData.occupation =
      occupation || '';

    // Convert comma separated string
    // into array safely
    if (languages) {

      if (Array.isArray(languages)) {

        updateData.languages =
          languages;

      } else {

        updateData.languages =
          languages
            .split(',')
            .map((lang) =>
              lang.trim()
            )
            .filter(Boolean);
      }
    }
  }

  const user =
    await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

  res.json({
    success: true,
    user,
  });
});
// @desc    Update FCM token
// @route   PATCH /api/auth/fcm-token
const updateFcmToken = catchAsync(async (req, res) => {
  const { fcmToken } = req.body;

  await User.findByIdAndUpdate(
    req.user.id,
    { fcmToken }
  );

  res.json({
    success: true,
    message: 'FCM token updated',
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updateFcmToken,
  registerValidation,
  loginValidation,
};