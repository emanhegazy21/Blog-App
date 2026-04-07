const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');

const register = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError(400, 'Email already in use');

  const user = await User.create({
    username,
    email,
    password,
    role: 'user',
  });

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.correctPassword(password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);
  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = { register, login };
