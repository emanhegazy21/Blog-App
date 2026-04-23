const Group = require("../models/group.model");
const User = require("../models/user.model");
const AppError = require("../utils/AppError");

const isGroupAdmin = (group, userId) => {
  return group.admins.some((a) =>
    a._id ? a._id.toString() === userId : a.toString() === userId,
  );
};

const checkGroupAdminAccess = (group, userId, userRole) => {
  if (!isGroupAdmin(group, userId.toString()) && userRole !== "superadmin") {
    throw new AppError(403, "Only group admins can perform this action");
  }
};

const isGroupMember = (group, userId) => {
  return group.members.some((m) => m.toString() === userId);
};

const hasPermission = (permissionsArray, userId) => {
  return permissionsArray.some((u) => u.toString() === userId.toString());
};

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

const addMember = async (groupId, userId, requestingUser) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError(404, "Group not found");

  checkGroupAdminAccess(group, requestingUser._id, requestingUser.role);

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  if (isGroupMember(group, userId)) {
    throw new AppError(400, "User is already a member");
  }

  group.members.push(userId);
  await group.save();
  return group;
};

const removeMember = async (groupId, userId, requestingUser) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError(404, "Group not found");

  checkGroupAdminAccess(group, requestingUser._id, requestingUser.role);

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

  checkGroupAdminAccess(group, requestingUser._id, requestingUser.role);

  if (!isGroupMember(group, userId)) {
    throw new AppError(400, "User is not a member of this group");
  }

  if (canPost) {
    if (!hasPermission(group.permissions.canPost, userId)) {
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

  checkGroupAdminAccess(group, requestingUser._id, requestingUser.role);

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  if (isGroupAdmin(group, userId)) {
    throw new AppError(400, "User is already an admin");
  }

  group.admins.push(userId);

  if (!isGroupMember(group, userId)) {
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
