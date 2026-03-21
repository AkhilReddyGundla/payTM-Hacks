const Message = require('../models/Message');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { generateReminderMessage, generateOfferMessage } = require('../services/aiService');

/**
 * @desc    Generate a reminder message
 * @route   POST /api/reminders/generate
 */
const generateReminder = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    const messageText = await generateReminderMessage(
      transaction.customerName, 
      transaction.amount, 
      transaction.itemText, 
      transaction.dueDate
    );

    res.json({ messageText });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send (save) a reminder message
 * @route   POST /api/reminders/send
 */
const sendReminder = async (req, res, next) => {
  try {
    const { merchantId, customerPhone, messageText, transactionId, scheduledFor } = req.body;

    const message = await Message.create({
      merchantId,
      customerPhone,
      type: 'REMINDER',
      messageText,
      status: scheduledFor ? 'PENDING' : 'SENT',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    });

    if (transactionId) {
      await Transaction.findByIdAndUpdate(transactionId, { reminderSent: true });
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate an offer message
 * @route   POST /api/offers/generate
 */
const generateOffer = async (req, res, next) => {
  try {
    const { customerPhone, merchantId, isInactive } = req.body;
    
    const customer = await Customer.findOne({ merchantId, phone: customerPhone });
    
    // Quick find logic for favorite item (simplified)
    const transactions = await Transaction.find({ merchantId, customerPhone });
    const favoriteItem = transactions.length > 0 ? transactions[0].itemText : 'our products';

    const messageText = await generateOfferMessage(
      customer ? customer.name : 'friend',
      isInactive,
      favoriteItem
    );

    res.json({ messageText });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a general Offer/Ad Message
 * @route   POST /api/reminders/sendOffer
 */
const sendOffer = async (req, res, next) => {
  try {
    const { merchantId, customerPhone, messageText, scheduledFor } = req.body;

    const message = await Message.create({
      merchantId,
      customerPhone,
      type: 'OFFER',
      messageText,
      status: scheduledFor ? 'PENDING' : 'SENT',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Background batch scheduling for loyal customers (zero pending dues)
 * @route   POST /api/offers/batchSchedule
 */
const batchScheduleOffers = async (req, res, next) => {
  try {
    const { merchantId, customers, scheduledFor } = req.body;
    
    // Respond immediately to avoid timeout
    res.status(202).json({ success: true, message: `Batch scheduling started for ${customers.length} loyal customers.` });

    const scheduleDate = scheduledFor ? new Date(scheduledFor) : null;

    // Process in background
    setTimeout(async () => {
      for (const c of customers) {
        try {
          const { generateOfferMessage } = require('../services/aiService');
          const messageText = await generateOfferMessage(c.name, false, 'anything you like');
          
          await Message.create({
            merchantId,
            customerPhone: c._id || c.phone,
            type: 'OFFER',
            messageText,
            status: scheduleDate ? 'PENDING' : 'SENT',
            scheduledFor: scheduleDate
          });
          console.log(`[BATCH] Scheduled offer for ${c.name} (${c._id})`);
        } catch (err) {
          console.error(`[BATCH] Failed for ${c._id}:`, err);
        }
      }
      console.log(`[BATCH] Completed batch scheduling for ${merchantId}`);
    }, 100);

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Background batch scheduling for pending reminders
 * @route   POST /api/reminders/batchReminders
 */
const batchScheduleReminders = async (req, res, next) => {
  try {
    const { merchantId, transactions, scheduledFor } = req.body;
    
    // Respond immediately to avoid timeout
    res.status(202).json({ success: true, message: `Batch scheduling started for ${transactions.length} reminders.` });

    // Process in background
    setTimeout(async () => {
      for (const tx of transactions) {
        try {
          const { generateReminderMessage } = require('../services/aiService');
          const messageText = await generateReminderMessage(tx.customerName, tx.amount, tx.itemText, tx.dueDate);
          
          await Message.create({
            merchantId,
            customerPhone: tx.customerPhone,
            type: 'REMINDER',
            messageText,
            status: scheduledFor ? 'PENDING' : 'SENT',
            transactionId: tx._id,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : null
          });
          
          // Mark as reminderSent 
          await require('../models/Transaction').findByIdAndUpdate(tx._id, { reminderSent: true });
          console.log(`[BATCH REMINDER] Scheduled for ${tx.customerPhone}`);
        } catch (err) {
          console.error(`[BATCH REMINDER] Failed for ${tx._id}:`, err);
        }
      }
      console.log(`[BATCH REMINDER] Completed batch scheduling for ${merchantId}`);
    }, 100);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReminder,
  sendReminder,
  generateOffer,
  sendOffer,
  batchScheduleOffers,
  batchScheduleReminders
};
