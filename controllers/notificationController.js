const Notification = require('../models/notification')


exports.getUserNotifications = async (req, res) => {
    const userId = req.body.userId;
    try {
        const notifications = await Notification.find({
            $or: [
                { recipient: userId },
                { commentWritter: userId }
            ]
        })
            .populate('sender', 'username email profileImg socialAccounts gender')
            .populate({
                path: 'postId',
                select: 'questionTitle createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'username email profileImg socialAccounts gender'
                }
            })
            .populate('commentId', 'content')
            .select('type createdAt read content')
            .sort({ createdAt: -1 });
        return res.status(200).json(notifications);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching notifications.' });
    }
};


exports.markNotificationsAsRead = async (req, res) => {
    const userId = req.body.userId;
    const notificationIds = req.body.notificationIds; 

    try {
        if (notificationIds && notificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: notificationIds }, recipient: userId },
                { $set: { read: true } }
            );
        } else {
            await Notification.updateMany(
                { recipient: userId, read: false },
                { $set: { read: true } }
            );
        }
        return res.status(200).json({ code:200, message: 'Notifications marked as read successfully' });
    } catch (error) {
        return res.status(500).json({ code:500, message: 'An error occurred while updating notifications.' });
    }
};

