const express = require('express');
const { protect } = require('../middleware/auth');
const { getChatHistory } = require('../controllers/chatController');

const router = express.Router();

// =====================================================
// CHAT ROUTES
// =====================================================

// Get chat history for a specific alert
// Protected: Only woman and accepted volunteer can access
router.get('/:alertId', protect, getChatHistory);

module.exports = router;