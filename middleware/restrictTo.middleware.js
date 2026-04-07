const AppError = require("../utils/AppError.js");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      throw new AppError(403, "forbidden");
    }
    next();
  };
};

module.exports =restrictTo