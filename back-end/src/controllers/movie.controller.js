const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/movies
 * List movies with filters
 */
const getMovies = asyncHandler(async (req, res) => {
  const { status, genre, language, page = 1, limit = 20, sort = '-releaseDate' } = req.query;
  const filter = { isActive: true };

  if (status) filter.status = status;
  if (genre) filter.genres = { $in: [genre] };
  if (language) filter.languages = { $in: [language] };

  const movies = await Movie.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Movie.countDocuments(filter);

  res.json(
    new ApiResponse(200, {
      movies,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'Movies fetched')
  );
});

/**
 * GET /api/v1/movies/now-showing
 */
const getNowShowing = asyncHandler(async (req, res) => {
  const { city, page = 1, limit = 20 } = req.query;
  const filter = { status: 'now_showing', isActive: true };

  let movieIds;
  if (city) {
    // Get movies that have active shows in the specified city
    const shows = await Show.find({ isActive: true })
      .populate({ path: 'theatre', match: { city, isActive: true }, select: '_id' });
    movieIds = [...new Set(
      shows.filter((s) => s.theatre).map((s) => s.movie.toString())
    )];
    if (movieIds.length > 0) {
      filter._id = { $in: movieIds };
    }
  }

  const movies = await Movie.find(filter)
    .sort('-releaseDate')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Movie.countDocuments(filter);

  res.json(
    new ApiResponse(200, {
      movies,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'Now showing movies fetched')
  );
});

/**
 * GET /api/v1/movies/coming-soon
 */
const getComingSoon = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const movies = await Movie.find({ status: 'coming_soon', isActive: true })
    .sort('releaseDate')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Movie.countDocuments({ status: 'coming_soon', isActive: true });

  res.json(
    new ApiResponse(200, {
      movies,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'Coming soon movies fetched')
  );
});

/**
 * GET /api/v1/movies/trending
 * Trending by booking count (cached 1hr)
 */
const getTrending = asyncHandler(async (req, res) => {
  const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await Booking.aggregate([
    { $match: { status: 'confirmed', createdAt: { $gte: recentDate } } },
    { $group: { _id: '$movie', bookingCount: { $sum: 1 } } },
    { $sort: { bookingCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movie',
      },
    },
    { $unwind: '$movie' },
    { $match: { 'movie.isActive': true } },
  ]);

  const movies = trending.map((t) => ({ ...t.movie, bookingCount: t.bookingCount }));

  res.json(new ApiResponse(200, { movies }, 'Trending movies fetched'));
});

/**
 * GET /api/v1/movies/featured
 * Featured/banner movies
 */
const getFeatured = asyncHandler(async (req, res) => {
  const movies = await Movie.find({
    isActive: true,
    status: 'now_showing',
    averageRating: { $gte: 7 },
  })
    .sort('-averageRating -totalRatings')
    .limit(5);

  res.json(new ApiResponse(200, { movies }, 'Featured movies fetched'));
});

/**
 * GET /api/v1/movies/:id
 * Movie details
 */
const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie || !movie.isActive) {
    throw new ApiError(404, 'Movie not found');
  }

  res.json(new ApiResponse(200, { movie }, 'Movie details fetched'));
});

/**
 * GET /api/v1/movies/:id/shows
 * Available shows for a movie
 */
const getMovieShows = asyncHandler(async (req, res) => {
  const { date, city, format, language } = req.query;
  const filter = { movie: req.params.id, isActive: true };

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.showDate = { $gte: startOfDay, $lte: endOfDay };
  }
  if (format) filter.format = format;
  if (language) filter.language = language;

  let shows = await Show.find(filter)
    .populate('theatre', 'name city locality address amenities')
    .populate('screen', 'name features')
    .sort('showTime');

  if (city) {
    shows = shows.filter((s) => s.theatre && s.theatre.city === city);
  }

  res.json(new ApiResponse(200, { shows }, 'Shows fetched'));
});

/**
 * GET /api/v1/movies/:id/reviews
 */
const getMovieReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'recent' } = req.query;
  const sortOption = sort === 'top' ? { likes: -1 } : { createdAt: -1 };

  const reviews = await Review.find({ movie: req.params.id })
    .populate('user', 'name avatar')
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Review.countDocuments({ movie: req.params.id });

  res.json(
    new ApiResponse(200, {
      reviews,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'Reviews fetched')
  );
});

/**
 * POST /api/v1/movies/:id/reviews
 * Post a review (auth, verified purchase only)
 */
const postReview = asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  const userId = req.user._id;

  // Check for verified purchase
  const hasBooking = await Booking.findOne({
    user: userId,
    movie: movieId,
    status: 'confirmed',
  });

  const existingReview = await Review.findOne({ user: userId, movie: movieId });
  if (existingReview) {
    throw new ApiError(409, 'You have already reviewed this movie');
  }

  const review = await Review.create({
    user: userId,
    movie: movieId,
    rating: req.body.rating,
    title: req.body.title,
    body: req.body.body,
    isVerifiedPurchase: !!hasBooking,
  });

  // Update movie average rating
  const stats = await Review.aggregate([
    { $match: { movie: review.movie } },
    {
      $group: {
        _id: '$movie',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings,
    });
  }

  res.status(201).json(new ApiResponse(201, { review }, 'Review posted'));
});

/**
 * POST /api/v1/movies/:id/interested
 * Toggle "interested" for coming soon movies
 */
const toggleInterested = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new ApiError(404, 'Movie not found');

  // Simple toggle: increment/decrement
  movie.interestedCount = (movie.interestedCount || 0) + 1;
  await movie.save();

  res.json(new ApiResponse(200, { interestedCount: movie.interestedCount }, 'Interest toggled'));
});

/**
 * GET /api/v1/movies/search
 * Full-text search
 */
const searchMovies = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  if (!q) {
    throw new ApiError(400, 'Search query is required');
  }

  const movies = await Movie.find(
    { $text: { $search: q }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(new ApiResponse(200, { movies }, 'Search results'));
});

module.exports = {
  getMovies,
  getNowShowing,
  getComingSoon,
  getTrending,
  getFeatured,
  getMovieById,
  getMovieShows,
  getMovieReviews,
  postReview,
  toggleInterested,
  searchMovies,
};
