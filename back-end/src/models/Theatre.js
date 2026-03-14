const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    locality: {
      type: String,
    },
    address: {
      type: String,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    amenities: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

theatreSchema.index({ city: 1, isActive: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
