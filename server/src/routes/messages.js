const express = require('express');
const router = express.Router();

// A simple test route
router.get('/test', (req, res) => {
  res.send('The route is working!');
});

// CRITICAL: You must export the router so index.js can see it
module.exports = router;
