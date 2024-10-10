const mongoose = require("mongoose");
const Question = require("../models/PostSchema");
const Notification = require("../models/notification");
const User = require("../models/User")
const utility = require("../config/utility")

exports.createQuestion = async (req, res) => {
  try {
    const {
      askanonymously,
      questionTitle,
      description,
      category,
      opinionFrom,
    } = req.body;

    const { _id, user } = req.body;

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

    if (req.files && req.files.image) {
      const imagePath = await utility.default.sendImageS3Bucket(
        req.files.image,
        'QuestionPost',
        rowData.image || ''
      );
      newQuestion.imgUrl = imagePath;
    }

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    const questions = await Question.find({isDeleted:"false"});
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getPostsInfomations = async (req, res) => {
  try {
    const postId = req.body.postId;

    const post = await Question.findById(postId)
      .populate('createdBy', 'name username email gender blockedUsers profileImg socialAccounts') 
      .populate('likes.userId', 'name username email gender blockedUsers profileImg socialAccounts')
      .populate({
        path: 'comments.userId', 
        select: 'name username email gender blockedUsers profileImg socialAccounts'
      })
      .populate({
        path: 'comments.likes.userId', 
        select: 'name username email gender blockedUsers profileImg socialAccounts'
      })
      .exec();

    if (!post) {
      return res.status(200).json({ message: 'Post not found' });
    }

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

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) {
      return res.status(200).json({ message: "Question not found" });
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
      return res.status(200).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reportQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(200).json({ message: "Question not found" });
    }

    if (question.report.includes(req.body.userId)) {
      return res.status(200).json({ message: "You have already reported this question" });
    }

    question.report.push(req.body.userId);
    await question.save();

    res.status(200).json({ message: "Question reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reportComment = async (req, res) => {
  try {
    const { postId, commentId, userId } = req.body;

    const post = await Question.findById(postId);

    if (!post) {
      return res.status(200).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(200).json({ message: "Comment not found" });
    }

    if (comment.report.includes(userId)) {
      return res.status(200).json({ message: "You have already reported this comment" });
    }

    comment.report.push(userId);

    await post.save();

    res.status(200).json({ message: "Comment reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reportReply = async (req, res) => {
  try {
    const { postId, commentId, replyId, userId } = req.body;

    const post = await Question.findById(postId);

    if (!post) {
      return res.status(200).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(200).json({ message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(200).json({ message: "Reply not found" });
    }

    if (reply.report.includes(userId)) {
      return res.status(200).json({ message: "You have already reported this reply" });
    }

    reply.report.push(userId);

    await post.save();

    res.status(200).json({ message: "Reply reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCommentNew = async (req, res) => {
  try {
    const { postId, commentId } = req.body;

    const post = await Question.findById(postId);

    if (!post) {
      return res.status(200).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(200).json({ message: "Comment not found" });
    }

    comment.isDeleted = "true";

    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.body;

    const post = await Question.findById(postId);

    if (!post) {
      return res.status(200).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(200).json({ message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(200).json({ message: "Reply not found" });
    }

    reply.isDeleted = "true";

    await post.save();

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    const alreadyLiked = post.likes.find((like) => like.userId.equals(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((like) => !like.userId.equals(userId));

      await post.save();

      return res.status(200).json({ message: "Post unliked", post });
    } else {
      post.likes.push({ userId });
      await post.save();

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

    const newComment = { userId, content };
    post.comments.push(newComment);
    await post.save();
    const notification = new Notification({
      recipient: post.createdBy,
      sender: userId,
      type: 'Comment',
      postId: post._id,
      content:content,
    });
    await notification.save();

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

    const alreadyLiked = comment.likes.find((like) =>
      like.userId.equals(userId)
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (like) => !like.userId.equals(userId)
      );
      await post.save();

      return res.status(200).json({ message: "Comment unliked", post });
    } else {
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
    const userId = req.body.userId;
    const user = await User.findById(userId).populate('fellowing');

    let posts;

    if (user.fellowing.length === 0) {
      posts = await Question.find().populate('createdBy');
    } else {
      const followingIds = user.fellowing.map(followedUser => followedUser._id);
      posts = await Question.find({ createdBy: { $in: followingIds } }).populate('createdBy');
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
      return res.status(200).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};