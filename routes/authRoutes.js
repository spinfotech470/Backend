const express = require('express');
const { signup, socialLogin ,getUser} = require('../controllers/authController');
// const auth = require('../middleware/auth');
const auth = require('../middleware/authMiddleware');
const { getAllQuestions } = require('../controllers/questionController');
const router = express.Router();

router.post('/signup', signup);
router.post('/sociallogin', socialLogin);
router.get('/profile', auth, getUser);
router.get('/', getAllQuestions);
router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

module.exports = router;
