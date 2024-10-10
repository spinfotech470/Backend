
const mongoose = require("mongoose");

const dbUrl =
  "mongodb+srv://youthaddabyspinfotech:QxNmEJQO9CFezsED@cluster0.jwlesrn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(dbUrl, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = db;
