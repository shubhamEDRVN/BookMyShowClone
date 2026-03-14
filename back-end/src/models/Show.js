const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
    },
    showDate: {
      type: Date,
      required: true,
    },
    showTime: {
      type: String, // "10:30 AM"
      required: true,
    },
    language: {
      type: String,
    },
    format: {
      type: String,
    },
    totalSeats: {
      type: Number,
    },
    bookedSeats: [String], // ['A1','A2','B5']
    lockedSeats: [
      {
        seatId: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId },
        lockedAt: { type: Date },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

showSchema.index({ movie: 1, showDate: 1, isActive: 1 });
showSchema.index({ theatre: 1, showDate: 1 });
showSchema.index({ screen: 1, showDate: 1, showTime: 1 });

module.exports = mongoose.model('Show', showSchema);
