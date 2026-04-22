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

function insertMessage(threadId, senderId, content, mediaUrl = null, mediaType = null) {
  const trimmedContent = String(content ?? '').trim();
  if (!trimmedContent && !mediaUrl) throw new Error('Message must contain text or media.');
  const result = db.prepare(`INSERT INTO messages (thread_id, sender_id, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)`).run(threadId, String(senderId).trim(), trimmedContent || null, mediaUrl, mediaType);
  return db.prepare(`SELECT * FROM messages WHERE id = ?`).get(result.lastInsertRowid);
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

function createPost(authorId, content) {
  const info = db.prepare(`INSERT INTO posts (authorId, content) VALUES (?, ?)`).run(authorId, content);
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
}

module.exports = {
  db,
  dbPath,
  getOrCreateDirectThread,
  insertMessage,
  getUserInbox,
  createPost,
  serializeThread,
  normalizeUserIds
};
