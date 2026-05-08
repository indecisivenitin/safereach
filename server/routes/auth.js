// const express = require('express');
// const router = express.Router();
// const { register, login, getMe, updateProfile, updateFcmToken, registerValidation, loginValidation } = require('../controllers/authController');
// const { protect } = require('../middleware/auth');
// const validate = require('../middleware/validate');

// router.post('/register', validate(registerValidation), register);
// router.post('/login', validate(loginValidation), login);
// router.get('/me', protect, getMe);
// router.put('/me', protect, updateProfile);
// router.patch('/fcm-token', protect, updateFcmToken);

// module.exports = router;









const express = require('express');

const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  updateFcmToken,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const validate = require('../middleware/validate');

const upload = require('../middleware/upload');

// =========================
// Auth Routes
// =========================

// Register
router.post(
  '/register',
  upload.single('selfie'),
  validate(registerValidation),
  register
);

// Login
router.post(
  '/login',
  validate(loginValidation),
  login
);

// Current user
router.get(
  '/me',
  protect,
  getMe
);

// Update profile
router.put(
  '/me',
  protect,
  updateProfile
);

// Update FCM token
router.patch(
  '/fcm-token',
  protect,
  updateFcmToken
);

module.exports = router;