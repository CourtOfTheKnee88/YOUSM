const express = require('express');
const router = express.Router();

// A temporary test route to see all threads
router.get('/', (req, res) => {
    res.json({
        message: "Threads route is working!",
        data: []
    });
});

// A temporary route to create a thread
router.post('/', (req, res) => {
    const { title } = req.body;
    res.status(201).json({
        message: "Thread created (mocked)",
        thread: { id: 1, title: title || "New Thread" }
    });
});

// VERY IMPORTANT: This exports the router so your server doesn't crash
module.exports = router;
