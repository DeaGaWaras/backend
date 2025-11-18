const nodemailer = require('nodemailer');

// Configure email service (using Gmail or your SMTP)
// For production, use environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER || 'your-email@gmail.com',
    pass: process.env.MAIL_PASSWORD || 'your-app-password'
  }
});

/**
 * Send email with attachments
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - email body HTML
 * @param {array} attachments - file attachments
 */
exports.sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@smanike.sch.id',
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email error to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send multiple emails
 */
exports.sendBulkEmail = async (recipients, subject, html, attachments = []) => {
  const results = [];
  for (const email of recipients) {
    const result = await exports.sendEmail(email, subject, html, attachments);
    results.push({ email, ...result });
  }
  return results;
};
