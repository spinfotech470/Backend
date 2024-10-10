const { response } = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/PostSchema')
const Message = require('../models/Message');
const utility = require("../config/utility");
const ContactUs = require("../models/ContactUs")


exports.editProfile = async (req, res) => {
  const { _id, followers, ...updateData } = req.body;
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

    if (followers) {
      let followersArray = [];

      if (Array.isArray(followers)) {
        followersArray = followers.map(id => new mongoose.Types.ObjectId(id.trim()));
      } else if (typeof followers === 'string') {
        followersArray = followers.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
      }

      updateData.followers = followersArray;
    }

    const user = await User.findByIdAndUpdate(_id, updateData, { new: true });

    if (user) {
      res.send({ data: user, message: 'Profile updated successfully' });
    } else {
      res.status(200).send({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to update user data' });
  }
};

exports.fillInfo = async (req, res) => {
  const { _id, ...updateData } = req.body;

  try {

    const user = await User.findByIdAndUpdate(_id, updateData, { new: true });

    if (user) {
      res.send({ data: user, message: 'Profile updated successfully' });
    } else {
      res.status(200).send({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to update user data' });
  }
};

exports.userList = async (req, res) => {

  try {

    const user = await User.find();

    if (user) {
      res.send({ data: user, message: 'User List' });
    } else {
      res.status(200).send({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to update user data' });
  }
};

exports.blockUnblockUser = async (req, res) => {
  const { userId, loggedUser, senderName, receiverName } = req.body;

  try {
    const userToBlock = await User.findById(userId);
    const loggedInUser = await User.findById(loggedUser);

    if (!userToBlock || !loggedInUser) {
      return res.status(200).send({ message: 'User not found' });
    }

    const isBlocked = loggedInUser.blockedUsers.includes(userId);

    if (isBlocked) {
      loggedInUser.blockedUsers = loggedInUser.blockedUsers.filter(id => id.toString() !== userId);

      await Message.updateMany(
        {
          $or: [
            { receiver: senderName, sender: receiverName },
            { receiver: receiverName, sender: senderName }
          ]
        },
        { $pull: { blocked: loggedUser } }
      );

      await loggedInUser.save();

      return res.status(200).send({ message: 'User unblocked successfully' });
    } else {
      loggedInUser.blockedUsers.push(userId);
      await Message.updateMany(
        {
          $or: [
            { receiver: senderName, sender: receiverName },
            { receiver: receiverName, sender: senderName }
          ]
        },
        { $addToSet: { blocked: loggedUser } }
      );

      await loggedInUser.save();

      return res.status(200).send({ message: 'User blocked successfully' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to block/unblock user' });
  }
};

exports.checkUsername = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });

    if (user) {
      res.send({ exists: true, message: 'Username is already taken' });
    } else {
      res.send({ exists: false, message: 'Username is available' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to check username' });
  }
};

exports.contactUs = async (req, res) => {
  const { formData } = req.body;

  try {
    if (!formData) {
      return res.status(400).send({ message: 'Data is required.' });
    }

    const user = await ContactUs.create(formData);

    if (user) {
      res.status(200).send({ data: user, message: 'Your form has been submitted successfully!' });
    } else {
      res.status(500).send({ message: 'Service unavailable, may be under maintenance' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to send your form' });
  }
};

exports.getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalPost = await Question.countDocuments({});
    const maleUsers = await User.countDocuments({ gender: 'male' });
    const femaleUsers = await User.countDocuments({ gender: 'female' });
    const activeUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      totalUsers,
      maleUsers,
      femaleUsers,
      activeUsers,
      totalPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};