const { response } = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message')
const utility = require("../config/utility")

exports.editProfile = async (req, res) => {
  const { _id, followers, ...updateData } = req.body;

  try {
    // Handle image uploads
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

    // Convert followers to an array of ObjectId if provided
    if (followers) {
      const followersArray = followers.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
      updateData.followers = followersArray;
    }

    // Update user profile
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

exports.fillInfo = async (req, res) => {
  const { _id, ...updateData } = req.body;

  try {

    // Update user profile
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

// exports.editProfile = async (req, res) => {
//   const { _id, ...updateData } = req.body;

//   try {
//     if (req.files && req.files.profileImg) {
//       const profileImgPath = await utility.default.sendImageS3Bucket(
//         req.files.profileImg,
//         'UserProfile',
//         updateData.profileImg || '' 
//       );
//       updateData.profileImg = profileImgPath;
//     }

//     if (req.files && req.files.coverImg) {
//       const coverImgPath = await utility.default.sendImageS3Bucket(
//         req.files.coverImg,
//         'UserCover',
//         updateData.coverImg || ''
//       );
//       updateData.coverImg = coverImgPath;
//     }

//     const user = await User.findByIdAndUpdate(_id, updateData, { new: true });

//     if (user) {
//       res.send({ data: user, message: 'Profile updated successfully' });
//     } else {
//       res.status(404).send({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Error updating user data:', error);
//     res.status(500).send({ message: 'Failed to update user data' });
//   }
// };

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

// exports.blockUnblockUser = async (req, res) => {
//   const { userId, loggedUser } = req.body; // userId to block/unblock and the logged-in user

//   try {
//     const userToBlock = await User.findById(userId);
//     const loggedInUser = await User.findById(loggedUser);

//     if (!userToBlock || !loggedInUser) {
//       return res.status(404).send({ message: 'User not found' });
//     }

//     // Check if the user is already blocked
//     const isBlocked = loggedInUser.blockedUsers.includes(userId);

//     if (isBlocked) {
//       // Unblock logic
//       loggedInUser.blockedUsers = loggedInUser.blockedUsers.filter(id => id.toString() !== userId);
      
//       await loggedInUser.save();

//       return res.status(200).send({ message: 'User unblocked successfully' });
//     } else {
//       // Block logic
//       loggedInUser.blockedUsers.push(userId);

//       await loggedInUser.save();

//       return res.status(200).send({ message: 'User blocked successfully' });
//     }
//   } catch (error) {
//     console.error('Error blocking/unblocking user:', error);
//     res.status(500).send({ message: 'Failed to block/unblock user' });
//   }
// };

exports.blockUnblockUser = async (req, res) => {
  console.log('-------------------*****', req.body);
  const { userId, loggedUser, senderName, receiverName } = req.body;

  try {
    const userToBlock = await User.findById(userId);
    const loggedInUser = await User.findById(loggedUser);

    if (!userToBlock || !loggedInUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the user is already blocked
    const isBlocked = loggedInUser.blockedUsers.includes(userId);

    if (isBlocked) {
      // Unblock logic
      loggedInUser.blockedUsers = loggedInUser.blockedUsers.filter(id => id.toString() !== userId);

      // Update the Message table by removing the loggedUser from the blocked array
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
      // Block logic
      loggedInUser.blockedUsers.push(userId);

      // Update the Message table by adding the loggedUser to the blocked array
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
    console.error('Error blocking/unblocking user:', error);
    res.status(500).send({ message: 'Failed to block/unblock user' });
  }
};


