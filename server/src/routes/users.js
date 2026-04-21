const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all users
router.get('/', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        id,
        username,
        displayName,
        bio,
        profileImage,
        (SELECT COUNT(*) FROM followers WHERE followingId = users.id) as followerCount,
        (SELECT COUNT(*) FROM followers WHERE followerId = users.id) as followingCount
      FROM users
      ORDER BY displayName
    `).all();
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET single user by ID
router.get('/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const user = db.prepare(`
      SELECT 
        id,
        username,
        displayName,
        bio,
        profileImage,
        createdAt,
        (SELECT COUNT(*) FROM followers WHERE followingId = ?) as followerCount,
        (SELECT COUNT(*) FROM followers WHERE followerId = ?) as followingCount
      FROM users
      WHERE id = ?
    `).get(userId, userId, userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's posts
    const posts = db.prepare(`
      SELECT id, content, imageUrl, videoUrl, createdAt
      FROM posts
      WHERE authorId = ?
      ORDER BY createdAt DESC
    `).all(userId);
    
    res.json({ user, posts });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET user by username
router.get('/name/:username', (req, res) => {
  try {
    const username = req.params.username;
    
    const user = db.prepare(`
      SELECT 
        id,
        username,
        displayName,
        bio,
        profileImage,
        createdAt,
        (SELECT COUNT(*) FROM followers WHERE followingId = users.id) as followerCount,
        (SELECT COUNT(*) FROM followers WHERE followerId = users.id) as followingCount
      FROM users
      WHERE username = ?
    `).get(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST follow a user
router.post('/:userId/follow', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { followerId } = req.body;
    
    if (!followerId) {
      return res.status(400).json({ error: 'FollowerId required' });
    }
    
    if (userId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    // Check if already following
    const existing = db.prepare(`
      SELECT id FROM followers WHERE followerId = ? AND followingId = ?
    `).get(followerId, userId);
    
    if (existing) {
      // Unfollow
      db.prepare(`
        DELETE FROM followers WHERE id = ?
      `).run(existing.id);
      return res.json({ following: false });
    }
    
    // Follow
    db.prepare(`
      INSERT INTO followers (followerId, followingId)
      VALUES (?, ?)
    `).run(followerId, userId);
    
    res.json({ following: true });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// GET followers of a user
router.get('/:userId/followers', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const followers = db.prepare(`
      SELECT 
        u.id,
        u.username,
        u.displayName,
        u.profileImage
      FROM followers f
      JOIN users u ON f.followerId = u.id
      WHERE f.followingId = ?
      ORDER BY f.createdAt DESC
    `).all(userId);
    
    res.json({ followers });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// GET following list
router.get('/:userId/following', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const following = db.prepare(`
      SELECT 
        u.id,
        u.username,
        u.displayName,
        u.profileImage
      FROM followers f
      JOIN users u ON f.followingId = u.id
      WHERE f.followerId = ?
      ORDER BY f.createdAt DESC
    `).all(userId);
    
    res.json({ following });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

module.exports = router;
