const express = require('express');
const { editProfile, userList, blockUnblockUser, fillInfo, checkUsername, contactUs } = require('../controllers/userController');


const router = express.Router();

router.post('/editProfile', editProfile);
router.post('/fillInfo', fillInfo);
router.post('/userList', userList);
router.post('/blockUnblockUser', blockUnblockUser);
router.post('/checkUsername', checkUsername);
router.post('/contactUs', contactUs);



module.exports = router;
