// const express = require('express');
// const router = express.Router();
// const { updateLocation, toggleStatus, getStats, getLeaderboard } = require('../controllers/volunteerController');
// const { protect, restrictTo } = require('../middleware/auth');

// router.use(protect);

// router.patch('/location', restrictTo('volunteer'), updateLocation);
// router.patch('/status', restrictTo('volunteer'), toggleStatus);
// router.get('/stats', restrictTo('volunteer'), getStats);
// router.get('/leaderboard', getLeaderboard);

// module.exports = router;



const express = require('express');

const router = express.Router();

const {
  updateLocation
} = require('../controllers/volunteerController');

const {
  protect,
  restrictTo
} = require('../middleware/auth');

router.use(protect);

router.put(
  '/location',
  restrictTo('volunteer'),
  updateLocation
);

module.exports = router;