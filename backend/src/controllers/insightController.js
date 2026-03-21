const Transaction = require('../models/Transaction');

/**
 * @desc    Get Chai Time (visit time patterns)
 * @route   GET /api/insights/chai-time
 */
const getChaiTimeInsights = async (req, res, next) => {
  try {
    const { merchantId } = req.query;
    const mongoose = require('mongoose');
    if (!merchantId) return res.status(400).json({ message: 'merchantId required' });

    // Aggregate by hour of the day
    const insights = await Transaction.aggregate([
      { $match: { merchantId: mongoose.Types.ObjectId(merchantId) } },
      { 
        $group: { 
          _id: { $hour: "$createdAt" }, 
          count: { $sum: 1 },
          items: { $push: "$itemText" }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 3 } // Top 3 busiest hours
    ]);

    // Format output
    const formatted = insights.map(i => ({
      hour: i._id,
      count: i.count,
      popularString: i.items.join(', ').substring(0, 50) + '...'
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI Daily Digest based on today's sales
 * @route   GET /api/insights/daily-digest
 */
const getDailyDigest = async (req, res, next) => {
  try {
    const { merchantId } = req.query;
    if (!merchantId) return res.status(400).json({ message: 'merchantId required' });

    // For demo purposes, fetch the last 50 transactions to analyze
    const recentTx = await Transaction.find({ merchantId }).sort('-createdAt').limit(50);
    const itemStrings = recentTx.map(tx => tx.itemText).join(', ');

    const { generateStoreDigest } = require('../services/aiService');
    const digest = await generateStoreDigest(itemStrings || 'No recent sales logged');

    res.json(digest);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Schedule the daily digest for the merchant
 * @route   POST /api/insights/schedule-digest
 */
const scheduleDailyDigest = async (req, res, next) => {
  try {
    const { merchantId, phone, digestData, scheduledFor } = req.body;
    
    // Schedule based on request, or "Now"
    let scheduleTime;
    if (scheduledFor) {
      scheduleTime = new Date(scheduledFor);
    } else {
      scheduleTime = new Date(); // Right now, cron will pick it up
    }

    const mongoose = require('mongoose');
    const Message = require('../models/Message');
    const Customer = require('../models/Customer');
    const { generateOfferMessage } = require('../services/aiService');

    // 1. Schedule the strict Digest for the Merchant
    const messageText = `📊 Daily Store Digest\n🏆 Hero: ${digestData.heroProduct}\n📉 Zero: ${digestData.zeroProduct}\n💡 Tip: ${digestData.improvementTip}`;

    await Message.create({
      merchantId,
      customerPhone: phone, // phone comes from frontend user auth 
      type: 'DIGEST',
      messageText,
      status: 'PENDING',
      scheduledFor: scheduleTime
    });

    // 2. Fetch all customers for this merchant
    const customers = await Customer.find({ merchantId });

    // Respond immediately to prevent timeout
    res.status(202).json({ 
      success: true, 
      message: scheduledFor 
        ? `Scheduled digest for you + Hero Campaign for ${customers.length} customers!` 
        : `Sending digest now + Launching Hero Campaign to ${customers.length} customers!` 
    });

    // 3. Process the mass personalized AI campaign in the background
    setTimeout(async () => {
      console.log(`[DIGEST] Starting mass Hero Campaign for ${customers.length} customers...`);
      for (const c of customers) {
        try {
          // Use the Hero Product to generate a customized message for EACH customer
          const promo = await generateOfferMessage(c.name, false, digestData.heroProduct);
          await Message.create({
            merchantId,
            customerPhone: c.phone,
            type: 'OFFER',
            messageText: promo,
            status: 'PENDING',
            scheduledFor: scheduleTime
          });
        } catch (e) {
          console.error(`[DIGEST] Failed to generate offer for ${c.phone}:`, e);
        }
      }
      console.log(`[DIGEST] Finished queuing mass Hero Campaign!`);
    }, 0);

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch the most recently sent (scheduled) digest for the merchant
 * @route   GET /api/insights/latest-digest
 */
const getLatestSentDigest = async (req, res, next) => {
  try {
    const { merchantId } = req.query;
    if (!merchantId) return res.status(400).json({ message: 'merchantId required' });

    const Message = require('../models/Message');
    const msg = await Message.findOne({ merchantId, type: 'DIGEST', status: 'SENT' }).sort('-updatedAt');
    
    if (!msg) return res.json(null);

    // Parse the stored text back into structured JSON for the UI
    const text = msg.messageText;
    const heroProduct = text.split('🏆 Hero:')[1]?.split('\n')[0]?.trim();
    const zeroProduct = text.split('📉 Zero:')[1]?.split('\n')[0]?.trim();
    const improvementTip = text.split('💡 Tip:')[1]?.split('\n')[0]?.trim();

    res.json({
      heroProduct,
      zeroProduct,
      improvementTip,
      sentAt: msg.updatedAt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getChaiTimeInsights, getDailyDigest, scheduleDailyDigest, getLatestSentDigest };
