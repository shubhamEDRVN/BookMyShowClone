const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['music', 'comedy', 'sports', 'play', 'workshop', 'exhibition'],
      required: true,
    },
    posterUrl: {
      type: String,
    },
    venue: {
      name: { type: String },
      city: { type: String },
      address: { type: String },
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    ticketTiers: [
      {
        name: { type: String },
        price: { type: Number },
        available: { type: Number },
        total: { type: Number },
      },
    ],
    artists: [
      {
        name: { type: String },
        photoUrl: { type: String },
      },
    ],
    language: {
      type: String,
    },
    ageRestriction: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ 'venue.city': 1, category: 1 });
eventSchema.index({ startDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
