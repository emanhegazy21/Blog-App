const express = require('express');
const router = express.Router();
const {
  createGroup, getAllGroups, getGroupById,
  addMember, removeMember, updatePermission, addAdmin
} = require('../controllers/group.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createGroupSchema, addRemoveMemberSchema, updatePermissionSchema } = require('../validations/group.validation');

router.use(auth);

router.get('/', getAllGroups);
router.get('/:id', getGroupById);
router.post('/', validate(createGroupSchema), createGroup);
router.post('/:id/members', validate(addRemoveMemberSchema), addMember);
router.delete('/:id/members', validate(addRemoveMemberSchema), removeMember);
router.patch('/:id/permissions', validate(updatePermissionSchema), updatePermission);
router.post('/:id/admins', validate(addRemoveMemberSchema), addAdmin);

module.exports = router;
