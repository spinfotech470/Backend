const mongoose = require('mongoose');
const Message = require("../ReplySchema");
exports.getMessageReply = async (req, res) => {
    try {
        // console.log("inside the Lookup")
        const results = await Message.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByDetails'
                }
            },
            {
                $unwind: {
                    path: '$createdByDetails',
                    preserveNullAndEmptyArrays: true // Keep Message without createdBy details
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'likes.userId',
                    foreignField: '_id',
                    as: 'likesUserDetails'
                }
            },
            {
                $unwind: {
                    path: '$likes',
                    preserveNullAndEmptyArrays: true // Keep Message without likes
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'likes.userId',
                    foreignField: '_id',
                    as: 'likes.userDetails'
                }
            },
            {
                $unwind: {
                    path: '$likes.userDetails',
                    preserveNullAndEmptyArrays: true // Keep likes without user details
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.userId',
                    foreignField: '_id',
                    as: 'commentsUserDetails'
                }
            },
            {
                $unwind: {
                    path: '$comments',
                    preserveNullAndEmptyArrays: true // Keep Message without comments
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.userId',
                    foreignField: '_id',
                    as: 'comments.userDetails'
                }
            },
            {
                $unwind: {
                    path: '$comments.userDetails',
                    preserveNullAndEmptyArrays: true // Keep comments without user details
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.likes.userId',
                    foreignField: '_id',
                    as: 'commentLikesUserDetails'
                }
            },
            {
                $unwind: {
                    path: '$comments.likes',
                    preserveNullAndEmptyArrays: true // Keep comments without likes
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.likes.userId',
                    foreignField: '_id',
                    as: 'comments.likes.userDetails'
                }
            },
            {
                $unwind: {
                    path: '$comments.likes.userDetails',
                    preserveNullAndEmptyArrays: true // Keep likes without user details
                }
            },
            {
                $group: {
                    _id: '$_id',
                    askanonymously: { $first: '$askanonymously' },
                    imgUrl: { $first: '$imgUrl' },
                    questionTitle: { $first: '$questionTitle' },
                    description: { $first: '$description' },
                    category: { $first: '$category' },
                    opinionFrom: { $first: '$opinionFrom' },
                    createdBy: { $first: '$createdBy' },
                    createdByUsername: { $first: '$createdByUsername' },
                    createdAt: { $first: '$createdAt' },
                    createdByDetails: { $first: '$createdByDetails' },
                    likes: { $push: '$likes' },
                    likesUserDetails: { $first: '$likesUserDetails' },
                    comments: { $push: '$comments' },
                    commentsUserDetails: { $first: '$commentsUserDetails' },
                    commentLikesUserDetails: { $first: '$commentLikesUserDetails' }
                }
            }
        ]);
        // console.log("results",results)
        res.status(200).json(results);
    } catch (error) {
        // console.error(error);
    }
};


