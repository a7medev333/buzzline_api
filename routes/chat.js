const express = require('express');
const Chat = require('../models/chat');

const router = express.Router();

// Get all chats for a user
router.get('/chats/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const chats = await Chat.find({
      $or: [{ sender: uuid }, { receiver: uuid }],
    }).sort('timestamp');
    res.json(chats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get one-to-one messages between two users
router.get('/messages/:senderUuid/:receiverUuid', async (req, res) => {
  try {
    const { senderUuid, receiverUuid } = req.params;
    const messages = await Chat.find({
      $or: [
        { sender: senderUuid, receiver: receiverUuid },
        { sender: receiverUuid, receiver: senderUuid },
      ],
    }).sort('timestamp');
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;