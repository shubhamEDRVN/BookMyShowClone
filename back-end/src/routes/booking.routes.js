const router = require('express').Router();
const {
  initiateBooking,
  confirmBooking,
  getBookingById,
  cancelBooking,
  getTicket,
  getQRCode,
} = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, bookingInitiateSchema, bookingConfirmSchema } = require('../utils/validators');

router.use(authenticate);

router.post('/initiate', validate(bookingInitiateSchema), initiateBooking);
router.post('/confirm', validate(bookingConfirmSchema), confirmBooking);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);
router.get('/:id/ticket', getTicket);
router.get('/:id/qr', getQRCode);

module.exports = router;
