const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { auth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');

// Register FCM Device Token
router.post('/register-device', auth, asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) return res.status(400).json({ error: 'FCM Token is required' });

  const student = await Student.findById(req.studentId);
  
  if (!student.fcmTokens) {
    student.fcmTokens = [];
  }

  // Only add if not already present
  if (!student.fcmTokens.includes(fcmToken)) {
    student.fcmTokens.push(fcmToken);
    await student.save();
  }

  res.json({ message: 'Device registered for push notifications successfully' });
}));

// Test Notifications (For debugging/testing from Frontend)
router.post('/test-notification', auth, asyncHandler(async (req, res) => {
  const student = await Student.findById(req.studentId);
  
  // Test Email
  await notificationService.sendWelcomeEmail(student.email, student.displayName || student.username);
  
  // Test Push
  if (student.fcmTokens && student.fcmTokens.length > 0) {
    await notificationService.sendPushNotification(
      student.fcmTokens, 
      '🔔 Test Push Notification', 
      'This is a test notification from Edu AI to verify your device works.',
      { test: 'true' }
    );
  }

  res.json({ message: 'Simulation executed. Check console for output. (Or check inbox/device if configured)' });
}));

// Update Notification Preferences
router.post('/preferences', auth, asyncHandler(async (req, res) => {
  const { emailNotificationsEnabled, pushNotificationsEnabled } = req.body;
  
  const student = await Student.findById(req.studentId);
  
  if (emailNotificationsEnabled !== undefined) {
    student.emailNotificationsEnabled = emailNotificationsEnabled;
  }
  
  if (pushNotificationsEnabled !== undefined) {
    student.pushNotificationsEnabled = pushNotificationsEnabled;
  }
  
  await student.save();
  res.json({ 
    emailNotificationsEnabled: student.emailNotificationsEnabled,
    pushNotificationsEnabled: student.pushNotificationsEnabled 
  });
}));

module.exports = router;
