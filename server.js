const http = require("https");
const socketIo = require("socket.io");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const db = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const chatRoutes = require("./routes/chatRoutes");
const questionRoutes = require("./routes/questionRoutes");
const fellowRoutes = require("./routes/fellowRoutes");
const NewUserRoutes = require("./routes/userRoutes");
const Message = require("./models/Message");
const User = require("./models/User");
const fileUpload = require("express-fileupload");
const utility = require("./config/utility");

const app = express();

app.use(express.json()); // Parse JSON bodies
app.use(fileUpload()); // Enable file upload middleware
// Middleware
app.use(
  cors({
    origin: "*", // Allow requests from your frontend's origin
    methods: ["GET", "POST"],
    credentials: true, // If you need to allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(bodyParser.json());

// Connect Database
// connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use("/api/auth", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);
app.use("/api", homeRoutes);
app.use("/api", chatRoutes);
app.use("/users", fellowRoutes);
app.use("/", NewUserRoutes);

// Create HTTP server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from your frontend's origin
    methods: ["GET", "POST"],
    credentials: true, // If you need to allow credentials (cookies, authorization headers, etc.)
  },
});

// Socket.IO authentication
io.use((socket, next) => {
  try {
    socket.user = socket.handshake.auth.user;
  } catch (err) {
    console.log("Error parsing user:", err);
  }
  next();
});

io.on("connection", (socket) => {
  // Join a room with the user's username
  if (socket.user && socket.user._id && socket.user.username) {
    socket.join(socket.user.username);

    // Mark user as active
    User.findOneAndUpdate(
      { _id: socket.user._id },
      { isActive: true },
      { new: true }
    )
      .then((user) => {
        if (user) {
        } else {
        }
      })
      .catch((err) =>
        console.error("Error updating user status during connection:", err)
      );
  } else if (socket.user && socket.user._id && socket.user.username) {
    socket.join(socket.user.username);
    User.findOneAndUpdate(
      { city: socket.user.city },
      { isActive: true },
      { new: true }
    ).then((user) => {
      if (user) {
      } else {
      }
    });
  } else {
    console.error("Socket user information is missing");
  }

  socket.on("message", async (data) => {
    const {
      receiver,
      message,
      type,
      reply,
      replyTo,
      fileType,
      isSecret,
      hideMe,
      forWhat,
      image,
      imageName,
      imageType,
    } = data;
    if ((receiver && message && type) || image) {
      try {
        let newMessage;
        if (type === "image" && type !== "MayBeBoth") {
          // If the message is an image, upload it to S3 and save the path
          const imagePath = await utility.default.sendImageS3BucketNew(
            message,
            "chatImages"
          );
          newMessage = new Message({
            sender: socket.user.username,
            isSecret,
            hideMe,
            receiver,
            message: imagePath, // Save the S3 path instead of the actual image data
            type,
            fileType,
            timestamp: new Date(),
          });
          await newMessage.save();
          io.to(receiver).emit("message", newMessage);
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
              timestamp: new Date(),
            });
            await newMessage.save();
            io.to(receiver).emit("message", newMessage);
          } else if (forWhat === "broadCast" || type === "MayBeBoth") {
            //get both message and image
            if (type === "MayBeBoth" && image) {
              const imagePath = await utility.default.sendImageS3BucketNew(
                image,
                "chatImages",
                imageName,
                imageType
              );

              // Find all users whose city matches the receiver
              const usersInCity = await User.find({ city: receiver });

              if (usersInCity.length > 0) {
                usersInCity.forEach(async (user) => {
                  if (user.username !== socket.user.username) {
                    // Exclude the sender
                    newMessage = new Message({
                      sender: socket.user.username,
                      receiver: user.username, // Send to each user in the city
                      message,
                      image: imagePath,
                      type,
                      isSecret: data.isSecret,
                      hideMe: data.hideMe,
                      timestamp: new Date(),
                    });

                    await newMessage.save();
                    io.to(user.username).emit("message", newMessage);
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
                  if (user.username !== socket.user.username) {
                    // Exclude the sender

                    // Check if both sender and receiver have sent at least one message to each other with isSecret: "false"
                    const existingConversation = await Message.find({
                      $or: [
                        {
                          sender: socket.user.username,
                          receiver: user.username,
                          isSecret: "false",
                        },
                        {
                          sender: user.username,
                          receiver: socket.user.username,
                          isSecret: "false",
                        },
                      ],
                    });

                    // If both have sent at least one message to each other
                    const senderToReceiver = existingConversation.some(
                      (msg) => msg.sender === socket.user.username
                    );
                    const receiverToSender = existingConversation.some(
                      (msg) => msg.sender === user.username
                    );

                    // Only send the message if no two-way non-secret conversation exists
                    if (!senderToReceiver || !receiverToSender) {
                      const newMessage = new Message({
                        sender: socket.user.username,
                        receiver: user.username, // Send to each user in the city
                        message,
                        type,
                        isSecret,
                        hideMe,
                        timestamp: new Date(),
                      });

                      // Save the new message
                      await newMessage.save();

                      // Emit the message to the user
                      io.to(user.username).emit("message", newMessage);
                    } else {
                    }
                  }
                }
              } else {
              }
            }
          } else {
            // For non-image messages
            newMessage = new Message({
              sender: socket.user.username,
              receiver,
              message,
              isSecret,
              hideMe,
              replyTo,
              type,
              timestamp: new Date(),
            });
            await newMessage.save();
            io.to(receiver).emit("message", newMessage);
          }
        }
      } catch (err) {}
    } else {
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (socket.user && socket.user._id) {
      User.findOneAndUpdate(
        { _id: socket.user._id },
        { isActive: false },
        { new: true }
      )
        .then((user) => {
          if (user) {
          } else {
          }
        })
        .catch((err) =>
          console.error("Error updating user status during disconnection:", err)
        );
    } else {
      console.error("Socket user information is missing on disconnect");
    }
  });
});

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 to allow external connections
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Ignore DeprecationWarning if necessary
process.emitWarning = (warning, type) => {
  if (type !== "DeprecationWarning") {
    console.warn(warning);
  }
};
