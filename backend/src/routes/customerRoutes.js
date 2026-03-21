const express = require('express');
const router = express.Router();
const { getRegularCustomers, getInactiveCustomers, getCustomerDashboard } = require('../controllers/customerController');

router.get('/regulars', getRegularCustomers);
router.get('/inactive', getInactiveCustomers);
router.get('/:phone/dashboard', getCustomerDashboard);

module.exports = router;
