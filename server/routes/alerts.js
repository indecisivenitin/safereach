// const express = require('express');
// const router = express.Router();
// const { createAlert, acceptAlert, declineAlert, resolveAlert, cancelAlert, getMyAlerts, getNearbyAlerts } = require('../controllers/alertController');
// const { protect, restrictTo } = require('../middleware/auth');

// router.use(protect);

// router.post('/', restrictTo('woman'), createAlert);
// router.get('/my', getMyAlerts);
// router.get('/nearby', restrictTo('volunteer'), getNearbyAlerts);
// router.put('/:id/accept', restrictTo('volunteer'), acceptAlert);
// router.put('/:id/decline', restrictTo('volunteer'), declineAlert);
// router.put('/:id/resolve', restrictTo('woman'), resolveAlert);
// router.put('/:id/cancel', restrictTo('woman'), cancelAlert);

// module.exports = router;














//claude//

// const { getChatHistory } = require('../controllers/chatController');
// const express = require('express');

// const router = express.Router();

// const {
//   createAlert,
//   acceptAlert,
//   declineAlert,
//   resolveAlert,
//   cancelAlert,
//   getMyAlerts,
//   getNearbyAlerts,
//   getAlertById
// } = require('../controllers/alertController');

// const {
//   protect,
//   restrictTo
// } = require('../middleware/auth');

// // PROTECTED ROUTES

// router.use(protect);

// // WOMAN ROUTES


// router.post(
//   '/',
//   restrictTo('woman'),
//   createAlert
// );

// // Resolve active alert

// router.put(
//   '/:id/resolve',
//   restrictTo('woman'),
//   resolveAlert
// );

// // Cancel pending alert

// router.put(
//   '/:id/cancel',
//   restrictTo('woman'),
//   cancelAlert
// );

// // =====================================================
// // VOLUNTEER ROUTES
// // =====================================================

// // Nearby SOS alerts

// router.get(
//   '/nearby',
//   restrictTo('volunteer'),
//   getNearbyAlerts
// );

// // Accept SOS

// router.put(
//   '/:id/accept',
//   restrictTo('volunteer'),
//   acceptAlert
// );

// // Decline SOS

// router.put(
//   '/:id/decline',
//   restrictTo('volunteer'),
//   declineAlert
// );

// // =====================================================
// // COMMON ROUTES
// // =====================================================

// // My alerts history

// router.get(
//   '/my',
//   getMyAlerts
// );

// // Get single alert with volunteer + woman details

// router.get(
//   '/:id',
//   getAlertById
// );
// router.get('/:alertId/chat', protect, getChatHistory);


// module.exports = router;
















//chatgpt//


const express = require('express');

const {
  createAlert,
  getNearbyAlerts,
  acceptAlert,
  resolveAlert,
  cancelAlert,
  getAlertById,
  getChatHistory,
  sendChatMessage,
} = require('../controllers/alertController');

const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('woman'), createAlert);

router.get('/nearby', restrictTo('volunteer'), getNearbyAlerts);

router.get('/:alertId/chat', getChatHistory);


// CHAT ROUTES
router.get('/:alertId/chat', getChatHistory);

router.post('/:alertId/chat', sendChatMessage);



router.get('/:id', getAlertById);

router.patch('/:id/accept', restrictTo('volunteer'), acceptAlert);

router.patch('/:id/resolve', restrictTo('woman'), resolveAlert);

router.patch('/:id/cancel', restrictTo('woman'), cancelAlert);

module.exports = router;

