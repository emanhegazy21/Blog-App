const postService = require('../services/post.services');

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts(req.user);
    res.status(200).json({ status: 'success', results: posts.length, data: posts });
  } catch (err) {
    next(err);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const posts = await postService.getUserPosts(req.params.userId);
    res.status(200).json({ status: 'success', results: posts.length, data: posts });
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.status(200).json({ status: 'success', data: post });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    // الصور موجودة هنا بعد middleware image-kit
    const data = {
      title: req.body.title,
      content: req.body.content,
      images: req.body.images || [], // array of URLs
      group: req.body.groupId || null,
    };
    const post = await postService.createPost(data, req.user);
    res.status(201).json({ status: 'success', data: post });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      content: req.body.content,
      images: req.body.images, // يمكن تحديث الصور الجديدة
      group: req.body.groupId,
    };
    const post = await postService.updatePost(req.params.id, data, req.user);
    res.status(200).json({ status: 'success', data: post });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.user);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPosts, getUserPosts, getPostById, createPost, updatePost, deletePost };