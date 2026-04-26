const router       = require('express').Router();
const Groq = require('groq-sdk');
const Conversation = require('../models/Conversation');
const auth         = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Sari conversations list
router.get('/conversations', auth, async (req, res) => {
  try {
    const convos = await Conversation.find({ user: req.user.id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json(convos);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Ek conversation ki messages
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const convo = await Conversation.findOne({
      _id: req.params.id, user: req.user.id
    });
    if (!convo) return res.status(404).json({ message: 'Not found' });
    res.json(convo);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Naya message bhejo — OpenAI se reply lo
router.post('/conversations/:id/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Empty message' });

    // Conversation find ya banao
    let convo = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });

    // User message save karo
    convo.messages.push({ role: 'user', content: message });

    // Pehla message ho toh title set karo
    if (convo.messages.length === 1 || convo.title === 'New Chat') {
      convo.title = message.length > 40
        ? message.substring(0, 40) + '...'
        : message;
    }

    // OpenAI ko poori conversation history bhejo — context ke liye
    const messagesForAI = convo.messages.map(m => ({
      role: m.role, content: m.content
    }));

    // ✅ OpenAI API call
    const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",  // free aur fast model
  messages: [
    {
      role: 'system',
      content: 'You are a helpful AI assistant. For code, use markdown code blocks.'
    },
    ...messagesForAI
  ],
  max_tokens: 1000,
  temperature: 0.7,
});

const aiReply = completion.choices[0].message.content;
    // AI reply save karo
    convo.messages.push({ role: 'assistant', content: aiReply });
    await convo.save();

    res.json({
      message:      aiReply,
      conversation: convo,
    });
  } catch (err) {
    console.error('OpenAI Error:', err.message);
    if (err.status === 429)
      return res.status(429).json({ message: 'Rate limit — thoda wait karo' });
    res.status(500).json({ message: err.message });
  }
});

// Naya conversation banao
router.post('/conversations', auth, async (req, res) => {
  try {
    const convo = await Conversation.create({
      user:  req.user.id,
      title: 'New Chat',
    });
    res.status(201).json(convo);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Conversation delete karo
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;