const Razorpay = require('razorpay');

let razorpayInstance = null;

/**
 * Get or create Razorpay instance (lazy initialization)
 * @returns {Razorpay|null} Razorpay instance or null if not configured
 */
const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('Razorpay credentials not configured');
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
