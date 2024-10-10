const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    commentWritter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Like', 'Comment','CommentLike', 'Reply'], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    mail: { type: Boolean, default: false },
    content : {type: String}
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
