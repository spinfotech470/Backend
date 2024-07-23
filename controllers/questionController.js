// controllers/questionController.js
const mongoose = require("mongoose");
const Question = require("../models/PostSchema");
const Notification = require("../models/notification");
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

    console.log("Attempting to save the question to the database");

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
    console.error("Error saving question:", error);
    res.status(500).json({ message: error.message });
  }
};

// exports.addArtiest = async function (req, res) {
//   try {
//       var post = req.body;

//       var rowData = {};
//       if (post._id) {
//           rowData = await _master2.default.getOneDb(_projectArtiest2.default, { _id: post._id });
//       }

//       if (req.files && req.files.image) {
//           post.image = await _utility2.default.sendImageS3Bucket(req.files.image, 'artiest', rowData && rowData.image ? rowData.image : '');
//       }

//       if (post._id) {
//           await _master2.default.updateDb(_projectArtiest2.default, { _id: post._id }, post);
//           rowData = await _master2.default.getOneDb(_projectArtiest2.default, { _id: post._id });
//       } else {
//           rowData = await _master2.default.addDb(_projectArtiest2.default, post);
//       }

//       return res.send({ "code": _commonMsg2.default.sucessCODE, "msg": _commonMsg2.default.sucessMSG, "data": rowData });
//   } catch (error) {
//       return res.send({ "code": _commonMsg2.default.errorCODE, "msg": _commonMsg2.default.catchMsg, "error": error });
//   }
// };

// Get all questions

exports.getQuestions = async (req, res) => {
  if (req.query) {
    try {
      const { createdBy } = req.query;
      console.log("createdBy:", createdBy);
      const questions = await Question.find({ createdBy: createdBy });
      console.log(questions);
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
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

// Delete a question by ID
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

// Like a post
exports.likePost = async (req, res) => {
  const { postId } = req.query;
  const userId = req.body.createdBy;
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
      console.log("Post is Unlike");

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
      console.log("Post is like");

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

    console.log("Comment added and notification created");

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
    console.log("Comment deleted");

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  // const { } = req.query;
  const { content , postId, commentId} = req.body;

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
    console.log("Comment updated");

    return res.status(200).json({ message: "Comment updated successfully", post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.likeComment = async (req, res) => {
  // const { postId, commentId } = req.query;
  const {postId, commentId,userId } = req.body;
  console.log("PostId --------- ",postId)

  try {
    const post = await Question.findById(postId);
    console.log("post --",post)

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

      console.log("Comment unliked");

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
      console.log("Comment liked");

      return res.status(200).json({ message: "Comment liked", post });
    }

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.replyToComment = async (req, res) => {
  // const { postId } = req.query;
  const { userId, content ,commentId, postId } = req.body;
  try {
    const post = await Question.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    console.log("comment ",comment)
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

    console.log("Reply added With Notification");

    return res.status(200).json({ message: "Reply added", post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getRepliesOfComment = async (req, res) => {
  const { commentId,postId} = req.body;
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
      console.log("User Details of replies : ",comment.replies)
      return comment.replies;
  } catch (error) {
      console.error('Error fetching replies of comment:', error);
      throw error;
  }
};
