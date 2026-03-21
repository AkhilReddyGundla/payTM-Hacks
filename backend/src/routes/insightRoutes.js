const express = require('express');
const router = express.Router();
const { getChaiTimeInsights, getDailyDigest, scheduleDailyDigest, getLatestSentDigest } = require('../controllers/insightController');

router.get('/chai-time', getChaiTimeInsights);
router.get('/daily-digest', getDailyDigest);
router.get('/latest-digest', getLatestSentDigest);
router.post('/schedule-digest', scheduleDailyDigest);

module.exports = router;
