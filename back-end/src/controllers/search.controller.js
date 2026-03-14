const Movie = require('../models/Movie');
const Event = require('../models/Event');
const Theatre = require('../models/Theatre');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getRedisClient } = require('../config/redis');

/**
 * GET /api/v1/search
 * Unified search across movies, events, venues
 */
const search = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  if (!q) {
    throw new ApiError(400, 'Search query (q) is required');
  }

  const regex = new RegExp(q, 'i');

  const [movies, events, theatres] = await Promise.all([
    Movie.find({
      isActive: true,
      $or: [{ title: regex }, { genres: regex }, { 'cast.name': regex }],
    })
      .limit(parseInt(limit, 10))
      .select('title posterUrl genres status averageRating'),
    Event.find({
      isActive: true,
      $or: [{ title: regex }, { category: regex }, { 'artists.name': regex }],
    })
      .limit(parseInt(limit, 10))
      .select('title posterUrl category venue.city startDate'),
    Theatre.find({
      isActive: true,
      $or: [{ name: regex }, { city: regex }, { locality: regex }],
    })
      .limit(parseInt(limit, 10))
      .select('name city locality'),
  ]);

  // Track trending search
  const redis = getRedisClient();
  if (redis && redis.isReady) {
    redis.zIncrBy('trending:searches', 1, q.toLowerCase()).catch(() => {});
  }

  res.json(
    new ApiResponse(200, { movies, events, theatres }, 'Search results')
  );
});

/**
 * GET /api/v1/search/suggestions
 * Autocomplete suggestions
 */
const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json(new ApiResponse(200, { suggestions: [] }, 'Suggestions'));
  }

  const regex = new RegExp(`^${q}`, 'i');

  const movies = await Movie.find({ isActive: true, title: regex })
    .limit(5)
    .select('title posterUrl');

  const events = await Event.find({ isActive: true, title: regex })
    .limit(3)
    .select('title category');

  const suggestions = [
    ...movies.map((m) => ({ type: 'movie', id: m._id, title: m.title, posterUrl: m.posterUrl })),
    ...events.map((e) => ({ type: 'event', id: e._id, title: e.title, category: e.category })),
  ];

  res.json(new ApiResponse(200, { suggestions }, 'Suggestions fetched'));
});

/**
 * GET /api/v1/search/trending-searches
 * Trending search terms from Redis sorted set
 */
const getTrendingSearches = asyncHandler(async (req, res) => {
  const redis = getRedisClient();
  if (!redis || !redis.isReady) {
    return res.json(new ApiResponse(200, { terms: [] }, 'Trending searches'));
  }

  const terms = await redis.zRangeWithScores('trending:searches', 0, 9, { REV: true });

  res.json(
    new ApiResponse(200, {
      terms: terms.map((t) => ({ term: t.value, count: t.score })),
    }, 'Trending searches fetched')
  );
});

module.exports = { search, getSuggestions, getTrendingSearches };
