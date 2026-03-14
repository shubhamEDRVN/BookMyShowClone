const Offer = require('../models/Offer');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/offers
 * List active offers
 */
const getOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const offers = await Offer.find({
    isActive: true,
    validFrom: { $lte: now },
    validTill: { $gte: now },
  }).sort('-createdAt');

  res.json(new ApiResponse(200, { offers }, 'Offers fetched'));
});

/**
 * POST /api/v1/offers/validate
 * Validate promo code and calculate discount
 */
const validateOffer = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const now = new Date();

  const offer = await Offer.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: now },
    validTill: { $gte: now },
  });

  if (!offer) {
    throw new ApiError(404, 'Invalid or expired offer code');
  }

  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
    throw new ApiError(400, 'Offer usage limit reached');
  }

  if (offer.minOrderValue && amount < offer.minOrderValue) {
    throw new ApiError(400, `Minimum order value is ₹${offer.minOrderValue}`);
  }

  let discount = 0;
  if (offer.discountType === 'percent') {
    discount = Math.round((amount * offer.discountValue) / 100);
    if (offer.maxDiscount) {
      discount = Math.min(discount, offer.maxDiscount);
    }
  } else {
    discount = offer.discountValue;
  }

  res.json(
    new ApiResponse(200, {
      offer: { code: offer.code, title: offer.title },
      discount,
      payableAmount: amount - discount,
    }, 'Offer validated')
  );
});

module.exports = { getOffers, validateOffer };
