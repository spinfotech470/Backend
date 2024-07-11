const mongoose = require('mongoose');

// Define the Like schema
const likeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likedAt: { type: Date, default: Date.now }
});

// Define the Reply schema
const replySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [likeSchema]
});

// Define the Comment schema
const commentSchema = new mongoose.Schema({
    commentId: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [replySchema],
    likes: [likeSchema]
});

// Define the Post schema
const postSchema = new mongoose.Schema({
    askanonymously: { type: String },
    questionTitle: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    opinionFrom: { type: String, required: true },
    imgUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByUsername: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [likeSchema],
    comments: [commentSchema]
});

// Create the Post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
