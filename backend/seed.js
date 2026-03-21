require('dotenv').config();
const mongoose = require('mongoose');
const Merchant = require('./src/models/Merchant');
const Customer = require('./src/models/Customer');
const Transaction = require('./src/models/Transaction');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Clear everything
    await Merchant.deleteMany();
    await Customer.deleteMany();
    await Transaction.deleteMany();

    console.log('Cleared existing data.');

    // Seed one merchant
    const merchant = await Merchant.create({
      name: 'Ramu Chaiwala',
      phone: '9876543210',
      interestEnabled: true,
      interestRate: 5,
    });

    console.log(`Created merchant ${merchant.name} (ID: ${merchant._id})`);

    // Optionally output this merchant ID to a file or environment so the frontend can use it
    const fs = require('fs');
    fs.writeFileSync('.env.local', `VITE_MERCHANT_ID=${merchant._id}\n`, { flag: 'a' });

    console.log('Seed completed successfully.');
    process.exit();
  } catch (error) {
    console.error('Seed error', error);
    process.exit(1);
  }
};

seedData();
