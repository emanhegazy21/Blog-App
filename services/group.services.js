const Group = require("../models/group.model");
const User = require("../models/user.model");
const AppError = require("../utils/AppError");

const createGroup = async (data, requestingUser) => {
  const admins = data.admins
    ? [...new Set([...data.admins, requestingUser._id.toString()])]
    : [requestingUser._id];
  const group = await Group.create({ ...data, admins });
  return group;
};

const getAllGroups = async () => {
  return await Group.find()
    .populate("admins", "username email")
    .populate("members", "username email");
};

const getGroupById = async (id) => {
  const group = await Group.findById(id)
    .populate("admins", "username email")
    .populate("members", "username email")
    .populate("permissions.canPost", "username email");
  if (!group) throw new AppError(404, "Group not found");
  return group;
};

const isGroupAdmin = (group, userId) => {
  return group.admins.some((a) =>
    a._id ? a._id.toString() === userId : a.toString() === userId,
  );
};

const addMember = async (groupId, userId, requestingUser) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError(404, "Group not found");

  if (
    !isGroupAdmin(group, requestingUser._id.toString()) &&
    requestingUser.role !== "superadmin"
  ) {
    throw new AppError(403, "Only group admins can add members");
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  if (group.members.some((m) => m.toString() === userId)) {
    throw new AppError(400, "User is already a member");
  }

  group.members.push(userId);
  await group.save();
  return group;
};

const removeMember = async (groupId, userId, requestingUser) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError(404, "Group not found");

  if (
    !isGroupAdmin(group, requestingUser._id.toString()) &&
    requestingUser.role !== "superadmin"
  ) {
    throw new AppError(403, "Only group admins can remove members");
  }

  group.members = group.members.filter((m) => m.toString() !== userId);
  group.permissions.canPost = group.permissions.canPost.filter(
    (u) => u.toString() !== userId,
  );
  await group.save();
  return group;
};

const updatePermission = async (groupId, userId, canPost, requestingUser) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError(404, "Group not found");

  if (
    !isGroupAdmin(group, requestingUser._id.toString()) &&
    requestingUser.role !== "superadmin"
  ) {
    throw new AppError(403, "Only group admins can manage permissions");
  }

  const isMember = group.members.some((m) => m.toString() === userId);
  if (!isMember) throw new AppError(400, "User is not a member of this group");

  if (canPost) {
    if (!group.permissions.canPost.some((u) => u.toString() === userId)) {
      group.permissions.canPost.push(userId);
    }
  } else {
    group.permissions.canPost = group.permissions.canPost.filter(
      (u) => u.toString() !== userId,
    );
  }

  await group.save();
  return group;
};

const addAdmin = async (groupId, userId, requestingUser) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError(404, "Group not found");

  if (
    !isGroupAdmin(group, requestingUser._id.toString()) &&
    requestingUser.role !== "superadmin"
  ) {
    throw new AppError(403, "Only group admins can add other admins");
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  if (group.admins.some((a) => a.toString() === userId)) {
    throw new AppError(400, "User is already an admin");
  }

  group.admins.push(userId);

  if (!group.members.some((m) => m.toString() === userId)) {
    group.members.push(userId);
  }
  await group.save();
  return group;
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  addMember,
  removeMember,
  updatePermission,
  addAdmin,
};
