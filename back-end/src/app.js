const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { errorHandler } = require('./middlewares/error.middleware');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimit.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const movieRoutes = require('./routes/movie.routes');
const theatreRoutes = require('./routes/theatre.routes');
const showRoutes = require('./routes/show.routes');
const bookingRoutes = require('./routes/booking.routes');
const eventRoutes = require('./routes/event.routes');
const reviewRoutes = require('./routes/review.routes');
const offerRoutes = require('./routes/offer.routes');
const paymentRoutes = require('./routes/payment.routes');
const searchRoutes = require('./routes/search.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes with rate limiting
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', apiLimiter, userRoutes);
app.use('/api/v1/movies', apiLimiter, movieRoutes);
app.use('/api/v1/theatres', apiLimiter, theatreRoutes);
app.use('/api/v1/shows', apiLimiter, showRoutes);
app.use('/api/v1/bookings', apiLimiter, bookingRoutes);
app.use('/api/v1/events', apiLimiter, eventRoutes);
app.use('/api/v1/reviews', apiLimiter, reviewRoutes);
app.use('/api/v1/offers', apiLimiter, offerRoutes);
app.use('/api/v1/payment', apiLimiter, paymentRoutes);
app.use('/api/v1/search', apiLimiter, searchRoutes);
app.use('/api/v1/admin', apiLimiter, adminRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
