const Joi = require('joi');

const createGroupSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  admins: Joi.array().items(Joi.string().hex().length(24)).optional(),
  members: Joi.array().items(Joi.string().hex().length(24)).optional(),
});

const addRemoveMemberSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

const updatePermissionSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  canPost: Joi.boolean().required(),
});

module.exports = { createGroupSchema, addRemoveMemberSchema, updatePermissionSchema };
