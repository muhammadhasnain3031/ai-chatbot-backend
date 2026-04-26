const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

// 1. FULL CORS & MANUAL HEADERS (The "Sultani" Fix)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ["https://ai-chatbot-frontend-ten-woad.vercel.app"];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // OPTIONS (Pre-flight) request ko foran 200 OK bhej do
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// 2. Extra Safety (Middleware)
app.use(express.json());

// 3. Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/', (req, res) => res.json({ status: 'AI Chatbot API running ✅' }));

// 4. DB Connection & Listen
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
  })
  .catch(err => console.log('❌ DB Error:', err.message));