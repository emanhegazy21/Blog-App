const express = require('express');
const router = express.Router({ mergeParams: true }); // Allows access to parent params (:postId)

const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  likeComment,
} = require('../controllers/comment.controller');

const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createCommentSchema, updateCommentSchema } = require('../validations/comment.validation');
const { createCommentLimiter } = require('../middleware/rate-limit.middleware');

router.use(auth);

// Get all comments for a post (with pagination)
router.get('/', getPostComments);

// Create comment (with rate limiting)
router.post('/', createCommentLimiter, validate(createCommentSchema), createComment);

// Update comment
router.patch('/:commentId', validate(updateCommentSchema), updateComment);

// Delete comment
router.delete('/:commentId', deleteComment);

// Like/Unlike comment
router.post('/:commentId/like', likeComment);

module.exports = router;
