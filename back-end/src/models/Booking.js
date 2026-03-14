const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      default: () => `BMS${nanoid()}`,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
    },
    seats: [
      {
        seatId: { type: String },
        category: { type: String },
        price: { type: Number },
      },
    ],
    foodItems: [
      {
        name: { type: String },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
    totalAmount: {
      type: Number,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    offerCode: {
      type: String,
    },
    convenienceFee: {
      type: Number,
      default: 0,
    },
    payableAmount: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'pending',
    },
    qrCode: {
      type: String, // Base64 QR
    },
    cancellationReason: {
      type: String,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ show: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
