const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
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
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow requests from your frontend's origin
    methods: ['GET', 'POST'],
    credentials: true // If you need to allow credentials (cookies, authorization headers, etc.)
  }
});

// Socket.IO authentication
io.use((socket, next) => {
  try {
    socket.user = JSON.parse(socket.handshake.auth.user);
  } catch (err) {
    console.log('Error parsing user:', err);
  }
    next();
});


// Socket.IO connection
io.on('connection', (socket) => {
  
  // Join a room with the user's username 
  socket.join(socket.user);``

  // Mark user as active
  User.findOneAndUpdate({ _id: socket.user._id }, { isActive: true }, { new: true })
    .catch(err => console.error(err));

  // Handle chat messages
  socket.on('message', async (data) => {
    const { receiver, message, type} = data;
    const newMessage = new Message({
      sender:socket.user.username,
      receiver,
      message,
      type,
      timestamp: new Date()
    });
    console.log("newMessage",newMessage)
    await newMessage.save();
    io.to(receiver).emit('message', newMessage);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    User.findOneAndUpdate(
      { username: socket.user.username },
      { isActive: false },
      { new: true }
    )
      .then(user => {
        if (user) {
        } else {
        }
      })
      .catch(err => console.error('Error updating user:', err));
  });
  
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
