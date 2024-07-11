// const Notification = require('../models/Notification'); // Adjust the path as needed
const Notification = require('../models/notification')

// Controller method to get all notifications for a user
exports.getUserNotifications = async (req, res) => {
    
    const userId = req.query.userId;
    console.log("userId ",req.query.userId)

    try {
        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'username') // Populate sender's username
            .populate('postId', 'questionTitle') // Populate post's question title
            .populate('commentId', 'content') // Populate comment's content (if exists)
            .select('type createdAt read') 
            .sort({ createdAt: -1 }); // Sort by most recent

            console.log("Notifications -- ",notifications.length)
        return res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'An error occurred while fetching notifications.' });
    }
};
