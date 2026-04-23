const User = require("../models/user.model");
const AppError = require("../utils/AppError");

const canModifyUser = (requestingUser, targetUserId) => {
  return (
    requestingUser._id.toString() === targetUserId ||
    requestingUser.role === "superadmin"
  );
};

const getAllUsers = async () => {
  return await User.find().select("-password");
};

const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new AppError(404, "User not found");
  return user;
};

const updateUser = async (id, data, requestingUser) => {
  if (!canModifyUser(requestingUser, id)) {
    throw new AppError(403, "You can only update your own account");
  }

  if (data.role && requestingUser.role !== "superadmin") {
    throw new AppError(403, "Only superadmin can change roles");
  }

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw new AppError(404, "User not found");
  return user;
};

const deleteUser = async (id, requestingUser) => {
  if (!canModifyUser(requestingUser, id)) {
    throw new AppError(403, "You can only delete your own account");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError(404, "User not found");
  return user;
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
