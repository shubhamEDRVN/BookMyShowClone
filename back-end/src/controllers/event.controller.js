const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/events
 */
const getEvents = asyncHandler(async (req, res) => {
  const { city, category, date, page = 1, limit = 20 } = req.query;
  const filter = { isActive: true };

  if (city) filter['venue.city'] = city;
  if (category) filter.category = category;
  if (date) {
    filter.startDate = { $lte: new Date(date) };
    filter.endDate = { $gte: new Date(date) };
  }

  const events = await Event.find(filter)
    .sort('startDate')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Event.countDocuments(filter);

  res.json(
    new ApiResponse(200, {
      events,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    }, 'Events fetched')
  );
});

/**
 * GET /api/v1/events/featured
 */
const getFeaturedEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    isActive: true,
    isFeatured: true,
    endDate: { $gte: new Date() },
  })
    .sort('startDate')
    .limit(10);

  res.json(new ApiResponse(200, { events }, 'Featured events fetched'));
});

/**
 * GET /api/v1/events/:id
 */
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event || !event.isActive) {
    throw new ApiError(404, 'Event not found');
  }

  res.json(new ApiResponse(200, { event }, 'Event details fetched'));
});

/**
 * POST /api/v1/events/:id/book
 * Book an event ticket
 */
const bookEvent = asyncHandler(async (req, res) => {
  const { tierId, quantity = 1 } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event || !event.isActive) {
    throw new ApiError(404, 'Event not found');
  }

  const tier = event.ticketTiers.id(tierId);
  if (!tier) {
    throw new ApiError(404, 'Ticket tier not found');
  }

  if (tier.available < quantity) {
    throw new ApiError(400, 'Not enough tickets available');
  }

  tier.available -= quantity;
  await event.save();

  res.json(
    new ApiResponse(200, {
      event: event.title,
      tier: tier.name,
      quantity,
      totalAmount: tier.price * quantity,
    }, 'Event tickets booked')
  );
});

module.exports = { getEvents, getFeaturedEvents, getEventById, bookEvent };
