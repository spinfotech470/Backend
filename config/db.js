const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            connectTimeoutMS: 30000,  // 30 seconds connection timeout
            socketTimeoutMS: 45000    // 45 seconds socket timeout
        });
        // console.log('MongoDB connected...');
    } catch (err) {
        // console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;






// const mongoose = require("mongoose");

// const dbUrl =
//   "mongodb+srv://youthaddabyspinfotech:QxNmEJQO9CFezsED@cluster0.jwlesrn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// mongoose.connect(dbUrl, {
//   //   useNewUrlParser: true,
//   //   useUnifiedTopology: true,
// });

// const db = mongoose.connection;

// db.on("error", console.error.bind(console, "Connection error:"));
// db.once("open", () => {
//   console.log("Connected to MongoDB");
// });

// module.exports = db;
