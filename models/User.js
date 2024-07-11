const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  email: { type: String, required: true },
  profilePicture: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  gender: { type: String },
  dob: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  socialAccounts: [socialAccountSchema],
  blockedUsers: [String],
  isActive: Boolean,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  fellowing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
