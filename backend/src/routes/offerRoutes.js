const express = require('express');
const router = express.Router();
const { generateOffer, sendOffer, batchScheduleOffers } = require('../controllers/reminderController');

router.post('/generate', generateOffer);
router.post('/send', sendOffer);
router.post('/batchSchedule', batchScheduleOffers);

module.exports = router;
