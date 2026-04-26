const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  getFeedForUser,
  createPost,
  getAllPosts,
  interactWithPost,
  getPostById,
  deletePost,
  deleteCommunityPost,
} = require("../db");

// Configure storage for post media
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "..", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "post-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

function getStatusCode(error) {
  return error.statusCode || 500;
}

// GET user's global feed
// Community posts stay out of the global feed because db.js filters communityId IS NULL.
router.get("/feed/:userId", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const posts = getFeedForUser(userId);

    res.json({ posts });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(getStatusCode(error)).json({
      error: error.message || "Failed to fetch feed",
    });
  }
});

// GET all global posts
// Community posts stay out of this route because db.js filters communityId IS NULL.
router.get("/all", (req, res) => {
  try {
    const posts = getAllPosts();

    res.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(getStatusCode(error)).json({
      error: error.message || "Failed to fetch posts",
    });
  }
});

// POST create a new post
// Supports:
// - global posts: authorId + content/media
// - community posts: authorId + content/media + communityId
// - announcements: authorId + content/media + communityId + postType="announcement"
router.post("/", upload.single("media"), (req, res) => {
  try {
    const authorId = parseInt(req.body.authorId);
    const content = req.body.content || null;
    const communityId = req.body.communityId
      ? parseInt(req.body.communityId)
      : null;
    const postType = req.body.postType || "post";

    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;

      if (req.file.mimetype.startsWith("image/")) {
        imageUrl = fileUrl;
      } else if (req.file.mimetype.startsWith("video/")) {
        videoUrl = fileUrl;
      }
    }

    if (isNaN(authorId) || (!content && !imageUrl && !videoUrl)) {
      return res.status(400).json({
        error: "AuthorId and content/image/video required.",
      });
    }

    const post = createPost(
      authorId,
      content,
      imageUrl,
      videoUrl,
      communityId,
      postType
    );

    res.status(201).json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(getStatusCode(error)).json({
      error: error.message || "Failed to create post",
      ban: error.ban || null,
    });
  }
});

// GET single post with interactions
router.get("/:postId", (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const viewerId = parseInt(req.query.userId || 0);
    const data = getPostById(postId, viewerId);

    if (!data) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(getStatusCode(error)).json({
      error: error.message || "Failed to fetch post",
    });
  }
});

// POST like/comment/share a post
router.post("/:postId/interact", (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { userId, type, content } = req.body;

    if (!userId || !type) {
      return res.status(400).json({
        error: "userId and type are required.",
      });
    }

    const result = interactWithPost(
      postId,
      parseInt(userId),
      type,
      content || null
    );

    res.json(result);
  } catch (error) {
    console.error("Error interacting with post:", error);
    res.status(getStatusCode(error)).json({
      error: error.message || "Failed to interact with post",
    });
  }
});

// DELETE post
// Existing global behavior still works.
// If adminUserId is provided, the backend checks that user is an admin
// of the post's community before deleting it.
router.delete("/:postId", (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    const adminUserId = req.body?.adminUserId
      ? parseInt(req.body.adminUserId)
      : req.query.adminUserId
        ? parseInt(req.query.adminUserId)
        : null;

    if (adminUserId) {
      deleteCommunityPost(postId, adminUserId);
    } else {
      deletePost(postId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(getStatusCode(error)).json({
      error: error.message || "Failed to delete post",
    });
  }
});

module.exports = router;