const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const Massage = require('../models/Message')


// exports.getChatData = async (req, res) => {
//   const { sender, receiver, page = 1, limit = 20 } = req.query;
//   try {
//     const messages = await Massage.find({
//       $or: [
//         { sender, receiver },
//         { sender: receiver, receiver: sender },
//       ],
//     })
//       .sort({ timestamp: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getChatData = async (req, res) => {
//   const { sender, receiver} = req.query;
//   try {
//     const messages = await Massage.find({
//       $or: [
//         { sender, receiver },
//         { sender: receiver, receiver: sender },
//       ],
//       isDeleted: 'false'
//     })
//       .sort({ timestamp: -1 })
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// 6/9/24 working code
exports.getChatData = async (req, res) => {
  const { sender, receiver, userId } = req.query;

  try {
    const messages = await Massage.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ],
      chatDeleted: { $ne: userId },
      isDeleted: false
    });

    res.send({ data: messages });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).send({ message: 'Failed to fetch chats' });
  }
};

// exports.getChatData = async (req, res) => {
//   const { sender, receiver, userId, page = 1, pageSize = 20 } = req.query;
//   console.log("get chat data api", req.query)

//   try {
//     const skip = (page - 1) * pageSize; // Calculate how many messages to skip

//     // Fetch messages with pagination and sort by timestamp in descending order (latest first)
//     const messages = await Massage.find({
//       $or: [
//         { sender, receiver },
//         { sender: receiver, receiver: sender }
//       ],
//       chatDeleted: { $ne: userId },
//       isDeleted: false
//     })
//     .sort({ timestamp: -1 }) // Sort messages by most recent first
//     .skip(skip)               // Skip messages for pagination
//     .limit(parseInt(pageSize)); // Limit the number of messages fetched

//     // Send the paginated messages
//     res.send({ data: messages });
//   } catch (error) {
//     console.error('Error fetching chats:', error);
//     res.status(500).send({ message: 'Failed to fetch chats' });
//   }
// };




exports.myChatData = async (req, res) => {
  const { sender, receiver } = req.body;
  try {
    const messages = await Massage.find({
      $or: [
        { sender, sender },
        { receiver: sender },
      ],
      isDeleted: 'false'
    })
      .sort({ timestamp: -1 })
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.chatsSeen = async (req, res) => {
//   const { sender,receiver, ...updateData } = req.body;

//   try {
//     // const message = await Massage.findByIdAndUpdate(_id, updateData, { new: true });
//     const message = await Massage.findOneAndUpdate({ sender: sender, receiver: receiver }, updateData, { new: true });

//     if (message) {
//       res.send({ data: message });
//     } else {
//       res.status(404).send({ message: 'message not found' });
//     }
//   } catch (error) {
//     console.error('Error updating message data:', error);
//     res.status(500).send({ message: 'Failed to update message data' });
//   }
// };

exports.chatsSeen = async (req, res) => {
  const { sender, receiver, ...updateData } = req.body;

  try {
    const result = await Massage.updateMany({ sender: sender, receiver: receiver }, updateData);

    if (result.nModified > 0) {
      const updatedMessages = await Massage.find({ sender, receiver });
      res.send({ data: updatedMessages });
    } else {
      res.status(404).send({ message: 'No messages found to update' });
    }
  } catch (error) {
    console.error('Error updating message data:', error);
    res.status(500).send({ message: 'Failed to update message data' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  try {
    // Find and update the message by its ID
    const result = await Massage.findByIdAndUpdate(
      messageId,
      { isDeleted: "true" },
      { new: true } // This option returns the updated document
    );

    if (result) {
      res.send({ data: result });
    } else {
      res.status(404).send({ message: 'Message not found' });
    }
  } catch (error) {
    console.error('Error updating message data:', error);
    res.status(500).send({ message: 'Failed to update message data' });
  }
};

exports.deleteChat = async (req, res) => {
  const { sender, receiver, loginId } = req.body;
  try {
    // Update messages between sender and receiver, adding loginId to chatDeleted array
    const result = await Massage.updateMany(
      {
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender }
        ]
      },
      { $addToSet: { chatDeleted: loginId } }
    );

    if (result.modifiedCount > 0) {
      // Fetch updated messages if needed
      const updatedMessages = await Massage.find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender }
        ]
      });
      res.send({ data: updatedMessages });
    } else {
      res.status(404).send({ message: 'No messages found to update' });
    }
  } catch (error) {
    console.error('Error updating message data:', error);
    res.status(500).send({ message: 'Failed to update message data' });
  }
};

exports.editMessage = async (req, res) => {
  const { messageId, message, edited } = req.body;
  try {
    // Update the message content and set edited flag
    const result = await Massage.findByIdAndUpdate(
      messageId,
      { $set: { message, edited } },
      { new: true } // Return the updated document
    );

    if (result) {
      res.send({ data: result });
    } else {
      res.status(404).send({ message: 'Message not found' });
    }
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).send({ message: 'Failed to update message' });
  }
};

// exports.chatReply = async (req, res) => {
//   const { messageId, message, edited } = req.body;

//   try {
//     // Update the message content and set edited flag
//     const result = await Massage.findByIdAndUpdate(
//       messageId,
//       { $set: { message, edited } },
//       { new: true } // Return the updated document
//     );

//     if (result) {
//       res.send({ data: result });
//     } else {
//       res.status(404).send({ message: 'Message not found' });
//     }
//   } catch (error) {
//     console.error('Error updating message:', error);
//     res.status(500).send({ message: 'Failed to update message' });
//   }
// }; 


// const chatReply = async (req, res) => {
//   const { sender, receiver, message, type, replyTo } = req.body;

//   const newMessage = new Message({
//     sender,
//     receiver,
//     message,
//     type,
//     replyTo,
//   });

//   try {
//     const savedMessage = await newMessage.save();
//     res.status(201).json(savedMessage);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };







