const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    title: {
      type: String,
    },
    body: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ movie: 1, createdAt: -1 });
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
