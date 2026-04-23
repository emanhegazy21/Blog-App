const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});


const createPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20,
  message: "Too many posts created, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.user && req.user.role === "superadmin";
  },
});

const createCommentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many comments, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.user && req.user.role === "superadmin";
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  createPostLimiter,
  createCommentLimiter,
};
