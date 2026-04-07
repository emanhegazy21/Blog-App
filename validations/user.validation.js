const Joi = require('joi');

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid('user', 'admin', 'superadmin'),
}).min(1);

module.exports = { updateUserSchema };
