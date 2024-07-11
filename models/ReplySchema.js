const mongoose = require('mongoose');

// Define the Reply schema
const replySchema = new mongoose.Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Export only the Reply model
module.exports = mongoose.model('Reply', replySchema);
