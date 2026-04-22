const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getFeedForUser, createPost, getAllPosts, interactWithPost, getPostById, deletePost, db } = require('../db');

// Configure storage for post media
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET user's feed (posts from people they follow + their own posts)
router.get('/feed/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const posts = getFeedForUser(userId);
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// GET all posts (for testing, shows everyone's posts)
router.get('/all', (req, res) => {
  try {
    const posts = getAllPosts();
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST create a new post
router.post('/', upload.single('media'), (req, res) => {
  try {
    const authorId = parseInt(req.body.authorId);
    const content = req.body.content || null;
    
    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;
      if (req.file.mimetype.startsWith('image/')) imageUrl = fileUrl;
      else if (req.file.mimetype.startsWith('video/')) videoUrl = fileUrl;
    }
    
    if (isNaN(authorId) || (!content && !imageUrl && !videoUrl)) {
      return res.status(400).json({ error: 'AuthorId and content/image/video required' });
    }

    const post = createPost(authorId, content, imageUrl, videoUrl);
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
    const viewerId = parseInt(req.query.userId || 0);
    const data = getPostById(postId, viewerId);
    
    if (!data) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(data);
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
    
    const result = interactWithPost(postId, userId, type, content);
    res.json(result);
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
    
    const data = getPostById(postId);
    
    if (!data) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (data.post.authorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    deletePost(postId);
    
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
