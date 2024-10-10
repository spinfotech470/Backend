const { response } = require('express');
const User = require('../models/User');

exports.userInfo = async (req, res) => {
  const { userId } = req.body;

  try {
    if(userId){
      const user = await User.findById(userId);
      if (user) {
        res.send({ data: user, message: '' });
      } else {
        res.status(200).send({ message: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).send({ message: 'Failed to load user data' });
  }
};

exports.searchUsers = async (req, res) => {
  const { searchQuery } = req.body;
  const userId = req.body.userId;

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: `^${searchQuery}`, $options: 'i' } },
        { username: { $regex: `^${searchQuery}`, $options: 'i' } }
      ],
      blockedUsers: { $ne: userId }
    });

    if (users.length > 0) {
      res.send({ data: users, message: '' });
    } else {
      res.status(200).send({ message: 'No users found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to search users' });
  }
};

exports.followUser = async (req, res) => {
  const { userId, currentUser } = req.body;

  try {
    const userToFollow = await User.findById(userId);
    const loggedInUser = await User.findById(currentUser);

    if (!userToFollow || !loggedInUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    const isFollowing = loggedInUser.fellowing.includes(userId);

    if (isFollowing) {
      await User.findByIdAndUpdate(currentUser, {
        $pull: { fellowing: userId },
      }, { new: true, useFindAndModify: false });

      await User.findByIdAndUpdate(userId, {
        $pull: { followers: currentUser },
      }, { new: true, useFindAndModify: false });

      return res.status(200).send({ message: 'User unfollowed successfully' });
    } else {
      await User.findByIdAndUpdate(currentUser, {
        $addToSet: { fellowing: userId },
      }, { new: true, useFindAndModify: false });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: currentUser },
      }, { new: true, useFindAndModify: false });

      return res.status(200).send({ message: 'User followed successfully' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to follow/unfollow user' });
  }
};