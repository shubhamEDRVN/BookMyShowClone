const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email verification link
 * @param {string} to - Recipient email
 * @param {string} name - User name
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"BookMyShow" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Verify Your Email - BookMyShow',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}" style="padding:12px 24px;background:#dc3558;color:#fff;text-decoration:none;border-radius:4px;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} name - User name
 * @param {string} token - Reset token
 */
const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"BookMyShow" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset Your Password - BookMyShow',
    html: `
      <h2>Hi ${name},</h2>
      <p>You requested a password reset. Click below to set a new password:</p>
      <a href="${resetUrl}" style="padding:12px 24px;background:#dc3558;color:#fff;text-decoration:none;border-radius:4px;">
        Reset Password
      </a>
      <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `,
  });
};

/**
 * Send booking confirmation email
 * @param {string} to - Recipient email
 * @param {Object} booking - Booking details
 */
const sendBookingConfirmationEmail = async (to, booking) => {
  await transporter.sendMail({
    from: `"BookMyShow" <${process.env.SMTP_USER}>`,
    to,
    subject: `Booking Confirmed - ${booking.bookingId}`,
    html: `
      <h2>Booking Confirmed!</h2>
      <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      <p><strong>Seats:</strong> ${booking.seats.map((s) => s.seatId).join(', ')}</p>
      <p><strong>Amount Paid:</strong> ₹${booking.payableAmount}</p>
      <p>Show your QR code at the theatre entrance. Enjoy the show!</p>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
};
