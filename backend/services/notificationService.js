const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Initialize Firebase Admin (Only if not already initialized and credentials exist)
// In a real app, you would pass a service account key path.
// For now, we mock it or use default credentials if available in ENV.
try {
  if (!admin.apps.length) {
    // This expects GOOGLE_APPLICATION_CREDENTIALS in env for real FCM
    // We wrap it in try-catch so the app doesn't crash if it's missing
    admin.initializeApp();
  }
} catch (err) {
  console.log('Firebase Admin init skipped (missing credentials). FCM will be simulated.');
}

class NotificationService {
  constructor() {
    // Setup Nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'edu.ai.assistant@gmail.com', // Placeholder
        pass: process.env.SMTP_PASS || 'placeholder_password', 
      },
    });

    this.isEmailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  // Send Email
  async sendEmail(to, subject, htmlContent) {
    if (!this.isEmailConfigured) {
      console.log(`\n📧 [EMAIL SIMULATION] To: ${to}\nSubject: ${subject}\nContent: \n${htmlContent}\n`);
      return { success: true, simulated: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Edu AI" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
      });
      console.log('Email sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send Push Notification (FCM)
  async sendPushNotification(tokens, title, body, data = {}) {
    if (!tokens || tokens.length === 0) return { success: false, error: 'No tokens provided' };

    // If Firebase Admin isn't fully configured or fails to send, we simulate it
    try {
      const message = {
        notification: { title, body },
        data: data,
        tokens: tokens,
      };

      if (admin.apps.length) {
        const response = await admin.messaging().sendMulticast(message);
        console.log(`\n🔔 [FCM PUSH] Sent to ${response.successCount} devices. Failed: ${response.failureCount}`);
        return { success: true, response };
      } else {
        throw new Error('Firebase Admin not initialized');
      }
    } catch (error) {
      console.log(`\n🔔 [FCM SIMULATION] Title: ${title}\nBody: ${body}\nTokens: ${tokens.length}\n`);
      return { success: true, simulated: true, error: error.message };
    }
  }

  // Predefined Templates

  async sendWelcomeEmail(email, displayName) {
    const subject = 'Welcome to Edu AI! 🎉';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6c5ce7;">Welcome to Edu AI, ${displayName}!</h2>
        <p>We are thrilled to have you on board. Your personalized learning journey starts now.</p>
        <p>Log in to explore AI tutoring, adaptive tests, and interactive simulations.</p>
        <br/>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #6c5ce7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Learning</a>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendStreakWarning(email, displayName, fcmTokens, streak, hoursLeft) {
    const title = `🔥 Keep your ${streak}-day streak alive!`;
    const body = `Hey ${displayName}, you have ${hoursLeft} hours left before you lose your streak! Hop back into Edu AI.`;

    // 1. Send Email
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #ff5252;">${title}</h2>
        <p>${body}</p>
        <br/>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #ff5252; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Continue Learning</a>
      </div>
    `;
    this.sendEmail(email, title, html);

    // 2. Send Push Notification if tokens exist
    if (fcmTokens && fcmTokens.length > 0) {
      this.sendPushNotification(fcmTokens, title, body, { type: 'streak_warning' });
    }
  }
}

module.exports = new NotificationService();
