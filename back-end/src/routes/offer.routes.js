const router = require('express').Router();
const { getOffers, validateOffer } = require('../controllers/offer.controller');
const { validate, validateOfferSchema } = require('../utils/validators');

router.get('/', getOffers);
router.post('/validate', validate(validateOfferSchema), validateOffer);

module.exports = router;
