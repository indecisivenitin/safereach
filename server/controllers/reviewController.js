const Review = require('../models/Review');
const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Submit review
// @route   POST /api/reviews
const createReview = catchAsync(async (req, res, next) => {
  const { alertId, rating, comment, tags } = req.body;

  const alert = await Alert.findById(alertId);
  if (!alert) return next(new AppError('Alert not found', 404));
  if (alert.woman.toString() !== req.user.id.toString()) {
    return next(new AppError('You can only review your own alerts', 403));
  }
  if (alert.status !== 'resolved') return next(new AppError('Can only review resolved alerts', 400));
  if (alert.hasReview) return next(new AppError('This alert already has a review', 400));
  if (!alert.volunteer) return next(new AppError('No volunteer to review', 400));

  const review = await Review.create({
    alert: alertId,
    woman: req.user.id,
    volunteer: alert.volunteer,
    rating,
    comment: comment || '',
    tags: tags || [],
  });

  await Alert.findByIdAndUpdate(alertId, { hasReview: true });

  res.status(201).json({ success: true, review });
});

// @desc    Get reviews for a volunteer
// @route   GET /api/reviews/volunteer/:id
const getVolunteerReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ volunteer: req.params.id })
    .populate('woman', 'name')
    .sort('-createdAt')
    .limit(20);
  res.json({ success: true, reviews });
});

module.exports = { createReview, getVolunteerReviews };





// const Review = require('../models/Review');
// const Alert = require('../models/Alert');
// const User = require('../models/User');

// const AppError = require('../utils/AppError');
// const catchAsync = require('../utils/catchAsync');

// // =====================================================
// // CREATE REVIEW
// // @route POST /api/reviews
// // =====================================================

// const createReview = catchAsync(async (req, res, next) => {

//   const {
//     alertId,
//     rating,
//     comment,
//     tags
//   } = req.body;

//   // ---------------------------------------------------
//   // VALIDATION
//   // ---------------------------------------------------

//   const alert = await Alert.findById(alertId);

//   if (!alert) {

//     return next(
//       new AppError(
//         'Alert not found',
//         404
//       )
//     );
//   }

//   // Only woman who created alert can review
//   if (
//     alert.woman.toString() !==
//     req.user.id.toString()
//   ) {

//     return next(
//       new AppError(
//         'You can only review your own alerts',
//         403
//       )
//     );
//   }

//   // Alert must be resolved
//   if (alert.status !== 'resolved') {

//     return next(
//       new AppError(
//         'Can only review resolved alerts',
//         400
//       )
//     );
//   }

//   // Prevent duplicate reviews
//   if (alert.hasReview) {

//     return next(
//       new AppError(
//         'This alert already has a review',
//         400
//       )
//     );
//   }

//   // Volunteer must exist
//   if (!alert.volunteer) {

//     return next(
//       new AppError(
//         'No volunteer assigned to this alert',
//         400
//       )
//     );
//   }

//   // ---------------------------------------------------
//   // CREATE REVIEW
//   // ---------------------------------------------------

//   const review = await Review.create({

//     alert: alertId,

//     woman: req.user.id,

//     volunteer: alert.volunteer,

//     rating,

//     comment: comment || '',

//     tags: tags || []
//   });

//   // ---------------------------------------------------
//   // MARK ALERT REVIEWED
//   // ---------------------------------------------------

//   alert.hasReview = true;

//   await alert.save();

//   // ---------------------------------------------------
//   // RECALCULATE VOLUNTEER STATS
//   // ---------------------------------------------------

//   const volunteerReviews = await Review.find({
//     volunteer: alert.volunteer
//   });

//   const totalReviews = volunteerReviews.length;

//   const totalRating = volunteerReviews.reduce(
//     (sum, review) => sum + review.rating,
//     0
//   );

//   const averageRating =
//     totalReviews > 0
//       ? totalRating / totalReviews
//       : 0;

//   // Total resolved alerts helped
//   const totalAlertsHelped =
//     await Alert.countDocuments({
//       volunteer: alert.volunteer,
//       status: 'resolved'
//     });

//   // ---------------------------------------------------
//   // UPDATE VOLUNTEER PROFILE
//   // ---------------------------------------------------

//   await User.findByIdAndUpdate(
//     alert.volunteer,
//     {
//       averageRating:
//         Number(
//           averageRating.toFixed(1)
//         ),

//       totalReviews,

//       totalAlertsHelped
//     }
//   );

//   // ---------------------------------------------------
//   // SOCKET EVENT
//   // ---------------------------------------------------

//   const io = req.app.get('io');

//   io.to(`user:${alert.volunteer}`).emit(
//     'volunteer:stats-updated',
//     {
//       totalReviews,
//       averageRating:
//         Number(
//           averageRating.toFixed(1)
//         ),
//       totalAlertsHelped
//     }
//   );

//   // ---------------------------------------------------
//   // RESPONSE
//   // ---------------------------------------------------

//   res.status(201).json({

//     success: true,

//     message:
//       'Review submitted successfully',

//     review,

//     volunteerStats: {

//       totalReviews,

//       averageRating:
//         Number(
//           averageRating.toFixed(1)
//         ),

//       totalAlertsHelped
//     }
//   });
// });

// // =====================================================
// // GET VOLUNTEER REVIEWS
// // @route GET /api/reviews/volunteer/:id
// // =====================================================

// const getVolunteerReviews = catchAsync(async (req, res) => {

//   const reviews = await Review.find({

//     volunteer: req.params.id

//   })
//     .populate(
//       'woman',
//       'name'
//     )
//     .sort('-createdAt')
//     .limit(20);

//   res.json({

//     success: true,

//     count: reviews.length,

//     reviews
//   });
// });

// module.exports = {

//   createReview,

//   getVolunteerReviews
// };