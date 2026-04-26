const mongoose = require('mongoose');

// Har conversation mein multiple messages hote hain
const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, default: 'New Chat' },
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);