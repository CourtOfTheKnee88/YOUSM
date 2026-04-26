const express = require("express");
const router = express.Router();

const {
  getAllCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getCommunitiesByUserId,
  createCommunity,
  getCommunityFeed,
  getCommunityMembers,
  promoteCommunityMemberToAdmin,
  banCommunityMember,
} = require("../db");

function getStatusCode(error) {
  return error.statusCode || 500;
}

// GET all communities
router.get("/", (req, res) => {
  try {
    const communities = getAllCommunities();
    res.json({ communities });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

// GET user's communities
router.get("/user/:userId", (req, res) => {
  try {
    const communities = getCommunitiesByUserId(parseInt(req.params.userId));
    res.json({ communities });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

// GET community feed
router.get("/:id/feed", (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId);

    if (!userId) {
      return res.status(400).json({
        error: "userId query parameter is required.",
      });
    }

    const posts = getCommunityFeed(communityId, userId);
    res.json({ posts });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      error: error.message,
      ban: error.ban || null,
    });
  }
});

// GET community members
router.get("/:id/members", (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const members = getCommunityMembers(communityId);

    res.json({ members });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

// GET single community
router.get("/:id", (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId) : null;
    const community = getCommunityById(parseInt(req.params.id), userId);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    res.json({ community });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

// POST join community
router.post("/:id/join", (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const membership = joinCommunity(parseInt(req.params.id), parseInt(userId));

    res.json({ success: true, membership });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

// DELETE leave community
router.delete("/:id/leave/:userId", (req, res) => {
  try {
    leaveCommunity(parseInt(req.params.id), parseInt(req.params.userId));
    res.json({ success: true });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

// POST promote member to admin
router.post("/:id/admins", (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const { adminUserId, targetUserId } = req.body;

    if (!adminUserId || !targetUserId) {
      return res.status(400).json({
        error: "adminUserId and targetUserId are required.",
      });
    }

    const membership = promoteCommunityMemberToAdmin(
      communityId,
      parseInt(targetUserId),
      parseInt(adminUserId)
    );

    res.json({ success: true, membership });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

// POST temporary posting ban
router.post("/:id/bans", (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const { adminUserId, targetUserId, durationMinutes, reason } = req.body;

    if (!adminUserId || !targetUserId) {
      return res.status(400).json({
        error: "adminUserId and targetUserId are required.",
      });
    }

    const ban = banCommunityMember(
      communityId,
      parseInt(targetUserId),
      parseInt(adminUserId),
      durationMinutes || 10,
      reason || null
    );

    res.status(201).json({ success: true, ban });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

// POST create community
router.post("/", (req, res) => {
  try {
    const { name, type, category, description, creatorId } = req.body;

    if (!name || !type || !category || !description || !creatorId) {
      return res.status(400).json({
        error: "Name, type, category, description, and creatorId are required.",
      });
    }

    const community = createCommunity(
      name,
      type,
      category,
      description,
      parseInt(creatorId)
    );

    res.status(201).json({ community });
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
});

module.exports = router;