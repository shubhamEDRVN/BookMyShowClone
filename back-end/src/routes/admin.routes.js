const router = require('express').Router();
const {
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
} = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/admin.middleware');
const { validate, movieSchema, showSchema, offerSchema, eventSchema, theatreSchema } = require('../utils/validators');

router.use(authenticate, adminOnly);

router.get('/dashboard', getDashboard);
router.post('/movies', validate(movieSchema), createMovie);
router.put('/movies/:id', validate(movieSchema), updateMovie);
router.delete('/movies/:id', deleteMovie);
router.post('/theatres', validate(theatreSchema), createTheatre);
router.post('/shows', validate(showSchema), createShow);
router.put('/shows/:id', updateShow);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.post('/offers', validate(offerSchema), createOffer);
router.get('/analytics', getAnalytics);
router.post('/events', validate(eventSchema), createEvent);

module.exports = router;
