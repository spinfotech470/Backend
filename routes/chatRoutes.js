const express = require('express');
const {  editMessage, deleteChat,  deleteMessage ,getChatData, myChatData, chatsSeen } = require('../controllers/chatController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/deleteMessage', deleteMessage);
router.post('/deleteChat', deleteChat);
router.post('/editMessage', editMessage);
router.get('/chat', getChatData);
router.post('/mychat', myChatData);
router.post('/chatsSeen', chatsSeen);
router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

module.exports = router;
