const express = require('express');
const router = express.Router();
const { 
  processTransaction, 
  getTransactions, 
  getPendingTransactions,
  markAsPaid
} = require('../controllers/transactionController');

router.post('/process', processTransaction);
router.get('/', getTransactions);
router.get('/pending', getPendingTransactions);
router.put('/:id/pay', markAsPaid);

module.exports = router;
