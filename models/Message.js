const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, default: "" },
  image: { type: String },
  isSecret: { type: String, default : "false"},
  hideMe: { type: String, default: ""},
  fileType: { type: String },
  type: { type: String, enum: ['text', 'image', 'emoji', 'gif', 'MayBeBoth'], default: 'text' },
  timestamp: { type: Date, default: Date.now },
  seenTime: { type: Date, default: Date.now },
  seenStatus: { type: String, default: "false" },
  isDeleted: { type: String, default: "false" },
  edited: { type: String, default: "false" },
  chatDeleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   // Reference to the original message being replied to
}, { timestamps: true });


module.exports = mongoose.model('Message', messageSchema);
