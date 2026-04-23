const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const AppError = require("../utils/AppError");

const isCommentOwner = (comment, userId, userRole) => {
  return comment.author.toString() === userId.toString() || userRole === "superadmin";
};

const createComment = async (postId, data, requestingUser) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError(404, "Post not found");

  const comment = await Comment.create({
    ...data,
    author: requestingUser._id,
    post: postId,
  });

  return await comment.populate("author", "username email");
};

const getPostComments = async (postId, page = 1, limit = 10) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError(404, "Post not found");

  const skip = (page - 1) * limit;

  const comments = await Comment.find({ post: postId })
    .populate("author", "username email")
    .populate("likes", "username")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({ post: postId });

  return {
    comments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const updateComment = async (commentId, data, requestingUser) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError(404, "Comment not found");

  if (!isCommentOwner(comment, requestingUser._id, requestingUser.role)) {
    throw new AppError(403, "You can only update your own comments");
  }

  if (data.content) comment.content = data.content;

  await comment.save();
  return await comment.populate("author", "username email");
};

const deleteComment = async (commentId, requestingUser) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError(404, "Comment not found");

  if (!isCommentOwner(comment, requestingUser._id, requestingUser.role)) {
    throw new AppError(403, "You can only delete your own comments");
  }

  await comment.deleteOne();
};

const likeComment = async (commentId, requestingUser) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError(404, "Comment not found");

  const userIdStr = requestingUser._id.toString();
  const index = comment.likes.findIndex(id => id.toString() === userIdStr);

  if (index === -1) {
    comment.likes.push(requestingUser._id);
  } else {
    comment.likes.splice(index, 1);
  }

  await comment.save();
  return await Comment.findById(commentId) 
    .populate("author", "username email")
    .populate("likes", "username");
};

module.exports = { createComment, getPostComments, updateComment, deleteComment, likeComment };