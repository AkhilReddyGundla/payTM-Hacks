const express = require('express');
const router = express.Router();
const { generateReminder, sendReminder, batchScheduleReminders } = require('../controllers/reminderController');

router.post('/generate', generateReminder);
router.post('/send', sendReminder);
router.post('/batchReminders', batchScheduleReminders);

module.exports = router;
