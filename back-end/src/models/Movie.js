const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    posterUrl: {
      type: String,
    },
    backdropUrl: {
      type: String,
    },
    trailerUrl: {
      type: String, // YouTube embed URL
    },
    genres: [String],
    languages: [String],
    formats: [
      {
        type: String,
        enum: ['2D', '3D', 'IMAX', '4DX', 'IMAX 3D'],
      },
    ],
    certification: {
      type: String,
      enum: ['U', 'U/A', 'A', 'S'],
    },
    duration: {
      type: Number, // minutes
    },
    director: {
      type: String,
    },
    cast: [
      {
        name: { type: String },
        role: { type: String },
        photoUrl: { type: String },
      },
    ],
    releaseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['coming_soon', 'now_showing', 'ended'],
      default: 'coming_soon',
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    interestedCount: {
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

movieSchema.index({ title: 'text', 'cast.name': 'text', genres: 'text' });
movieSchema.index({ status: 1, isActive: 1 });
movieSchema.index({ releaseDate: -1 });

module.exports = mongoose.model('Movie', movieSchema);
