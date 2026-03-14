const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Event = require('../models/Event');
const Offer = require('../models/Offer');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/admin/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [bookingsToday, totalRevenue, activeShows, newUsers] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: today }, status: 'confirmed' }),
    Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$payableAmount' } } },
    ]),
    Show.countDocuments({ isActive: true, showDate: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: today } }),
  ]);

  res.json(
    new ApiResponse(200, {
      bookingsToday,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeShows,
      newUsersToday: newUsers,
    }, 'Dashboard stats fetched')
  );
});

/**
 * POST /api/v1/admin/movies
 */
const createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json(new ApiResponse(201, { movie }, 'Movie created'));
});

/**
 * PUT /api/v1/admin/movies/:id
 */
const updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!movie) throw new ApiError(404, 'Movie not found');
  res.json(new ApiResponse(200, { movie }, 'Movie updated'));
});

/**
 * DELETE /api/v1/admin/movies/:id (soft delete)
 */
const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!movie) throw new ApiError(404, 'Movie not found');
  res.json(new ApiResponse(200, null, 'Movie deactivated'));
});

/**
 * POST /api/v1/admin/theatres
 */
const createTheatre = asyncHandler(async (req, res) => {
  const theatre = await Theatre.create(req.body);
  res.status(201).json(new ApiResponse(201, { theatre }, 'Theatre created'));
});

/**
 * POST /api/v1/admin/shows
 * Create show with time conflict validation
 */
const createShow = asyncHandler(async (req, res) => {
  const { screen, showDate, showTime, movie, theatre, language, format } = req.body;

  // Validate no time conflict on same screen
  const existingShow = await Show.findOne({
    screen,
    showDate: new Date(showDate),
    showTime,
    isActive: true,
  });

  if (existingShow) {
    throw new ApiError(409, 'A show already exists at this time on this screen');
  }

  // Get screen total seats
  const screenDoc = await Screen.findById(screen);
  const totalSeats = screenDoc ? screenDoc.totalSeats : 0;

  const show = await Show.create({
    movie,
    theatre,
    screen,
    showDate: new Date(showDate),
    showTime,
    language,
    format,
    totalSeats,
  });

  res.status(201).json(new ApiResponse(201, { show }, 'Show created'));
});

/**
 * PUT /api/v1/admin/shows/:id
 */
const updateShow = asyncHandler(async (req, res) => {
  const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!show) throw new ApiError(404, 'Show not found');
  res.json(new ApiResponse(200, { show }, 'Show updated'));
});

/**
 * GET /api/v1/admin/bookings
 */
const getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('movie', 'title')
    .populate('theatre', 'name city')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Booking.countDocuments(filter);

  res.json(
    new ApiResponse(200, {
      bookings,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'All bookings fetched')
  );
});

/**
 * GET /api/v1/admin/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await User.countDocuments();

  res.json(
    new ApiResponse(200, {
      users,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'Users fetched')
  );
});

/**
 * POST /api/v1/admin/offers
 */
const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create(req.body);
  res.status(201).json(new ApiResponse(201, { offer }, 'Offer created'));
});

/**
 * GET /api/v1/admin/analytics
 * Revenue charts data
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const { period = 'daily' } = req.query;

  let groupFormat;
  if (period === 'monthly') {
    groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  } else if (period === 'weekly') {
    groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
  } else {
    groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const analytics = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: '$payableAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 30 },
  ]);

  res.json(new ApiResponse(200, { analytics }, 'Analytics fetched'));
});

/**
 * POST /api/v1/admin/events
 */
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(new ApiResponse(201, { event }, 'Event created'));
});

module.exports = {
  getDashboard,
  createMovie,
  updateMovie,
  deleteMovie,
  createTheatre,
  createShow,
  updateShow,
  getAllBookings,
  getAllUsers,
  createOffer,
  getAnalytics,
  createEvent,
};
