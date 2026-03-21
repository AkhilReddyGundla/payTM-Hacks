# AI Sales Copilot for Small Merchants

A lightweight AI-powered MERN stack application for small merchants to track transactions via natural language, manage pending credits with AI-generated interest reminders, and send smart offers to regular and inactive customers.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **AI Integration**: OpenAI API

## Prerequisites
- Node.js (v18+)
- MongoDB running locally (default: `mongodb://localhost:27017/ai-sales-copilot`) OR a MongoDB Atlas URI.
- OpenAI API Key

## Setup & Running Locally

### 1. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on the `.env.example`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-sales-copilot
OPENAI_API_KEY=your_openai_api_key_here
```

Seed the database to create a sample merchant (Requires MongoDB to be running):
```bash
node seed.js
```
*(This will generate a `.env.local` file with your `VITE_MERCHANT_ID` for the frontend to use)*

Start the backend:
```bash
npm run start
# Or for development: npx nodemon server.js
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

## Features Demo Flow
1. **New Sale**: Type "5 chai to Ravi, he will pay tomorrow" in the Add Transaction tab to naturally log a sale.
2. **Pending Dues**: View unpaid transactions and use AI to generate polite reminder SMS text.
3. **Smart Offers**: Engage with VIP/Regular customers or Win-back inactive customers using AI generated SMS copies.
4. **Chai Time Insights**: View your busiest hours of the day and popular items sold.
