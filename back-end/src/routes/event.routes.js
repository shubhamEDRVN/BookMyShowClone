const router = require('express').Router();
const {
  getEvents,
  getFeaturedEvents,
  getEventById,
  bookEvent,
} = require('../controllers/event.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/:id', getEventById);
router.post('/:id/book', authenticate, bookEvent);

module.exports = router;
