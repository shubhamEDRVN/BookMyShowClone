/**
 * SMS service using MSG91/Twilio
 * Placeholder implementation - configure with your SMS provider
 */

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 */
const sendOTP = async (phone, otp) => {
  // MSG91 / Twilio integration
  // For development, log the OTP
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS] OTP for ${phone}: ${otp}`);
    return;
  }

  // Production: integrate with MSG91 or Twilio
  // const response = await fetch('https://api.msg91.com/api/v5/otp', { ... });
  console.log(`[SMS] OTP sent to ${phone}`);
};

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { sendOTP, generateOTP };
