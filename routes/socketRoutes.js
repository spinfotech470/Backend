const cors = require('cors');
const { Server } = require('socket.io');
const User = require('../models/User');
const Message = require('../models/Message');


const  SocketFunction = (server)=>{
    const io = new Server(server, {
        cors: {
          origin: '*', // Allow requests from your frontend's origin
          methods: ['GET', 'POST'],
          credentials: true // If you need to allow credentials (cookies, authorization headers, etc.)
        },
        transports: ['websocket', 'polling'],
        path: '/socket.io',
      })

      io.use((socket, next) => {
        try {
          socket.user = socket.handshake.auth.user;
          if (!socket.user) {
            return next(new Error('Authentication error'));
          }
          next();
        } catch (err) {
          next(new Error('Authentication error'));
        }
      });
      

      
      io.on('connection', (socket) => {
        // Join a room with the user's username
        if (socket.user && socket.user._id && socket.user.username) {
          socket.join(socket.user.username);
      
          // Mark user as active
          User.findOneAndUpdate({ _id: socket.user._id }, { isActive: true }, { new: true })
            .then(user => {
              if (user) {
              } else {
              }
            })
            .catch(err => console.error("Error updating user status during connection:", err));
        } else if (socket.user && socket.user._id && socket.user.username) {
          socket.join(socket.user.username);
          User.findOneAndUpdate({ city: socket.user.city }, { isActive: true }, { new: true })
            .then(user => {
              if (user) {
              } else {
              }
            })
        } else {
          console.error("Socket user information is missing");
        }
      
        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected: ', reason);
          if (reason === 'io server disconnect') {
            // The disconnection was initiated by the server
            socket.connect();
          }
        });
        
        socket.on('connect_error', (err) => {
          console.log('Connection error: ', err.message);
        });
      
        socket.on('message', async (data) => {
          const { receiver, message, type, reply, replyTo, fileType, isSecret, hideMe, forWhat, image, imageName, imageType } = data;
          if ((receiver && message && type) || image) {
            try {
              let newMessage;
              if (type === 'image' && type !== "MayBeBoth") {
                // If the message is an image, upload it to S3 and save the path
                const imagePath = await utility.default.sendImageS3BucketNew(message, 'chatImages');
                newMessage = new Message({
                  sender: socket.user.username,
                  isSecret,
                  hideMe,
                  receiver,
                  message: imagePath, // Save the S3 path instead of the actual image data
                  type,
                  fileType,
                  timestamp: new Date()
                });
                await newMessage.save();
                io.to(receiver).emit('message', newMessage);
              } else {
                if (reply === "no" && forWhat !== "broadCast") {
                  // For non-image messages
                  newMessage = new Message({
                    sender: socket.user.username,
                    receiver,
                    message,
                    isSecret,
                    hideMe,
                    type,
                    timestamp: new Date()
                  });
                  await newMessage.save();
                  io.to(receiver).emit('message', newMessage);
                } else if (forWhat === "broadCast" || type === "MayBeBoth") {
                  //get both message and image
                  if (type === "MayBeBoth" && image) {
      
                    const imagePath = await utility.default.sendImageS3BucketNew(image, 'chatImages', imageName, imageType);
      
                    // Find all users whose city matches the receiver
                    const usersInCity = await User.find({ city: receiver });
      
                    if (usersInCity.length > 0) {
                      usersInCity.forEach(async user => {
                        if (user.username !== socket.user.username) { // Exclude the sender
                          newMessage = new Message({
                            sender: socket.user.username,
                            receiver: user.username, // Send to each user in the city
                            message,
                            image: imagePath,
                            type,
                            isSecret: data.isSecret,
                            hideMe: data.hideMe,
                            timestamp: new Date()
                          });
      
                          await newMessage.save();
                          io.to(user.username).emit('message', newMessage);
                        }
                      });
                    } else {
                    }
                  }
                  //get only message
                  if (type === "MayBeBoth" && !image) {
                    // Find all users whose city matches the receiver
                    let usersInCity = await User.find({ city: receiver });
      
                    if (usersInCity.length > 0) {
                      // Shuffle the array of users
                      usersInCity = usersInCity.sort(() => 0.5 - Math.random());
      
                      // Select a random subset of 100 users
                      const selectedUsers = usersInCity.slice(0, 100);
      
                      for (const user of selectedUsers) {
                        if (user.username !== socket.user.username) { // Exclude the sender
      
                          // Check if both sender and receiver have sent at least one message to each other with isSecret: "false"
                          const existingConversation = await Message.find({
                            $or: [
                              { sender: socket.user.username, receiver: user.username, isSecret: 'false' },
                              { sender: user.username, receiver: socket.user.username, isSecret: 'false' }
                            ]
                          });
      
                          // If both have sent at least one message to each other
                          const senderToReceiver = existingConversation.some(msg => msg.sender === socket.user.username);
                          const receiverToSender = existingConversation.some(msg => msg.sender === user.username);
      
                          // Only send the message if no two-way non-secret conversation exists
                          if (!senderToReceiver || !receiverToSender) {
                            const newMessage = new Message({
                              sender: socket.user.username,
                              receiver: user.username, // Send to each user in the city
                              message,
                              type,
                              isSecret,
                              hideMe,
                              timestamp: new Date()
                            });
      
                            // Save the new message
                            await newMessage.save();
      
                            // Emit the message to the user
                            io.to(user.username).emit('message', newMessage);
                          } else {
                          }
                        }
                      }
                    } else {
                    }
                  }
                }
                else {
                  // For non-image messages
                  newMessage = new Message({
                    sender: socket.user.username,
                    receiver,
                    message,
                    isSecret,
                    hideMe,
                    replyTo,
                    type,
                    timestamp: new Date()
                  });
                  await newMessage.save();
                  io.to(receiver).emit('message', newMessage);
                }
              }
            } catch (err) {
            }
          } else {
          }
        });
      
        // Handle disconnection
        socket.on('disconnect', () => {
          if (socket.user && socket.user._id) {
            User.findOneAndUpdate(
              { _id: socket.user._id },
              { isActive: false },
              { new: true }
            )
              .then(user => {
                if (user) {
                } else {
                }
              })
              .catch(err => console.error("Error updating user status during disconnection:", err));
          } else {
            console.error("Socket user information is missing on disconnect");
          }
        });
      });

}

module.exports = {SocketFunction};