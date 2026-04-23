const postService = require("../services/post.services");

const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const { posts, pagination } = await postService.getAllPosts(
      req.user,
      page,
      limit,
      search,
    );
    res.status(200).json({ status: "success", data: posts, pagination });
  } catch (err) {
    next(err);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const posts = await postService.getUserPosts(req.params.userId);
    res
      .status(200)
      .json({ status: "success", results: posts.length, data: posts });
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.status(200).json({ status: "success", data: post });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      content: req.body.content,
      group: req.body.group || req.body.groupId,
      images: Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images].filter(Boolean),
    };
    if (!data.images || data.images.length === 0) {
      return res
        .status(400)
        .json({ message: "Please upload at least one image" });
    }

    const post = await postService.createPost(data, req.user);
    res.status(201).json({ status: "success", data: post });
  } catch (err) {
    next(err);
  }
};
const updatePost = async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      content: req.body.content,
      group: req.body.group || req.body.groupId,
    };

    if (req.body.images) {
      data.images = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
    }
    const post = await postService.updatePost(req.params.id, data, req.user);
    res.status(200).json({ status: "success", data: post });
  } catch (err) {
    next(err);
  }
};
const deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.user);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

const likePost = async (req, res, next) => {
  try {
    const post = await postService.likePost(req.params.id, req.user);
    res.status(200).json({ status: "success", data: post });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPosts,
  getUserPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
};
