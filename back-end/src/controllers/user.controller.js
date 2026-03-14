const User = require('../models/User');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../config/cloudinary');

/**
 * GET /api/v1/users/me
 */
const getProfile = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }, 'Profile fetched'));
});

/**
 * PUT /api/v1/users/me
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, city, phone } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (city) updates.city = city;
  if (phone) updates.phone = phone;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, { user }, 'Profile updated'));
});

/**
 * PUT /api/v1/users/me/password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.passwordHash = newPassword;
  await user.save();

  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});

/**
 * GET /api/v1/users/me/bookings
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, filter } = req.query;
  const query = { user: req.user._id };

  if (filter === 'upcoming') {
    query.status = 'confirmed';
    query['show'] = { $exists: true };
  } else if (filter === 'past') {
    query.status = { $in: ['confirmed', 'cancelled'] };
  }

  const bookings = await Booking.find(query)
    .populate('movie', 'title posterUrl')
    .populate('theatre', 'name city')
    .populate('show', 'showDate showTime')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Booking.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      bookings,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'Bookings fetched')
  );
});

/**
 * GET /api/v1/users/me/bookings/:id
 */
const getMyBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('movie', 'title posterUrl duration certification')
    .populate('theatre', 'name city address')
    .populate('show', 'showDate showTime screen language format');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  res.json(new ApiResponse(200, { booking }, 'Booking details fetched'));
});

/**
 * POST /api/v1/users/me/wishlist/:movieId
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const { movieId } = req.params;

  const movie = await Movie.findById(movieId);
  if (!movie) throw new ApiError(404, 'Movie not found');

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { wishlist: movieId },
  });

  res.json(new ApiResponse(200, null, 'Added to wishlist'));
});

/**
 * DELETE /api/v1/users/me/wishlist/:movieId
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: req.params.movieId },
  });

  res.json(new ApiResponse(200, null, 'Removed from wishlist'));
});

/**
 * GET /api/v1/users/me/wishlist
 */
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist',
    'title posterUrl genres releaseDate status averageRating'
  );

  res.json(new ApiResponse(200, { wishlist: user.wishlist }, 'Wishlist fetched'));
});

/**
 * GET /api/v1/users/me/loyalty
 */
const getLoyalty = asyncHandler(async (req, res) => {
  res.json(
    new ApiResponse(200, { loyaltyPoints: req.user.loyaltyPoints }, 'Loyalty points fetched')
  );
});

/**
 * POST /api/v1/users/me/avatar
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Image file is required');
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bookmyshow/avatars', width: 300, crop: 'scale' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true }
  );

  res.json(new ApiResponse(200, { user }, 'Avatar uploaded'));
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getMyBookings,
  getMyBookingById,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getLoyalty,
  uploadAvatar,
};
