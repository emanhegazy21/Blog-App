const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getUserPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");

const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const { uploadCDN } = require("../middleware/upload.middleware");
const uploadImageKit = require("../middleware/image-kit.middleware");
const { createPostSchema, updatePostSchema } = require("../validations/post.validation");

router.use(auth);

router.get("/", getAllPosts);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPostById);

// Create post with images
router.post(
  "/",
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

module.exports = router;