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
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
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

  try {
    const columns = db.pragma("table_info(users)");
    const columnNames = columns.map((col) => col.name);

    const missingColumns = [];
    if (!columnNames.includes("password"))
      missingColumns.push("ALTER TABLE users ADD COLUMN password TEXT");
    if (!columnNames.includes("email"))
      missingColumns.push("ALTER TABLE users ADD COLUMN email TEXT UNIQUE");
    if (!columnNames.includes("securityQuestion"))
      missingColumns.push("ALTER TABLE users ADD COLUMN securityQuestion TEXT");
    if (!columnNames.includes("securityQA"))
      missingColumns.push("ALTER TABLE users ADD COLUMN securityQA TEXT");

    missingColumns.forEach((migration) => {
      try {
        db.exec(migration);
        console.log("Migration applied:", migration);
      } catch (e) {
        console.log("Migration already applied or skipped:", migration);
      }
    });
  } catch (e) {
    console.log("Migration check error:", e.message);
  }

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

  addColumnIfMissing(db, "posts", "communityId", "INTEGER");
  addColumnIfMissing(db, "posts", "postType", "TEXT DEFAULT 'post'");

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
  `);

  const testUsers = [
    { username: "james", displayName: "James Tedder", email: "james.tedder@maine.edu", password: "password123", role: "Student" },
    { username: "gage", displayName: "Gage", email: "gage@maine.edu", password: "password123", role: "Student" },
    { username: "courtney", displayName: "Courtney", email: "courtney@maine.edu", password: "password123", role: "Student" },
    { username: "esther", displayName: "Esther Greene", email: "esther.greene@maine.edu", password: "password123", role: "Student" },
    { username: "janedoe", displayName: "Jane Doe", email: "jane.doe@maine.edu", password: "password123", role: "Faculty" },
    { username: "bobsmith", displayName: "Bob Smith", email: "bob.smith@alumni.maine.edu", password: "password123", role: "Alumni" },
  ];

  testUsers.forEach((user) => {
    try {
      db.prepare(
        `
        INSERT INTO users (username, displayName, email, password, role) VALUES (?, ?, ?, ?, ?)
      `,
      ).run(user.username, user.displayName, user.email, user.password, user.role);
    } catch (e) {
      // User already exists
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
        description: "A supportive space for USM students interested in technology and computing.",
      },
      {
        name: "Software Engineering",
        type: "Course",
        category: "Class",
        description: "A course community for USM Software Engineering students to collaborate and discuss projects.",
      },
      {
        name: "Campus Hiking Club",
        type: "Club",
        category: "Social",
        description: "Explore the outdoors with fellow USM students.",
      },
      {
        name: "Chess Society",
        type: "Club",
        category: "Social",
        description: "Strategic matches and tournaments for all levels.",
      },
    ];

    const insert = db.prepare(
      "INSERT INTO communities (name, type, category, description) VALUES (?, ?, ?, ?)",
    );

    initialCommunities.forEach((c) => {
      insert.run(c.name, c.type, c.category, c.description);
    });
  }

  // Seed test posts if none exist
  const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get().count;
  if (postCount === 0) {
    const users = db.prepare("SELECT id, username FROM users").all();
    const insertPost = db.prepare("INSERT INTO posts (authorId, content, createdAt) VALUES (?, ?, ?)");

    const usmPostsPool = [
      "Just grabbed a coffee at the Portland campus. Ready for my 9 AM! ☕",
      "Who's going to the Huskies game this weekend? Let's go USM! 🐾",
      "Study session at Glickman Library later today. Join me on the 4th floor! 📚",
      "The Gorham campus is looking beautiful this autumn. #USMLife",
      "Can anyone recommend a good elective for next semester? Thinking about something in the Arts.",
      "Excited to join the Women in Computing club meeting tonight! 💻",
      "Does anyone know if the Husky Bus from Portland to Gorham is running on time today? 🚌",
      "Just finished my Software Engineering project. Feeling accomplished! #CS",
      "Looking for teammates for the USM intramural soccer league. DM me! ⚽",
      "First day at the University of Southern Maine! So happy to be a Husky.",
      "The view of the White Mountains from the Gorham campus today is incredible. 🏔️",
      "Heading to the Costello Sports Complex for a quick workout. Huskies stay fit! 💪",
      "Thinking of checking out the art exhibit in the Woodbury Campus Center.",
      "Is the McGoldrick Center open for late-night study sessions this week?",
      "Portland campus parking is a struggle this morning. Start early, everyone! 🚗",
      "Great lecture today on cybersecurity. USM faculty are really top-notch.",
      "Does anyone have the notes from Bio 101 last Friday? I was out sick. 🤒",
      "The Portland Commons is finally feeling like home. Loving the new dorms!",
      "If you haven't checked out the Glickman Library special collections, you're missing out!",
      "Who wants to start a weekly board game night at the Brooks Student Center? 🎲",
      "Just finished a great workout at the Sullivan Gym. Feeling energized!",
      "Attending the USM Career Fair today. So many great Maine companies here.",
      "First snowfall in Gorham! Be careful on the roads, fellow Huskies. ❄️",
      "Can't believe I'm graduating from USM this year. It's been an amazing journey.",
      "Thinking of joining the Student Government Association. Anyone have experience?",
      "The pizza at the Gorham dining hall is actually pretty good today. 🍕",
      "Anyone want to go for a run on the trails behind the Gorham campus?",
      "Portland vs. Gorham—which campus has the better vibes? Discuss!",
      "Huskies win! 🐾 What a great game against UMaine tonight.",
      "Looking for a used copy of the Chemistry 102 textbook. USM Bookstore is pricey!",
      "I love that we have a dedicated Makerspace on campus. Testing out the 3D printers today.",
      "Anyone in the Nursing program? Looking for some study tips for clinicals.",
      "Found a lost set of keys near the Portland skywalk. Turning them into campus safety.",
      "Can't wait for the Spring Fling event! USM knows how to throw a party.",
      "Is anyone doing the exchange program next semester? Thinking about Ireland.",
      "The new Osher Map Library exhibit is fantastic. Highly recommend a visit.",
      "Anyone else having trouble with the USM WiFi in the science building?",
      "Just joined the USM Hiking Club. Katahdin here we come! 🥾",
      "Why is the Portland campus always so windy? 💨 Stay warm, everyone!",
      "Shoutout to the USM Writing Center for helping me with my capstone draft.",
      "Is the gym open on holiday Mondays? Need to keep the routine going.",
      "Anyone want to grab a bite at the Great Lost Bear after class in Portland? 🍔",
      "USM Huskies pride! Just got my new hoodie from the campus shop.",
      "Does the library have any private study rooms available for booking tonight?",
      "Thinking of starting a USM Chess Society. Any grandmasters out there?",
      "Just saw a beautiful sunset from the top floor of Glickman. Love this city.",
      "Working on my thesis in the Lewiston-Auburn campus library. Very quiet here!",
      "How do I apply for the USM Foundation scholarships? Deadline is coming up.",
      "Met some great alumni at the networking event tonight. USM family is strong.",
      "The USM music department is having a concert tonight. Let's support our peers! 🎺",
      "Taking my first class at the L.A. campus next week. Any tips for the commute?",
      "I wish the Portland campus had more green space, but I love being in the city.",
      "Gorham Husky here! Looking for Portland campus friends for lunch next Tuesday.",
      "Who's excited for the USM theatre department's new play? Tickets are on sale.",
      "Does USM have a photography club? I've been taking some shots around Casco Bay.",
      "Need a tutor for Calculus II. Math is not my friend this semester. 📐",
      "Just walked the Maine narrow gauge railroad trail. Beautiful afternoon in Portland.",
      "USM Spartans... no wait, Huskies! Old habits from my previous school die hard.",
      "The Glickman Library is the best place for serious focus. Headphones on, world off.",
      "What's your favorite local spot to eat near the USM Portland campus? 🥪"
    ];

    users.forEach((user, userIdx) => {
      for (let i = 0; i < 10; i++) {
        const postContent = usmPostsPool[(userIdx * 10 + i) % usmPostsPool.length];
        // Intermingle posts by spacing out timestamps based on user and post index.
        // This ensures that when sorted by date, users appear interleaved in the feed.
        const minutesAgo = (i * 30) + (userIdx * 5);
        const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
        insertPost.run(user.id, postContent, timestamp);
      }
    });
  }

  // Seed community memberships if none exist
  const memberCount = db.prepare("SELECT COUNT(*) as count FROM community_members").get().count;
  if (memberCount === 0) {
    const users = db.prepare("SELECT id, username FROM users").all();
    const comms = db.prepare("SELECT id, name FROM communities").all();
    
    const james = users.find(u => u.username === 'james');
    const esther = users.find(u => u.username === 'esther');
    const gage = users.find(u => u.username === 'gage');
    const jane = users.find(u => u.username === 'janedoe');
    const courtney = users.find(u => u.username === 'courtney');
    const bob = users.find(u => u.username === 'bobsmith');

    const wic = comms.find(c => c.name === 'Women in Computing');
    const swe = comms.find(c => c.name === 'Software Engineering');
    const hike = comms.find(c => c.name === 'Campus Hiking Club');
    const chess = comms.find(c => c.name === 'Chess Society');

    const insertMember = db.prepare("INSERT INTO community_members (communityId, userId, role) VALUES (?, ?, ?)");

    if (esther && wic) insertMember.run(wic.id, esther.id, 'admin');
    if (courtney && wic) insertMember.run(wic.id, courtney.id, 'member');
    if (james && swe) insertMember.run(swe.id, james.id, 'member');
    if (gage && swe) insertMember.run(swe.id, gage.id, 'member');
    if (jane && swe) insertMember.run(swe.id, jane.id, 'admin');
    if (gage && hike) insertMember.run(hike.id, gage.id, 'member');
    if (bob && hike) insertMember.run(hike.id, bob.id, 'member');
    if (james && chess) insertMember.run(chess.id, james.id, 'member');
    if (bob && chess) insertMember.run(chess.id, bob.id, 'member');
  }

  return db;
}

const db = initializeDatabase();

function normalizeUserIds(input) {
  const userIds = Array.isArray(input) ? input : [];
  const filtered = userIds
    .map((userId) => String(userId).trim())
    .filter(Boolean);
  const unique = [...new Set(filtered)];

  if (unique.length !== 2) {
    const error = new Error(
      "A direct thread requires exactly two unique participant IDs.",
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
      `SELECT user_id FROM thread_participants WHERE thread_id = ? ORDER BY user_id ASC`,
    )
    .all(thread.id)
    .map((row) => row.user_id);

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

  const existingThread = db
    .prepare(`SELECT * FROM threads WHERE direct_key = ?`)
    .get(directKey);

  if (existingThread) return serializeThread(existingThread);

  const transaction = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO threads (thread_type, direct_key) VALUES ('direct', ?)`,
      )
      .run(directKey);

    const threadId = result.lastInsertRowid;

    db.prepare(
      `INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`,
    ).run(threadId, firstUserId);

    db.prepare(
      `INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`,
    ).run(threadId, secondUserId);

    return threadId;
  });

  return serializeThread(
    db.prepare(`SELECT * FROM threads WHERE id = ?`).get(transaction()),
  );
}

function getAllUsers() {
  return db
    .prepare(
      `
    SELECT id, username, displayName, bio, profileImage,
      (SELECT COUNT(*) FROM followers WHERE followingId = users.id) as followerCount,
      (SELECT COUNT(*) FROM followers WHERE followerId = users.id) as followingCount
    FROM users
    ORDER BY displayName
  `,
    )
    .all();
}

function getUserById(userId) {
  return db
    .prepare(
      `
    SELECT id, username, displayName, bio, profileImage, role, pronouns, major, gradYear, degree, department, officeHours, employer, jobTitle, moderationLevel, interests, createdAt, securityQuestion, securityQA,
      (SELECT COUNT(*) FROM followers WHERE followingId = ?) as followerCount,
      (SELECT COUNT(*) FROM followers WHERE followerId = ?) as followingCount
    FROM users
    WHERE id = ?
  `,
    )
    .get(userId, userId, userId);
}

function updateUser(userId, data) {
  const {
    displayName,
    bio,
    pronouns,
    major,
    gradYear,
    degree,
    department,
    officeHours,
    employer,
    jobTitle,
    moderationLevel,
    interests,
    role,
  } = data;

  db.prepare(
    `
    UPDATE users SET 
      displayName = ?, bio = ?, pronouns = ?, major = ?, gradYear = ?, 
      degree = ?, department = ?, officeHours = ?, employer = ?, 
      jobTitle = ?, moderationLevel = ?, interests = ?, role = ?
    WHERE id = ?
  `,
  ).run(
    displayName,
    bio,
    pronouns,
    major,
    gradYear,
    degree,
    department,
    officeHours,
    employer,
    jobTitle,
    moderationLevel,
    interests,
    role,
    userId,
  );

  return getUserById(userId);
}

function createUser(
  username,
  email,
  password,
  role = "Student",
  securityQuestion = null,
  securityAnswer = null,
) {
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, role, securityQuestion, securityQA, displayName)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    username,
    email,
    password,
    role,
    securityQuestion,
    securityAnswer,
    username,
  );

  return getUserById(result.lastInsertRowid);
}

function getUserByUsername(username) {
  return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
}

function updateUserPassword(userId, newPassword) {
  return db
    .prepare("UPDATE users SET password = ? WHERE id = ?")
    .run(newPassword, userId);
}

function toggleFollow(followerId, followingId) {
  const existing = db
    .prepare(
      `
    SELECT id FROM followers WHERE followerId = ? AND followingId = ?
  `,
    )
    .get(followerId, followingId);

  if (existing) {
    db.prepare(`DELETE FROM followers WHERE id = ?`).run(existing.id);
    return { following: false };
  }

  db.prepare(
    `INSERT INTO followers (followerId, followingId) VALUES (?, ?)`,
  ).run(followerId, followingId);

  return { following: true };
}

function getFollowers(userId) {
  return db
    .prepare(
      `
    SELECT u.id, u.username, u.displayName, u.profileImage
    FROM followers f
    JOIN users u ON f.followerId = u.id
    WHERE f.followingId = ? ORDER BY f.createdAt DESC
  `,
    )
    .all(userId);
}

function getFollowing(userId) {
  return db
    .prepare(
      `
    SELECT u.id, u.username, u.displayName, u.profileImage
    FROM followers f
    JOIN users u ON f.followingId = u.id
    WHERE f.followerId = ? ORDER BY f.createdAt DESC
  `,
    )
    .all(userId);
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
        `INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`,
      ).run(threadId, userId);
    }

    return threadId;
  });

  return getThreadById(transaction());
}

function insertMessage(
  threadId,
  senderId,
  content,
  mediaUrl = null,
  mediaType = null,
) {
  const trimmedContent = String(content ?? "").trim();

  if (!trimmedContent && !mediaUrl) {
    throw new Error("Message must contain text or media.");
  }

  if (isBlockedByAny(senderId, threadId)) {
    throw new Error(
      "Message blocked: You cannot exchange messages with this user.",
    );
  }

  const result = db
    .prepare(
      `INSERT INTO messages (thread_id, sender_id, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      threadId,
      String(senderId).trim(),
      trimmedContent || null,
      mediaUrl,
      mediaType,
    );

  return serializeMessage(
    db
      .prepare(`SELECT * FROM messages WHERE id = ?`)
      .get(result.lastInsertRowid),
  );
}

function interactWithPost(postId, userId, type, content = null) {
  if (type === "like") {
    const existing = db
      .prepare(
        `SELECT id FROM interactions WHERE postId = ? AND userId = ? AND type = 'like'`,
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
    INSERT INTO interactions (postId, userId, type, content) VALUES (?, ?, ?, ?)
  `,
    )
    .run(postId, userId, type, content);

  return {
    interaction: { id: result.lastInsertRowid, postId, userId, type, content },
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
  `,
    )
    .get(viewerId, postId);

  if (!post) return null;

  const interactions = db
    .prepare(
      `
    SELECT i.*, u.username, u.displayName, u.profileImage
    FROM interactions i
    JOIN users u ON i.userId = u.id
    WHERE i.postId = ? ORDER BY i.createdAt DESC
  `,
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
    .prepare(
      `
    SELECT followingId FROM followers WHERE followerId = ?
  `,
    )
    .all(userId);

  const followingIds = following.map((f) => f.followingId);
  followingIds.push(userId);

  const placeholders = followingIds.map(() => "?").join(",");

  return db
    .prepare(
      `
    SELECT 
      p.id, p.authorId, p.content, p.imageUrl, p.videoUrl, p.createdAt, p.communityId, p.postType,
      u.username, u.displayName, u.profileImage,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likeCount,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as commentCount,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'share') as shareCount,
      (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND userId = ? AND type = 'like') as isLiked
    FROM posts p
    JOIN users u ON p.authorId = u.id
    WHERE p.authorId IN (${placeholders})
      AND p.communityId IS NULL
    ORDER BY p.createdAt DESC
    LIMIT 50
  `,
    )
    .all(userId, ...followingIds);
}

function getPostsByUserId(userId) {
  return db
    .prepare(
      `
    SELECT id, content, imageUrl, videoUrl, createdAt, communityId, postType
    FROM posts
    WHERE authorId = ?
    ORDER BY createdAt DESC
  `,
    )
    .all(userId);
}

function getAllCommunities() {
  return db
    .prepare(
      `
    SELECT c.*, 
      (SELECT COUNT(*) FROM community_members WHERE communityId = c.id) as memberCount
    FROM communities c
    ORDER BY c.name
  `,
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
  `,
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
  `,
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
  `,
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
  `,
  ).run(communityId, targetUserId);

  return getCommunityMembership(communityId, targetUserId);
}

function banCommunityMember(
  communityId,
  targetUserId,
  adminUserId,
  durationMinutes = 10,
  reason = null,
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
  `,
    )
    .run(communityId, targetUserId, adminUserId, reason, bannedUntil);

  return db
    .prepare(`SELECT * FROM community_bans WHERE id = ?`)
    .get(result.lastInsertRowid);
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

function getCommunityById(id, userId = null) {
  const community = db
    .prepare(
      `
    SELECT c.*, 
      (SELECT COUNT(*) FROM community_members WHERE communityId = c.id) as memberCount
    FROM communities c
    WHERE c.id = ?
  `,
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
    `INSERT OR IGNORE INTO community_members (communityId, userId, role) VALUES (?, ?, 'member')`,
  ).run(communityId, userId);

  return getCommunityMembership(communityId, userId);
}

function leaveCommunity(communityId, userId) {
  db.prepare(
    `DELETE FROM community_members WHERE communityId = ? AND userId = ?`,
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
  `,
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
    `,
      )
      .run(name, type, category, description, creatorId);

    const id = result.lastInsertRowid;

    db.prepare(
      `INSERT INTO community_members (communityId, userId, role) VALUES (?, ?, 'admin')`,
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
  postType = "post",
) {
  const normalizedCommunityId = communityId ? parseInt(communityId, 10) : null;
  const normalizedPostType = postType === "announcement" ? "announcement" : "post";

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
        "You are temporarily banned from posting in this community.",
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
  `,
    )
    .run(
      authorId,
      content,
      imageUrl,
      videoUrl,
      normalizedCommunityId,
      normalizedPostType,
    );

  return db
    .prepare(
      `
    SELECT p.*, u.username, u.displayName, u.profileImage
    FROM posts p
    JOIN users u ON p.authorId = u.id
    WHERE p.id = ?
  `,
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
      p.id, p.authorId, p.content, p.imageUrl, p.videoUrl, p.createdAt, p.communityId, p.postType,
      u.username, u.displayName, u.profileImage,
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
  `,
    )
    .all(viewerId, communityId);
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
    ORDER BY p.createdAt DESC LIMIT 50
  `,
    )
    .all();
}

function getMessagesForThread(threadId, afterMessageId = 0) {
  const messages = db
    .prepare(
      `
    SELECT * FROM messages 
    WHERE thread_id = ? AND id > ? 
    ORDER BY id ASC
  `,
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
        WHEN t.name IS NOT NULL AND t.name != '' THEN t.name
        ELSE (
          SELECT GROUP_CONCAT(COALESCE(u.displayName, u.username), ', ') 
          FROM thread_participants tp
          JOIN users u ON tp.user_id = u.id
          WHERE tp.thread_id = t.id AND tp.user_id != ?
        )
      END as targetUser,
      (SELECT content FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessage,
      (SELECT created_at FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessageAt
    FROM threads t
    WHERE t.id IN (SELECT thread_id FROM thread_participants WHERE user_id = ?)
    ORDER BY lastMessageAt DESC
  `,
    )
    .all(userId, userId);
}

function addParticipant(threadId, userId) {
  db.prepare(
    `INSERT OR IGNORE INTO thread_participants (thread_id, user_id) VALUES (?, ?)`,
  ).run(threadId, userId);
}

function removeParticipant(threadId, userId) {
  db.prepare(
    `DELETE FROM thread_participants WHERE thread_id = ? AND user_id = ?`,
  ).run(threadId, userId);
}

function deleteThread(threadId) {
  db.prepare("DELETE FROM threads WHERE id = ?").run(threadId);
}

function deleteMessage(messageId) {
  db.prepare("DELETE FROM messages WHERE id = ?").run(messageId);
}

function updateThreadName(threadId, newName) {
  db.prepare(
    "UPDATE threads SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(newName, threadId);

  return getThreadById(threadId);
}

function blockUser(blockerId, blockedId) {
  db.prepare(
    `INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)`,
  ).run(blockerId, blockedId);
}

function unblockUser(blockerId, blockedId) {
  db.prepare(`DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`).run(
    blockerId,
    blockedId,
  );
}

function getBlockedUsers(userId) {
  return db
    .prepare(`SELECT blocked_id FROM blocks WHERE blocker_id = ?`)
    .all(userId)
    .map((r) => r.blocked_id);
}

function isBlocked(userId, otherUserId) {
  const row = db
    .prepare(
      `
    SELECT 1 FROM blocks 
    WHERE (blocker_id = ? AND blocked_id = ?)
       OR (blocker_id = ? AND blocked_id = ?)
  `,
    )
    .get(userId, otherUserId, otherUserId, userId);

  return !!row;
}

function isBlockedByAny(userId, threadId) {
  const participants = db
    .prepare(
      `SELECT user_id FROM thread_participants WHERE thread_id = ? AND user_id != ?`,
    )
    .all(threadId, userId);

  for (const p of participants) {
    if (isBlocked(userId, p.user_id)) return true;
  }

  return false;
}

function getRecentPosts() {
  return db
    .prepare(
      `
    SELECT p.*, u.username, u.displayName 
    FROM posts p 
    JOIN users u ON p.authorId = u.id 
    WHERE p.communityId IS NULL
    ORDER BY p.createdAt DESC 
    LIMIT 50
  `,
    )
    .all();
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
  getUserByUsername,
  createUser,
  updateUserPassword,
  updateUser,
  toggleFollow,
  getFollowers,
  getFollowing,

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