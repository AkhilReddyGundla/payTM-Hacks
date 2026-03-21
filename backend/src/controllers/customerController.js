const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

/**
 * @desc    Get regular customers (2 or more transactions)
 * @route   GET /api/customers/regulars
 */
const getRegularCustomers = async (req, res, next) => {
  try {
    const { merchantId } = req.query;
    if (!merchantId) return res.status(400).json({ message: 'merchantId required' });
    const mongoose = require('mongoose');
    const regularsAgg = await Transaction.aggregate([
      { $match: { merchantId: new mongoose.Types.ObjectId(merchantId) } },
      { $group: { 
          _id: '$customerPhone', 
          count: { $sum: 1 }, 
          name: { $first: '$customerName' },
          totalPending: { 
            $sum: { $cond: [ { $eq: ['$status', 'PENDING'] }, '$amount', 0 ] } 
          }
      } },
      { $match: { count: { $gte: 2 } } }
    ]);

    res.json(regularsAgg);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inactive customers (No transactions in the last 7 days)
 * @route   GET /api/customers/inactive
 */
const getInactiveCustomers = async (req, res, next) => {
  try {
    const { merchantId } = req.query;
    if (!merchantId) return res.status(400).json({ message: 'merchantId required' });

    // **DEMO HACK**: Consider customers "inactive" if they haven't ordered in the last 1 hour!
    // (In production, this would be 7 or 14 days)
    const inactiveThreshold = new Date(Date.now() - 60 * 60 * 1000); // 1 hour

    // active in last 2 minutes
    const activeRecentPhones = await Transaction.distinct('customerPhone', {
      merchantId,
      createdAt: { $gte: inactiveThreshold }
    });

    // all customers not in activeRecentPhones
    const inactiveCustomers = await Customer.find({
      merchantId,
      phone: { $nin: activeRecentPhones }
    });

    res.json(inactiveCustomers);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard data for a customer
 * @route   GET /api/customers/:phone/dashboard
 */
const getCustomerDashboard = async (req, res, next) => {
  try {
    const { phone } = req.params;
    
    // Fetch all transactions for this customer phone
    const transactions = await Transaction.find({ customerPhone: phone }).populate('merchantId', 'name phone').sort('-createdAt');
    // ONLY fetch messages that have actually been SENT (so scheduled messages stay hidden until cron runs)
    const messages = await require('../models/Message').find({ customerPhone: phone, status: 'SENT' }).populate('merchantId', 'name').sort('-createdAt');

    res.json({
      transactions,
      messages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRegularCustomers,
  getInactiveCustomers,
  getCustomerDashboard
};
