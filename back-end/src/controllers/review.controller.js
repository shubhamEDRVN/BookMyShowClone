const Review = require('../models/Review');
const Movie = require('../models/Movie');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/reviews (query by movieId)
 */
const getReviews = asyncHandler(async (req, res) => {
  const { movieId, page = 1, limit = 10, sort = 'recent' } = req.query;
  const filter = {};
  if (movieId) filter.movie = movieId;

  const sortOption = sort === 'top' ? { likes: -1 } : { createdAt: -1 };

  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Review.countDocuments(filter);

  res.json(
    new ApiResponse(200, {
      reviews,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'Reviews fetched')
  );
});

/**
 * POST /api/v1/reviews/:id/like
 */
const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );

  if (!review) throw new ApiError(404, 'Review not found');

  res.json(new ApiResponse(200, { review }, 'Review liked'));
});

module.exports = { getReviews, likeReview };
