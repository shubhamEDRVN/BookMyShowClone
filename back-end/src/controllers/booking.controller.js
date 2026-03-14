const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { lockSeats, unlockSeats } = require('../services/seat.service');
const { createOrder, verifySignature } = require('../services/payment.service');
const { sendBookingConfirmationEmail } = require('../services/email.service');

const CONVENIENCE_FEE_GST_MULTIPLIER = 1.18; // Base fee + 18% GST

/**
 * POST /api/v1/bookings/initiate
 * Create pending booking → lock seats → create Razorpay order
 */
const initiateBooking = asyncHandler(async (req, res) => {
  const { showId, seats, foodItems = [], offerCode } = req.body;
  const userId = req.user._id;

  const show = await Show.findById(showId);
  if (!show || !show.isActive) {
    throw new ApiError(404, 'Show not found');
  }

  // Lock seats
  const seatIds = seats.map((s) => s.seatId);
  await lockSeats(showId, seatIds, userId.toString());

  // Calculate amounts using integer arithmetic (paise) to avoid floating-point errors
  const seatTotal = seats.reduce((sum, s) => sum + Math.round(s.price * 100), 0);
  const foodTotal = foodItems.reduce((sum, f) => sum + Math.round(f.price * 100) * f.quantity, 0);
  const totalAmount = seatTotal + foodTotal;
  const convenienceFee = Math.round(seatTotal * 0.028 * CONVENIENCE_FEE_GST_MULTIPLIER);
  const payableAmount = totalAmount + convenienceFee;

  // Convert back to rupees for storage
  const totalAmountRupees = totalAmount / 100;
  const convenienceFeeRupees = convenienceFee / 100;
  const payableAmountRupees = payableAmount / 100;

  // Create booking
  const booking = await Booking.create({
    user: userId,
    show: showId,
    movie: show.movie,
    theatre: show.theatre,
    seats,
    foodItems,
    totalAmount: totalAmountRupees,
    convenienceFee: convenienceFeeRupees,
    offerCode,
    payableAmount: payableAmountRupees,
    status: 'pending',
    paymentStatus: 'pending',
  });

  // Create Razorpay order
  let razorpayOrder;
  try {
    razorpayOrder = await createOrder(payableAmountRupees, booking.bookingId);
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();
  } catch (error) {
    // If Razorpay fails, still return booking for alternate payment
    console.error('Razorpay order creation failed:', error.message);
  }

  res.status(201).json(
    new ApiResponse(201, {
      booking,
      razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    }, 'Booking initiated')
  );
});

/**
 * POST /api/v1/bookings/confirm
 * Verify payment → confirm booking → mark seats as booked → award loyalty
 */
const confirmBooking = asyncHandler(async (req, res) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status === 'confirmed') {
    throw new ApiError(400, 'Booking is already confirmed');
  }

  // Verify payment signature
  const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    booking.paymentStatus = 'failed';
    await booking.save();
    throw new ApiError(400, 'Invalid payment signature');
  }

  // Update booking
  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.razorpayPaymentId = razorpayPaymentId;

  // Generate QR code
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    seats: booking.seats.map((s) => s.seatId),
    movie: booking.movie,
  });
  booking.qrCode = await QRCode.toDataURL(qrData);

  await booking.save();

  // Mark seats as booked in Show
  const seatIds = booking.seats.map((s) => s.seatId);
  await Show.findByIdAndUpdate(booking.show, {
    $push: { bookedSeats: { $each: seatIds } },
  });

  // Release Redis locks
  await unlockSeats(booking.show.toString(), seatIds, booking.user.toString());

  // Award loyalty points (₹100 spent = 1 point)
  const pointsEarned = Math.floor(booking.payableAmount / 100);
  if (pointsEarned > 0) {
    await User.findByIdAndUpdate(booking.user, {
      $inc: { loyaltyPoints: pointsEarned },
    });
  }

  // Send confirmation email (non-blocking)
  const user = await User.findById(booking.user);
  if (user && user.email) {
    sendBookingConfirmationEmail(user.email, booking).catch((err) =>
      console.error('Confirmation email failed:', err.message)
    );
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate('movie', 'title posterUrl')
    .populate('theatre', 'name city')
    .populate('show', 'showDate showTime');

  res.json(new ApiResponse(200, { booking: populatedBooking }, 'Booking confirmed'));
});

/**
 * GET /api/v1/bookings/:id
 */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('movie', 'title posterUrl duration certification')
    .populate('theatre', 'name city address')
    .populate('show', 'showDate showTime language format');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  res.json(new ApiResponse(200, { booking }, 'Booking fetched'));
});

/**
 * POST /api/v1/bookings/:id/cancel
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(400, 'Booking is already cancelled');
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'User cancelled';

  // Remove seats from booked list
  const seatIds = booking.seats.map((s) => s.seatId);
  await Show.findByIdAndUpdate(booking.show, {
    $pull: { bookedSeats: { $in: seatIds } },
  });

  // Initiate refund if paid
  if (booking.paymentStatus === 'paid') {
    booking.paymentStatus = 'refunded';
    // Payment refund would be initiated here via payment.service
  }

  await booking.save();

  res.json(new ApiResponse(200, { booking }, 'Booking cancelled'));
});

/**
 * GET /api/v1/bookings/:id/ticket
 * Generate/fetch ticket info
 */
const getTicket = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: 'confirmed',
  })
    .populate('movie', 'title posterUrl duration certification')
    .populate('theatre', 'name city address')
    .populate('show', 'showDate showTime screen language format');

  if (!booking) {
    throw new ApiError(404, 'Confirmed booking not found');
  }

  res.json(new ApiResponse(200, { ticket: booking }, 'Ticket fetched'));
});

/**
 * GET /api/v1/bookings/:id/qr
 * Get QR code for entry
 */
const getQRCode = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: 'confirmed',
  });

  if (!booking) {
    throw new ApiError(404, 'Confirmed booking not found');
  }

  if (!booking.qrCode) {
    const qrData = JSON.stringify({
      bookingId: booking.bookingId,
      seats: booking.seats.map((s) => s.seatId),
    });
    booking.qrCode = await QRCode.toDataURL(qrData);
    await booking.save();
  }

  res.json(new ApiResponse(200, { qrCode: booking.qrCode }, 'QR code fetched'));
});

module.exports = {
  initiateBooking,
  confirmBooking,
  getBookingById,
  cancelBooking,
  getTicket,
  getQRCode,
};
