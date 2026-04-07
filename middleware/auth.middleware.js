const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const util = require('util');
const User = require('../models/user.model');

const jwtVerify = util.promisify(jwt.verify);

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError(401, 'No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const payload = await jwtVerify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.sub);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
