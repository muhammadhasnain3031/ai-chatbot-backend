const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();
const corsOptions = {
  origin: "https://ai-chatbot-frontend-ten-woad.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200 // Ye line "HTTP ok status" wala masla hal karegi
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

// Health check — Render ke liye
app.get('/', (req, res) => res.json({ status: 'AI Chatbot API running ✅' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
  })
  .catch(err => console.log('❌ DB Error:', err.message));