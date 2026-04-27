const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const router = express.Router();

const {
  getAllUsers,
  getUserById,
  getSafeUserById,
  getUserByUsername,
  toggleFollow,
  requestOrFollowUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getPostsByUserId,
  updateUser,
  updateUserProfileImage,
  createUser,
  updateUserPassword,
  getIncomingFollowRequests,
  respondToFollowRequest,
  getUserProfileForViewer,
  searchUsersAndCommunities,
} = require("../db");

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
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

function getStatusCode(error) {
  return error.statusCode || 500;
}

function removeSensitiveUserFields(user) {
  if (!user) return null;

  const { password, securityQA, securityQuestion, email, ...safeUser } = user;

  return safeUser;
}

// GET all users
router.get("/", (req, res) => {
  try {
    const users = getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET search people and communities
router.get("/search/all", (req, res) => {
  try {
    const query = req.query.q || "";
    const results = searchUsersAndCommunities(query);

    res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// POST login
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const user = getUserByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({ user: removeSensitiveUserFields(user) });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET security question for password reset
router.get("/forgot-password/:username", (req, res) => {
  try {
    const user = getUserByUsername(req.params.username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      userId: user.id,
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST verify security answer
router.post("/verify-security", (req, res) => {
  try {
    const { userId, answer } = req.body;
    const user = getUserById(userId);

    if (
      user &&
      user.securityQA &&
      answer &&
      bcrypt.compareSync(answer.toLowerCase(), user.securityQA)
    ) {
      return res.json({ success: true });
    }

    res.status(401).json({ error: "Incorrect answer" });
  } catch (error) {
    console.error("Security verification failed:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// POST reset password
router.post("/reset-password", (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res
        .status(400)
        .json({ error: "userId and newPassword are required." });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    updateUserPassword(userId, hashedPassword);
    res.json({ success: true });
  } catch (error) {
    console.error("Password reset failed:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// POST create a new user
router.post("/", (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      securityQuestion,
      securityAnswer,
    } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    const existingUsername = getUserByUsername(username);

    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const hashedAnswer = securityAnswer
      ? bcrypt.hashSync(securityAnswer.toLowerCase(), 10)
      : null;

    const user = createUser(
      username,
      email,
      hashedPassword,
      role || "Student",
      securityQuestion,
      hashedAnswer,
    );

    res.status(201).json({ user: removeSensitiveUserFields(user) });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET follow requests received by current user
router.get("/:userId/follow-requests", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requests = getIncomingFollowRequests(userId);

    res.json({ requests });
  } catch (error) {
    console.error("Error fetching follow requests:", error);
    res
      .status(getStatusCode(error))
      .json({ error: error.message || "Failed to fetch follow requests" });
  }
});

// POST respond to a follow request
router.post("/:userId/follow-requests/:requestId/respond", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requestId = parseInt(req.params.requestId);
    const { action } = req.body;

    const result = respondToFollowRequest(requestId, userId, action);

    res.json(result);
  } catch (error) {
    console.error("Error responding to follow request:", error);
    res
      .status(getStatusCode(error))
      .json({ error: error.message || "Failed to respond to follow request" });
  }
});

// POST upload profile image
router.post(
  "/:userId/profile-image",
  upload.single("profileImage"),
  (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      if (!req.file) {
        return res.status(400).json({ error: "Profile image is required." });
      }

      const profileImage = `/uploads/${req.file.filename}`;
      const user = updateUserProfileImage(userId, profileImage);

      res.json({ user: removeSensitiveUserFields(user), profileImage });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res
        .status(getStatusCode(error))
        .json({ error: error.message || "Failed to upload profile image" });
    }
  },
);

// GET profile as viewed by another user
router.get("/:userId/profile", (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const viewerId = req.query.viewerId ? parseInt(req.query.viewerId) : null;

    const profile = getUserProfileForViewer(targetUserId, viewerId);

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching viewed profile:", error);
    res
      .status(getStatusCode(error))
      .json({ error: error.message || "Failed to fetch profile" });
  }
});

// POST follow/request follow
router.post("/:userId/follow", (req, res) => {
  try {
    const requestedId = parseInt(req.params.userId);
    const requesterId = parseInt(req.body.requesterId);

    const result = requestOrFollowUser(requesterId, requestedId);

    res.json(result);
  } catch (error) {
    console.error("Error following user:", error);
    res
      .status(getStatusCode(error))
      .json({ error: error.message || "Failed to follow user" });
  }
});

// DELETE unfollow/cancel pending request
router.delete("/:userId/follow/:followerId", (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = parseInt(req.params.followerId);

    const result = unfollowUser(followerId, followingId);

    res.json(result);
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res
      .status(getStatusCode(error))
      .json({ error: error.message || "Failed to unfollow user" });
  }
});

// POST legacy toggle follow route
router.post("/:userId/toggle-follow", (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = parseInt(req.body.followerId);

    const result = toggleFollow(followerId, followingId);

    res.json(result);
  } catch (error) {
    console.error("Error toggling follow:", error);
    res
      .status(getStatusCode(error))
      .json({ error: error.message || "Failed to update follow status" });
  }
});

// GET followers
router.get("/:userId/followers", (req, res) => {
  try {
    const followers = getFollowers(parseInt(req.params.userId));
    res.json({ followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

// GET following
router.get("/:userId/following", (req, res) => {
  try {
    const following = getFollowing(parseInt(req.params.userId));
    res.json({ following });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
});

// GET user by username
router.get("/name/:username", (req, res) => {
  try {
    const username = req.params.username;
    const user = getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: removeSensitiveUserFields(user) });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET single user by ID
router.get("/:userId", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = getSafeUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = getPostsByUserId(userId);

    res.json({ user, posts });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH update user profile
router.patch("/:userId", (req, res) => {
  try {
    const user = updateUser(parseInt(req.params.userId), req.body);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: removeSensitiveUserFields(user) });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;
