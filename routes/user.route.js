const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/restrictTo.middleware');
const validate = require('../middleware/validation.middleware');
const { updateUserSchema } = require('../validations/user.validation');

// All user routes require authentication
router.use(auth);

router.get('/', restrictTo('admin', 'superadmin'), getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
