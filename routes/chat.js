const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  } 
});

module.exports = router;
