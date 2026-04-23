const Joi = require('joi');

const createCommentSchema = Joi.object({
  content: Joi.string().trim().required().min(1).max(2000),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().trim().required().min(1).max(2000),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
};
