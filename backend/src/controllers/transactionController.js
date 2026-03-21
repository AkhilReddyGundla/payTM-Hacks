const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { parseTransactionText } = require('../services/aiService');

/**
 * @desc    Process natural language transaction
 * @route   POST /api/transactions/process
 */
const processTransaction = async (req, res, next) => {
  try {
    const { text, merchantId } = req.body;
    
    if (!text || !merchantId) {
      res.status(400);
      throw new Error('Please provide text and merchantId');
    }

    // 1. Parse text using AI
    const parsedData = await parseTransactionText(text);
    
    // AI Missing Value Validation
    const missing = [];
    if (!parsedData.customerName || parsedData.customerName.toLowerCase() === 'unknown' || parsedData.customerName.toLowerCase() === 'guest') missing.push('Customer Name');
    if (!parsedData.customerPhone || parsedData.customerPhone === '9999999999') missing.push('Phone Number');
    if (!parsedData.itemText || parsedData.itemText.length < 2 || parsedData.itemText.toLowerCase() === text.toLowerCase()) missing.push('Product/Item Name');
    if (!parsedData.amount || parsedData.amount === 0) missing.push('Price/Amount');

    if (missing.length > 0) {
      return res.status(400).json({
        isMissingDetails: true,
        message: 'Incomplete Text',
        missingFields: missing,
        parsedData: parsedData,
        suggestion: `Looks like you forgot to mention: ${missing.join(', ')}. Please fill in the missing details.`
      });
    }
    
    // 2. Find or create customer
    let customer = await Customer.findOne({ merchantId, phone: parsedData.customerPhone });
    if (!customer) {
      customer = await Customer.create({
        merchantId,
        phone: parsedData.customerPhone,
        name: parsedData.customerName || 'Guest',
      });
    } else if (!customer.name && parsedData.customerName) {
      // Update name if we found it and didn't have it
      customer.name = parsedData.customerName;
      await customer.save();
    }

    // 3. Create transaction
    const transaction = await Transaction.create({
      merchantId,
      customerPhone: customer.phone,
      customerName: customer.name,
      itemText: parsedData.itemText,
      amount: parsedData.amount,
      status: parsedData.status,
      dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : null
    });

    // 4. Credit Validation Checking
    let creditWarning = null;
    if (parsedData.status === 'PENDING') {
      const unpaidTxs = await Transaction.find({
        merchantId,
        customerPhone: customer.phone,
        status: 'PENDING',
        _id: { $ne: transaction._id } // exclude current
      });
      
      if (unpaidTxs.length > 0) {
        const totalUnpaid = unpaidTxs.reduce((sum, tx) => sum + tx.amount, 0);
        creditWarning = `Customer has ${unpaidTxs.length} past unpaid transactions totaling ₹${totalUnpaid}.`;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Transaction processed successfully',
      transaction,
      customer,
      creditWarning
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all transactions for a merchant
 * @route   GET /api/transactions?merchantId=...
 */
const getTransactions = async (req, res, next) => {
  try {
    const { merchantId } = req.query;
    if (!merchantId) {
      res.status(400);
      throw new Error('merchantId is required');
    }

    const transactions = await Transaction.find({ merchantId }).sort('-createdAt');
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pending transactions for a merchant
 * @route   GET /api/transactions/pending?merchantId=...
 */
const getPendingTransactions = async (req, res, next) => {
  try {
    const { merchantId } = req.query;
    if (!merchantId) {
      res.status(400);
      throw new Error('merchantId is required');
    }

    const pending = await Transaction.find({ merchantId, status: 'PENDING' }).sort('dueDate');
    res.json(pending);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark transaction as paid
 * @route   PUT /api/transactions/:id/pay
 */
const markAsPaid = async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            res.status(404);
            throw new Error('Transaction not found');
        }

        transaction.status = 'PAID';
        await transaction.save();

        res.json(transaction);
    } catch(error) {
        next(error);
    }
}

module.exports = {
  processTransaction,
  getTransactions,
  getPendingTransactions,
  markAsPaid
};
