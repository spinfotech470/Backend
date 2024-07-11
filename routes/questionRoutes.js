const express = require('express');
const { createQuestion, getQuestions, getAllQuestions,updateQuestion,deleteQuestion} = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// router.post('/', authenticateToken, createQuestion);
router.post('/', createQuestion);
router.get('/', getQuestions);
// router.get('/Home', getAllQuestions);
router.put('/:id', updateQuestion);

// Delete a question by ID
router.delete('/:id', deleteQuestion);

module.exports = router;
