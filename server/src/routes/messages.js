const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({ ok: true, route: 'messages' });
});

// A simple test route
router.get('/test', (req, res) => {
  res.send('The route is working!');
});

// CRITICAL: You must export the router so index.js can see it
module.exports = router;
