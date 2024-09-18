// const Notification = require('../models/Notification'); // Adjust the path as needed
const Notification = require('../models/notification')

// Controller method to get all notifications for a user
exports.getUserNotifications = async (req, res) => {
    const userId = req.body.userId;
    try {
        const notifications = await Notification.find({
            $or: [
                { recipient: userId },
                { commentWritter: userId }
            ]
        })
        .populate('sender', 'username email profileImg socialAccounts gender')  // Populate sender's username and email
        .populate({
            path: 'postId', 
            select: 'questionTitle createdBy',  // Include question title and createdBy fields from Post
            populate: {
                path: 'createdBy',  // Populate the createdBy field
                select: 'username email profileImg socialAccounts gender'  // Select the fields you want to show (e.g., username, email)
            }
        })
        .populate('commentId', 'content') // Populate comment's content (if exists)
        .select('type createdAt read') 
        .sort({ createdAt: -1 }); // Sort by most recent
        return res.status(200).json(notifications);
    } catch (error) {
        // console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'An error occurred while fetching notifications.' });
    }
  };
  
// exports.getUserNotifications = async (req, res) => {
//   const userId = req.body.userId;
//   try {
//       const notifications = await Notification.find({
//           $or: [
//               { recipient: userId },
//               { commentWritter: userId }
//           ]
//       })
//       .populate('sender', 'username') // Populate sender's username
//       .populate({
//           path: 'postId', 
//           select: 'questionTitle createdBy',  // Include question title and createdBy fields from Post
//           populate: {
//               path: 'createdBy',  // Populate the createdBy field
//               select: 'username email'  // Select the fields you want to show (e.g., username, email)
//           }
//       })
//       .populate('commentId', 'content') // Populate comment's content (if exists)
//       .select('type createdAt read') 
//       .sort({ createdAt: -1 }); // Sort by most recent
//       return res.status(200).json(notifications);
//   } catch (error) {
//       console.error('Error fetching notifications:', error);
//       return res.status(500).json({ message: 'An error occurred while fetching notifications.' });
//   }
// };

// exports.getUserNotifications = async (req, res) => {
    
//     const userId = req.body.userId;
//     console.log("userId ",req.body.userId)

//     try {
//         // const notifications = await Notification.find({ recipient: userId })
//         const notifications = await Notification.find({
//             $or: [
//               { recipient: userId },
//               { commentWritter: userId }
//             ]
//           })
//             .populate('sender', 'username') // Populate sender's username
//             .populate('postId', 'questionTitle') // Populate post's question title
//             .populate('commentId', 'content') // Populate comment's content (if exists)
//             .select('type createdAt read') 
//             .sort({ createdAt: -1 }); // Sort by most recent

//             console.log("Notifications -- ",notifications.length)
//         return res.status(200).json(notifications);
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//         return res.status(500).json({ message: 'An error occurred while fetching notifications.' });
//     }
// };
