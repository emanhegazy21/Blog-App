const Post = require('../models/post.model');
const Group = require('../models/group.model');
const AppError = require('../utils/AppError');

const getAllPosts = async (requestingUser) => {
  // Get groups the user is a member of
  const userGroups = await Group.find({
    $or: [{ members: requestingUser._id }, { admins: requestingUser._id }],
  }).select('_id');

  const groupIds = userGroups.map((g) => g._id);

  // Return global posts + group posts the user has access to
  const posts = await Post.find({
    $or: [{ group: null }, { group: { $in: groupIds } }],
  })
    .populate('author', 'username email')
    .populate('group', 'name')
    .sort('-createdAt');

  return posts;
};

const getUserPosts = async (userId) => {
  return await Post.find({ author: userId })
    .populate('author', 'username email')
    .populate('group', 'name')
    .sort('-createdAt');
};

const getPostById = async (id) => {
  const post = await Post.findById(id)
    .populate('author', 'username email')
    .populate('group', 'name');
  if (!post) throw new AppError(404, 'Post not found');
  return post;
};

const createPost = async (data, requestingUser) => {
  // If posting to a group, check permission
  if (data.group) {
    const group = await Group.findById(data.group);
    if (!group) throw new AppError(404, 'Group not found');

    const isMember =
      group.members.some((m) => m.toString() === requestingUser._id.toString()) ||
      group.admins.some((a) => a.toString() === requestingUser._id.toString());

    if (!isMember && requestingUser.role !== 'superadmin') {
      throw new AppError(403, 'You are not a member of this group');
    }

    const canPost =
      group.admins.some((a) => a.toString() === requestingUser._id.toString()) ||
      group.permissions.canPost.some((u) => u.toString() === requestingUser._id.toString()) ||
      requestingUser.role === 'superadmin';

    if (!canPost) {
      throw new AppError(403, 'You do not have permission to post in this group');
    }
  }

  const post = await Post.create({ ...data, author: requestingUser._id });
  return await post.populate('author', 'username email');
};

const updatePost = async (id, data, requestingUser) => {
  const post = await Post.findById(id);
  if (!post) throw new AppError(404, 'Post not found');

  if (post.author.toString() !== requestingUser._id.toString() && requestingUser.role !== 'superadmin') {
    throw new AppError(403, 'You can only update your own posts');
  }

  // images from imagekit middleware
  if (data.images) post.images = data.images;
  if (data.title) post.title = data.title;
  if (data.content) post.content = data.content;

  await post.save();
  return await post.populate('author', 'username email');
};

const deletePost = async (id, requestingUser) => {
  const post = await Post.findById(id);
  if (!post) throw new AppError(404, 'Post not found');

  if (post.author.toString() !== requestingUser._id.toString() && requestingUser.role !== 'superadmin') {
    throw new AppError(403, 'You can only delete your own posts');
  }

  await post.deleteOne();
  return post;
};

module.exports = { getAllPosts, getUserPosts, getPostById, createPost, updatePost, deletePost };
