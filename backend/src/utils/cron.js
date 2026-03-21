const cron = require('node-cron');
const Message = require('../models/Message');

const startCronJobs = () => {
  // Check every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find messages scheduled for now or earlier, that are still PENDING
      const readyMessages = await Message.find({
        status: 'PENDING',
        scheduledFor: { $lte: now }
      });

      if (readyMessages.length > 0) {
        console.log(`\n[CRON] Found ${readyMessages.length} messages scheduled for now.`);
        for (const msg of readyMessages) {
          // Simulate actual SMS Dispatch for the Demo
          console.log(`==============================================`);
          console.log(`📱 [SMS DISPATCHED] To: ${msg.customerPhone}`);
          console.log(`✉️  Message: "${msg.messageText}"`);
          console.log(`==============================================\n`);
          
          msg.status = 'SENT';
          await msg.save();

          // If this is a pending due reminder, mark transaction as sent
          if (msg.transactionId) {
            const Transaction = require('../models/Transaction');
            await Transaction.findByIdAndUpdate(msg.transactionId, { reminderSent: true });
          }
        }
        console.log(`[CRON] ✅ Successfully notified ${readyMessages.length} customers!`);
      }
    } catch (error) {
      console.error('[CRON Error]', error);
    }
  });

  // Automated Daily Digest Generator
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const Merchant = require('../models/Merchant');
      const Transaction = require('../models/Transaction');
      const { generateStoreDigest, generateOfferMessage } = require('../services/aiService');

      // Find all merchants where digestTime matches right now
      const merchants = await Merchant.find({ digestTime: currentHHMM });
      
      for (const m of merchants) {
        // Prevent duplicate generation for today
        const todayStart = new Date(now);
        todayStart.setHours(0,0,0,0);
        const existingDigest = await Message.findOne({ merchantId: m._id, type: 'DIGEST', createdAt: { $gte: todayStart } });
        if (existingDigest) continue;

        console.log(`[CRON-DIGEST] Auto-generating daily digest for Merchant ${m.name}...`);
        
        // Generate Digest
        const recentTx = await Transaction.find({ merchantId: m._id }).sort('-createdAt').limit(50);
        const itemStrings = recentTx.map(tx => tx.itemText).join(', ');
        const digestData = await generateStoreDigest(itemStrings || 'No sales');
        
        const messageText = `📊 Daily Store Digest\n🏆 Hero: ${digestData.heroProduct}\n📉 Zero: ${digestData.zeroProduct}\n💡 Tip: ${digestData.improvementTip}`;
        
        await Message.create({
          merchantId: m._id,
          customerPhone: m.phone,
          type: 'DIGEST',
          messageText,
          status: 'PENDING',
          scheduledFor: now
        });

        // Generate Mass Campaign
        console.log(`[CRON-DIGEST] Starting mass Hero Campaign for ${m.name}'s customers...`);
        const Customer = require('../models/Customer');
        const customers = await Customer.find({ merchantId: m._id });
        for (const c of customers) {
          try {
            const promo = await generateOfferMessage(c.name, false, digestData.heroProduct);
            await Message.create({
              merchantId: m._id,
              customerPhone: c.phone,
              type: 'OFFER',
              messageText: promo,
              status: 'PENDING',
              scheduledFor: now
            });
          } catch(e) {}
        }
        console.log(`[CRON-DIGEST] Finished auto-campaign for ${m.name}!`);
      }
    } catch(e) { 
      console.error('[CRON-DIGEST Error]', e);
    }
  });

  console.log('Cron scheduler initialized.');
};

module.exports = startCronJobs;
