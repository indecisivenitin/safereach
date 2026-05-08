// const User = require('../models/User');
// const Alert = require('../models/Alert');
// const AppError = require('../utils/AppError');
// const catchAsync = require('../utils/catchAsync');

// // @desc    Update volunteer live location
// // @route   PATCH /api/volunteers/location
// const updateLocation = catchAsync(async (req, res, next) => {
//   if (req.user.role !== 'volunteer') return next(new AppError('Only volunteers can update location', 403));
//   const { coordinates, address } = req.body;
//   if (!coordinates || coordinates.length !== 2) {
//     return next(new AppError('Valid coordinates [longitude, latitude] are required', 400));
//   }

//   await User.findByIdAndUpdate(req.user.id, {
//     location: { type: 'Point', coordinates, address: address || '', updatedAt: new Date() },
//     lastSeen: new Date(),
//   });

//   // If volunteer has active alert, broadcast location to the woman
//   const activeAlert = await Alert.findOne({ volunteer: req.user.id, status: 'active' });
//   if (activeAlert) {
//     const io = req.app.get('io');
//     io.to(`user:${activeAlert.woman}`).emit('volunteer-location-update', {
//       alertId: activeAlert._id,
//       coordinates,
//     });
//     // Store snapshot
//     await Alert.findByIdAndUpdate(activeAlert._id, {
//       $push: {
//         volunteerLocationHistory: {
//           $each: [{ coordinates, timestamp: new Date() }],
//           $slice: -50, // Keep last 50 snapshots
//         },
//       },
//     });
//   }

//   res.json({ success: true, message: 'Location updated' });
// });

// // @desc    Toggle volunteer active/inactive status
// // @route   PATCH /api/volunteers/status
// const toggleStatus = catchAsync(async (req, res, next) => {
//   if (req.user.role !== 'volunteer') return next(new AppError('Only volunteers can change status', 403));
//   const { isActive } = req.body;
//   if (typeof isActive !== 'boolean') return next(new AppError('isActive must be a boolean', 400));

//   await User.findByIdAndUpdate(req.user.id, { isActive });
//   const io = req.app.get('io');
//   io.to(`user:${req.user.id}`).emit('status-changed', { isActive });

//   res.json({ success: true, message: `You are now ${isActive ? 'active' : 'inactive'}`, isActive });
// });

// // @desc    Get volunteer stats
// // @route   GET /api/volunteers/stats
// const getStats = catchAsync(async (req, res) => {
//   const userId = req.user.id;
//   const [totalHelped, monthlyHelped, pendingAlerts] = await Promise.all([
//     Alert.countDocuments({ volunteer: userId, status: 'resolved' }),
//     Alert.countDocuments({
//       volunteer: userId,
//       status: 'resolved',
//       resolvedAt: { $gte: new Date(new Date().setDate(1)) },
//     }),
//     Alert.countDocuments({ status: 'pending' }),
//   ]);

//   const user = await User.findById(userId).select('averageRating totalReviews totalAlertsHelped');
//   res.json({
//     success: true,
//     stats: { totalHelped, monthlyHelped, pendingAlerts, averageRating: user.averageRating, totalReviews: user.totalReviews },
//   });
// });

// // @desc    Get leaderboard of top volunteers
// // @route   GET /api/volunteers/leaderboard
// const getLeaderboard = catchAsync(async (req, res) => {
//   const volunteers = await User.find({ role: 'volunteer', totalAlertsHelped: { $gt: 0 } })
//     .select('name averageRating totalAlertsHelped totalReviews')
//     .sort('-totalAlertsHelped -averageRating')
//     .limit(10);
//   res.json({ success: true, volunteers });
// });

// module.exports = { updateLocation, toggleStatus, getStats, getLeaderboard };








const User = require('../models/User');

exports.updateLocation = async (req, res) => {

  try {

    const { coordinates } = req.body;

    if (
      !coordinates ||
      coordinates.length !== 2
    ) {

      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          type: 'Point',
          coordinates
        },

        lastLocationUpdatedAt:
          new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Location updated'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
};