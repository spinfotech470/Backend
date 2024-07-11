const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  requester: { type: String, required: true },
  requestee: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
});

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
