const express = require('express')
const {followUser ,unfollowUser,getFellowingUsers, userInfo} = require('../controllers/fellowController')
// const {}
const router = express.Router();

router.post('/userInfo', userInfo);
router.post('/follow', followUser);
// router.post('/users/unfollow', unfollowUser);
// router.get('/users/following', getFellowingUsers);

module.exports = router;
