const express = require('express');
const { createQuestion, getQuestions, getAllQuestions,updateQuestion,deleteQuestion,likePost,commentPost,likeComment,replyToComment,deleteComment,updateComment,getRepliesOfComment} = require('../controllers/questionController');
const { getAllPostsWithLikesAndComments } = require('../models/Aggregation/postAggregation');
const { getUserNotifications } = require('../controllers/notificationController');
const router = express.Router();

router.get('/',getAllPostsWithLikesAndComments);
router.get('/',getAllQuestions);
router.post('/', likePost);
router.post('/commentPost', commentPost);
router.post('/updateComment', updateComment);
router.post('/deleteCommnet', deleteComment);
router.post('/likeComment', likeComment);
router.post('/replyComment', replyToComment);
router.get('/getCommentAllReply', getRepliesOfComment);
router.get('/notification',getUserNotifications)

module.exports = router; 
