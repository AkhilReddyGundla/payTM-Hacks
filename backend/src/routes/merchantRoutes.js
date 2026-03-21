const express = require('express');
const router = express.Router();
const { registerMerchant, updateSettings, getMerchant } = require('../controllers/merchantController');

router.post('/register', registerMerchant);
router.put('/:id/settings', updateSettings);
router.get('/:id', getMerchant);

module.exports = router;
