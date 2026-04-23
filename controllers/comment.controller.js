const commentService = require("../services/comment.services");

const createComment = async (req, res, next) => {
  try {
    const data = {
      content: req.body.content,
    };
    const comment = await commentService.createComment(
      req.params.postId,
      data,
      req.user,
    );
    res.status(201).json({ status: "success", data: comment });
  } catch (err) {
    next(err);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { comments, pagination } = await commentService.getPostComments(
      req.params.postId,
      page,
      limit,
    );
    res.status(200).json({ status: "success", data: comments, pagination });
  } catch (err) {
    next(err);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const data = {
      content: req.body.content,
    };
    const comment = await commentService.updateComment(
      req.params.commentId,
      data,
      req.user,
    );
    res.status(200).json({ status: "success", data: comment });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.commentId, req.user);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

const likeComment = async (req, res, next) => {
  try {
    const comment = await commentService.likeComment(
      req.params.commentId,
      req.user,
    );
    res.status(200).json({ status: "success", data: comment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  likeComment,
};
