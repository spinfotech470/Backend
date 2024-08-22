const express = require('express');
const { sendChatRequest, acceptChatRequest, editMessage, chatReply, deleteChat,  deleteMessage ,getChatData, myChatData, chatsSeen } = require('../controllers/chatController');
const authenticateToken = require('../middleware/authMiddleware');
const { getMessageReply } = require('../models/Aggregation/messageReplyAggregation');

const router = express.Router();

// router.post('/request', authenticateToken, sendChatRequest);
// router.post('/request/accept', authenticateToken, acceptChatRequest);
router.post('/deleteMessage', deleteMessage);
router.post('/deleteChat', deleteChat);
router.post('/editMessage', editMessage);
// router.post('/chatReply', getMessageReply);
// router.post('/chatReply', chatReply);
router.get('/chat', getChatData);
router.post('/mychat', myChatData);
router.post('/chatsSeen', chatsSeen);

module.exports = router;
