const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: "https://chat-app-frontend-peach-two.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
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