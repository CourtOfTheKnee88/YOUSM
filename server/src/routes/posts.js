const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const db = require('../db');

// GET user's feed (posts from people they follow + their own posts)
router.get('/feed/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get the IDs of users that userId follows
    const following = db.prepare(`
      SELECT followingId FROM followers WHERE followerId = ?
    `).all(userId);
    
    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // Include own posts
    
    if (followingIds.length === 0) {
      return res.json({ posts: [] });
    }
    
    // Get posts from followed users, ordered by recency
    const placeholders = followingIds.map(() => '?').join(',');
    const posts = db.prepare(`
      SELECT 
        p.id,
        p.authorId,
        p.content,
        p.imageUrl,
        p.videoUrl,
        p.createdAt,
        u.username,
        u.displayName,
        u.profileImage,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND userId = ? AND type = 'like') as isLiked
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.authorId IN (${placeholders})
      ORDER BY p.createdAt DESC
      LIMIT 50
    `).all(userId, ...followingIds);
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// GET all posts (for testing, shows everyone's posts)
router.get('/all', (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT 
        p.id,
        p.authorId,
        p.content,
        p.imageUrl,
        p.videoUrl,
        p.createdAt,
        u.username,
        u.displayName,
        u.profileImage,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
        0 as isLiked
      FROM posts p
      JOIN users u ON p.authorId = u.id
      ORDER BY p.createdAt DESC
      LIMIT 50
    `).all();
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST create a new post
router.post('/', (req, res) => {
  try {
    const { authorId, content, imageUrl, videoUrl } = req.body;
    
    if (!authorId || (!content && !imageUrl && !videoUrl)) {
      return res.status(400).json({ error: 'AuthorId and content/image/video required' });
    }
    
    const result = db.prepare(`
      INSERT INTO posts (authorId, content, imageUrl, videoUrl)
      VALUES (?, ?, ?, ?)
    `).run(authorId, content || null, imageUrl || null, videoUrl || null);
    
    const post = db.prepare(`
      SELECT 
        p.id,
        p.authorId,
        p.content,
        p.imageUrl,
        p.videoUrl,
        p.createdAt,
        u.username,
        u.displayName,
        u.profileImage,
        0 as likeCount,
        0 as commentCount,
        0 as shareCount
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET single post with interactions
router.get('/:postId', (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    const post = db.prepare(`
      SELECT 
        p.id,
        p.authorId,
        p.content,
        p.imageUrl,
        p.videoUrl,
        p.createdAt,
        u.username,
        u.displayName,
        u.profileImage,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND userId = ? AND type = 'like') as isLiked
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.id = ?
    `).get(req.query.userId || 0, postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const interactions = db.prepare(`
      SELECT i.*, u.username, u.displayName, u.profileImage
      FROM interactions i
      JOIN users u ON i.userId = u.id
      WHERE i.postId = ? 
      ORDER BY i.createdAt DESC
    `).all(postId);
    
    res.json({ post, interactions });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST like/comment/share a post
router.post('/:postId/interact', (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { userId, type, content } = req.body;
    
    if (!userId || !type) {
      return res.status(400).json({ error: 'UserId and type required' });
    }
    
    // Check if like already exists (for likes, prevent duplicates)
    if (type === 'like') {
      const existing = db.prepare(`
        SELECT id FROM interactions WHERE postId = ? AND userId = ? AND type = 'like'
      `).get(postId, userId);
      
      if (existing) {
        // Unlike
        db.prepare(`
          DELETE FROM interactions WHERE id = ?
        `).run(existing.id);
        return res.json({ liked: false });
      }
    }
    
    const result = db.prepare(`
      INSERT INTO interactions (postId, userId, type, content)
      VALUES (?, ?, ?, ?)
    `).run(postId, userId, type, content || null);
    
    res.json({ 
      interaction: {
        id: result.lastInsertRowid,
        postId,
        userId,
        type,
        content
      },
      liked: true
    });
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

// DELETE a post
router.delete('/:postId', (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { userId } = req.body;
    
    const post = db.prepare('SELECT authorId FROM posts WHERE id = ?').get(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    db.prepare('DELETE FROM interactions WHERE postId = ?').run(postId);
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
    
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
=======
const { createPost, getRecentPosts } = require('../db');

// GET /posts - Fetch the news feed
router.get('/', (req, res) => {
    try {
        const posts = getRecentPosts();
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// POST /posts - Create a new post
router.post('/', (req, res) => {
    try {
        const { authorId, content } = req.body;
        
        if (!authorId || !content) {
            return res.status(400).json({ error: "Missing authorId or content" });
        }

        const newPost = createPost(authorId, content);
        res.status(201).json({ post: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Failed to create post" });
    }
});

module.exports = router;
>>>>>>> Gage---Messaging
