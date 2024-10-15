const express = require('express')
const {followUser ,unfollowUser,getFellowingUsers, userInfo, searchUsers} = require('../controllers/fellowController')
// const {}
const router = express.Router();

router.post('/userInfo', userInfo);
router.post('/follow', followUser);
router.post('/findFriends', searchUsers);
router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });


module.exports = router;
