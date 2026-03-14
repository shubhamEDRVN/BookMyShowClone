const router = require('express').Router();
const multer = require('multer');
const {
  getProfile,
  updateProfile,
  changePassword,
  getMyBookings,
  getMyBookingById,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getLoyalty,
  uploadAvatar,
} = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, updateProfileSchema, changePasswordSchema } = require('../utils/validators');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);
router.put('/me/password', validate(changePasswordSchema), changePassword);
router.get('/me/bookings', getMyBookings);
router.get('/me/bookings/:id', getMyBookingById);
router.post('/me/wishlist/:movieId', addToWishlist);
router.delete('/me/wishlist/:movieId', removeFromWishlist);
router.get('/me/wishlist', getWishlist);
router.get('/me/loyalty', getLoyalty);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
