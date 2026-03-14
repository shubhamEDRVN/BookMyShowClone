const router = require('express').Router();
const { search, getSuggestions, getTrendingSearches } = require('../controllers/search.controller');
const { cacheMiddleware } = require('../middlewares/cache.middleware');

router.get('/', search);
router.get('/suggestions', cacheMiddleware('suggest', 300), getSuggestions);
router.get('/trending-searches', cacheMiddleware('trending:searches', 600), getTrendingSearches);

module.exports = router;
