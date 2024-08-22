const express = require('express');
const { createQuestion, getQuestions, getAllQuestions,updateQuestion,deleteQuestion, getPostInfo} = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getFollowersDetails } = require('../models/Aggregation/followersUserAggregation')

const router = express.Router();

// router.post('/', authenticateToken, createQuestion);
router.post('/', createQuestion);
router.post('/postInfo', getPostInfo);
router.get('/', getQuestions);
router.get('/followerList', getFollowersDetails);

// router.get('/Home', getAllQuestions);
router.put('/:id', updateQuestion);

// Delete a question by ID
router.delete('/:id', deleteQuestion);

module.exports = router;
