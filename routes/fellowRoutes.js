const express = require('express')
const {followUser ,unfollowUser,getFellowingUsers, userInfo, searchUsers} = require('../controllers/fellowController')
// const {}
const router = express.Router();

router.post('/userInfo', userInfo);
router.post('/follow', followUser);
router.post('/findFriends', searchUsers);

// router.post('/users/unfollow', unfollowUser);
// router.get('/users/following', getFellowingUsers);

module.exports = router;
