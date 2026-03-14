const Show = require('../models/Show');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { lockSeats, unlockSeats, getSeatStatus } = require('../services/seat.service');

/**
 * GET /api/v1/shows/:id
 * Show details + seat map
 */
const getShowById = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id)
    .populate('movie', 'title posterUrl duration certification')
    .populate('theatre', 'name city address amenities')
    .populate('screen');

  if (!show || !show.isActive) {
    throw new ApiError(404, 'Show not found');
  }

  res.json(new ApiResponse(200, { show }, 'Show details fetched'));
});

/**
 * POST /api/v1/shows/:id/lock-seats
 * Temporarily lock seats (10 min, Redis TTL)
 */
const lockShowSeats = asyncHandler(async (req, res) => {
  const { seats } = req.body;
  const showId = req.params.id;
  const userId = req.user._id.toString();

  await lockSeats(showId, seats, userId);

  res.json(new ApiResponse(200, { lockedSeats: seats }, 'Seats locked for 10 minutes'));
});

/**
 * DELETE /api/v1/shows/:id/unlock-seats
 * Release locked seats
 */
const unlockShowSeats = asyncHandler(async (req, res) => {
  const { seats } = req.body;
  const showId = req.params.id;
  const userId = req.user._id.toString();

  await unlockSeats(showId, seats, userId);

  res.json(new ApiResponse(200, null, 'Seats unlocked'));
});

/**
 * GET /api/v1/shows/:id/seat-status
 * Real-time seat availability
 */
const getShowSeatStatus = asyncHandler(async (req, res) => {
  const seatStatus = await getSeatStatus(req.params.id);

  res.json(new ApiResponse(200, seatStatus, 'Seat status fetched'));
});

module.exports = {
  getShowById,
  lockShowSeats,
  unlockShowSeats,
  getShowSeatStatus,
};
