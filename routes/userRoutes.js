const express = require('express');
const { editProfile, userList } = require('../controllers/userController');


const router = express.Router();

router.post('/editProfile', editProfile);
router.post('/userList', userList);


module.exports = router;
