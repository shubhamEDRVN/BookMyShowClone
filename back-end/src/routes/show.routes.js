const router = require('express').Router();
const {
  getShowById,
  lockShowSeats,
  unlockShowSeats,
  getShowSeatStatus,
} = require('../controllers/show.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, lockSeatsSchema } = require('../utils/validators');

router.get('/:id', getShowById);
router.post('/:id/lock-seats', authenticate, validate(lockSeatsSchema), lockShowSeats);
router.delete('/:id/unlock-seats', authenticate, unlockShowSeats);
router.get('/:id/seat-status', getShowSeatStatus);

module.exports = router;
