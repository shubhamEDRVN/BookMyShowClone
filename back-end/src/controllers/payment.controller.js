const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createOrder, verifySignature, initiateRefund } = require('../services/payment.service');
const Booking = require('../models/Booking');

/**
 * POST /api/v1/payment/create-order
 * Create Razorpay order
 */
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, bookingId } = req.body;

  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Valid amount is required');
  }

  const order = await createOrder(amount, bookingId || `order_${Date.now()}`);

  res.json(
    new ApiResponse(200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, 'Payment order created')
  );
});

/**
 * POST /api/v1/payment/verify
 * Verify Razorpay payment signature
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    throw new ApiError(400, 'Invalid payment signature');
  }

  // Update related booking if exists
  const booking = await Booking.findOne({ razorpayOrderId });
  if (booking) {
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.paymentStatus = 'paid';
    await booking.save();
  }

  res.json(new ApiResponse(200, { verified: true }, 'Payment verified'));
});

/**
 * POST /api/v1/payment/refund
 * Initiate refund
 */
const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId, amount } = req.body;

  if (!paymentId) {
    throw new ApiError(400, 'Payment ID is required');
  }

  const refund = await initiateRefund(paymentId, amount);

  res.json(new ApiResponse(200, { refund }, 'Refund initiated'));
});

module.exports = { createPaymentOrder, verifyPayment, refundPayment };
