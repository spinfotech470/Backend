const mongoose = require('mongoose');

// Define the Like schema
const likeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Define the Reply schema
const replySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isDeleted:{ type: String, default:"false" },
    report: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [likeSchema]
}, { timestamps: true });

// Define the Comment schema
const commentSchema = new mongoose.Schema({
    commentId: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [replySchema],
    isDeleted:{ type: String, default:"false" },
    report: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [likeSchema]
}, { timestamps: true });

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
    comments: [commentSchema],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Store userIds who shared the post
    report: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: { type: Number, default: 0 },
    isDeleted:{ type: String, default:"false" },
    isSecret: { type: String, default : "false"},
    hideMe: { type: String, default: "false"},
}, { timestamps: true });

// Virtual to calculate score considering unique user comments
postSchema.virtual('calculatedScore').get(function () {
    const likesCount = this.likes?.length || 0;

    // Count unique users who commented
    const uniqueCommenters = new Set(this.comments && this.comments.map(comment => comment.userId.toString())).size;

    const shareCount = this.shares?.length || 0;

    return (likesCount * 1) + (uniqueCommenters * 10) + (shareCount * 20);
});

// Set the virtual field to be included in JSON output
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Optional: Pre-save middleware to calculate and store the score
postSchema.pre('save', function (next) {
    const likesCount = this.likes.length;

    // Count unique users who commented
    const uniqueCommenters = new Set(this.comments && this.comments.map(comment => comment.userId.toString())).size;

    const shareCount = this.shares.length;

    this.score = (likesCount * 1) + (uniqueCommenters * 10) + (shareCount * 20);
    next();
});

// Create the Post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
