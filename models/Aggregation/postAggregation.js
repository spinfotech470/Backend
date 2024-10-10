const mongoose = require('mongoose');
const Post = require("../PostSchema");

exports.getAllPostsWithLikesAndComments = async (req, res) => {
    try {
        const results = await Post.aggregate([
            {$match: {
                isDeleted: "false"
            }},
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByDetails'
                }
            },
            {
                $unwind: '$createdByDetails'
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
                $lookup: {
                    from: 'users',
                    localField: 'comments.userId',
                    foreignField: '_id',
                    as: 'commentsUserDetails'
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
                $project: {
                    askanonymously: 1,
                    imgUrl: 1,
                    questionTitle: 1,
                    description: 1,
                    category: 1,
                    opinionFrom: 1,
                    createdBy: 1,
                    createdByUsername: 1,
                    createdAt: 1,
                    createdByDetails: 1,
                    isDeleted: 1,
                    likes: {
                        $map: {
                            input: '$likes',
                            as: 'like',
                            in: {
                                userId: '$$like.userId',
                                userDetails: {
                                    $cond: [
                                        { $lte: [{ $indexOfArray: ['$likes.userId', '$$like.userId'] }, 2] },
                                        {
                                            $arrayElemAt: ['$likesUserDetails', {
                                                $indexOfArray: ['$likes.userId', '$$like.userId']
                                            }]
                                        },
                                        null
                                    ]
                                },
                                likedAt: '$$like.likedAt',
                            }
                        }
                    },
                    comments: {
                        $map: {
                            input: '$comments',
                            as: 'comment',
                            in: {
                                commentId: '$$comment.commentId',
                                userId: '$$comment.userId',
                                userDetails: {
                                    $cond: [
                                        { $lte: [{ $indexOfArray: ['$comments.userId', '$$comment.userId'] }, 2] },
                                        {
                                            $arrayElemAt: ['$commentsUserDetails', {
                                                $indexOfArray: ['$comments.userId', '$$comment.userId']
                                            }]
                                        },
                                        null
                                    ]
                                },
                                content: '$$comment.content',
                                createdAt: '$$comment.createdAt',
                                likes: {
                                    $map: {
                                        input: '$$comment.likes',
                                        as: 'like',
                                        in: {
                                            userId: '$$like.userId',
                                            userDetails: {
                                                $cond: [
                                                    { $lte: [{ $indexOfArray: ['$comments.likes.userId', '$$like.userId'] }, 2] },
                                                    {
                                                        $arrayElemAt: ['$commentLikesUserDetails', {
                                                            $indexOfArray: ['$comments.likes.userId', '$$like.userId']
                                                        }]
                                                    },
                                                    null
                                                ]
                                            },
                                            likedAt: '$$like.likedAt',
                                        }
                                    }
                                }
                            }
                        }
                    },
                    score: 1,
                    shares: 1,
                }
            }
        ]);

        res.status(200).json(results);
    } catch (error) {
        // console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
