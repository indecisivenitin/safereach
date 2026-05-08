const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Alert = require("../models/Alert");
const logger = require("../utils/logger");

const initSocket = (io) => {
  // =====================================================
  // AUTH MIDDLEWARE
  // =====================================================

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select(
        "name role isActive phone averageRating",
      );

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;

      next();
    } catch (err) {
      logger.error(`Socket auth error: ${err.message}`);

      next(new Error("Authentication error: Invalid token"));
    }
  });

  // =====================================================
  // SOCKET CONNECTION
  // =====================================================

  io.on("connection", async (socket) => {
    const user = socket.user;

    logger.info(
      `🔌 Socket connected: ${user.name} (${user.role}) [${socket.id}]`,
    );

    console.log("SOCKET USER:", {
      id: user._id,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });

    // -----------------------------------------------------
    // PERSONAL ROOM
    // -----------------------------------------------------

    socket.join(`user:${user._id}`);

    // -----------------------------------------------------
    // AUTO JOIN VOLUNTEER ROOM
    // -----------------------------------------------------

    if (user.role && user.role.toLowerCase() === "volunteer") {
      socket.join("active-volunteers");

      logger.info(`✅ ${user.name} joined active-volunteers room`);

      console.log(`✅ ${user.name} joined active-volunteers room`);
    }

    // =====================================================
    // VOLUNTEER EVENTS
    // =====================================================

    // Volunteer online/offline toggle

    socket.on("volunteer:toggle-status", async (data, callback) => {
      try {
        const { isActive } = data;

        await User.findByIdAndUpdate(user._id, { isActive });

        if (isActive) {
          socket.join("active-volunteers");

          logger.info(`${user.name} marked ACTIVE`);
        } else {
          socket.leave("active-volunteers");

          logger.info(`${user.name} marked INACTIVE`);
        }

        socket.emit("volunteer:status-updated", { isActive });

        if (callback) {
          callback({
            success: true,
            isActive,
          });
        }
      } catch (err) {
        logger.error(`Toggle status error: ${err.message}`);

        socket.emit("app-error", {
          message: err.message,
        });

        if (callback) {
          callback({
            success: false,
            message: err.message,
          });
        }
      }
    });

    // -----------------------------------------------------
    // VOLUNTEER LOCATION UPDATE
    // -----------------------------------------------------

    // -----------------------------------------------------
    // VOLUNTEER LOCATION UPDATE
    // -----------------------------------------------------

    socket.on("volunteer:location-update", async (data) => {
      try {
        const { coordinates, alertId } = data;

        if (!coordinates || coordinates.length !== 2) {
          return;
        }

        const [lng, lat] = coordinates;

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return;
        }

        // =====================================================
        // UPDATE USER LOCATION
        // =====================================================

        await User.findByIdAndUpdate(user._id, {
          location: {
            type: "Point",
            coordinates,
            updatedAt: new Date(),
          },

          lastSeen: new Date(),
        });

        // =====================================================
        // UPDATE ALERT TRACKING HISTORY
        // =====================================================

        if (alertId) {
          await Alert.findByIdAndUpdate(alertId, {
            $push: {
              volunteerLocationHistory: {
                coordinates,
                timestamp: new Date(),
              },
            },
          });
        }

        // =====================================================
        // SEND LIVE LOCATION TO WOMAN
        // =====================================================

        if (alertId) {
          const activeAlert = await Alert.findById(alertId);

          io.to(`alert:${alertId}`).emit("volunteer-location-update", {
            alertId,

            volunteer: {
              _id: user._id,

              name: user.name,

              phone: user.phone,

              averageRating: user.averageRating || 0,
            },

            coordinates,

            route: {
              from: coordinates,

              to: activeAlert?.location?.coordinates || [],
            },

            updatedAt: new Date(),

            timestamp: Date.now(),
          });
        }
      } catch (err) {
        logger.error(`Location update error: ${err.message}`);
      }
    });

    // -----------------------------------------------------
    // JOIN ALERT ROOM
    // -----------------------------------------------------

    socket.on("join-alert-room", async (data) => {
      try {
        const { alertId } = data;

        if (!alertId) return;

        const alert = await Alert.findById(alertId);

        if (!alert) {
          return socket.emit("app-error", {
            message: "Alert not found",
          });
        }

        socket.join(`alert:${alertId}`);

        logger.info(`${user.name} joined alert room: ${alertId}`);
      } catch (err) {
        socket.emit("app-error", {
          message: err.message,
        });
      }
    });

    // -----------------------------------------------------
    // ACCEPT ALERT
    // -----------------------------------------------------

    socket.on("alert:accept", async (data, callback) => {
      try {
        const { alertId, responseMessage } = data;

        if (!alertId) {
          return callback?.({
            success: false,
            message: "Alert ID missing",
          });
        }

        const Alert = require("../models/Alert");
        const User = require("../models/User");

        const alert = await Alert.findById(alertId)
          .populate("woman", "name phone")
          .populate("volunteer", "name phone");

        if (!alert) {
          return callback?.({
            success: false,
            message: "Alert not found",
          });
        }

        if (alert.status !== "pending") {
          return callback?.({
            success: false,
            message: "Alert already accepted",
          });
        }

        // =====================================================
        // UPDATE ALERT
        // =====================================================

        alert.status = "active";

        alert.volunteer = socket.user._id;

        alert.acceptedAt = new Date();

        alert.responseMessage = responseMessage || "I am on my way";

        await alert.save();

        const volunteer = await User.findById(socket.user._id).select(
          "name phone",
        );

        // =====================================================
        // JOIN ALERT ROOM
        // =====================================================

        socket.join(`alert:${alertId}`);

        // =====================================================
        // NOTIFY WOMAN
        // =====================================================

        io.to(`alert:${alertId}`).emit("alert:accepted", {
          alertId,

          volunteer,

          responseMessage: alert.responseMessage,

          acceptedAt: alert.acceptedAt,
        });

        logger.info(`✅ Alert accepted by ${socket.user.name}`);

        callback?.({
          success: true,
        });
      } catch (err) {
        console.error(err);

        callback?.({
          success: false,
          message: "Failed to accept alert",
        });
      }
    });

    // -----------------------------------------------------
    // REJECT ALERT
    // -----------------------------------------------------

    socket.on("alert:reject", async (data) => {
      try {
        const { alertId } = data;

        logger.info(`❌ Alert ${alertId} rejected by ${user.name}`);
      } catch (err) {
        logger.error(`Reject alert error: ${err.message}`);
      }
    });

    // =====================================================
    // WOMAN EVENTS
    // =====================================================

    socket.on("woman:join-alert", (data) => {
      const { alertId } = data;

      if (alertId) {
        socket.join(`alert:${alertId}`);

        logger.info(`${user.name} joined alert room: ${alertId}`);
      }
    });

    socket.on("woman:leave-alert", (data) => {
      const { alertId } = data;

      if (alertId) {
        socket.leave(`alert:${alertId}`);
      }
    });

    // =====================================================
    // SOS CREATE EVENT
    // =====================================================

    socket.on("sos:create", async (data, callback) => {
      try {
        const { coordinates, message } = data;

        if (!coordinates || coordinates.length !== 2) {
          return callback({
            success: false,
            message: "Invalid coordinates",
          });
        }

        const [lng, lat] = coordinates;

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return callback({
            success: false,
            message: "Invalid coordinates",
          });
        }

        // CREATE ALERT

        const alert = await Alert.create({
          woman: user._id,

          message: message || "Emergency SOS triggered",

          status: "pending",

          location: {
            type: "Point",
            coordinates,
          },

          createdAt: new Date(),
        });

        // WOMAN JOINS ROOM

        socket.join(`alert:${alert._id}`);

        // DEBUG

        const volunteerSockets = await io
          .in("active-volunteers")
          .fetchSockets();

        console.log("ACTIVE VOLUNTEERS COUNT:", volunteerSockets.length);

        console.log(
          "VOLUNTEER SOCKET IDS:",
          volunteerSockets.map((s) => s.id),
        );

        // BROADCAST SOS

        io.to("active-volunteers").emit("new-sos-alert", {
          alertId: alert._id,

          woman: {
            id: user._id,
            name: user.name,
          },

          coordinates,

          message: alert.message,

          createdAt: alert.createdAt,
        });

        logger.info(`🚨 SOS alert created by ${user.name}`);

        callback({
          success: true,
          alertId: alert._id,
          volunteersNotified: volunteerSockets.length,
        });
      } catch (err) {
        logger.error(`SOS create error: ${err.message}`);

        callback({
          success: false,
          message: err.message,
        });
      }
    });

    // =====================================================
    // PING / PONG
    // =====================================================

    socket.on("ping", () => {
      socket.emit("pong", {
        timestamp: Date.now(),
      });
    });

    // =====================================================
    // DISCONNECT
    // =====================================================

    socket.on("disconnect", async (reason) => {
      logger.info(`🔌 Socket disconnected: ${user.name} [${reason}]`);

      if (user.role && user.role.toLowerCase() === "volunteer") {
        await User.findByIdAndUpdate(user._id, {
          lastSeen: new Date(),
        }).catch(() => {});
      }
    });

    // =====================================================
    // SOCKET ERROR
    // =====================================================

    socket.on("error", (err) => {
      logger.error(`Socket error for ${user.name}: ${err.message}`);
    });
  });
};

module.exports = initSocket;
