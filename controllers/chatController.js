const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const Massage = require('../models/Message');
const User = require('../models/User');


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
    }).populate('replyTo');

    res.send({ data: messages });
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch chats' });
  }
};

exports.myChatData = async (req, res) => {
  const { sender, receiver } = req.body;
  
  try {
    const messages = await Massage.aggregate([
      {
        $match: {
          $or: [
            { sender: sender },
            { receiver: sender }
          ],
          isDeleted: 'false'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: 'username',
          as: 'senderDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiver',
          foreignField: 'username',
          as: 'receiverDetails'
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $project: {
          message: 1,
          timestamp: 1,
          sender:1,
          receiver:1,
          senderDetails:  {
            $arrayElemAt: [
              {
                $map: {
                  input: "$senderDetails",
                  as: "sender",
                  in: {
                    name: "$$sender.name",
                    username: "$$sender.username",
                    blockedUsers: "$$sender.blockedUsers",
                    socialAccounts: "$$sender.socialAccounts",
                    city: "$$sender.city",
                    gender: "$$sender.gender",
                    profileImg: "$$sender.profileImg"
                  }
                }
              },
              0
            ]
          },
          receiverDetails:  {
            $arrayElemAt: [
              {
                $map: {
                  input: "$receiverDetails",
                  as: "receiver",
                  in: {
                    name: "$$receiver.name",
                    username: "$$receiver.username",
                    blockedUsers: "$$receiver.blockedUsers",
                    socialAccounts: "$$receiver.socialAccounts",
                    city: "$$receiver.city",
                    gender: "$$receiver.gender",
                    profileImg: "$$receiver.profileImg"
                  }
                }
              },
              0
            ]
          },
          isSecret: 1,
          hideMe: 1,
          type: 1,
          seenStatus: 1,
          chatDeleted:1,
          edited:1,
          isDeleted:1,
          blocked:1,
          forWhat:1
        }
      }
    ]);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.chatsSeen = async (req, res) => {
  const { sender, receiver, ...updateData } = req.body;

  try {
    const result = await Massage.updateMany({ sender: sender, receiver: receiver }, updateData);

    if (result.nModified > 0) {
      const updatedMessages = await Massage.find({ sender, receiver });
      res.send({ data: updatedMessages });
    } else {
      res.status(200).send({ message: 'No messages found to update' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to update message data' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  try {
    const result = await Massage.findByIdAndUpdate(
      messageId,
      { isDeleted: "true" },
      { new: true }
    );

    if (result) {
      res.send({ data: result });
    } else {
      res.status(200).send({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to update message data' });
  }
};

exports.deleteChat = async (req, res) => {
  const { sender, receiver, loginId } = req.body;
  try {
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
      const updatedMessages = await Massage.find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender }
        ]
      });
      res.send({ data: updatedMessages });
    } else {
      res.status(200).send({ message: 'No messages found to update' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to update message data' });
  }
};

exports.editMessage = async (req, res) => {
  const { messageId, message, edited } = req.body;
  try {
    const result = await Massage.findByIdAndUpdate(
      messageId,
      { $set: { message, edited } },
      { new: true } 
    );

    if (result) {
      res.send({ data: result });
    } else {
      res.status(200).send({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to update message' });
  }
};







