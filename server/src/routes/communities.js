const express = require('express');
const router = express.Router();
const { getAllCommunities, getCommunityById, joinCommunity, leaveCommunity, getCommunitiesByUserId, createCommunity } = require('../db');

// GET all communities
router.get('/', (req, res) => {
  try {
    const communities = getAllCommunities();
    res.json({ communities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET user's communities
router.get('/user/:userId', (req, res) => {
  try {
    const communities = getCommunitiesByUserId(parseInt(req.params.userId));
    res.json({ communities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single community
router.get('/:id', (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId) : null;
    const community = getCommunityById(parseInt(req.params.id), userId);
    if (!community) return res.status(404).json({ error: 'Community not found' });
    res.json({ community });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST join community
router.post('/:id/join', (req, res) => {
  try {
    const { userId } = req.body;
    joinCommunity(parseInt(req.params.id), parseInt(userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE leave community
router.delete('/:id/leave/:userId', (req, res) => {
  try {
    leaveCommunity(parseInt(req.params.id), parseInt(req.params.userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create community
router.post('/', (req, res) => {
  try {
    const { name, type, category, description, creatorId } = req.body; // Destructure new fields
    if (!name || !type || !category || !description || !creatorId) {
      return res.status(400).json({ error: "Name, type, category, description, and creatorId are required." });
    }
    const community = createCommunity(name, type, category, description, parseInt(creatorId));
    res.status(201).json({ community });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;