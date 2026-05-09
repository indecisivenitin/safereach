const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

// =====================================================
// GET CHAT HISTORY FOR ALERT
// GET /api/alerts/:id/chat
// =====================================================

const getChatHistory = catchAsync(async (req, res, next) => {
  const { id: alertId } = req.params;

  // Validate alertId format
  if (!alertId) {
    return next(new AppError('Alert ID is required', 400));
  }

  // Fetch alert with chat messages and populate sender details
  const alert = await Alert.findById(alertId)
    .populate({
      path: 'chatMessages.sender',
      select: 'name role'
    });

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  // Authorization check: Only woman and accepted volunteer can access chat
  const isAuthorized =
    alert.woman.toString() === req.user.id ||
    (alert.volunteer && alert.volunteer.toString() === req.user.id);

  if (!isAuthorized) {
    return next(
      new AppError(
        'You do not have permission to access this chat',
        403
      )
    );
  }

  // Return chat messages
  res.status(200).json({
    success: true,
    data: {
      chatMessages: alert.chatMessages || []
    }
  });

  logger.info(
    `📋 Chat history fetched for alert ${alertId} by user ${req.user.id}`
  );
});

module.exports = {
  getChatHistory
};