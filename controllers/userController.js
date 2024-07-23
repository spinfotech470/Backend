const { response } = require('express');
const User = require('../models/User');
const utility = require("../config/utility")

exports.editProfile = async (req, res) => {
  const { _id, ...updateData } = req.body;

  try {
    if (req.files && req.files.profileImg) {
      const profileImgPath = await utility.default.sendImageS3Bucket(
        req.files.profileImg,
        'UserProfile',
        updateData.profileImg || '' 
      );
      updateData.profileImg = profileImgPath;
    }

    if (req.files && req.files.coverImg) {
      const coverImgPath = await utility.default.sendImageS3Bucket(
        req.files.coverImg,
        'UserCover',
        updateData.coverImg || ''
      );
      updateData.coverImg = coverImgPath;
    }

    const user = await User.findByIdAndUpdate(_id, updateData, { new: true });

    if (user) {
      res.send({ data: user, message: 'Profile updated successfully' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).send({ message: 'Failed to update user data' });
  }
};

exports.userList = async (req, res) => {

  try {

    const user = await User.find();

    if (user) {
      res.send({ data: user, message: 'User List' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).send({ message: 'Failed to update user data' });
  }
};
