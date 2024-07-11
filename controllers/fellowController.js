const User = require('../models/User');

// Controller function to follow another user
exports.followUser = async (req, res) => {
  const { userId } = req.params;
  const { currentUser } = req.body;

  try {
    const user = await User.findById(currentUser._id);
    await user.follow(userId);
    res.status(200).send({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).send({ message: 'Failed to follow user' });
  }
};

// Controller function to unfollow another user
exports.unfollowUser = async (req, res) => {
  const { userId } = req.params; // User ID to unfollow
  const { currentUser } = req.body; // Assuming currentUser is passed in request body

  try {
    const user = await User.findById(currentUser._id);
    await user.unfollow(userId);
    res.status(200).send({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).send({ message: 'Failed to unfollow user' });
  }
};

// Controller function to get fellowing users
exports.getFellowingUsers = async (req, res) => {
  const { currentUser } = req.body; // Assuming currentUser is passed in request body

  try {
    const user = await User.findById(currentUser._id);
    const fellowingUsers = await user.populate('fellowingUsers').execPopulate();
    res.status(200).send(followingUsers.fellowingUsers);
  } catch (error) {
    console.error('Error fetching fellowing users:', error);
    res.status(500).send({ message: 'Failed to fetch fellowing users' });
  }
};
