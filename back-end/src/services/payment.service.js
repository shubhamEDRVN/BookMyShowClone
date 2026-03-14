const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');
const ApiError = require('../utils/ApiError');

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in INR
 * @param {string} receipt - Receipt identifier
 * @returns {Object} Razorpay order
 */
const createOrder = async (amount, receipt) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new ApiError(503, 'Payment gateway not configured');
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise
    currency: 'INR',
    receipt,
    payment_capture: 1,
  };
  return razorpay.orders.create(options);
};

/**
 * Verify Razorpay payment signature using HMAC-SHA256
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Signature from Razorpay
 * @returns {boolean} Whether signature is valid
 */
const verifySignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

/**
 * Initiate a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in INR (optional, full refund if omitted)
 * @returns {Object} Refund object
 */
const initiateRefund = async (paymentId, amount) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new ApiError(503, 'Payment gateway not configured');
  }

  const options = {};
  if (amount) {
    options.amount = Math.round(amount * 100);
  }
  return razorpay.payments.refund(paymentId, options);
};

module.exports = { createOrder, verifySignature, initiateRefund };
