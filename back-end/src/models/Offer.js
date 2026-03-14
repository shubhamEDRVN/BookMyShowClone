const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    bank: {
      type: String,
    },
    discountType: {
      type: String,
      enum: ['percent', 'flat'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscount: {
      type: Number,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
    },
    validTill: {
      type: Date,
    },
    usageLimit: {
      type: Number,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

offerSchema.index({ code: 1, isActive: 1 });

module.exports = mongoose.model('Offer', offerSchema);
