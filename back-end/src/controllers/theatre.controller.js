const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/theatres
 */
const getTheatres = asyncHandler(async (req, res) => {
  const { city, movie } = req.query;
  const filter = { isActive: true };

  if (city) filter.city = city;

  let theatres;
  if (movie) {
    // Find theatres showing this movie
    const shows = await Show.find({ movie, isActive: true }).distinct('theatre');
    filter._id = { $in: shows };
  }

  theatres = await Theatre.find(filter).sort('name');

  res.json(new ApiResponse(200, { theatres }, 'Theatres fetched'));
});

/**
 * GET /api/v1/theatres/:id
 */
const getTheatreById = asyncHandler(async (req, res) => {
  const theatre = await Theatre.findById(req.params.id);
  if (!theatre || !theatre.isActive) {
    throw new ApiError(404, 'Theatre not found');
  }

  const screens = await Screen.find({ theatre: theatre._id, isActive: true });

  res.json(new ApiResponse(200, { theatre, screens }, 'Theatre details fetched'));
});

/**
 * GET /api/v1/theatres/:id/shows
 */
const getTheatreShows = asyncHandler(async (req, res) => {
  const { date, movieId } = req.query;
  const filter = { theatre: req.params.id, isActive: true };

  if (movieId) filter.movie = movieId;

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.showDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const shows = await Show.find(filter)
    .populate('movie', 'title posterUrl duration')
    .populate('screen', 'name features')
    .sort('showTime');

  res.json(new ApiResponse(200, { shows }, 'Theatre shows fetched'));
});

module.exports = { getTheatres, getTheatreById, getTheatreShows };
