const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../yousm.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize tables
function initializeDatabase() {
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
}

initializeDatabase();

module.exports = db;

