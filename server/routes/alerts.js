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



const express = require('express');

const router = express.Router();

const {
  createAlert,
  acceptAlert,
  declineAlert,
  resolveAlert,
  cancelAlert,
  getMyAlerts,
  getNearbyAlerts,
  getAlertById
} = require('../controllers/alertController');

const {
  protect,
  restrictTo
} = require('../middleware/auth');

// =====================================================
// PROTECTED ROUTES
// =====================================================

router.use(protect);

// =====================================================
// WOMAN ROUTES
// =====================================================

// Create SOS alert

router.post(
  '/',
  restrictTo('woman'),
  createAlert
);

// Resolve active alert

router.put(
  '/:id/resolve',
  restrictTo('woman'),
  resolveAlert
);

// Cancel pending alert

router.put(
  '/:id/cancel',
  restrictTo('woman'),
  cancelAlert
);

// =====================================================
// VOLUNTEER ROUTES
// =====================================================

// Nearby SOS alerts

router.get(
  '/nearby',
  restrictTo('volunteer'),
  getNearbyAlerts
);

// Accept SOS

router.put(
  '/:id/accept',
  restrictTo('volunteer'),
  acceptAlert
);

// Decline SOS

router.put(
  '/:id/decline',
  restrictTo('volunteer'),
  declineAlert
);

// =====================================================
// COMMON ROUTES
// =====================================================

// My alerts history

router.get(
  '/my',
  getMyAlerts
);

// Get single alert with volunteer + woman details

router.get(
  '/:id',
  getAlertById
);

module.exports = router;