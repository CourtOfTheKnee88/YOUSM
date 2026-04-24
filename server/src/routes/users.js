const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getUserByUsername,
  toggleFollow,
  getFollowers,
  getFollowing,
  getPostsByUserId,
  updateUser,
  createUser,
} = require("../db");

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

    // Check if username already exists
    const existingUsername = getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = createUser(
      username,
      email,
      password,
      role || "Student",
      securityQuestion,
      securityAnswer,
    );
    res.status(201).json({ user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET single user by ID
router.get("/:userId", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = getUserById(userId);

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
    res.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
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

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST follow a user
router.post("/:userId/follow", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({ error: "FollowerId required" });
    }

    if (userId === followerId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const result = toggleFollow(followerId, userId);
    res.json(result);
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
});

// GET followers of a user
router.get("/:userId/followers", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const followers = getFollowers(userId);

    res.json({ followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

// GET following list
router.get("/:userId/following", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const following = getFollowing(userId);

    res.json({ following });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
});

module.exports = router;
