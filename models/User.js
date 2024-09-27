const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  email: { type: String, required: true },
  profilePicture: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String }
});

const followersSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true  },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  gender: { type: String },
  profileImg: { type: String },
  coverImg: { type: String },
  dob: { type: Date },
  city:{type: String},
  aboutMe:{type: String},
  mobile:{type: String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  socialAccounts: [socialAccountSchema],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: Boolean,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  fellowing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersDetails : [followersSchema],
  userType : {type: String, default : "0" }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
