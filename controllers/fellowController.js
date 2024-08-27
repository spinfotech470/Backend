const { response } = require('express');
const User = require('../models/User');

exports.userInfo = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (user) {
      res.send({ data: user, message: '' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).send({ message: 'Failed to load user data' });
  }
};

exports.followUser = async (req, res) => {
  const { userId, currentUser } = req.body; // whom to follow/unfollow and logged user

  try {
    const userToFollow = await User.findById(userId);
    const loggedInUser = await User.findById(currentUser);

    if (!userToFollow || !loggedInUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the user is already following
    const isFollowing = loggedInUser.fellowing.includes(userId);

    if (isFollowing) {
      // Unfollow logic
      loggedInUser.fellowing = loggedInUser.fellowing.filter(id => id.toString() !== userId);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser);

      await loggedInUser.save();
      await userToFollow.save();

      return res.status(200).send({ message: 'User unfollowed successfully' });
    } else {
      // Follow logic
      loggedInUser.fellowing.push(userId);
      userToFollow.followers.push(currentUser);

      await loggedInUser.save();
      await userToFollow.save();

      return res.status(200).send({ message: 'User followed successfully' });
    }
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    res.status(500).send({ message: 'Failed to follow/unfollow user' });
  }
};

// Backend: User Search API
// exports.searchUsers = async (req, res) => {
//   const { searchQuery } = req.body;

//   try {
//     const users = await User.find({
//       $or: [
//         { name: { $regex: `^${searchQuery}`, $options: 'i' } },
//         { username: { $regex: `^${searchQuery}`, $options: 'i' } }
//       ]
//     });

//     if (users.length > 0) {
//       res.send({ data: users, message: '' });
//     } else {
//       res.status(404).send({ message: 'No users found' });
//     }
//   } catch (error) {
//     console.error('Error searching for users:', error);
//     res.status(500).send({ message: 'Failed to search users' });
//   }
// };

exports.searchUsers = async (req, res) => {
  const { searchQuery } = req.body;
  const userId = req.body.userId; // Assuming you have the logged-in user's ID available

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: `^${searchQuery}`, $options: 'i' } },
        { username: { $regex: `^${searchQuery}`, $options: 'i' } }
      ],
      blockedUsers: { $ne: userId } // Exclude users who have blocked the current user
    });

    if (users.length > 0) {
      res.send({ data: users, message: '' });
    } else {
      res.status(404).send({ message: 'No users found' });
    }
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).send({ message: 'Failed to search users' });
  }
};




// Controller function to unfollow another user

// exports.unfollowUser = async (req, res) => {
//   const { userId } = req.params; // User ID to unfollow
//   const { currentUser } = req.body; // Assuming currentUser is passed in request body

//   try {
//     const user = await User.findById(currentUser._id);
//     await user.unfollow(userId);
//     res.status(200).send({ message: 'User unfollowed successfully' });
//   } catch (error) {
//     console.error('Error unfollowing user:', error);
//     res.status(500).send({ message: 'Failed to unfollow user' });
//   }
// };

// Controller function to get fellowing users

// exports.getFellowingUsers = async (req, res) => {
//   const { currentUser } = req.body; // Assuming currentUser is passed in request body

//   try {
//     const user = await User.findById(currentUser._id);
//     const fellowingUsers = await user.populate('fellowingUsers').execPopulate();
//     res.status(200).send(followingUsers.fellowingUsers);
//   } catch (error) {
//     console.error('Error fetching fellowing users:', error);
//     res.status(500).send({ message: 'Failed to fetch fellowing users' });
//   }
// };
