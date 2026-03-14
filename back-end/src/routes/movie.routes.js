const router = require('express').Router();
const {
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
} = require('../controllers/movie.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { cacheMiddleware } = require('../middlewares/cache.middleware');
const { validate, reviewSchema } = require('../utils/validators');

router.get('/', getMovies);
router.get('/now-showing', getNowShowing);
router.get('/coming-soon', getComingSoon);
router.get('/trending', cacheMiddleware('trending:movies', 3600), getTrending);
router.get('/featured', cacheMiddleware('featured:movies', 1800), getFeatured);
router.get('/search', searchMovies);
router.get('/:id', cacheMiddleware('movie', 1800), getMovieById);
router.get('/:id/shows', getMovieShows);
router.get('/:id/reviews', getMovieReviews);
router.post('/:id/reviews', authenticate, validate(reviewSchema), postReview);
router.post('/:id/interested', authenticate, toggleInterested);

module.exports = router;
