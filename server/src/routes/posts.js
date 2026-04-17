const express = require('express');
const router = express.Router();
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