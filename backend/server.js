require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/utils/db');

// Connect to database
connectDB();

// Init Cron Jobs
require('./src/utils/cron')();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('AI Sales Copilot API is running...');
});

// Routes
app.use('/api/merchants', require('./src/routes/merchantRoutes'));
app.use('/api/transactions', require('./src/routes/transactionRoutes'));
app.use('/api/reminders', require('./src/routes/reminderRoutes'));
app.use('/api/offers', require('./src/routes/offerRoutes'));
app.use('/api/customers', require('./src/routes/customerRoutes'));
app.use('/api/insights', require('./src/routes/insightRoutes'));

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
