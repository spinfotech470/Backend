const express = require('express');
const { editProfile, userList, blockUnblockUser, fillInfo } = require('../controllers/userController');


const router = express.Router();

router.post('/editProfile', editProfile);
router.post('/fillInfo', fillInfo);
router.post('/userList', userList);
router.post('/blockUnblockUser', blockUnblockUser);



module.exports = router;
