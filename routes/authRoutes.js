const express = require('express');
const { signup, login,socialLogin ,getUser} = require('../controllers/authController');
// const auth = require('../middleware/auth');
const auth = require('../middleware/authMiddleware');
const { getAllQuestions } = require('../controllers/questionController');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/sociallogin', socialLogin);
router.get('/profile', auth, getUser);
router.get('/', getAllQuestions);
module.exports = router;
