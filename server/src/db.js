const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "yousm.db");

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function addColumnIfMissing(db, tableName, columnName, columnDefinition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`
    );
  }
}

function initializeDatabase() {
  ensureDirectory(dataDir);

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      displayName TEXT,
      bio TEXT,
      profileImage TEXT,
      isPrivate INTEGER DEFAULT 0,
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
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      securityQuestion TEXT,
      securityQA TEXT
    )
  `);

  addColumnIfMissing(db, "users", "password", "TEXT");
  addColumnIfMissing(db, "users", "email", "TEXT");
  addColumnIfMissing(db, "users", "securityQuestion", "TEXT");
  addColumnIfMissing(db, "users", "securityQA", "TEXT");
  addColumnIfMissing(db, "users", "profileImage", "TEXT");
  addColumnIfMissing(db, "users", "isPrivate", "INTEGER DEFAULT 0");

  db.exec(`
    CREATE TABLE IF NOT EXISTS followers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      followerId INTEGER NOT NULL,
      followingId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(followerId, followingId)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS follow_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requesterId INTEGER NOT NULL,
      requestedId INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requesterId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (requestedId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(requesterId, requestedId)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      authorId INTEGER NOT NULL,
      content TEXT,
      imageUrl TEXT,
      videoUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      likes INTEGER DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  addColumnIfMissing(db, "posts", "communityId", "INTEGER");
  addColumnIfMissing(db, "posts", "postType", "TEXT DEFAULT 'post'");

  db.exec(`
    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

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

  db.exec(`
    CREATE TABLE IF NOT EXISTS community_bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      communityId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      bannedBy INTEGER NOT NULL,
      reason TEXT,
      bannedUntil DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (bannedBy) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

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
    CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(communityId);
    CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(postType);
    CREATE INDEX IF NOT EXISTS idx_community_bans_lookup ON community_bans(communityId, userId, bannedUntil);
    CREATE INDEX IF NOT EXISTS idx_follow_requests_lookup ON follow_requests(requesterId, requestedId, status);
  `);

  const testUsers = [
    {
      username: "james",
      displayName: "James Tedder",
      email: "james.tedder@maine.edu",
      password: "password123",
      role: "Student",
    },
    {
      username: "gage",
      displayName: "Gage",
      email: "gage@maine.edu",
      password: "password123",
      role: "Student",
    },
    {
      username: "courtney",
      displayName: "Courtney",
      email: "courtney@maine.edu",
      password: "password123",
      role: "Student",
    },
    {
      username: "esther",
      displayName: "Esther Greene",
      email: "esther.greene@maine.edu",
      password: "password123",
      role: "Student",
    },
    {
      username: "janedoe",
      displayName: "Jane Doe",
      email: "jane.doe@maine.edu",
      password: "password123",
      role: "Faculty",
    },
    {
      username: "bobsmith",
      displayName: "Bob Smith",
      email: "bob.smith@alumni.maine.edu",
      password: "password123",
      role: "Alumni",
    },
  ];

  testUsers.forEach((user) => {
    try {
      db.prepare(
        `
        INSERT INTO users (username, displayName, email, password, role)
        VALUES (?, ?, ?, ?, ?)
      `
      ).run(
        user.username,
        user.displayName,
        user.email,
        user.password,
        user.role
      );
    } catch (error) {
      // User already exists.
    }
  });

  const commCount = db
    .prepare("SELECT COUNT(*) as count FROM communities")
    .get().count;

  if (commCount === 0) {
    const initialCommunities = [
      {
        name: "Women in Computing",
        type: "Club",
        category: "Academic",
        description:
          "A supportive space for USM students interested in technology and computing.",
      },
      {
        name: "Software Engineering",
        type: "Course",
        category: "Class",
        description: "Course community for software engineering students.",
      },
      {
        name: "Chess Society",
        type: "Club",
        category: "Social",
        description: "Strategic matches and tournaments for all levels.",
      },
    ];

    const insert = db.prepare(
      "INSERT INTO communities (name, type, category, description) VALUES (?, ?, ?, ?)"
    );

    initialCommunities.forEach((community) => {
      insert.run(
        community.name,
        community.type,
        community.category,
        community.description
      );
    });
  }

  const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get()
    .count;

  if (postCount === 0) {
    const users = db.prepare("SELECT id, username FROM users").all();
    const insertPost = db.prepare(
      "INSERT INTO posts (authorId, content) VALUES (?, ?)"
    );

    const posts = [
      "Just grabbed a coffee at the Portland campus. Ready for my 9 AM! ☕",
      "Who's going to the Huskies game this weekend? Let's go USM! 🐾",
      "Study session at Glickman Library later today. Join me on the 4th floor! 📚",
      "The Gorham campus is looking beautiful this autumn. #USMLife",
      "Can anyone recommend a good elective for next semester?",
      "Excited to join the Women in Computing club meeting tonight! 💻",
      "Does anyone know if the Husky Bus is running on time today? 🚌",
      "Just finished my Software Engineering project. Feeling accomplished!",
      "Looking for teammates for intramural soccer. DM me! ⚽",
      "First day at the University of Southern Maine! So happy to be a Husky.",
    ];

    users.forEach((user, userIndex) => {
      for (let i = 0; i < 4; i++) {
        insertPost.run(user.id, posts[(userIndex + i) % posts.length]);
      }
    });
  }

  return db;
}

const db = initializeDatabase();

function normalizeUserIds(input) {
  const userIds = Array.isArray(input) ? input : [];
  const filtered = userIds.map((userId) => String(userId).trim()).filter(Boolean);
  const unique = [...new Set(filtered)];

  if (unique.length !== 2) {
    const error = new Error(
      "A direct thread requires exactly two unique participant IDs."
    );
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

  const participants = db
    .prepare(
      `SELECT user_id FROM thread_participants WHERE thread_id = ? ORDER BY user_id ASC`
    )
    .all(thread.id)
    .map((row) => row.user_id);

  return {
    id: thread.id,
    threadType: thread.thread_type,
    directKey: thread.direct_key,
    name: thread.name,
    createdAt: thread.created_at,
    updatedAt: thread.updated_at,
    participantIds: participants,
  };
}

function getUserById(userId) {
  return db
    .prepare(
      `
      SELECT id, username, email, displayName, bio, profileImage, isPrivate,
        role, pronouns, major, gradYear, degree, department, officeHours,
        employer, jobTitle, moderationLevel, interests, createdAt,
        securityQuestion, securityQA,
        (SELECT COUNT(*) FROM followers WHERE followingId = users.id) as followerCount,
        (SELECT COUNT(*) FROM followers WHERE followerId = users.id) as followingCount
      FROM users
      WHERE id = ?
    `
    )
    .get(userId);
}

function getSafeUserById(userId) {
  const user = getUserById(userId);
  if (!user) return null;

  const { email, securityQuestion, securityQA, ...safeUser } = user;
  return safeUser;
}

function getUserByUsername(username) {
  return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
}

function getAllUsers() {
  return db
    .prepare(
      `
      SELECT id, username, displayName, bio, profileImage, isPrivate, role, major,
        (SELECT COUNT(*) FROM followers WHERE followingId = users.id) as followerCount,
        (SELECT COUNT(*) FROM followers WHERE followerId = users.id) as followingCount
      FROM users
      ORDER BY COALESCE(displayName, username)
    `
    )
    .all();
}

function updateUser(userId, data) {
  const existing = getUserById(userId);
  if (!existing) return null;

  const updated = {
    displayName: data.displayName ?? existing.displayName,
    bio: data.bio ?? existing.bio,
    pronouns: data.pronouns ?? existing.pronouns,
    major: data.major ?? existing.major,
    gradYear: data.gradYear ?? existing.gradYear,
    degree: data.degree ?? existing.degree,
    department: data.department ?? existing.department,
    officeHours: data.officeHours ?? existing.officeHours,
    employer: data.employer ?? existing.employer,
    jobTitle: data.jobTitle ?? existing.jobTitle,
    moderationLevel: data.moderationLevel ?? existing.moderationLevel,
    interests: data.interests ?? existing.interests,
    role: data.role ?? existing.role,
    profileImage: data.profileImage ?? existing.profileImage,
    isPrivate:
      data.isPrivate === true || data.isPrivate === 1 || data.isPrivate === "1"
        ? 1
        : data.isPrivate === false ||
            data.isPrivate === 0 ||
            data.isPrivate === "0"
          ? 0
          : existing.isPrivate || 0,
  };

  db.prepare(
    `
    UPDATE users SET
      displayName = ?,
      bio = ?,
      pronouns = ?,
      major = ?,
      gradYear = ?,
      degree = ?,
      department = ?,
      officeHours = ?,
      employer = ?,
      jobTitle = ?,
      moderationLevel = ?,
      interests = ?,
      role = ?,
      profileImage = ?,
      isPrivate = ?
    WHERE id = ?
  `
  ).run(
    updated.displayName,
    updated.bio,
    updated.pronouns,
    updated.major,
    updated.gradYear,
    updated.degree,
    updated.department,
    updated.officeHours,
    updated.employer,
    updated.jobTitle,
    updated.moderationLevel,
    updated.interests,
    updated.role,
    updated.profileImage,
    updated.isPrivate,
    userId
  );

  return getUserById(userId);
}

function updateUserProfileImage(userId, profileImage) {
  db.prepare(`UPDATE users SET profileImage = ? WHERE id = ?`).run(
    profileImage,
    userId
  );

  return getUserById(userId);
}

function createUser(
  username,
  email,
  password,
  role = "Student",
  securityQuestion = null,
  securityAnswer = null
) {
  const stmt = db.prepare(`
    INSERT INTO users (
      username,
      email,
      password,
      role,
      securityQuestion,
      securityQA,
      displayName,
      isPrivate
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const result = stmt.run(
    username,
    email,
    password,
    role,
    securityQuestion,
    securityAnswer,
    username
  );

  return getUserById(result.lastInsertRowid);
}

function updateUserPassword(userId, newPassword) {
  return db
    .prepare("UPDATE users SET password = ? WHERE id = ?")
    .run(newPassword, userId);
}

function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) return false;

  const row = db
    .prepare(
      `
      SELECT id FROM followers
      WHERE followerId = ? AND followingId = ?
    `
    )
    .get(followerId, followingId);

  return !!row;
}

function getPendingFollowRequest(requesterId, requestedId) {
  return db
    .prepare(
      `
      SELECT *
      FROM follow_requests
      WHERE requesterId = ?
        AND requestedId = ?
        AND status = 'pending'
    `
    )
    .get(requesterId, requestedId);
}

function getFollowStatus(viewerId, targetUserId) {
  if (!viewerId || !targetUserId) return "none";
  if (parseInt(viewerId) === parseInt(targetUserId)) return "self";
  if (isFollowing(viewerId, targetUserId)) return "following";
  if (getPendingFollowRequest(viewerId, targetUserId)) return "requested";
  return "none";
}

function requestOrFollowUser(requesterId, requestedId) {
  requesterId = parseInt(requesterId);
  requestedId = parseInt(requestedId);

  if (!requesterId || !requestedId) {
    const error = new Error("requesterId and requestedId are required.");
    error.statusCode = 400;
    throw error;
  }

  if (requesterId === requestedId) {
    const error = new Error("You cannot follow yourself.");
    error.statusCode = 400;
    throw error;
  }

  const requestedUser = getUserById(requestedId);
  if (!requestedUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (isFollowing(requesterId, requestedId)) {
    return { status: "following", following: true };
  }

  if (requestedUser.isPrivate) {
    const existingRequest = getPendingFollowRequest(requesterId, requestedId);

    if (existingRequest) {
      return { status: "requested", request: existingRequest };
    }

    const result = db
      .prepare(
        `
        INSERT INTO follow_requests (requesterId, requestedId, status)
        VALUES (?, ?, 'pending')
      `
      )
      .run(requesterId, requestedId);

    const request = db
      .prepare(`SELECT * FROM follow_requests WHERE id = ?`)
      .get(result.lastInsertRowid);

    return { status: "requested", request };
  }

  db.prepare(
    `
    INSERT OR IGNORE INTO followers (followerId, followingId)
    VALUES (?, ?)
  `
  ).run(requesterId, requestedId);

  return { status: "following", following: true };
}

function unfollowUser(followerId, followingId) {
  db.prepare(
    `
    DELETE FROM followers
    WHERE followerId = ? AND followingId = ?
  `
  ).run(followerId, followingId);

  db.prepare(
    `
    DELETE FROM follow_requests
    WHERE requesterId = ? AND requestedId = ? AND status = 'pending'
  `
  ).run(followerId, followingId);

  return { status: "none", following: false };
}

function toggleFollow(followerId, followingId) {
  if (isFollowing(followerId, followingId)) {
    return unfollowUser(followerId, followingId);
  }

  return requestOrFollowUser(followerId, followingId);
}

function getIncomingFollowRequests(userId) {
  return db
    .prepare(
      `
      SELECT
        fr.id,
        fr.requesterId,
        fr.requestedId,
        fr.status,
        fr.createdAt,
        u.username,
        u.displayName,
        u.profileImage,
        u.role,
        u.major
      FROM follow_requests fr
      JOIN users u ON fr.requesterId = u.id
      WHERE fr.requestedId = ?
        AND fr.status = 'pending'
      ORDER BY datetime(fr.createdAt) DESC
    `
    )
    .all(userId);
}

function respondToFollowRequest(requestId, requestedId, action) {
  const request = db
    .prepare(
      `
      SELECT *
      FROM follow_requests
      WHERE id = ? AND requestedId = ? AND status = 'pending'
    `
    )
    .get(requestId, requestedId);

  if (!request) {
    const error = new Error("Follow request not found.");
    error.statusCode = 404;
    throw error;
  }

  if (action === "accept") {
    const transaction = db.transaction(() => {
      db.prepare(
        `
        INSERT OR IGNORE INTO followers (followerId, followingId)
        VALUES (?, ?)
      `
      ).run(request.requesterId, request.requestedId);

      db.prepare(
        `
        UPDATE follow_requests
        SET status = 'accepted', updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      ).run(requestId);
    });

    transaction();

    return { success: true, status: "accepted" };
  }

  if (action === "deny") {
    db.prepare(
      `
      UPDATE follow_requests
      SET status = 'denied', updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    ).run(requestId);

    return { success: true, status: "denied" };
  }

  const error = new Error("Action must be accept or deny.");
  error.statusCode = 400;
  throw error;
}

function getFollowers(userId) {
  return db
    .prepare(
      `
      SELECT u.id, u.username, u.displayName, u.profileImage, u.role, u.major
      FROM followers f
      JOIN users u ON f.followerId = u.id
      WHERE f.followingId = ?
      ORDER BY f.createdAt DESC
    `
    )
    .all(userId);
}

function getFollowing(userId) {
  return db
    .prepare(
      `
      SELECT u.id, u.username, u.displayName, u.profileImage, u.role, u.major
      FROM followers f
      JOIN users u ON f.followingId = u.id
      WHERE f.followerId = ?
      ORDER BY f.createdAt DESC
    `
    )
    .all(userId);
}

function canViewerSeePosts(viewerId, targetUserId) {
  if (!targetUserId) return false;
  if (parseInt(viewerId) === parseInt(targetUserId)) return true;

  const targetUser = getUserById(targetUserId);
  if (!targetUser) return false;

  if (!targetUser.isPrivate) return true;
  return isFollowing(viewerId, targetUserId);
}

function getUserProfileForViewer(targetUserId, viewerId = null) {
  const user = getSafeUserById(targetUserId);
  if (!user) return null;

  const followStatus = getFollowStatus(viewerId, targetUserId);
  const canViewPosts = canViewerSeePosts(viewerId, targetUserId);

  const posts = canViewPosts ? getPostsByUserId(targetUserId) : [];

  return {
    user: {
      ...user,
      followStatus,
      canViewPosts,
    },
    posts,
  };
}

function getPostsByUserId(userId) {
  return db
    .prepare(
      `
      SELECT
        p.id,
        p.authorId,
        p.content,
        p.imageUrl,
        p.videoUrl,
        p.createdAt,
        p.communityId,
        p.postType,
        u.username,
        u.displayName,
        u.profileImage,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.authorId = ?
        AND p.communityId IS NULL
      ORDER BY datetime(p.createdAt) DESC
    `
    )
    .all(userId);
}

function searchUsersAndCommunities(query) {
  const searchTerm = `%${String(query || "").trim()}%`;

  if (!String(query || "").trim()) {
    return [];
  }

  const users = db
    .prepare(
      `
      SELECT
        id,
        username,
        displayName,
        role,
        major,
        profileImage,
        'person' as resultType
      FROM users
      WHERE username LIKE ?
        OR displayName LIKE ?
        OR role LIKE ?
        OR major LIKE ?
      ORDER BY COALESCE(displayName, username)
      LIMIT 20
    `
    )
    .all(searchTerm, searchTerm, searchTerm, searchTerm);

  const communities = db
    .prepare(
      `
      SELECT
        c.id,
        c.name,
        c.category,
        c.type,
        c.description,
        NULL as username,
        NULL as displayName,
        NULL as role,
        NULL as major,
        NULL as profileImage,
        'community' as resultType,
        (SELECT COUNT(*) FROM community_members WHERE communityId = c.id) as memberCount
      FROM communities c
      WHERE c.name LIKE ?
        OR c.category LIKE ?
        OR c.type LIKE ?
        OR c.description LIKE ?
      ORDER BY c.name
      LIMIT 20
    `
    )
    .all(searchTerm, searchTerm, searchTerm, searchTerm);

  return [...users, ...communities];
}

function getOrCreateDirectThread(userIds) {
  const [firstUserId, secondUserId] = normalizeUserIds(userIds);
  const directKey = `${firstUserId}:${secondUserId}`;

  const existingThread = db
    .prepare(`SELECT * FROM threads WHERE direct_key = ?`)
    .get(directKey);

  if (existingThread) return serializeThread(existingThread);

  const transaction = db.transaction(() => {
    const result = db
      .prepare(`INSERT INTO threads (thread_type, direct_key) VALUES ('direct', ?)`)
      .run(directKey);

    const threadId = result.lastInsertRowid;

    db.prepare(
      `INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`
    ).run(threadId, firstUserId);

    db.prepare(
      `INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`
    ).run(threadId, secondUserId);

    return threadId;
  });

  return serializeThread(
    db.prepare(`SELECT * FROM threads WHERE id = ?`).get(transaction())
  );
}

function getThreadById(threadId) {
  const thread = db.prepare(`SELECT * FROM threads WHERE id = ?`).get(threadId);
  return serializeThread(thread);
}

function createGroupThread(userIds, groupName = null) {
  const uniqueUsers = [
    ...new Set(userIds.map((id) => String(id).trim()).filter(Boolean)),
  ];

  if (uniqueUsers.length < 2) {
    throw new Error("Group thread needs at least 2 participants.");
  }

  const transaction = db.transaction(() => {
    const result = db
      .prepare(`INSERT INTO threads (thread_type, name) VALUES ('group', ?)`)
      .run(groupName);

    const threadId = result.lastInsertRowid;

    for (const userId of uniqueUsers) {
      db.prepare(
        `INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`
      ).run(threadId, userId);
    }

    return threadId;
  });

  return getThreadById(transaction());
}

function isBlocked(userId, otherUserId) {
  const row = db
    .prepare(
      `
      SELECT 1 FROM blocks
      WHERE (blocker_id = ? AND blocked_id = ?)
         OR (blocker_id = ? AND blocked_id = ?)
    `
    )
    .get(userId, otherUserId, otherUserId, userId);

  return !!row;
}

function isBlockedByAny(userId, threadId) {
  const participants = db
    .prepare(
      `SELECT user_id FROM thread_participants WHERE thread_id = ? AND user_id != ?`
    )
    .all(threadId, userId);

  for (const participant of participants) {
    if (isBlocked(userId, participant.user_id)) return true;
  }

  return false;
}

function insertMessage(
  threadId,
  senderId,
  content,
  mediaUrl = null,
  mediaType = null
) {
  const trimmedContent = String(content ?? "").trim();

  if (!trimmedContent && !mediaUrl) {
    throw new Error("Message must contain text or media.");
  }

  if (isBlockedByAny(senderId, threadId)) {
    throw new Error(
      "Message blocked: You cannot exchange messages with this user."
    );
  }

  const result = db
    .prepare(
      `
      INSERT INTO messages (thread_id, sender_id, content, media_url, media_type)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .run(
      threadId,
      String(senderId).trim(),
      trimmedContent || null,
      mediaUrl,
      mediaType
    );

  return serializeMessage(
    db.prepare(`SELECT * FROM messages WHERE id = ?`).get(result.lastInsertRowid)
  );
}

function getMessagesForThread(threadId, afterMessageId = 0) {
  const messages = db
    .prepare(
      `
      SELECT *
      FROM messages
      WHERE thread_id = ? AND id > ?
      ORDER BY id ASC
    `
    )
    .all(threadId, afterMessageId);

  return messages.map(serializeMessage);
}

function getUserInbox(userId) {
  return db
    .prepare(
      `
      SELECT
        t.id as threadId,
        t.thread_type as threadType,
        CASE
          WHEN t.name IS NOT NULL THEN t.name
          ELSE (
            SELECT GROUP_CONCAT(user_id, ', ')
            FROM thread_participants
            WHERE thread_id = t.id AND user_id != ?
          )
        END as targetUser,
        (SELECT content FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessage,
        (SELECT created_at FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessageAt
      FROM threads t
      WHERE t.id IN (
        SELECT thread_id
        FROM thread_participants
        WHERE user_id = ?
      )
      ORDER BY datetime(COALESCE(lastMessageAt, t.updated_at)) DESC
    `
    )
    .all(String(userId), String(userId));
}

function addParticipant(threadId, userId) {
  db.prepare(
    `
    INSERT OR IGNORE INTO thread_participants (thread_id, user_id)
    VALUES (?, ?)
  `
  ).run(threadId, String(userId).trim());
}

function removeParticipant(threadId, userId) {
  db.prepare(
    `DELETE FROM thread_participants WHERE thread_id = ? AND user_id = ?`
  ).run(threadId, String(userId).trim());
}

function deleteThread(threadId) {
  db.prepare("DELETE FROM threads WHERE id = ?").run(threadId);
}

function deleteMessage(messageId) {
  db.prepare("DELETE FROM messages WHERE id = ?").run(messageId);
}

function updateThreadName(threadId, newName) {
  db.prepare(
    "UPDATE threads SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(newName, threadId);

  return getThreadById(threadId);
}

function blockUser(blockerId, blockedId) {
  db.prepare(
    `INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)`
  ).run(String(blockerId).trim(), String(blockedId).trim());
}

function unblockUser(blockerId, blockedId) {
  db.prepare(`DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`).run(
    String(blockerId).trim(),
    String(blockedId).trim()
  );
}

function getBlockedUsers(userId) {
  return db
    .prepare(`SELECT blocked_id FROM blocks WHERE blocker_id = ?`)
    .all(String(userId).trim())
    .map((row) => row.blocked_id);
}

function interactWithPost(postId, userId, type, content = null) {
  if (type === "like") {
    const existing = db
      .prepare(
        `
        SELECT id
        FROM interactions
        WHERE postId = ? AND userId = ? AND type = 'like'
      `
      )
      .get(postId, userId);

    if (existing) {
      db.prepare(`DELETE FROM interactions WHERE id = ?`).run(existing.id);
      return { liked: false };
    }
  }

  const result = db
    .prepare(
      `
      INSERT INTO interactions (postId, userId, type, content)
      VALUES (?, ?, ?, ?)
    `
    )
    .run(postId, userId, type, content);

  return {
    interaction: {
      id: result.lastInsertRowid,
      postId,
      userId,
      type,
      content,
    },
    liked: type === "like",
  };
}

function getPostById(postId, viewerId = 0) {
  const post = db
    .prepare(
      `
      SELECT p.*, u.username, u.displayName, u.profileImage,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND userId = ? AND type = 'like') as isLiked
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.id = ?
    `
    )
    .get(viewerId, postId);

  if (!post) return null;

  const interactions = db
    .prepare(
      `
      SELECT i.*, u.username, u.displayName, u.profileImage
      FROM interactions i
      JOIN users u ON i.userId = u.id
      WHERE i.postId = ?
      ORDER BY i.createdAt DESC
    `
    )
    .all(postId);

  return { post, interactions };
}

function deletePost(postId) {
  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM interactions WHERE postId = ?").run(postId);
    db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
  });

  transaction();
}

function getFeedForUser(userId) {
  const following = db
    .prepare(`SELECT followingId FROM followers WHERE followerId = ?`)
    .all(userId);

  const followingIds = following.map((follow) => follow.followingId);
  followingIds.push(userId);

  const placeholders = followingIds.map(() => "?").join(",");

  return db
    .prepare(
      `
      SELECT
        p.id,
        p.authorId,
        p.content,
        p.imageUrl,
        p.videoUrl,
        p.createdAt,
        p.communityId,
        p.postType,
        u.username,
        u.displayName,
        u.profileImage,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND userId = ? AND type = 'like') as isLiked
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.authorId IN (${placeholders})
        AND p.communityId IS NULL
      ORDER BY datetime(p.createdAt) DESC
      LIMIT 50
    `
    )
    .all(userId, ...followingIds);
}

function getAllPosts() {
  return db
    .prepare(
      `
      SELECT p.*, u.username, u.displayName, u.profileImage,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
        0 as isLiked
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.communityId IS NULL
      ORDER BY datetime(p.createdAt) DESC
      LIMIT 50
    `
    )
    .all();
}

function getRecentPosts() {
  return db
    .prepare(
      `
      SELECT p.*, u.username, u.displayName, u.profileImage
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.communityId IS NULL
      ORDER BY datetime(p.createdAt) DESC
      LIMIT 50
    `
    )
    .all();
}

function getAllCommunities() {
  return db
    .prepare(
      `
      SELECT c.*,
        (SELECT COUNT(*) FROM community_members WHERE communityId = c.id) as memberCount
      FROM communities c
      ORDER BY c.name
    `
    )
    .all();
}

function getCommunityMembership(communityId, userId) {
  return db
    .prepare(
      `
      SELECT communityId, userId, role, createdAt
      FROM community_members
      WHERE communityId = ? AND userId = ?
    `
    )
    .get(communityId, userId);
}

function isCommunityMember(communityId, userId) {
  return !!getCommunityMembership(communityId, userId);
}

function isCommunityAdmin(communityId, userId) {
  const membership = getCommunityMembership(communityId, userId);
  return membership?.role === "admin";
}

function requireCommunityAdmin(communityId, userId) {
  if (!isCommunityAdmin(communityId, userId)) {
    const error = new Error("Only community admins can do this.");
    error.statusCode = 403;
    throw error;
  }
}

function getActiveCommunityBan(communityId, userId) {
  return db
    .prepare(
      `
      SELECT *
      FROM community_bans
      WHERE communityId = ?
        AND userId = ?
        AND datetime(bannedUntil) > datetime('now')
      ORDER BY datetime(bannedUntil) DESC
      LIMIT 1
    `
    )
    .get(communityId, userId);
}

function getCommunityMembers(communityId) {
  return db
    .prepare(
      `
      SELECT
        cm.communityId,
        cm.userId,
        cm.role,
        cm.createdAt,
        u.username,
        u.displayName,
        u.profileImage
      FROM community_members cm
      JOIN users u ON cm.userId = u.id
      WHERE cm.communityId = ?
      ORDER BY
        CASE WHEN cm.role = 'admin' THEN 0 ELSE 1 END,
        COALESCE(u.displayName, u.username),
        u.username
    `
    )
    .all(communityId);
}

function promoteCommunityMemberToAdmin(communityId, targetUserId, adminUserId) {
  requireCommunityAdmin(communityId, adminUserId);

  const membership = getCommunityMembership(communityId, targetUserId);

  if (!membership) {
    const error = new Error("User must join the community before becoming an admin.");
    error.statusCode = 400;
    throw error;
  }

  db.prepare(
    `
    UPDATE community_members
    SET role = 'admin'
    WHERE communityId = ? AND userId = ?
  `
  ).run(communityId, targetUserId);

  return getCommunityMembership(communityId, targetUserId);
}

function banCommunityMember(
  communityId,
  targetUserId,
  adminUserId,
  durationMinutes = 10,
  reason = null
) {
  requireCommunityAdmin(communityId, adminUserId);

  const targetMembership = getCommunityMembership(communityId, targetUserId);

  if (!targetMembership) {
    const error = new Error("User must be a community member before they can be banned.");
    error.statusCode = 400;
    throw error;
  }

  if (targetMembership.role === "admin") {
    const error = new Error("Community admins cannot temporarily ban other admins.");
    error.statusCode = 400;
    throw error;
  }

  const duration = Math.min(Math.max(parseInt(durationMinutes, 10) || 10, 1), 10);
  const bannedUntil = new Date(Date.now() + duration * 60 * 1000).toISOString();

  const result = db
    .prepare(
      `
      INSERT INTO community_bans (communityId, userId, bannedBy, reason, bannedUntil)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .run(communityId, targetUserId, adminUserId, reason, bannedUntil);

  return db
    .prepare(`SELECT * FROM community_bans WHERE id = ?`)
    .get(result.lastInsertRowid);
}

function getCommunityById(id, userId = null) {
  const community = db
    .prepare(
      `
      SELECT c.*,
        (SELECT COUNT(*) FROM community_members WHERE communityId = c.id) as memberCount
      FROM communities c
      WHERE c.id = ?
    `
    )
    .get(id);

  if (community && userId) {
    const membership = getCommunityMembership(id, userId);
    const activeBan = getActiveCommunityBan(id, userId);

    community.isMember = !!membership;
    community.memberRole = membership?.role || null;
    community.isAdmin = membership?.role === "admin";
    community.isPostBanned = !!activeBan;
    community.activeBan = activeBan || null;
  }

  return community;
}

function joinCommunity(communityId, userId) {
  db.prepare(
    `
    INSERT OR IGNORE INTO community_members (communityId, userId, role)
    VALUES (?, ?, 'member')
  `
  ).run(communityId, userId);

  return getCommunityMembership(communityId, userId);
}

function leaveCommunity(communityId, userId) {
  db.prepare(
    `DELETE FROM community_members WHERE communityId = ? AND userId = ?`
  ).run(communityId, userId);
}

function getCommunitiesByUserId(userId) {
  return db
    .prepare(
      `
      SELECT c.*,
        cm.role as memberRole,
        (cm.role = 'admin') as isAdmin,
        (SELECT COUNT(*) FROM community_members WHERE communityId = c.id) as memberCount
      FROM communities c
      JOIN community_members cm ON c.id = cm.communityId
      WHERE cm.userId = ?
      ORDER BY c.name
    `
    )
    .all(userId);
}

function createCommunity(name, type, category, description, creatorId) {
  const transaction = db.transaction(() => {
    const result = db
      .prepare(
        `
        INSERT INTO communities (name, type, category, description, creatorId)
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .run(name, type, category, description, creatorId);

    const id = result.lastInsertRowid;

    db.prepare(
      `
      INSERT INTO community_members (communityId, userId, role)
      VALUES (?, ?, 'admin')
    `
    ).run(id, creatorId);

    return id;
  });

  const id = transaction();
  return getCommunityById(id, creatorId);
}

function createPost(
  authorId,
  content,
  imageUrl = null,
  videoUrl = null,
  communityId = null,
  postType = "post"
) {
  const normalizedCommunityId = communityId ? parseInt(communityId, 10) : null;
  const normalizedPostType =
    postType === "announcement" ? "announcement" : "post";

  if (normalizedCommunityId) {
    const membership = getCommunityMembership(normalizedCommunityId, authorId);

    if (!membership) {
      const error = new Error("You must join this community before posting.");
      error.statusCode = 403;
      throw error;
    }

    if (normalizedPostType === "announcement" && membership.role !== "admin") {
      const error = new Error("Only community admins can create announcements.");
      error.statusCode = 403;
      throw error;
    }

    const activeBan = getActiveCommunityBan(normalizedCommunityId, authorId);

    if (activeBan && membership.role !== "admin") {
      const error = new Error(
        "You are temporarily banned from posting in this community."
      );
      error.statusCode = 403;
      error.ban = activeBan;
      throw error;
    }
  }

  const info = db
    .prepare(
      `
      INSERT INTO posts (authorId, content, imageUrl, videoUrl, communityId, postType)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    )
    .run(
      authorId,
      content,
      imageUrl,
      videoUrl,
      normalizedCommunityId,
      normalizedPostType
    );

  return db
    .prepare(
      `
      SELECT p.*, u.username, u.displayName, u.profileImage
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.id = ?
    `
    )
    .get(info.lastInsertRowid);
}

function getCommunityFeed(communityId, viewerId) {
  if (!isCommunityMember(communityId, viewerId)) {
    const error = new Error("You must join this community to view its feed.");
    error.statusCode = 403;
    throw error;
  }

  return db
    .prepare(
      `
      SELECT
        p.id,
        p.authorId,
        p.content,
        p.imageUrl,
        p.videoUrl,
        p.createdAt,
        p.communityId,
        p.postType,
        u.username,
        u.displayName,
        u.profileImage,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
        (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND userId = ? AND type = 'like') as isLiked
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.communityId = ?
      ORDER BY
        CASE WHEN p.postType = 'announcement' THEN 0 ELSE 1 END,
        datetime(p.createdAt) DESC
      LIMIT 100
    `
    )
    .all(viewerId, communityId);
}

function deleteCommunityPost(postId, adminUserId) {
  const postData = getPostById(postId);

  if (!postData) {
    const error = new Error("Post not found.");
    error.statusCode = 404;
    throw error;
  }

  const post = postData.post;

  if (!post.communityId) {
    const error = new Error("This is not a community post.");
    error.statusCode = 400;
    throw error;
  }

  requireCommunityAdmin(post.communityId, adminUserId);
  deletePost(postId);

  return { success: true };
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
  deleteCommunityPost,
  interactWithPost,
  getPostById,
  getFeedForUser,
  getPostsByUserId,
  getRecentPosts,
  getAllPosts,
  getCommunityFeed,

  getAllUsers,
  getUserById,
  getSafeUserById,
  getUserByUsername,
  createUser,
  updateUserPassword,
  updateUser,
  updateUserProfileImage,
  toggleFollow,
  requestOrFollowUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
  getIncomingFollowRequests,
  respondToFollowRequest,
  getUserProfileForViewer,
  searchUsersAndCommunities,

  getAllCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getCommunitiesByUserId,
  createCommunity,
  getCommunityMembership,
  getCommunityMembers,
  isCommunityMember,
  isCommunityAdmin,
  requireCommunityAdmin,
  getActiveCommunityBan,
  promoteCommunityMemberToAdmin,
  banCommunityMember,

  serializeThread,
  normalizeUserIds,
};