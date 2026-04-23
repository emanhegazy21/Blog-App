const Joi = require('joi');

const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(5).required(),
  group: Joi.string().hex().length(24).optional(),
  groupId: Joi.string().hex().length(24).optional(),
  images: Joi.any().optional(),
}).or('group', 'groupId');

const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  content: Joi.string().min(5),
}).min(1);

module.exports = { createPostSchema, updatePostSchema };
