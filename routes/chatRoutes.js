const express = require('express');
const { sendChatRequest, acceptChatRequest, deleteChat,getChatData } = require('../controllers/chatController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// router.post('/request', authenticateToken, sendChatRequest);
// router.post('/request/accept', authenticateToken, acceptChatRequest);
// router.post('/delete', authenticateToken, deleteChat);
router.get('/chat', getChatData);

module.exports = router;
