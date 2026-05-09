// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const Alert = require("../models/Alert");
// const logger = require("../utils/logger");

// const initSocket = (io) => {
//   // =====================================================
//   // AUTH MIDDLEWARE
//   // =====================================================

//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (!token) return next(new Error("Authentication error: No token provided"));

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id).select(
//         "name role isActive phone averageRating location"
//       );

//       if (!user) return next(new Error("Authentication error: User not found"));

//       socket.user = user;
//       next();
//     } catch (err) {
//       logger.error(`Socket auth error: ${err.message}`);
//       next(new Error("Authentication error: Invalid token"));
//     }
//   });

//   // =====================================================
//   // SOCKET CONNECTION
//   // =====================================================

//   io.on("connection", async (socket) => {
//     const user = socket.user;

//     logger.info(`🔌 Socket connected: ${user.name} (${user.role}) [${socket.id}]`);

//     // =====================================================
//     // PERSONAL ROOM
//     // =====================================================

//     await socket.join(`user:${user._id}`);

//     // =====================================================
//     // AUTO JOIN VOLUNTEER ROOM
//     // =====================================================

//     if (user.role && user.role.toLowerCase() === "volunteer") {
//       await socket.join("active-volunteers");
//       logger.info(`✅ ${user.name} joined active-volunteers room (isActive: ${user.isActive})`);
//       console.log("ROOMS:", Array.from(socket.rooms));
//     }

//     // =====================================================
//     // VOLUNTEER TOGGLE STATUS
//     // =====================================================

//     socket.on("volunteer:toggle-status", async (data, callback) => {
//       try {
//         const { isActive, coordinates } = data;

//         const updateObj = { isActive };

//         if (coordinates && coordinates.length === 2) {
//           const [lng, lat] = coordinates;
//           if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
//             updateObj.location = {
//               type: "Point",
//               coordinates,
//               updatedAt: new Date(),
//             };
//             updateObj.lastSeen = new Date();
//             console.log(`📍 Volunteer ${user.name} location saved on toggle: ${coordinates}`);
//           }
//         }

//         await User.findByIdAndUpdate(user._id, updateObj);

//         if (isActive) {
//           await socket.join("active-volunteers");
//           logger.info(`${user.name} marked ACTIVE`);
//           console.log("ROOMS AFTER ACTIVE:", Array.from(socket.rooms));
//         } else {
//           await socket.leave("active-volunteers");
//           logger.info(`${user.name} marked INACTIVE`);
//         }

//         socket.emit("volunteer:status-updated", { isActive });
//         if (callback) callback({ success: true, isActive });
//       } catch (err) {
//         logger.error(`Toggle status error: ${err.message}`);
//         socket.emit("app-error", { message: err.message });
//         if (callback) callback({ success: false, message: err.message });
//       }
//     });

//     // =====================================================
//     // VOLUNTEER LOCATION UPDATE
//     // =====================================================

//     socket.on("volunteer:location-update", async (data) => {
//       try {
//         const { coordinates, alertId } = data;

//         if (!coordinates || coordinates.length !== 2) return;

//         const [lng, lat] = coordinates;
//         if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

//         await User.findByIdAndUpdate(user._id, {
//           location: { type: "Point", coordinates, updatedAt: new Date() },
//           lastSeen: new Date(),
//         });

//         if (alertId) {
//           await Alert.findByIdAndUpdate(alertId, {
//             $push: { volunteerLocationHistory: { coordinates, timestamp: new Date() } },
//           });

//           const activeAlert = await Alert.findById(alertId);

//           io.to(`alert:${alertId}`).emit("volunteer-location-update", {
//             alertId,
//             volunteer: {
//               _id: user._id,
//               name: user.name,
//               phone: user.phone,
//               averageRating: user.averageRating || 0,
//             },
//             coordinates,
//             route: {
//               from: coordinates,
//               to: activeAlert?.location?.coordinates || [],
//             },
//             updatedAt: new Date(),
//             timestamp: Date.now(),
//           });
//         }
//       } catch (err) {
//         logger.error(`Location update error: ${err.message}`);
//       }
//     });

//     // =====================================================
//     // JOIN ALERT ROOM
//     // =====================================================

//     socket.on("join-alert-room", async (data) => {
//       try {
//         const { alertId } = data;
//         if (!alertId) return;

//         const alert = await Alert.findById(alertId);
//         if (!alert) return socket.emit("app-error", { message: "Alert not found" });

//         await socket.join(`alert:${alertId}`);
//         logger.info(`${user.name} joined alert room: ${alertId}`);
//       } catch (err) {
//         socket.emit("app-error", { message: err.message });
//       }
//     });

//     // =====================================================
//     // ACCEPT ALERT
//     // =====================================================

//     socket.on("alert:accept", async (data, callback) => {
//       try {
//         const { alertId, responseMessage } = data;

//         console.log(`📨 ALERT:ACCEPT received from ${user.name} for alert ${alertId}`);

//         if (!alertId) return callback?.({ success: false, message: "Alert ID missing" });

//         const alert = await Alert.findById(alertId)
//           .populate("woman", "name phone _id")
//           .populate("volunteer", "name phone");

//         if (!alert) return callback?.({ success: false, message: "Alert not found" });
//         if (alert.status !== "pending") return callback?.({ success: false, message: "Alert already accepted" });

//         alert.status = "active";
//         alert.volunteer = socket.user._id;
//         alert.acceptedAt = new Date();
//         alert.responseMessage = responseMessage || "I am on my way";
//         await alert.save();

//         const volunteer = await User.findById(socket.user._id).select(
//           "name phone bio skills languages volunteerBio availabilityNote ratings totalAlertsHelped location averageRating"
//         );

//         await socket.join(`alert:${alertId}`);

//         const payload = {
//           alertId,
//           volunteer,
//           responseMessage: alert.responseMessage,
//           acceptedAt: alert.acceptedAt,
//         };

//         // =====================================================
//         // FIX: Emit to BOTH alert room AND woman's personal room
//         // Alert room = only works if woman already joined it
//         // Personal room = always works, woman is always in it
//         // =====================================================

//         io.to(`alert:${alertId}`).emit("alert:accepted", payload);
//         io.to(`user:${alert.woman._id}`).emit("alert:accepted", payload);  // ← THE FIX

//         console.log(`📢 Emitted alert:accepted to alert:${alertId} AND user:${alert.woman._id}`);

//         socket.emit("alert:accepted-by-you", { alertId, success: true });

//         logger.info(`✅ Alert accepted by ${socket.user.name}.`);

//         callback?.({ success: true });
//       } catch (err) {
//         console.error("❌ Alert accept error:", err);
//         logger.error(`Alert accept error: ${err.message}`);
//         callback?.({ success: false, message: "Failed to accept alert" });
//       }
//     });

//     // =====================================================
//     // REJECT ALERT
//     // =====================================================

//     socket.on("alert:reject", async (data) => {
//       try {
//         const { alertId } = data;
//         logger.info(`❌ Alert ${alertId} rejected by ${user.name}`);
//       } catch (err) {
//         logger.error(`Reject alert error: ${err.message}`);
//       }
//     });

//     // =====================================================
//     // WOMAN EVENTS
//     // =====================================================

//     socket.on("woman:join-alert", async (data) => {
//       const { alertId } = data;
//       if (alertId) {
//         await socket.join(`alert:${alertId}`);
//         logger.info(`${user.name} joined alert room: ${alertId}`);
//         console.log(`✅ Woman ${user.name} joined alert:${alertId}`);
//       }
//     });

//     socket.on("woman:leave-alert", async (data) => {
//       const { alertId } = data;
//       if (alertId) {
//         await socket.leave(`alert:${alertId}`);
//         console.log(`❌ Woman left alert:${alertId}`);
//       }
//     });

//     // =====================================================
//     // SOS CREATE EVENT
//     // =====================================================

//     socket.on("sos:create", async (data, callback) => {
//       try {
//         const { coordinates, message } = data;

//         if (!coordinates || coordinates.length !== 2) {
//           return callback({ success: false, message: "Invalid coordinates" });
//         }

//         const [lng, lat] = coordinates;
//         if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
//           return callback({ success: false, message: "Invalid coordinates" });
//         }

//         const alert = await Alert.create({
//           woman: user._id,
//           message: message || "Emergency SOS triggered",
//           status: "pending",
//           location: { type: "Point", coordinates },
//           createdAt: new Date(),
//         });

//         await socket.join(`alert:${alert._id}`);

//         const volunteerSockets = await io.in("active-volunteers").fetchSockets();
//         console.log("ACTIVE VOLUNTEERS IN ROOM:", volunteerSockets.length);

//         const dbVolunteers = await User.find({ role: "volunteer", isActive: true }).select("_id").lean();
//         console.log("DB ACTIVE VOLUNTEERS:", dbVolunteers.length);

//         io.to("active-volunteers").emit("new-sos-alert", {
//           alertId: alert._id,
//           woman: { id: user._id, name: user.name },
//           coordinates,
//           message: alert.message,
//           createdAt: alert.createdAt,
//         });

//         for (const vol of dbVolunteers) {
//           io.to(`user:${vol._id}`).emit("new-sos-alert", {
//             alertId: alert._id,
//             woman: { id: user._id, name: user.name },
//             coordinates,
//             message: alert.message,
//             createdAt: alert.createdAt,
//           });
//         }

//         logger.info(`🚨 SOS created by ${user.name}. Room: ${volunteerSockets.length}, DB: ${dbVolunteers.length}`);

//         callback({
//           success: true,
//           alertId: alert._id,
//           volunteersNotified: Math.max(volunteerSockets.length, dbVolunteers.length),
//         });
//       } catch (err) {
//         logger.error(`SOS create error: ${err.message}`);
//         callback({ success: false, message: err.message });
//       }
//     });

//     // =====================================================
//     // PING / PONG
//     // =====================================================

//     socket.on("ping", () => {
//       socket.emit("pong", { timestamp: Date.now() });
//     });

//     // =====================================================
//     // DISCONNECT
//     // =====================================================

//     socket.on("disconnect", async (reason) => {
//       logger.info(`🔌 Socket disconnected: ${user.name} [${reason}]`);
//       if (user.role && user.role.toLowerCase() === "volunteer") {
//         await User.findByIdAndUpdate(user._id, { lastSeen: new Date() }).catch(() => {});
//       }
//     });

//     // =====================================================
//     // SOCKET ERROR
//     // =====================================================

//     socket.on("error", (err) => {
//       logger.error(`Socket error for ${user.name}: ${err.message}`);
//     });
//   });
// };

// module.exports = initSocket;

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
      if (!token)
        return next(new Error("Authentication error: No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "name role isActive phone averageRating location",
      );

      if (!user) return next(new Error("Authentication error: User not found"));

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

    // =====================================================
    // PERSONAL ROOM
    // =====================================================

    await socket.join(`user:${user._id}`);

    // =====================================================
    // AUTO JOIN VOLUNTEER ROOM
    // =====================================================

    if (user.role && user.role.toLowerCase() === "volunteer") {
      await socket.join("active-volunteers");
      logger.info(
        `✅ ${user.name} joined active-volunteers room (isActive: ${user.isActive})`,
      );
      console.log("ROOMS:", Array.from(socket.rooms));
    }

    // =====================================================
    // VOLUNTEER TOGGLE STATUS
    // =====================================================

    socket.on("volunteer:toggle-status", async (data, callback) => {
      try {
        const { isActive, coordinates } = data;

        const updateObj = { isActive };

        if (coordinates && coordinates.length === 2) {
          const [lng, lat] = coordinates;
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            updateObj.location = {
              type: "Point",
              coordinates,
              updatedAt: new Date(),
            };
            updateObj.lastSeen = new Date();
            console.log(
              `📍 Volunteer ${user.name} location saved on toggle: ${coordinates}`,
            );
          }
        }

        await User.findByIdAndUpdate(user._id, updateObj);

        if (isActive) {
          await socket.join("active-volunteers");
          logger.info(`${user.name} marked ACTIVE`);
          console.log("ROOMS AFTER ACTIVE:", Array.from(socket.rooms));
        } else {
          await socket.leave("active-volunteers");
          logger.info(`${user.name} marked INACTIVE`);
        }

        socket.emit("volunteer:status-updated", { isActive });
        if (callback) callback({ success: true, isActive });
      } catch (err) {
        logger.error(`Toggle status error: ${err.message}`);
        socket.emit("app-error", { message: err.message });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // =====================================================
    // VOLUNTEER LOCATION UPDATE
    // =====================================================

    socket.on("volunteer:location-update", async (data) => {
      try {
        const { coordinates, alertId } = data;

        if (!coordinates || coordinates.length !== 2) return;

        const [lng, lat] = coordinates;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

        await User.findByIdAndUpdate(user._id, {
          location: { type: "Point", coordinates, updatedAt: new Date() },
          lastSeen: new Date(),
        });

        if (alertId) {
          await Alert.findByIdAndUpdate(alertId, {
            $push: {
              volunteerLocationHistory: { coordinates, timestamp: new Date() },
            },
          });

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

    // =====================================================
    // JOIN ALERT ROOM
    // =====================================================

    socket.on("join-alert-room", async (data) => {
      try {
        const { alertId } = data;
        if (!alertId) return;

        const alert = await Alert.findById(alertId);
        if (!alert)
          return socket.emit("app-error", { message: "Alert not found" });

        await socket.join(`alert:${alertId}`);
        logger.info(`${user.name} joined alert room: ${alertId}`);
      } catch (err) {
        socket.emit("app-error", { message: err.message });
      }
    });

    // =====================================================
    // ACCEPT ALERT
    // =====================================================

    socket.on("alert:accept", async (data, callback) => {
      try {
        const { alertId, responseMessage } = data;

        console.log(
          `📨 ALERT:ACCEPT received from ${user.name} for alert ${alertId}`,
        );

        if (!alertId)
          return callback?.({ success: false, message: "Alert ID missing" });

        const alert = await Alert.findById(alertId)
          .populate("woman", "name phone _id")
          .populate("volunteer", "name phone");

        if (!alert)
          return callback?.({ success: false, message: "Alert not found" });
        if (alert.status !== "pending")
          return callback?.({
            success: false,
            message: "Alert already accepted",
          });

        alert.status = "active";
        alert.volunteer = socket.user._id;
        alert.acceptedAt = new Date();
        alert.responseMessage = responseMessage || "I am on my way";
        await alert.save();

        const volunteer = await User.findById(socket.user._id).select(
          "name phone bio skills languages volunteerBio availabilityNote ratings totalAlertsHelped location averageRating",
        );

        await socket.join(`alert:${alertId}`);

        // const payload = {
        //   alertId,
        //   volunteer,
        //   responseMessage: alert.responseMessage,
        //   acceptedAt: alert.acceptedAt,
        // };

        // server/socket/index.js

        // ONLY THIS PART CHANGED INSIDE alert:accept

        const payload = {
          alertId,

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

          responseMessage: alert.responseMessage,

          acceptedAt: alert.acceptedAt,

          womanLocation: {
            coordinates: alert.location.coordinates,
          },

          volunteerLocation: {
            coordinates: volunteer.location?.coordinates || [],
          },

          status: "active",
        };

        io.to(`alert:${alertId}`).emit("alert:accepted", payload);

        io.to(`user:${alert.woman._id}`).emit("alert:accepted", payload);

        // =====================================================
        // FIX: Emit to BOTH alert room AND woman's personal room
        // Alert room = only works if woman already joined it
        // Personal room = always works, woman is always in it
        // =====================================================

        io.to(`alert:${alertId}`).emit("alert:accepted", payload);
        io.to(`user:${alert.woman._id}`).emit("alert:accepted", payload); // ← THE FIX

        console.log(
          `📢 Emitted alert:accepted to alert:${alertId} AND user:${alert.woman._id}`,
        );

        socket.emit("alert:accepted-by-you", { alertId, success: true });

        logger.info(`✅ Alert accepted by ${socket.user.name}.`);

        callback?.({ success: true });
      } catch (err) {
        console.error("❌ Alert accept error:", err);
        logger.error(`Alert accept error: ${err.message}`);
        callback?.({ success: false, message: "Failed to accept alert" });
      }
    });

    // =====================================================
    // REJECT ALERT
    // =====================================================

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

    socket.on("woman:join-alert", async (data) => {
      const { alertId } = data;
      if (alertId) {
        await socket.join(`alert:${alertId}`);
        logger.info(`${user.name} joined alert room: ${alertId}`);
        console.log(`✅ Woman ${user.name} joined alert:${alertId}`);
      }
    });

    socket.on("woman:leave-alert", async (data) => {
      const { alertId } = data;
      if (alertId) {
        await socket.leave(`alert:${alertId}`);
        console.log(`❌ Woman left alert:${alertId}`);
      }
    });

    // =====================================================
    // SOS CREATE EVENT
    // =====================================================

    socket.on("sos:create", async (data, callback) => {
      try {
        const { coordinates, message } = data;

        if (!coordinates || coordinates.length !== 2) {
          return callback({ success: false, message: "Invalid coordinates" });
        }

        const [lng, lat] = coordinates;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return callback({ success: false, message: "Invalid coordinates" });
        }

        const alert = await Alert.create({
          woman: user._id,
          message: message || "Emergency SOS triggered",
          status: "pending",
          location: { type: "Point", coordinates },
          createdAt: new Date(),
        });

        await socket.join(`alert:${alert._id}`);

        const volunteerSockets = await io
          .in("active-volunteers")
          .fetchSockets();
        console.log("ACTIVE VOLUNTEERS IN ROOM:", volunteerSockets.length);

        const dbVolunteers = await User.find({
          role: "volunteer",
          isActive: true,
        })
          .select("_id")
          .lean();
        console.log("DB ACTIVE VOLUNTEERS:", dbVolunteers.length);

        io.to("active-volunteers").emit("new-sos-alert", {
          alertId: alert._id,
          woman: { id: user._id, name: user.name },
          coordinates,
          message: alert.message,
          createdAt: alert.createdAt,
        });

        for (const vol of dbVolunteers) {
          io.to(`user:${vol._id}`).emit("new-sos-alert", {
            alertId: alert._id,
            woman: { id: user._id, name: user.name },
            coordinates,
            message: alert.message,
            createdAt: alert.createdAt,
          });
        }

        logger.info(
          `🚨 SOS created by ${user.name}. Room: ${volunteerSockets.length}, DB: ${dbVolunteers.length}`,
        );

        callback({
          success: true,
          alertId: alert._id,
          volunteersNotified: Math.max(
            volunteerSockets.length,
            dbVolunteers.length,
          ),
        });
      } catch (err) {
        logger.error(`SOS create error: ${err.message}`);
        callback({ success: false, message: err.message });
      }
    });

    // =====================================================
    // CHAT: SEND MESSAGE
    // =====================================================

    socket.on("chat:send-message", async (data, callback) => {
      try {
        const { alertId, message } = data;

        if (!alertId || !message || message.trim().length === 0) {
          return callback?.({
            success: false,
            message: "Invalid alertId or message",
          });
        }

        // Fetch alert
        const alert = await Alert.findById(alertId);

        if (!alert) {
          return callback?.({
            success: false,
            message: "Alert not found",
          });
        }

        // Validate authorization
        const isAuthorized =
          alert.woman.toString() === socket.user._id.toString() ||
          alert.volunteer?.toString() === socket.user._id.toString();

        if (!isAuthorized) {
          return callback?.({
            success: false,
            message: "Unauthorized",
          });
        }

        // Validate alert is still active
        if (!["pending", "active"].includes(alert.status)) {
          return callback?.({
            success: false,
            message: "Alert is no longer active",
          });
        }

        // Create message object
        const newMessage = {
          sender: socket.user._id,
          senderRole: socket.user.role,
          message: message.trim(),
          createdAt: new Date(),
        };

        // Add to database
        alert.chatMessages.push(newMessage);
        await alert.save();

        // Emit to alert room
        io.to(`alert:${alertId}`).emit("chat:new-message", {
          ...newMessage,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
          },
        });

        logger.info(
          `💬 Chat message from ${socket.user.name} (${socket.user.role}) in alert ${alertId}`,
        );

        callback?.({ success: true });
      } catch (err) {
        logger.error(`Chat send error: ${err.message}`);
        callback?.({
          success: false,
          message: "Failed to send message",
        });
      }
    });

    // =====================================================
    // PING / PONG
    // =====================================================

    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    // =====================================================
    // DISCONNECT
    // =====================================================

    socket.on("disconnect", async (reason) => {
      logger.info(`🔌 Socket disconnected: ${user.name} [${reason}]`);
      if (user.role && user.role.toLowerCase() === "volunteer") {
        await User.findByIdAndUpdate(user._id, { lastSeen: new Date() }).catch(
          () => {},
        );
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
