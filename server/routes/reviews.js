const express = require('express');
const router = express.Router();
const { createReview, getVolunteerReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createReview);
router.get('/volunteer/:id', getVolunteerReviews);

module.exports = router;
