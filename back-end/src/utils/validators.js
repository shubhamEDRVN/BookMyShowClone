const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  city: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).max(128).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  city: Joi.string().optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
});

const movieSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  posterUrl: Joi.string().uri().optional(),
  backdropUrl: Joi.string().uri().optional(),
  trailerUrl: Joi.string().uri().optional(),
  genres: Joi.array().items(Joi.string()).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
  formats: Joi.array().items(Joi.string().valid('2D', '3D', 'IMAX', '4DX', 'IMAX 3D')).optional(),
  certification: Joi.string().valid('U', 'U/A', 'A', 'S').optional(),
  duration: Joi.number().integer().min(1).optional(),
  director: Joi.string().optional(),
  cast: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    role: Joi.string().optional(),
    photoUrl: Joi.string().uri().optional(),
  })).optional(),
  releaseDate: Joi.date().optional(),
  status: Joi.string().valid('coming_soon', 'now_showing', 'ended').optional(),
});

const showSchema = Joi.object({
  movie: Joi.string().required(),
  theatre: Joi.string().required(),
  screen: Joi.string().required(),
  showDate: Joi.date().required(),
  showTime: Joi.string().required(),
  language: Joi.string().required(),
  format: Joi.string().required(),
});

const bookingInitiateSchema = Joi.object({
  showId: Joi.string().required(),
  seats: Joi.array().items(Joi.object({
    seatId: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().required(),
  })).min(1).required(),
  foodItems: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().required(),
  })).optional(),
  offerCode: Joi.string().optional(),
});

const bookingConfirmSchema = Joi.object({
  bookingId: Joi.string().required(),
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(10).required(),
  title: Joi.string().max(200).optional(),
  body: Joi.string().max(2000).optional(),
});

const offerSchema = Joi.object({
  code: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().optional(),
  bank: Joi.string().optional(),
  discountType: Joi.string().valid('percent', 'flat').required(),
  discountValue: Joi.number().required(),
  maxDiscount: Joi.number().optional(),
  minOrderValue: Joi.number().optional(),
  validFrom: Joi.date().required(),
  validTill: Joi.date().required(),
  usageLimit: Joi.number().integer().optional(),
});

const eventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  category: Joi.string().valid('music', 'comedy', 'sports', 'play', 'workshop', 'exhibition').required(),
  posterUrl: Joi.string().uri().optional(),
  venue: Joi.object({
    name: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().optional(),
  }).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  ticketTiers: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    available: Joi.number().integer().required(),
    total: Joi.number().integer().required(),
  })).optional(),
  artists: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    photoUrl: Joi.string().uri().optional(),
  })).optional(),
  language: Joi.string().optional(),
  ageRestriction: Joi.string().optional(),
  isFeatured: Joi.boolean().optional(),
});

const lockSeatsSchema = Joi.object({
  seats: Joi.array().items(Joi.string()).min(1).required(),
});

const validateOfferSchema = Joi.object({
  code: Joi.string().required(),
  amount: Joi.number().required(),
});

const theatreSchema = Joi.object({
  name: Joi.string().required(),
  city: Joi.string().required(),
  locality: Joi.string().optional(),
  address: Joi.string().optional(),
  coordinates: Joi.object({
    lat: Joi.number(),
    lng: Joi.number(),
  }).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
});

/**
 * Express middleware factory for Joi validation
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    const ApiError = require('./ApiError');
    throw new ApiError(400, 'Validation failed', errors);
  }
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  movieSchema,
  showSchema,
  bookingInitiateSchema,
  bookingConfirmSchema,
  reviewSchema,
  offerSchema,
  eventSchema,
  lockSeatsSchema,
  validateOfferSchema,
  theatreSchema,
  validate,
};
