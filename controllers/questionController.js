// controllers/questionController.js
const mongoose = require("mongoose");
const Question = require("../models/PostSchema");
const Notification = require("../models/notification");
const User = require("../models/User")
const utility = require("../config/utility")

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const {
      askanonymously,
      questionTitle,
      description,
      category,
      opinionFrom,
    } = req.body;

    const { _id, user } = req.body; // Destructure _id and user from req.body

    const newQuestion = new Question({
      askanonymously,
      questionTitle,
      description,
      category,
      opinionFrom,
      createdBy: req.body.user_id,
      createdByUsername: req.body.username,
    });

    let rowData = {};

    // Handle image upload if exists in req.files
    if (req.files && req.files.image) {
      const imagePath = await utility.default.sendImageS3Bucket(
        req.files.image,
        'QuestionPost',
        rowData.image || '' // Use existing image path if rowData.image exists
      );
      newQuestion.imgUrl = imagePath; // Assign image path to newQuestion
    }

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all questions
exports.getQuestions = async (req, res) => {
  if (req.query) {
    try {
      const { createdBy } = req.query;
      const questions = await Question.find({ createdBy: createdBy });
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

exports.getAllQuestions = async (req, res) => {
  const userId = req.body.userId;
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPostsInfomations = async (req, res) => {
  try {
    const postId = req.body.postId;

    // Fetch the post and populate createdBy and likes.userId with user details
    const post = await Question.findById(postId)
      .populate('createdBy', 'name username email gender blockedUsers profileImg socialAccounts') // Populate createdBy details
      .populate('likes.userId', 'name username email gender blockedUsers profileImg socialAccounts') // Populate likes.userId details
      .populate({
        path: 'comments.userId', 
        select: 'name username email gender blockedUsers profileImg socialAccounts' // Populate comments.userId details
      })
      .populate({
        path: 'comments.likes.userId', 
        select: 'name username email gender blockedUsers profileImg socialAccounts' // Populate comments.likes.userId details
      })
      .exec();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Prepare response with user details
    const response = {
      ...post.toObject(),
      createdByDetails: post.createdBy, // Add createdBy details
      likesDetails: post.likes.map(like => like.userId), // Map likes to user details
      commentsDetails: post.comments.map(comment => ({
        ...comment.toObject(),
        userId: comment.userId, // Include user details in each comment
        likesDetails: comment.likes.map(like => like.userId) // Include user details for likes within each comment
      }))
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getPostInfo = async (req, res) => {
  try {
    const questions = await Question.findById({ _id: req.body.postId });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a question by ID
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id); 
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// report post-
exports.reportQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(200).json({ message: "Question not found" });
    }

    // Check if user has already reported the question
    if (question.report.includes(req.body.userId)) {
      return res.status(200).json({ message: "You have already reported this question" });
    }

    // Add user ID to the report field
    question.report.push(req.body.userId);
    await question.save();

    res.status(200).json({ message: "Question reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// report comment
exports.reportComment = async (req, res) => {
  try {
    const { postId, commentId, userId } = req.body;

    // Find the post by ID
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(200).json({ message: "Post not found" });
    }

    // Find the specific comment by ID within the post's comments array
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(200).json({ message: "Comment not found" });
    }

    // Check if the user has already reported the comment
    if (comment.report.includes(userId)) {
      return res.status(200).json({ message: "You have already reported this comment" });
    }

    // Add the userId to the report field of the comment
    comment.report.push(userId);

    // Save the updated post with the reported comment
    await post.save();

    res.status(200).json({ message: "Comment reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// report reply
exports.reportReply = async (req, res) => {
  try {
    const { postId, commentId, replyId, userId } = req.body;

    // Find the post by ID
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(200).json({ message: "Post not found" });
    }

    // Find the specific comment by ID within the post's comments array
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(200).json({ message: "Comment not found" });
    }

    // Find the specific reply by ID within the comment's replies array
    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(200).json({ message: "Reply not found" });
    }

    // Check if the user has already reported the reply
    if (reply.report.includes(userId)) {
      return res.status(200).json({ message: "You have already reported this reply" });
    }

    // Add the userId to the report field of the reply
    reply.report.push(userId);

    // Save the updated post with the reported reply
    await post.save();

    res.status(200).json({ message: "Reply reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete comment
exports.deleteCommentNew = async (req, res) => {
  try {
    const { postId, commentId } = req.body;

    // Find the post by ID
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(200).json({ message: "Post not found" });
    }

    // Find the specific comment by ID within the post's comments array
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(200).json({ message: "Comment not found" });
    }

    // Set the comment's isDeleted flag to true
    comment.isDeleted = "true"; // or you can use boolean true

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete reply
exports.deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.body;

    // Find the post by ID
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(200).json({ message: "Post not found" });
    }

    // Find the specific comment by ID within the post's comments array
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(200).json({ message: "Comment not found" });
    }

    // Find the specific reply by ID within the comment's replies array
    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(200).json({ message: "Reply not found" });
    }

    // Set the reply's isDeleted flag to true
    reply.isDeleted = "true"; // or you can use boolean true

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// Like a post
exports.likePost = async (req, res) => {
  const { postId } = req.query;
  const userId = req.body.createdBy;
  const postInfo = req.body.postInfo;
  const senderInfo = req.body.senderInfo;
  const type = req.body.type;
  try {
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user already liked the post
    const alreadyLiked = post.likes.find((like) => like.userId.equals(userId));

    if (alreadyLiked) {
      // Unlike the post
      post.likes = post.likes.filter((like) => !like.userId.equals(userId));

      await post.save();

      return res.status(200).json({ message: "Post unliked", post });
    } else {
      // Like the post
      post.likes.push({ userId });
      await post.save();

      // Send notification to the post owner (commented out for now)
      const notification = new Notification({
        recipient: post.createdBy,
        sender: userId,
        type: 'Like',
        postId: post._id
      });
      await notification.save();
      utility.default.sendNotificationMail(postInfo, senderInfo, type)

      return res.status(200).json({ message: "Post liked", post });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// Get likes of a post

exports.commentPost = async (req, res) => {
  const { postId } = req.query;
  const { userId, content } = req.body;
  const postInfo = req.body.postInfo;
  const senderInfo = req.body.senderInfo;
  const type = req.body.type;

  try {
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add the comment
    const newComment = { userId, content };
    post.comments.push(newComment);
    await post.save();
    // Create a notification
    const notification = new Notification({
      recipient: post.createdBy,
      sender: userId,
      type: 'Comment',
      postId: post._id
    });
    await notification.save();
    // utility.default.sendNotificationMail(postInfo,senderInfo,type)

    return res.status(200).json({ message: "Comment added and Notification is created", post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.body;

  try {
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    post.comments.pull(commentId);
    await post.save();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  // const { } = req.query;
  const { content, postId, commentId } = req.body;

  try {
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.content = content;
    await post.save();

    return res.status(200).json({ message: "Comment updated successfully", post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.likeComment = async (req, res) => {
  // const { postId, commentId } = req.query;
  const { postId, commentId, userId } = req.body;

  try {
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user already liked the comment
    const alreadyLiked = comment.likes.find((like) =>
      like.userId.equals(userId)
    );

    if (alreadyLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter(
        (like) => !like.userId.equals(userId)
      );
      await post.save();

      return res.status(200).json({ message: "Comment unliked", post });
    } else {
      // Like the comment
      comment.likes.push({ userId });
      await post.save();
      const notification = new Notification({
        recipient: post.createdBy,
        sender: userId,
        type: 'CommentLike',
        postId: post._id
      });
      await notification.save();

      return res.status(200).json({ message: "Comment liked", post });
    }

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.replyToComment = async (req, res) => {
  // const { postId } = req.query;
  const { userId, content, commentId, postId } = req.body;
  try {
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Add the reply
    const newReply = { userId, content };
    comment.replies.push(newReply);
    await post.save();
    const notification = new Notification({
      recipient: post.createdBy,
      commentWritter: req.body.commentWritter,
      sender: userId,
      type: 'Reply',
      postId: post._id
    });
    await notification.save();

    return res.status(200).json({ message: "Reply added", post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getRepliesOfComment = async (req, res) => {
  const { commentId, postId } = req.body;
  try {
    const post = await Question.findById(postId)
      .populate({
        path: 'comments.replies.userId',
        select: 'username'
      });

    if (!post) {
      throw new Error('Post not found');
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }
    return comment.replies;
  } catch (error) {
    throw error;
  }
};

exports.forYou = async (req, res) => {
  try {
    const userId = req.body.userId; // Get the user ID from the request body
    const user = await User.findById(userId).populate('fellowing');

    let posts;

    if (user.fellowing.length === 0) {
      // If the user is not following anyone, show all posts
      posts = await Question.find().populate('createdBy');
    } else {
      // Get the IDs of users the current user is following
      const followingIds = user.fellowing.map(followedUser => followedUser._id);

      // Show posts only from users they follow
      posts = await Question.find({ createdBy: { $in: followingIds } }).populate('createdBy');
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// exports.share = async (req, res) => {
//   try {
//     const { postId } = req.body;

//     const post = await Question.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: 'Post not found' });
//     }

//     post.share += 1;

//     const likesCount = post.likes?.length || 0;
//     const commentsCount = post.comments?.length || 0;
//     post.score = (likesCount * 1) + (commentsCount * 10) + (post.share * 20);

//     await post.save();

//     res.status(200).json(post);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

exports.share = async (req, res) => {
  const postId = req.body.postId;
  const userId = req.body.userId;
  try {
    const post = await Question.findById(postId);
    if (post) {
      if (!post.shares.includes(userId)) {
        post.shares.push(userId);
        await post.save();
        res.status(200).json(post);
      }
    } else {
      res.status(500).json({ message: 'no post found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error });
  }
};

exports.deleteQuestionOrPost = async (req, res) => {
  const id = req.body.postId;
  try {
    const question = await Question.findByIdAndUpdate({_id:id}, {
      isDeleted:"true"
    });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};