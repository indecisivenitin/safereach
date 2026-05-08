const admin = require('firebase-admin');
const logger = require('../utils/logger');

let firebaseApp = null;

const initFirebase = () => {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountPath) {
      logger.warn('Firebase service account key not provided. Push notifications disabled.');
      return null;
    }
    const serviceAccount = require(serviceAccountPath);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info('✅ Firebase Admin initialized');
    return firebaseApp;
  } catch (error) {
    logger.warn(`Firebase initialization skipped: ${error.message}`);
    return null;
  }
};

const sendPushNotification = async ({ token, title, body, data = {} }) => {
  if (!firebaseApp || !token) return null;
  try {
    const message = {
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      token,
      android: { priority: 'high', notification: { sound: 'default', channelId: 'safereach_alerts' } },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    };
    const response = await admin.messaging().send(message);
    logger.info(`Push sent: ${response}`);
    return response;
  } catch (error) {
    logger.error(`Push notification error: ${error.message}`);
    return null;
  }
};

module.exports = { initFirebase, sendPushNotification };
