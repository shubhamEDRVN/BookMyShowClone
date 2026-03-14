const router = require('express').Router();
const { getReviews, likeReview } = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', getReviews);
router.post('/:id/like', authenticate, likeReview);

module.exports = router;
