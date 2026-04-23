const Post = require("../models/post.model");
const Group = require("../models/group.model");
const AppError = require("../utils/AppError");

const getUserGroupIds = async (userId) => {
  const userGroups = await Group.find({
    $or: [{ members: userId }, { admins: userId }],
  }).select("_id");
  return userGroups.map((g) => g._id);
};

const buildSearchFilter = (search) => {
  if (!search || !search.trim()) return {};
  const searchRegex = { $regex: search, $options: "i" };
  return { $or: [{ title: searchRegex }, { content: searchRegex }] };
};

const buildAccessFilter = (groupIds) => {
  return { $or: [{ group: null }, { group: { $in: groupIds } }] };
};

const buildQueryFilter = async (user, search) => {
  const groupIds = await getUserGroupIds(user._id);
  const accessFilter = buildAccessFilter(groupIds);
  const searchFilter = buildSearchFilter(search);
  const filters = [accessFilter];
  if (Object.keys(searchFilter).length) filters.push(searchFilter);
  return filters.length > 1 ? { $and: filters } : filters[0];
};

const calculateSkip = (page, limit) => (page - 1) * limit;

const isPostOwner = (post, userId, userRole) => {
  return (
    post.author.toString() === userId.toString() || userRole === "superadmin"
  );
};

const toggleLike = (likesArray, userId) => {
  const userIdStr = userId.toString();
  const hasLiked = likesArray.some((id) => id.toString() === userIdStr);

  if (hasLiked) {
    return likesArray.filter((id) => id.toString() !== userIdStr);
  }
  return [...likesArray, userId];
};

const getAllPosts = async (
  requestingUser,
  page = 1,
  limit = 10,
  search = "",
) => {
  const filter = await buildQueryFilter(requestingUser, search);
  const skip = calculateSkip(page, limit);

  const posts = await Post.find(filter)
    .populate("author", "username email")
    .populate("group", "name")
    .populate("likes", "username")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(filter);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getUserPosts = async (userId) => {
  return await Post.find({ author: userId })
    .populate("author", "username email")
    .populate("group", "name")
    .sort("-createdAt");
};

const getPostById = async (id) => {
  const post = await Post.findById(id)
    .populate("author", "username email")
    .populate("group", "name");
  if (!post) throw new AppError(404, "Post not found");
  return post;
};

const createPost = async (data, requestingUser) => {
  await validateGroupPostPermission(
    data.group,
    requestingUser._id,
    requestingUser.role,
  );

  const post = await Post.create({ ...data, author: requestingUser._id });
  return await post.populate("author", "username email");
};

const validateGroupPostPermission = async (groupId, userId, userRole) => {
  if (!groupId) return;

  const group = await Group.findById(groupId);
  if (!group) throw new AppError(404, "Group not found");

  const userIdStr = userId.toString();
  const isMember =
    group.members.some((m) => m.toString() === userIdStr) ||
    group.admins.some((a) => a.toString() === userIdStr);

  if (!isMember && userRole !== "superadmin") {
    throw new AppError(403, "You are not a member of this group");
  }

  const canPost =
    group.admins.some((a) => a.toString() === userIdStr) ||
    group.permissions.canPost.some((u) => u.toString() === userIdStr) ||
    userRole === "superadmin";

  if (!canPost) {
    throw new AppError(403, "You do not have permission to post in this group");
  }
};

const updatePost = async (id, data, requestingUser) => {
  const post = await Post.findById(id);
  if (!post) throw new AppError(404, "Post not found");

  if (!isPostOwner(post, requestingUser._id, requestingUser.role)) {
    throw new AppError(403, "You can only update your own posts");
  }

  if (data.images) post.images = data.images;
  if (data.title) post.title = data.title;
  if (data.content) post.content = data.content;

  await post.save();
  return await post.populate("author", "username email");
};

const deletePost = async (id, requestingUser) => {
  const post = await Post.findById(id);
  if (!post) throw new AppError(404, "Post not found");

  if (!isPostOwner(post, requestingUser._id, requestingUser.role)) {
    throw new AppError(403, "You can only delete your own posts");
  }

  await post.deleteOne();
  return post;
};
const likePost = async (id, requestingUser) => {
  const post = await Post.findById(id);
  if (!post) throw new AppError(404, "Post not found");

  const userId = requestingUser._id.toString();

  if (!post.likes) post.likes = [];

  const index = post.likes.findIndex((like) => like.toString() === userId);

  if (index === -1) {
    post.likes.push(requestingUser._id);
  } else {
    post.likes.splice(index, 1);
  }

  await post.save();

  return await Post.findById(post._id)
    .populate("author", "username email")
    .populate("likes", "username");
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
