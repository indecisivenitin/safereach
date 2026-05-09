// const Alert = require('../models/Alert');
// const User = require('../models/User');
// const AppError = require('../utils/AppError');
// const catchAsync = require('../utils/catchAsync');
// const { sendPushNotification } = require('../config/firebase');
// const logger = require('../utils/logger');

// const SEARCH_RADIUS_METERS = 10000; // 10km
// const MAX_VOLUNTEERS_TO_NOTIFY = 20;

// // =====================================================
// // FIND NEAREST ACTIVE VOLUNTEERS
// // Falls back to ALL active volunteers if none found nearby
// // =====================================================

// const findNearestVolunteers = async (coordinates, excludeIds = []) => {
//   // First try geo query
//   const geoResults = await User.aggregate([
//     {
//       $geoNear: {
//         near: { type: 'Point', coordinates },
//         distanceField: 'distance',
//         maxDistance: SEARCH_RADIUS_METERS,
//         spherical: true,
//         query: {
//           role: 'volunteer',
//           isActive: true,
//           _id: { $nin: excludeIds },
//         },
//       },
//     },
//     { $limit: MAX_VOLUNTEERS_TO_NOTIFY },
//     {
//       $project: {
//         name: 1,
//         phone: 1,
//         location: 1,
//         averageRating: 1,
//         fcmToken: 1,
//         distance: 1,
//       },
//     },
//   ]);

//   if (geoResults.length > 0) {
//     console.log(`✅ Geo query found ${geoResults.length} volunteers`);
//     return geoResults;
//   }

//   // FALLBACK: volunteer location may be [0,0] (never updated) — find all active volunteers
//   console.warn('⚠️ Geo query returned 0. Falling back to all active volunteers.');

//   const fallback = await User.find({
//     role: 'volunteer',
//     isActive: true,
//     _id: { $nin: excludeIds },
//   })
//     .limit(MAX_VOLUNTEERS_TO_NOTIFY)
//     .select('name phone location averageRating fcmToken')
//     .lean();

//   return fallback.map((v) => ({ ...v, distance: null }));
// };

// // =====================================================
// // CREATE ALERT
// // POST /api/alerts
// // =====================================================

// const createAlert = catchAsync(async (req, res, next) => {
//   const { message, coordinates, address } = req.body;

//   if (!coordinates || coordinates.length !== 2) {
//     return next(new AppError('Valid coordinates required', 400));
//   }

//   const [lng, lat] = coordinates;

//   if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
//     return next(new AppError('Invalid coordinates', 400));
//   }

//   const existingAlert = await Alert.findOne({
//     woman: req.user.id,
//     status: { $in: ['pending', 'active'] },
//   });

//   if (existingAlert) {
//     return next(new AppError('You already have an active alert', 400));
//   }

//   const alert = await Alert.create({
//     woman: req.user.id,
//     message: message || 'SOS! Emergency assistance needed.',
//     status: 'pending',
//     location: {
//       type: 'Point',
//       coordinates,
//       address: address || '',
//     },
//     createdAt: new Date(),
//   });

//   const volunteers = await findNearestVolunteers(coordinates);

//   alert.notifiedVolunteers = volunteers.map((v) => v._id);
//   await alert.save();

//   const populatedAlert = await Alert.findById(alert._id).populate('woman', 'name phone');

//   const io = req.app.get('io');

//   // DEBUG
//   const sockets = await io.in('active-volunteers').fetchSockets();
//   console.log('ACTIVE VOLUNTEERS IN ROOM:', sockets.length);
//   console.log('SOCKET IDS:', sockets.map((s) => s.id));
//   console.log('DB VOLUNTEERS FOUND:', volunteers.length);

//   for (const volunteer of volunteers) {
//     io.to(`user:${volunteer._id}`).emit('new-sos-alert', {
//       alert: populatedAlert,
//       distance: volunteer.distance ? Math.round(volunteer.distance) : null,
//       woman: {
//         id: populatedAlert.woman._id,
//         name: populatedAlert.woman.name,
//         phone: populatedAlert.woman.phone,
//       },
//       coordinates,
//       message: populatedAlert.message,
//       createdAt: populatedAlert.createdAt,
//     });

//     if (volunteer.fcmToken) {
//       await sendPushNotification({
//         token: volunteer.fcmToken,
//         title: '🆘 Emergency SOS Nearby',
//         body: `${populatedAlert.woman.name} needs help nearby`,
//         data: { alertId: alert._id.toString(), type: 'new-alert' },
//       });
//     }
//   }

//   logger.info(
//     `🚨 Alert created by ${populatedAlert.woman.name}. Notified ${volunteers.length} volunteers`
//   );

//   res.status(201).json({
//     success: true,
//     message: `SOS alert sent to ${volunteers.length} volunteer(s)`,
//     volunteersNotified: volunteers.length,
//     alert: populatedAlert,
//   });
// });

// // =====================================================
// // ACCEPT ALERT
// // PUT /api/alerts/:id/accept
// // =====================================================

// const acceptAlert = catchAsync(async (req, res, next) => {
//   const { responseMessage } = req.body;

//   const alert = await Alert.findById(req.params.id).populate('woman', 'name phone fcmToken');

//   if (!alert) return next(new AppError('Alert not found', 404));
//   if (alert.status !== 'pending') return next(new AppError('Alert already accepted', 400));

//   const volunteer = await User.findById(req.user.id).select('+aadhaarNumber');
//   if (!volunteer) return next(new AppError('Volunteer not found', 404));

//   const volunteerCoords = volunteer.location?.coordinates;
//   const alertCoords = alert.location.coordinates;
//   let distance = 0;

//   if (volunteerCoords && volunteerCoords.length === 2) {
//     distance = getDistanceMeters(volunteerCoords, alertCoords);
//   }

//   alert.status = 'active';
//   alert.volunteer = volunteer._id;
//   alert.acceptedAt = new Date();
//   alert.distanceToVolunteer = distance;
//   if (responseMessage) alert.responseMessage = responseMessage;

//   if (volunteerCoords && volunteerCoords.length === 2) {
//     alert.volunteerLocationHistory.push({ coordinates: volunteerCoords, timestamp: new Date() });
//   }

//   await alert.save();

//   const io = req.app.get('io');

//   io.to(`user:${alert.woman._id}`).emit('alert:accepted', {
//     alertId: alert._id,
//     status: 'active',
//     acceptedAt: alert.acceptedAt,
//     responseMessage: responseMessage || '',
//     distanceMeters: distance,
//     volunteer: {
//       _id: volunteer._id,
//       name: volunteer.name,
//       email: volunteer.email,
//       phone: volunteer.phone,
//       avatar: volunteer.avatar,
//       role: volunteer.role,
//       volunteerBio: volunteer.volunteerBio || '',
//       availabilityNote: volunteer.availabilityNote || '',
//       skills: volunteer.skills || [],
//       languages: volunteer.languages || [],
//       averageRating: volunteer.averageRating || 0,
//       totalAlertsHelped: volunteer.totalAlertsHelped || 0,
//       aadhaarVerified: volunteer.aadhaarVerified || false,
//       aadhaarLast4: volunteer.aadhaarLast4 || '',
//       isActive: volunteer.isActive,
//       location: {
//         coordinates: volunteer.location?.coordinates || [],
//         updatedAt: volunteer.location?.updatedAt || new Date(),
//       },
//     },
//     womanLocation: { coordinates: alert.location.coordinates },
//     volunteerLocation: { coordinates: volunteer.location?.coordinates || [] },
//   });

//   io.to(`user:${volunteer._id}`).emit('alert:accepted-by-you', {
//     alertId: alert._id,
//     status: 'active',
//     acceptedAt: alert.acceptedAt,
//     womanName: alert.woman.name,
//     womanPhone: alert.woman.phone,
//     womanLocation: { coordinates: alert.location.coordinates },
//   });

//   logger.info(`✅ Sent confirmation to ${volunteer.name}`);

//   io.sockets.sockets.forEach((s) => {
//     if (s.user && s.user._id.toString() === volunteer._id.toString()) {
//       s.join(`alert:${alert._id}`);
//       console.log(`✅ ${volunteer.name} joined alert:${alert._id}`);
//     }
//   });

//   io.to('active-volunteers').emit('alert:taken', { alertId: alert._id });

//   if (alert.woman.fcmToken) {
//     await sendPushNotification({
//       token: alert.woman.fcmToken,
//       title: '✅ Volunteer Accepted Your SOS',
//       body: `${volunteer.name} is coming to help you.`,
//       data: { alertId: alert._id.toString(), type: 'alert-accepted' },
//     });
//   }

//   logger.info(`✅ Alert ${alert._id} accepted by ${volunteer.name}`);

//   res.json({ success: true, message: 'Alert accepted successfully', alert });
// });

// // =====================================================
// // DECLINE ALERT
// // PUT /api/alerts/:id/decline
// // =====================================================

// const declineAlert = catchAsync(async (req, res, next) => {
//   const alert = await Alert.findById(req.params.id);

//   if (!alert) return next(new AppError('Alert not found', 404));
//   if (alert.status !== 'pending') return next(new AppError('Alert no longer pending', 400));

//   if (!alert.declinedBy.map((id) => id.toString()).includes(req.user.id)) {
//     alert.declinedBy.push(req.user.id);
//     await alert.save();
//   }

//   logger.info(`❌ Volunteer ${req.user.name} declined alert ${alert._id}`);

//   res.json({ success: true, message: 'Alert declined' });
// });

// // =====================================================
// // RESOLVE ALERT
// // PUT /api/alerts/:id/resolve
// // =====================================================

// const resolveAlert = catchAsync(async (req, res, next) => {
//   const alert = await Alert.findById(req.params.id);

//   if (!alert) return next(new AppError('Alert not found', 404));

//   if (alert.woman.toString() !== req.user.id.toString()) {
//     return next(new AppError('Unauthorized', 403));
//   }

//   if (alert.status !== 'active') return next(new AppError('Alert is not active', 400));

//   alert.status = 'resolved';
//   alert.resolvedAt = new Date();
//   await alert.save();

//   if (alert.volunteer) {
//     await User.findByIdAndUpdate(alert.volunteer, { $inc: { totalAlertsHelped: 1 } });
//   }

//   const io = req.app.get('io');
//   io.to(`alert:${alert._id}`).emit('alert-resolved', { alertId: alert._id });

//   logger.info(`✅ Alert ${alert._id} resolved`);

//   res.json({ success: true, message: 'Alert resolved successfully', alert });
// });

// // =====================================================
// // CANCEL ALERT
// // PUT /api/alerts/:id/cancel
// // =====================================================

// const cancelAlert = catchAsync(async (req, res, next) => {
//   const alert = await Alert.findById(req.params.id);

//   if (!alert) return next(new AppError('Alert not found', 404));

//   if (alert.woman.toString() !== req.user.id.toString()) {
//     return next(new AppError('Unauthorized', 403));
//   }

//   alert.status = 'cancelled';
//   await alert.save();

//   const io = req.app.get('io');
//   io.to(`alert:${alert._id}`).emit('alert-cancelled', { alertId: alert._id });

//   logger.info(`❌ Alert ${alert._id} cancelled`);

//   res.json({ success: true, message: 'Alert cancelled' });
// });

// // =====================================================
// // GET MY ALERTS
// // =====================================================

// const getMyAlerts = catchAsync(async (req, res) => {
//   const query = req.user.role === 'woman' ? { woman: req.user.id } : { volunteer: req.user.id };

//   const alerts = await Alert.find(query)
//     .populate('woman', 'name phone')
//     .populate('volunteer', 'name phone averageRating')
//     .sort('-createdAt');

//   res.json({ success: true, alerts });
// });

// // =====================================================
// // GET NEARBY ALERTS
// // =====================================================

// const getNearbyAlerts = catchAsync(async (req, res, next) => {
//   if (req.user.role !== 'volunteer') {
//     return next(new AppError('Only volunteers allowed', 403));
//   }

//   const coords = req.user.location.coordinates;

//   const alerts = await Alert.aggregate([
//     {
//       $geoNear: {
//         near: { type: 'Point', coordinates: coords },
//         distanceField: 'distance',
//         maxDistance: SEARCH_RADIUS_METERS,
//         spherical: true,
//         query: { status: 'pending' },
//       },
//     },
//     { $limit: 10 },
//   ]);

//   res.json({ success: true, alerts });
// });

// // =====================================================
// // GET SINGLE ALERT
// // GET /api/alerts/:id
// // =====================================================

// const getAlertById = catchAsync(async (req, res, next) => {
//   const alert = await Alert.findById(req.params.id)
//     .populate('woman', 'name phone')
//     .populate(
//       'volunteer',
//       'name email phone avatar volunteerBio availabilityNote skills languages averageRating totalAlertsHelped aadhaarVerified aadhaarLast4 location isActive'
//     );

//   if (!alert) return next(new AppError('Alert not found', 404));

//   const isWoman = alert.woman._id.toString() === req.user.id.toString();
//   const isVolunteer =
//     alert.volunteer && alert.volunteer._id.toString() === req.user.id.toString();

//   if (!isWoman && !isVolunteer) {
//     return next(new AppError('Unauthorized access', 403));
//   }

//   res.json({ success: true, alert });
// });

// // =====================================================
// // DISTANCE HELPER
// // =====================================================

// const getDistanceMeters = ([lon1, lat1], [lon2, lat2]) => {
//   const R = 6371000;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) ** 2;
//   return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
// };

// module.exports = {
//   createAlert,
//   acceptAlert,
//   declineAlert,
//   resolveAlert,
//   cancelAlert,
//   getMyAlerts,
//   getNearbyAlerts,
//   getAlertById,
// };

const Alert = require("../models/Alert");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendPushNotification } = require("../config/firebase");
const logger = require("../utils/logger");
const mongoose = require("mongoose");
const SEARCH_RADIUS_METERS = 10000; // 10km
const MAX_VOLUNTEERS_TO_NOTIFY = 20;

// =====================================================
// FIND NEAREST ACTIVE VOLUNTEERS
// Falls back to ALL active volunteers if none found nearby
// =====================================================

const findNearestVolunteers = async (coordinates, excludeIds = []) => {
  // First try geo query
  const geoResults = await User.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates },
        distanceField: "distance",
        maxDistance: SEARCH_RADIUS_METERS,
        spherical: true,
        query: {
          role: "volunteer",
          isActive: true,
          _id: { $nin: excludeIds },
        },
      },
    },
    { $limit: MAX_VOLUNTEERS_TO_NOTIFY },
    {
      $project: {
        name: 1,
        phone: 1,
        location: 1,
        averageRating: 1,
        fcmToken: 1,
        distance: 1,
      },
    },
  ]);

  if (geoResults.length > 0) {
    console.log(`✅ Geo query found ${geoResults.length} volunteers`);
    return geoResults;
  }

  // FALLBACK: volunteer location may be [0,0] (never updated) — find all active volunteers
  console.warn(
    "⚠️ Geo query returned 0. Falling back to all active volunteers.",
  );

  const fallback = await User.find({
    role: "volunteer",
    isActive: true,
    _id: { $nin: excludeIds },
  })
    .limit(MAX_VOLUNTEERS_TO_NOTIFY)
    .select("name phone location averageRating fcmToken")
    .lean();

  return fallback.map((v) => ({ ...v, distance: null }));
};

// =====================================================
// CREATE ALERT
// POST /api/alerts
// =====================================================

const createAlert = catchAsync(async (req, res, next) => {
  // const { message, coordinates, address } = req.body;

  //chatgpt//
  const { message, coordinates, address, emergencyType, priority } = req.body;

  console.log("Incoming Alert Payload:", req.body);

  if (!coordinates || coordinates.length !== 2) {
    return next(new AppError("Valid coordinates required", 400));
  }

  const [lng, lat] = coordinates;

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return next(new AppError("Invalid coordinates", 400));
  }

  const existingAlert = await Alert.findOne({
    woman: req.user.id,
    status: { $in: ["pending", "active"] },
  });

  if (existingAlert) {
    return next(new AppError("You already have an active alert", 400));
  }

  const alert = await Alert.create({
    woman: req.user.id,
    message: message || "SOS! Emergency assistance needed.",
    status: "pending",
    location: {
      type: "Point",
      coordinates,
      address: address || "",
    },
    createdAt: new Date(),
  });

  const volunteers = await findNearestVolunteers(coordinates);

  alert.notifiedVolunteers = volunteers.map((v) => v._id);
  await alert.save();

  const populatedAlert = await Alert.findById(alert._id).populate(
    "woman",
    "name phone",
  );

  const io = req.app.get("io");

  // DEBUG
  const sockets = await io.in("active-volunteers").fetchSockets();
  console.log("ACTIVE VOLUNTEERS IN ROOM:", sockets.length);
  console.log(
    "SOCKET IDS:",
    sockets.map((s) => s.id),
  );
  console.log("DB VOLUNTEERS FOUND:", volunteers.length);

  for (const volunteer of volunteers) {
    io.to(`user:${volunteer._id}`).emit("new-sos-alert", {
      alert: populatedAlert,
      distance: volunteer.distance ? Math.round(volunteer.distance) : null,
      woman: {
        id: populatedAlert.woman._id,
        name: populatedAlert.woman.name,
        phone: populatedAlert.woman.phone,
      },
      coordinates,
      message: populatedAlert.message,
      createdAt: populatedAlert.createdAt,
    });

    if (volunteer.fcmToken) {
      await sendPushNotification({
        token: volunteer.fcmToken,
        title: "🆘 Emergency SOS Nearby",
        body: `${populatedAlert.woman.name} needs help nearby`,
        data: { alertId: alert._id.toString(), type: "new-alert" },
      });
    }
  }

  logger.info(
    `🚨 Alert created by ${populatedAlert.woman.name}. Notified ${volunteers.length} volunteers`,
  );

  res.status(201).json({
    success: true,
    message: `SOS alert sent to ${volunteers.length} volunteer(s)`,
    volunteersNotified: volunteers.length,
    alert: populatedAlert,
  });
});

// =====================================================
// ACCEPT ALERT
// PUT /api/alerts/:id/accept
// =====================================================

const acceptAlert = catchAsync(async (req, res, next) => {
  const { responseMessage } = req.body;

  const alert = await Alert.findById(req.params.id).populate(
    "woman",
    "name phone fcmToken",
  );

  if (!alert) return next(new AppError("Alert not found", 404));
  if (alert.status !== "pending")
    return next(new AppError("Alert already accepted", 400));

  const volunteer = await User.findById(req.user.id).select("+aadhaarNumber");
  if (!volunteer) return next(new AppError("Volunteer not found", 404));

  const volunteerCoords = volunteer.location?.coordinates;
  const alertCoords = alert.location.coordinates;
  let distance = 0;

  if (volunteerCoords && volunteerCoords.length === 2) {
    distance = getDistanceMeters(volunteerCoords, alertCoords);
  }

  alert.status = "active";
  alert.volunteer = volunteer._id;
  alert.acceptedAt = new Date();
  alert.distanceToVolunteer = distance;
  if (responseMessage) alert.responseMessage = responseMessage;

  if (volunteerCoords && volunteerCoords.length === 2) {
    alert.volunteerLocationHistory.push({
      coordinates: volunteerCoords,
      timestamp: new Date(),
    });
  }

  await alert.save();

  const io = req.app.get("io");

  io.to(`user:${alert.woman._id}`).emit("alert:accepted", {
    alertId: alert._id,
    status: "active",
    acceptedAt: alert.acceptedAt,
    responseMessage: responseMessage || "",
    distanceMeters: distance,
    volunteer: {
      _id: volunteer._id,
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      avatar: volunteer.avatar,
      role: volunteer.role,
      volunteerBio: volunteer.volunteerBio || "",
      availabilityNote: volunteer.availabilityNote || "",
      skills: volunteer.skills || [],
      languages: volunteer.languages || [],
      averageRating: volunteer.averageRating || 0,
      totalAlertsHelped: volunteer.totalAlertsHelped || 0,
      aadhaarVerified: volunteer.aadhaarVerified || false,
      aadhaarLast4: volunteer.aadhaarLast4 || "",
      isActive: volunteer.isActive,
      location: {
        coordinates: volunteer.location?.coordinates || [],
        updatedAt: volunteer.location?.updatedAt || new Date(),
      },
    },
    womanLocation: { coordinates: alert.location.coordinates },
    volunteerLocation: { coordinates: volunteer.location?.coordinates || [] },
  });

  io.to(`user:${volunteer._id}`).emit("alert:accepted-by-you", {
    alertId: alert._id,
    status: "active",
    acceptedAt: alert.acceptedAt,
    womanName: alert.woman.name,
    womanPhone: alert.woman.phone,
    womanLocation: { coordinates: alert.location.coordinates },
  });

  logger.info(`✅ Sent confirmation to ${volunteer.name}`);

  io.sockets.sockets.forEach((s) => {
    if (s.user && s.user._id.toString() === volunteer._id.toString()) {
      s.join(`alert:${alert._id}`);
      console.log(`✅ ${volunteer.name} joined alert:${alert._id}`);
    }
  });

  io.to("active-volunteers").emit("alert:taken", { alertId: alert._id });

  if (alert.woman.fcmToken) {
    await sendPushNotification({
      token: alert.woman.fcmToken,
      title: "✅ Volunteer Accepted Your SOS",
      body: `${volunteer.name} is coming to help you.`,
      data: { alertId: alert._id.toString(), type: "alert-accepted" },
    });
  }

  logger.info(`✅ Alert ${alert._id} accepted by ${volunteer.name}`);

  res.json({ success: true, message: "Alert accepted successfully", alert });
});

// =====================================================
// DECLINE ALERT
// PUT /api/alerts/:id/decline
// =====================================================

const declineAlert = catchAsync(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) return next(new AppError("Alert not found", 404));
  if (alert.status !== "pending")
    return next(new AppError("Alert no longer pending", 400));

  if (!alert.declinedBy.map((id) => id.toString()).includes(req.user.id)) {
    alert.declinedBy.push(req.user.id);
    await alert.save();
  }

  logger.info(`❌ Volunteer ${req.user.name} declined alert ${alert._id}`);

  res.json({ success: true, message: "Alert declined" });
});

// =====================================================
// RESOLVE ALERT
// PUT /api/alerts/:id/resolve
// =====================================================

const resolveAlert = catchAsync(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) return next(new AppError("Alert not found", 404));

  if (alert.woman.toString() !== req.user.id.toString()) {
    return next(new AppError("Unauthorized", 403));
  }

  if (alert.status !== "active")
    return next(new AppError("Alert is not active", 400));

  alert.status = "resolved";
  alert.resolvedAt = new Date();
  await alert.save();

  if (alert.volunteer) {
    await User.findByIdAndUpdate(alert.volunteer, {
      $inc: { totalAlertsHelped: 1 },
    });
  }

  const io = req.app.get("io");
  io.to(`alert:${alert._id}`).emit("alert-resolved", { alertId: alert._id });

  logger.info(`✅ Alert ${alert._id} resolved`);

  res.json({ success: true, message: "Alert resolved successfully", alert });
});

// =====================================================
// CANCEL ALERT
// PUT /api/alerts/:id/cancel
// =====================================================

const cancelAlert = catchAsync(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) return next(new AppError("Alert not found", 404));

  if (alert.woman.toString() !== req.user.id.toString()) {
    return next(new AppError("Unauthorized", 403));
  }

  alert.status = "cancelled";
  await alert.save();

  const io = req.app.get("io");
  io.to(`alert:${alert._id}`).emit("alert-cancelled", { alertId: alert._id });

  logger.info(`❌ Alert ${alert._id} cancelled`);

  res.json({ success: true, message: "Alert cancelled" });
});

// =====================================================
// GET MY ALERTS
// =====================================================

const getMyAlerts = catchAsync(async (req, res) => {
  const query =
    req.user.role === "woman"
      ? { woman: req.user.id }
      : { volunteer: req.user.id };

  const alerts = await Alert.find(query)
    .populate("woman", "name phone")
    .populate("volunteer", "name phone averageRating")
    .sort("-createdAt");

  res.json({ success: true, alerts });
});

// =====================================================
// GET NEARBY ALERTS
// =====================================================

const getNearbyAlerts = catchAsync(async (req, res, next) => {
  if (req.user.role !== "volunteer") {
    return next(new AppError("Only volunteers allowed", 403));
  }

  const coords = req.user.location.coordinates;

  const alerts = await Alert.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: coords },
        distanceField: "distance",
        maxDistance: SEARCH_RADIUS_METERS,
        spherical: true,
        query: { status: "pending" },
      },
    },
    { $limit: 10 },
  ]);

  res.json({ success: true, alerts });
});

// =====================================================
// GET SINGLE ALERT
// GET /api/alerts/:id
// =====================================================

const getAlertById = catchAsync(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id)
    .populate("woman", "name phone")
    .populate(
      "volunteer",
      "name email phone avatar volunteerBio availabilityNote skills languages averageRating totalAlertsHelped aadhaarVerified aadhaarLast4 location isActive",
    );

  if (!alert) return next(new AppError("Alert not found", 404));

  const isWoman = alert.woman._id.toString() === req.user.id.toString();
  const isVolunteer =
    alert.volunteer &&
    alert.volunteer._id.toString() === req.user.id.toString();

  if (!isWoman && !isVolunteer) {
    return next(new AppError("Unauthorized access", 403));
  }

  res.json({ success: true, alert });
});


//chatgpt//
// =====================================================
// GET CHAT HISTORY
// GET /api/alerts/:alertId/chat
// =====================================================

const getChatHistory = catchAsync(async (req, res, next) => {
  const alert = await Alert.findById(req.params.alertId)
    .populate("chatMessages.sender", "name role");

  if (!alert) {
    return next(new AppError("Alert not found", 404));
  }

  // SECURITY CHECK
  const isWoman =
    alert.woman.toString() === req.user.id.toString();

  const isVolunteer =
    alert.volunteer &&
    alert.volunteer.toString() === req.user.id.toString();

  if (!isWoman && !isVolunteer) {
    return next(new AppError("Unauthorized access", 403));
  }

  res.status(200).json({
    success: true,
    messages: alert.chatMessages || [],
  });
});

// =====================================================
// SEND CHAT MESSAGE
// POST /api/alerts/:alertId/chat
// =====================================================

const sendChatMessage = catchAsync(async (req, res, next) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return next(new AppError("Message is required", 400));
  }

  const alert = await Alert.findById(req.params.alertId);

  if (!alert) {
    return next(new AppError("Alert not found", 404));
  }

  // ONLY ACTIVE ALERTS
  if (alert.status !== "active") {
    return next(
      new AppError("Chat only available for active alerts", 400),
    );
  }

  // SECURITY CHECK
  const isWoman =
    alert.woman.toString() === req.user.id.toString();

  const isVolunteer =
    alert.volunteer &&
    alert.volunteer.toString() === req.user.id.toString();

  if (!isWoman && !isVolunteer) {
    return next(new AppError("Unauthorized access", 403));
  }

  const newMessage = {
    sender: req.user.id,
    senderRole: req.user.role,
    message: message.trim(),
    createdAt: new Date(),
  };

  // ENSURE ARRAY EXISTS
  if (!alert.chatMessages) {
    alert.chatMessages = [];
  }

  alert.chatMessages.push(newMessage);

  await alert.save();

  const populatedAlert = await Alert.findById(alert._id)
    .populate("chatMessages.sender", "name role");

  const latestMessage =
    populatedAlert.chatMessages[
      populatedAlert.chatMessages.length - 1
    ];

  // REALTIME SOCKET EMIT
  const io = req.app.get("io");

  io.to(`alert:${alert._id}`).emit(
    "chat:new-message",
    latestMessage,
  );

  res.status(201).json({
    success: true,
    message: "Message sent",
    chatMessage: latestMessage,
  });
});
// const sendChatMessage = catchAsync(async (req, res, next) => {

//   const { message } = req.body;

//   if (!message || !message.trim()) {
//     return next(new AppError("Message is required", 400));
//   }

//   const alert = await Alert.findById(req.params.alertId);

//   if (!alert) {
//     return next(new AppError("Alert not found", 404));
//   }

//   if (alert.status !== "active") {
//     return next(
//       new AppError("Chat only available for active alerts", 400),
//     );
//   }

//   const isWoman =
//     alert.woman.toString() === req.user.id.toString();

//   const isVolunteer =
//     alert.volunteer &&
//     alert.volunteer.toString() === req.user.id.toString();

//   if (!isWoman && !isVolunteer) {
//     return next(new AppError("Unauthorized access", 403));
//   }

//   // =========================================
//   // CREATE MESSAGE
//   // =========================================

//   const newMessage = {
//     _id: new mongoose.Types.ObjectId(),

//     sender: {
//       _id: req.user._id,
//       name: req.user.name,
//       role: req.user.role,
//     },

//     senderRole: req.user.role,

//     message: message.trim(),

//     createdAt: new Date(),
//   };

//   // =========================================
//   // EMIT INSTANTLY
//   // =========================================

//   const io = req.app.get("io");

//   io.to(`alert:${alert._id}`).emit(
//     "chat:new-message",
//     newMessage,
//   );

//   // =========================================
//   // SAVE AFTER EMIT
//   // =========================================

//   alert.chatMessages.push({
//     sender: req.user._id,
//     senderRole: req.user.role,
//     message: message.trim(),
//     createdAt: new Date(),
//   });

//   await alert.save();

//   res.status(201).json({
//     success: true,
//     message: "Message sent",
//     chatMessage: newMessage,
//   });
// });

// =====================================================
// DISTANCE HELPER
// =====================================================

const getDistanceMeters = ([lon1, lat1], [lon2, lat2]) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

module.exports = {
  createAlert,
  acceptAlert,
  declineAlert,
  resolveAlert,
  cancelAlert,
  getMyAlerts,
  getNearbyAlerts,
  getAlertById,
  getChatHistory,
  sendChatMessage,
};


