const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getUserPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/post.controller");

const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const { uploadCDN } = require("../middleware/upload.middleware");
const uploadImageKit = require("../middleware/image-kit.middleware");
const { createPostSchema, updatePostSchema } = require("../validations/post.validation");
const { createPostLimiter } = require("../middleware/rate-limit.middleware");


const commentRouter = require("./comment.route");

router.use(auth);

router.get("/", getAllPosts);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPostById);

router.post("/:id/like", likePost);

// Create post with images (with rate limiting)
router.post(
  "/",
  createPostLimiter,
  uploadCDN.array("images", 10),
  uploadImageKit(true, "blog-posts"),
  validate(createPostSchema),
  createPost
);

// Update post with images
router.patch(
  "/:id",
  uploadCDN.array("images", 10),
  uploadImageKit(true, "blog-posts"),
  validate(updatePostSchema),
  updatePost
);

router.delete("/:id", deletePost);


router.use("/:postId/comments", commentRouter);

module.exports = router;