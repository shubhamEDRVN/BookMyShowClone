const router = require('express').Router();
const { getTheatres, getTheatreById, getTheatreShows } = require('../controllers/theatre.controller');

router.get('/', getTheatres);
router.get('/:id', getTheatreById);
router.get('/:id/shows', getTheatreShows);

module.exports = router;
