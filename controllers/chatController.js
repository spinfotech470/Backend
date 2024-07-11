const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const Massage = require('../models/Message')


exports.getChatData = async (req, res) => {
  const { sender, receiver, page = 1, limit = 20 } = req.query;
  try {
    const messages = await Massage.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
