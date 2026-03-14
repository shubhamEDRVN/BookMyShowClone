const router = require('express').Router();
const {
  createPaymentOrder,
  verifyPayment,
  refundPayment,
} = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/admin.middleware');

router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);
router.post('/refund', authenticate, adminOnly, refundPayment);

module.exports = router;
