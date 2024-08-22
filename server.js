const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const chatRoutes = require('./routes/chatRoutes')
const questionRoutes = require('./routes/questionRoutes');
const fellowRoutes = require('./routes/fellowRoutes');
const NewUserRoutes = require('./routes/userRoutes');
const Message = require('./models/Message');
const User = require('./models/User');
const fileUpload = require('express-fileupload');
const utility = require("./config/utility")

const app = express();

app.use(express.json()); // Parse JSON bodies
app.use(fileUpload()); // Enable file upload middleware
// Middleware
app.use(cors({
  origin: '*', // Allow requests from your frontend's origin
  methods: ['GET', 'POST'],
  credentials: true // If you need to allow credentials (cookies, authorization headers, etc.)
}));
app.use(bodyParser.json());

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api', homeRoutes);
app.use('/api', chatRoutes);
app.use('/users', fellowRoutes);
app.use('/', NewUserRoutes)

// Create HTTP server
const server = http.createServer(app);

// Init Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: '*', // Allow requests from your frontend's origin
//     methods: ['GET', 'POST'],
//     credentials: true // If you need to allow credentials (cookies, authorization headers, etc.)
//   }
// });

const io = new Server(server, {
  cors: {
    origin: '*', // Allow requests from your frontend's origin
    methods: ['GET', 'POST'],
    credentials: true // If you need to allow credentials (cookies, authorization headers, etc.)
  }
})

// Socket.IO authentication
io.use((socket, next) => {
  try {
    socket.user = (socket.handshake.auth.user);
  } catch (err) {
    console.log('Error parsing user:', err);
  }
  next();
});


// Socket.IO connection
// io.on('connection', (socket) => {
//   // Join a room with the user's username 
//   console.log(socket.user._id)
//   socket.join(socket.user.username);``

//   // Mark user as active
//   User.findOneAndUpdate({ _id: socket.user._id }, { isActive: true }, { new: true })
//   .then(user => {
//     if (user) {
//       console.log("User marked as active:", user.username);
//     } else {
//       console.error("User not found");
//     }
//   })
//   .catch(err => console.error("Error updating user status:", err));

//   // Handle chat messages
//   socket.on('message', async (data) => {
//     const { receiver, message, type} = data;
//     const newMessage = new Message({
//       sender:socket.user.username,
//       receiver,
//       message,
//       type,
//       timestamp: new Date()
//     });
//     console.log("newMessage",newMessage)
//     await newMessage.save();
//     console.log("Emitting to:", receiver, "Message:", newMessage);
//     io.to(receiver).emit('message', newMessage);
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log("User disconnected", socket.id);
//     // Mark user as inactive
//     User.findOneAndUpdate(
//       { _id: socket.user._id },
//       { isActive: false },
//       { new: true }
//     )
//     .then(user => {
//       if (user) {
//         console.log("User marked as inactive:", user.username);
//       } else {
//         console.error("User not found");
//       }
//     })
//     .catch(err => console.error("Error updating user status:", err));
//   });

// });

io.on('connection', (socket) => {
  // Join a room with the user's username
  if (socket.user && socket.user._id && socket.user.username) {
    console.log("User connected:", socket.user.username);
    socket.join(socket.user.username);

    // Mark user as active
    User.findOneAndUpdate({ _id: socket.user._id }, { isActive: true }, { new: true })
      .then(user => {
        if (user) {
          console.log("User marked as active:", user.username);
        } else {
          console.error("User not found during connection");
        }
      })
      .catch(err => console.error("Error updating user status during connection:", err));
  } else if (socket.user && socket.user._id && socket.user.username) {
    console.log("User connected by city:", socket.user.username);
    socket.join(socket.user.username);
    User.findOneAndUpdate({ city: socket.user.city }, { isActive: true }, { new: true })
      .then(user => {
        if (user) {
          console.log("User marked as active by city:", user.username);
        } else {
          console.error("User not found during connection(city)");
        }
      })
  } else {
    console.error("Socket user information is missing");
  }

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
          console.log("Message saved and emitting to(Img):", receiver);
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
            console.log("Message saved and emitting to:", receiver);
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
                    console.log(`Broadcast message saved and sent to ${user.username} in city ${receiver}`);
                  }
                });
              } else {
                console.log(`No users found in city: ${receiver}`);
              }
            }
            //get only message
            if (type === "MayBeBoth" && !image) {
              // Find all users whose city matches the receiver
              const usersInCity = await User.find({ city: receiver });
              if (usersInCity.length > 0) {
                usersInCity.forEach(async user => {
                  if (user.username !== socket.user.username) { // Exclude the sender
                    newMessage = new Message({
                      sender: socket.user.username,
                      receiver: user.username, // Send to each user in the city
                      message,
                      image: '',
                      type,
                      isSecret: data.isSecret,
                      hideMe: data.hideMe,
                      timestamp: new Date()
                    });

                    await newMessage.save();
                    io.to(user.username).emit('message', newMessage);
                    console.log(`Broadcast message saved and sent to ${user.username} in city ${receiver}`);
                  }
                });
              } else {
                console.log(`No users found in city: ${receiver}`);
              }
            }
            // newMessage = new Message({
            //   sender: socket.user.username,
            //   receiver,
            //   message,
            //   isSecret,
            //   hideMe,
            //   type,
            //   timestamp: new Date()
            // });
            // await newMessage.save();
            // console.log("Message saved and emitting to(broadcaste):", receiver);
            // io.to(receiver).emit('message', newMessage);
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
            console.log("Message saved and emitting to:", receiver);
            io.to(receiver).emit('message', newMessage);
          }
        }
      } catch (err) {
        console.error("Error saving message:", err);
      }
    } else {
      console.error("Invalid message data:", data);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log("User disconnected", socket.id);
    if (socket.user && socket.user._id) {
      User.findOneAndUpdate(
        { _id: socket.user._id },
        { isActive: false },
        { new: true }
      )
        .then(user => {
          if (user) {
            console.log("User marked as inactive:", user.username);
          } else {
            console.error("User not found during disconnection");
          }
        })
        .catch(err => console.error("Error updating user status during disconnection:", err));
    } else {
      console.error("Socket user information is missing on disconnect");
    }
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
