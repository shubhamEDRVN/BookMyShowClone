const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    layout: {
      rows: Number,
      columns: Number,
      categories: [
        {
          name: { type: String }, // Silver, Gold, Platinum
          rows: [String],         // ['A','B','C']
          price: { type: Number },
          color: { type: String },
        },
      ],
    },
    features: [String], // Dolby, IMAX
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

screenSchema.index({ theatre: 1 });

module.exports = mongoose.model('Screen', screenSchema);
