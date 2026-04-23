const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'yousm.db');

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Initialize tables
function initializeDatabase() {
  ensureDirectory(dataDir);
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      displayName TEXT,
      bio TEXT,
      profileImage TEXT,
      role TEXT DEFAULT 'Student',
      pronouns TEXT,
      major TEXT,
      gradYear TEXT,
      degree TEXT,
      department TEXT,
      officeHours TEXT,
      employer TEXT,
      jobTitle TEXT,
      moderationLevel TEXT,
      interests TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Followers relationship
  db.exec(`
    CREATE TABLE IF NOT EXISTS followers (
      id INTEGER PRIMARY KEY,
      followerId INTEGER NOT NULL,
      followingId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (followerId) REFERENCES users(id),
      FOREIGN KEY (followingId) REFERENCES users(id),
      UNIQUE(followerId, followingId)
    )
  `);

  // Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY,
      authorId INTEGER NOT NULL,
      content TEXT,
      imageUrl TEXT,
      videoUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      likes INTEGER DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authorId) REFERENCES users(id)
    )
  `);

  // Likes/Interactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY,
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (postId) REFERENCES posts(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Communities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS communities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      category TEXT,
      description TEXT,
      creatorId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Community membership
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_members (
      communityId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (communityId, userId),
      FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Messaging Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_type TEXT NOT NULL DEFAULT 'direct',
      direct_key TEXT UNIQUE,
      name TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS thread_participants (
      thread_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (thread_id, user_id),
      FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT,
      media_url TEXT,
      media_type TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blocks (
      blocker_id TEXT NOT NULL,
      blocked_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (blocker_id, blocked_id)
    );

    CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON thread_participants(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_thread_id_id ON messages(thread_id, id);
  `);

  // Insert test users if they don't exist
  const testUsers = [
    { username: 'james', displayName: 'James' },
    { username: 'gage', displayName: 'Gage' },
    { username: 'courtney', displayName: 'Courtney' },
    { username: 'esther', displayName: 'Esther' }
  ];

  testUsers.forEach(user => {
    try {
      db.prepare(`
        INSERT INTO users (username, displayName) VALUES (?, ?)
      `).run(user.username, user.displayName);
    } catch (e) {
      // User already exists
    }
  });

  // Insert initial communities if none exist
  const commCount = db.prepare('SELECT COUNT(*) as count FROM communities').get().count;
  if (commCount === 0) {
    const initialCommunities = [
      { name: "Women in Computing", type: "Club", category: "Academic", description: "A supportive space for students interested in technology." },
      { name: "Software Engineering", type: "Course", category: "Class", description: "A course community for project collaboration." },
      { name: "Campus Hiking Club", type: "Club", category: "Social", description: "Explore the outdoors with fellow students." },
      { name: "Chess Society", type: "Club", category: "Social", description: "Strategic matches and tournaments for all levels." }
    ];
    const insert = db.prepare('INSERT INTO communities (name, type, category, description) VALUES (?, ?, ?, ?)');
    initialCommunities.forEach(c => {
      insert.run(c.name, c.type, c.category, c.description);
    });
  }

  return db;
}

const db = initializeDatabase();

// ==========================================
// Helper Functions
// ==========================================

function normalizeUserIds(input) {
  const userIds = Array.isArray(input) ? input : [];
  const filtered = userIds.map((userId) => String(userId).trim()).filter(Boolean);
  const unique = [...new Set(filtered)];
  if (unique.length !== 2) {
    const error = new Error('A direct thread requires exactly two unique participant IDs.');
    error.statusCode = 400;
    throw error;
  }
  return unique.sort();
}

function serializeMessage(message) {
  if (!message) return null;
  return {
    id: message.id,
    threadId: message.thread_id,
    senderId: message.sender_id,
    content: message.content,
    mediaUrl: message.media_url,
    mediaType: message.media_type,
    createdAt: message.created_at,
  };
}

function serializeThread(thread) {
  if (!thread) return null;
  const participants = db.prepare(`SELECT user_id FROM thread_participants WHERE thread_id = ? ORDER BY user_id ASC`).all(thread.id).map((row) => row.user_id);
  return {
    id: thread.id,
    threadType: thread.thread_type,
    directKey: thread.direct_key,
    createdAt: thread.created_at,
    updatedAt: thread.updated_at,
    participantIds: participants,
  };
}

function getOrCreateDirectThread(userIds) {
  const [firstUserId, secondUserId] = normalizeUserIds(userIds);
  const directKey = `${firstUserId}:${secondUserId}`;
  const existingThread = db.prepare(`SELECT * FROM threads WHERE direct_key = ?`).get(directKey);
  if (existingThread) return serializeThread(existingThread);
  const transaction = db.transaction(() => {
    const result = db.prepare(`INSERT INTO threads (thread_type, direct_key) VALUES ('direct', ?)`).run(directKey);
    const threadId = result.lastInsertRowid;
    db.prepare(`INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`).run(threadId, firstUserId);
    db.prepare(`INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`).run(threadId, secondUserId);
    return threadId;
  });
  return serializeThread(db.prepare(`SELECT * FROM threads WHERE id = ?`).get(transaction()));
}

function getAllUsers() {
  return db.prepare(`
    SELECT id, username, displayName, bio, profileImage,
      (SELECT COUNT(*) FROM followers WHERE followingId = users.id) as followerCount,
      (SELECT COUNT(*) FROM followers WHERE followerId = users.id) as followingCount
    FROM users
    ORDER BY displayName
  `).all();
}

function getUserById(userId) {
  return db.prepare(`
    SELECT id, username, displayName, bio, profileImage, role, pronouns, major, gradYear, degree, department, officeHours, employer, jobTitle, moderationLevel, interests, createdAt,
      (SELECT COUNT(*) FROM followers WHERE followingId = ?) as followerCount,
      (SELECT COUNT(*) FROM followers WHERE followerId = ?) as followingCount
    FROM users
    WHERE id = ?
  `).get(userId, userId, userId);
}

function updateUser(userId, data) {
  const { displayName, bio, pronouns, major, gradYear, degree, department, officeHours, employer, jobTitle, moderationLevel, interests, role } = data;
  db.prepare(`
    UPDATE users SET 
      displayName = ?, bio = ?, pronouns = ?, major = ?, gradYear = ?, 
      degree = ?, department = ?, officeHours = ?, employer = ?, 
      jobTitle = ?, moderationLevel = ?, interests = ?, role = ?
    WHERE id = ?
  `).run(displayName, bio, pronouns, major, gradYear, degree, department, officeHours, employer, jobTitle, moderationLevel, interests, role, userId);
  return getUserById(userId);
}

function getUserByUsername(username) {
  return db.prepare(`
    SELECT id, username, displayName, bio, profileImage, createdAt,
      (SELECT COUNT(*) FROM followers WHERE followingId = users.id) as followerCount,
      (SELECT COUNT(*) FROM followers WHERE followerId = users.id) as followingCount
    FROM users
    WHERE username = ?
  `).get(username);
}

function toggleFollow(followerId, followingId) {
  const existing = db.prepare(`
    SELECT id FROM followers WHERE followerId = ? AND followingId = ?
  `).get(followerId, followingId);

  if (existing) {
    db.prepare(`DELETE FROM followers WHERE id = ?`).run(existing.id);
    return { following: false };
  } else {
    db.prepare(`INSERT INTO followers (followerId, followingId) VALUES (?, ?)`).run(followerId, followingId);
    return { following: true };
  }
}

function getFollowers(userId) {
  return db.prepare(`
    SELECT u.id, u.username, u.displayName, u.profileImage
    FROM followers f
    JOIN users u ON f.followerId = u.id
    WHERE f.followingId = ? ORDER BY f.createdAt DESC
  `).all(userId);
}

function getFollowing(userId) {
  return db.prepare(`
    SELECT u.id, u.username, u.displayName, u.profileImage
    FROM followers f
    JOIN users u ON f.followingId = u.id
    WHERE f.followerId = ? ORDER BY f.createdAt DESC
  `).all(userId);
}

function getThreadById(threadId) {
  const thread = db.prepare(`SELECT * FROM threads WHERE id = ?`).get(threadId);
  return serializeThread(thread);
}

function createGroupThread(userIds, groupName = null) {
  const uniqueUsers = [...new Set(userIds.map(id => String(id).trim()).filter(Boolean))];
  if (uniqueUsers.length < 2) throw new Error('Group thread needs at least 2 participants.');

  const transaction = db.transaction(() => {
    const result = db.prepare(`INSERT INTO threads (thread_type, name) VALUES ('group', ?)`).run(groupName);
    const threadId = result.lastInsertRowid;
    for (const userId of uniqueUsers) {
      db.prepare(`INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`).run(threadId, userId);
    }
    return threadId;
  });
  return getThreadById(transaction());
}

function insertMessage(threadId, senderId, content, mediaUrl = null, mediaType = null) {
  const trimmedContent = String(content ?? '').trim();
  if (!trimmedContent && !mediaUrl) throw new Error('Message must contain text or media.');
  
  if (isBlockedByAny(senderId, threadId)) {
    throw new Error('Message blocked: You cannot exchange messages with this user.');
  }

  const result = db.prepare(`INSERT INTO messages (thread_id, sender_id, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)`).run(threadId, String(senderId).trim(), trimmedContent || null, mediaUrl, mediaType);
  return serializeMessage(db.prepare(`SELECT * FROM messages WHERE id = ?`).get(result.lastInsertRowid));
}

function interactWithPost(postId, userId, type, content = null) {
  if (type === 'like') {
    const existing = db.prepare(`SELECT id FROM interactions WHERE postId = ? AND userId = ? AND type = 'like'`).get(postId, userId);
    if (existing) {
      db.prepare(`DELETE FROM interactions WHERE id = ?`).run(existing.id);
      return { liked: false };
    }
  }
  
  const result = db.prepare(`
    INSERT INTO interactions (postId, userId, type, content) VALUES (?, ?, ?, ?)
  `).run(postId, userId, type, content);

  return {
    interaction: { id: result.lastInsertRowid, postId, userId, type, content },
    liked: type === 'like'
  };
}

function getPostById(postId, viewerId = 0) {
  const post = db.prepare(`
    SELECT p.*, u.username, u.displayName, u.profileImage,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND userId = ? AND type = 'like') as isLiked
    FROM posts p
    JOIN users u ON p.authorId = u.id
    WHERE p.id = ?
  `).get(viewerId, postId);

  if (!post) return null;

  const interactions = db.prepare(`
    SELECT i.*, u.username, u.displayName, u.profileImage
    FROM interactions i
    JOIN users u ON i.userId = u.id
    WHERE i.postId = ? ORDER BY i.createdAt DESC
  `).all(postId);

  return { post, interactions };
}

function deletePost(postId) {
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM interactions WHERE postId = ?').run(postId);
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
  });
  transaction();
}

function getFeedForUser(userId) {
  const following = db.prepare(`
    SELECT followingId FROM followers WHERE followerId = ?
  `).all(userId);
  
  const followingIds = following.map(f => f.followingId);
  followingIds.push(userId); // Include own posts

  const placeholders = followingIds.map(() => '?').join(',');
  return db.prepare(`
    SELECT 
      p.id, p.authorId, p.content, p.imageUrl, p.videoUrl, p.createdAt,
      u.username, u.displayName, u.profileImage,
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
}

function getPostsByUserId(userId) {
  return db.prepare(`
    SELECT id, content, imageUrl, videoUrl, createdAt
    FROM posts
    WHERE authorId = ?
    ORDER BY createdAt DESC
  `).all(userId);
}

function getAllCommunities() {
  return db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM community_members WHERE communityId = c.id) as memberCount
    FROM communities c
    ORDER BY c.name
  `).all();
}

function getCommunityById(id, userId = null) {
  const community = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM community_members WHERE communityId = c.id) as memberCount
    FROM communities c
    WHERE c.id = ?
  `).get(id);

  if (community && userId) {
    const membership = db.prepare(`
      SELECT 1 FROM community_members WHERE communityId = ? AND userId = ?
    `).get(id, userId);
    community.isMember = !!membership;
  }

  return community;
}

function joinCommunity(communityId, userId) {
  db.prepare(`INSERT OR IGNORE INTO community_members (communityId, userId) VALUES (?, ?)`).run(communityId, userId);
}

function leaveCommunity(communityId, userId) {
  db.prepare(`DELETE FROM community_members WHERE communityId = ? AND userId = ?`).run(communityId, userId);
}

function getCommunitiesByUserId(userId) {
  return db.prepare(`
    SELECT c.* 
    FROM communities c
    JOIN community_members cm ON c.id = cm.communityId
    WHERE cm.userId = ?
  `).all(userId);
}

function createCommunity(name, type, category, description, creatorId) {
  const result = db.prepare(`
    INSERT INTO communities (name, type, category, description, creatorId) 
    VALUES (?, ?, ?, ?, ?)
  `).run(name, type, category, description, creatorId);
  
  const id = result.lastInsertRowid;
  db.prepare(`INSERT INTO community_members (communityId, userId, role) VALUES (?, ?, 'admin')`).run(id, creatorId);
  return getCommunityById(id);
}


function getAllPosts() {
  return db.prepare(`
    SELECT p.*, u.username, u.displayName, u.profileImage,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
      0 as isLiked
    FROM posts p
    JOIN users u ON p.authorId = u.id
    ORDER BY p.createdAt DESC LIMIT 50
  `).all();
}

function getMessagesForThread(threadId, afterMessageId = 0) {
  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE thread_id = ? AND id > ? 
    ORDER BY id ASC
  `).all(threadId, afterMessageId);
  return messages.map(serializeMessage);
}

function getUserInbox(userId) {
  return db.prepare(`
    SELECT 
      t.id as threadId,
      t.thread_type as threadType,
      CASE 
        WHEN t.name IS NOT NULL THEN t.name
        ELSE (SELECT GROUP_CONCAT(user_id, ', ') FROM thread_participants WHERE thread_id = t.id AND user_id != ?)
      END as targetUser,
      (SELECT content FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessage,
      (SELECT created_at FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessageAt
    FROM threads t
    WHERE t.id IN (SELECT thread_id FROM thread_participants WHERE user_id = ?)
    ORDER BY lastMessageAt DESC
  `).all(userId, userId);
}

function addParticipant(threadId, userId) {
  db.prepare(`INSERT OR IGNORE INTO thread_participants (thread_id, user_id) VALUES (?, ?)`).run(threadId, userId);
}

function removeParticipant(threadId, userId) {
  db.prepare(`DELETE FROM thread_participants WHERE thread_id = ? AND user_id = ?`).run(threadId, userId);
}

function deleteThread(threadId) {
  db.prepare('DELETE FROM threads WHERE id = ?').run(threadId);
}

function deleteMessage(messageId) {
  db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
}

function updateThreadName(threadId, newName) {
  db.prepare('UPDATE threads SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newName, threadId);
  return getThreadById(threadId);
}

function blockUser(blockerId, blockedId) {
  db.prepare(`INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)`).run(blockerId, blockedId);
}

function unblockUser(blockerId, blockedId) {
  db.prepare(`DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`).run(blockerId, blockedId);
}

function getBlockedUsers(userId) {
  return db.prepare(`SELECT blocked_id FROM blocks WHERE blocker_id = ?`).all(userId).map(r => r.blocked_id);
}

function isBlocked(userId, otherUserId) {
  const row = db.prepare(`
    SELECT 1 FROM blocks 
    WHERE (blocker_id = ? AND blocked_id = ?)
       OR (blocker_id = ? AND blocked_id = ?)
  `).get(userId, otherUserId, otherUserId, userId);
  return !!row;
}

function isBlockedByAny(userId, threadId) {
  const participants = db.prepare(`SELECT user_id FROM thread_participants WHERE thread_id = ? AND user_id != ?`).all(threadId, userId);
  for (const p of participants) {
    if (isBlocked(userId, p.user_id)) return true;
  }
  return false;
}

function createPost(authorId, content, imageUrl = null, videoUrl = null) {
  const info = db.prepare(`
    INSERT INTO posts (authorId, content, imageUrl, videoUrl) 
    VALUES (?, ?, ?, ?)
  `).run(authorId, content, imageUrl, videoUrl);

  // Return the full post object with author details for the frontend
  return db.prepare(`
    SELECT p.*, u.username, u.displayName, u.profileImage
    FROM posts p
    JOIN users u ON p.authorId = u.id
    WHERE p.id = ?
  `).get(info.lastInsertRowid);
}

function getRecentPosts() {
  return db.prepare(`
    SELECT p.*, u.username, u.displayName 
    FROM posts p 
    JOIN users u ON p.authorId = u.id 
    ORDER BY p.createdAt DESC 
    LIMIT 50
  `).all();
}

module.exports = {
  db,
  dbPath,
  getThreadById,
  getOrCreateDirectThread,
  isBlocked,
  createGroupThread,
  insertMessage,
  getMessagesForThread,
  getUserInbox,
  addParticipant,
  removeParticipant,
  deleteThread,
  deleteMessage,
  updateThreadName,
  blockUser,
  unblockUser,
  getBlockedUsers,
  createPost,
  deletePost,
  interactWithPost,
  getPostById,
  getFeedForUser,
  getPostsByUserId,
  getRecentPosts,
  getAllPosts,
  getAllUsers,
  getUserById,
  getUserByUsername,
  toggleFollow,
  getFollowers,
  getAllCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getCommunitiesByUserId,
  createCommunity,
  getFollowing,
  serializeThread,
  normalizeUserIds
};
