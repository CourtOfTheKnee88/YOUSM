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

function openDatabase() {
	ensureDirectory(dataDir);

	const db = new Database(dbPath);
	db.pragma('foreign_keys = ON');
	db.pragma('journal_mode = WAL');

	db.exec(`
       CREATE TABLE IF NOT EXISTS threads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_type TEXT NOT NULL DEFAULT 'direct',
        direct_key TEXT UNIQUE,
        name TEXT, -- Stores the custom group name
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
			content TEXT, -- Made optional so you can send JUST a photo
			media_url TEXT, -- 🛑 
			media_type TEXT, -- 🛑 ('image' or 'video')
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author_id TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

		CREATE TABLE IF NOT EXISTS blocks (
			blocker_id TEXT NOT NULL,
			blocked_id TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (blocker_id, blocked_id)
	    );
		CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id
			ON thread_participants(user_id);

		CREATE INDEX IF NOT EXISTS idx_messages_thread_id_id
			ON messages(thread_id, id);
	`);

	return db;
}

const db = openDatabase();

function normalizeUserIds(input) {
	const userIds = Array.isArray(input) ? input : [];
	const filtered = userIds
		.map((userId) => String(userId).trim())
		.filter(Boolean);
	const unique = [...new Set(filtered)];

	if (unique.length !== 2) {
		const error = new Error('A direct thread requires exactly two unique participant IDs.');
		error.statusCode = 400;
		throw error;
	}

	return unique.sort();
}

function makeDirectKey(userIds) {
	return normalizeUserIds(userIds).join(':');
}

function serializeThread(thread) {
	if (!thread) {
		return null;
	}

	const participants = db
		.prepare(
			`
				SELECT user_id
				FROM thread_participants
				WHERE thread_id = ?
				ORDER BY user_id ASC
			`
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

function serializeMessage(message) {
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

function getOrCreateDirectThread(userIds) {
	const [firstUserId, secondUserId] = normalizeUserIds(userIds);
	const directKey = `${firstUserId}:${secondUserId}`;

	const existingThread = db
		.prepare(
			`
				SELECT id, thread_type, direct_key, created_at, updated_at
				FROM threads
				WHERE direct_key = ?
			`
		)
		.get(directKey);

	if (existingThread) {
		return serializeThread(existingThread);
	}

	const insertThread = db.prepare(
		`
			INSERT INTO threads (thread_type, direct_key)
			VALUES ('direct', ?)
		`
	);

	const insertParticipant = db.prepare(
		`
			INSERT INTO thread_participants (thread_id, user_id)
			VALUES (?, ?)
		`
	);

	const transaction = db.transaction(() => {
		const result = insertThread.run(directKey);
		insertParticipant.run(result.lastInsertRowid, firstUserId);
		insertParticipant.run(result.lastInsertRowid, secondUserId);
		return result.lastInsertRowid;
	});

	const threadId = transaction();

	const createdThread = db
		.prepare(
			`
				SELECT id, thread_type, direct_key, created_at, updated_at
				FROM threads
				WHERE id = ?
			`
		)
		.get(threadId);

	return serializeThread(createdThread);
}

function getThreadById(threadId) {
	const thread = db
		.prepare(
			`
				SELECT id, thread_type, direct_key, created_at, updated_at
				FROM threads
				WHERE id = ?
			`
		)
		.get(threadId);

	return serializeThread(thread);
}

// 🛑 Add mediaUrl and mediaType with default nulls
function insertMessage(threadId, senderId, content, mediaUrl = null, mediaType = null) {
	const trimmedContent = String(content ?? '').trim();

    // If there is no text AND no media, throw an error
	if (!trimmedContent && !mediaUrl) {
		const error = new Error('Message must contain text or media.');
		error.statusCode = 400;
		throw error;
	}

	const thread = db.prepare(`SELECT id FROM threads WHERE id = ?`).get(threadId);

	if (!thread) {
		const error = new Error('Thread not found.');
		error.statusCode = 404;
		throw error;
	}

    const participants = db.prepare(`
        SELECT user_id FROM thread_participants WHERE thread_id = ? AND user_id != ?
    `).all(threadId, String(senderId).trim());

    for (const participant of participants) {
        if (isBlocked(senderId, participant.user_id)) {
            const error = new Error('Message blocked. You cannot exchange messages with this user.');
            error.statusCode = 403; 
            throw error;
        }
    }

    // 🛑 UPDATE THE SQL TO INCLUDE THE NEW COLUMNS
	const result = db
		.prepare(
			`
				INSERT INTO messages (thread_id, sender_id, content, media_url, media_type)
				VALUES (?, ?, ?, ?, ?)
			`
		)
		.run(threadId, String(senderId).trim(), trimmedContent || null, mediaUrl, mediaType);

    const newMsg = db
        .prepare(`SELECT * FROM messages WHERE id = ?`)
        .get(result.lastInsertRowid);
        
    return serializeMessage(newMsg);
}

function getMessagesForThread(threadId, afterMessageId = 0) {
	const messages = db
		.prepare(
			`
				SELECT id, thread_id, sender_id, content, media_url, media_type, created_at
				FROM messages
				WHERE thread_id = ? AND id > ?
				ORDER BY id ASC
			`
		)
		.all(threadId, afterMessageId);

	return messages.map(serializeMessage);
}

function pingDatabase() {
	return db.prepare('SELECT 1 AS ok').get().ok === 1;
}

function createPost(authorId, content) {
    const stmt = db.prepare(`
        INSERT INTO posts (author_id, content)
        VALUES (?, ?)
    `);
    const info = stmt.run(authorId, content);
    
    // Return the newly created post
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
}

function getRecentPosts() {
    // Get the 50 newest posts, ordering by the timestamp
    const stmt = db.prepare(`
        SELECT * FROM posts 
        ORDER BY created_at DESC 
        LIMIT 50
    `);
    return stmt.all();
}

function getUserInbox(userId) {
    const stmt = db.prepare(`
        SELECT 
            t.id as threadId,
            t.thread_type as threadType,
            CASE 
                WHEN t.name IS NOT NULL THEN t.name
                WHEN t.thread_type = 'group' THEN 
                    (SELECT GROUP_CONCAT(user_id, ', ') FROM thread_participants WHERE thread_id = t.id AND user_id != ?)
                ELSE 
                    (SELECT user_id FROM thread_participants WHERE thread_id = t.id AND user_id != ? LIMIT 1)
            END as targetUser,
            (SELECT content FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessage,
            (SELECT created_at FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessageAt
        FROM threads t
        WHERE t.id IN (SELECT thread_id FROM thread_participants WHERE user_id = ?)
        
        -- Frontend Filter (Hides threads involving blocked users)
        AND NOT EXISTS (
            SELECT 1 
            FROM thread_participants tp
            JOIN blocks b ON (
                (b.blocker_id = ? AND b.blocked_id = tp.user_id) OR 
                (b.blocker_id = tp.user_id AND b.blocked_id = ?)
            )
            WHERE tp.thread_id = t.id AND tp.user_id != ?
        )
        
        ORDER BY lastMessageAt DESC
    `);
    
    // Because we added 3 more '?' placeholders in the NOT EXISTS block, 
    // we now have to pass userId exactly 6 times!
    return stmt.all(userId, userId, userId, userId, userId, userId);
}

function createGroupThread(userIds, groupName = null) {
    const uniqueUsers = [...new Set(userIds.map(id => String(id).trim()).filter(Boolean))];

    if (uniqueUsers.length < 3) {
        const error = new Error('A group thread requires at least 3 unique participants.');
        error.statusCode = 400;
        throw error;
    }

    const insertThread = db.prepare(`
        INSERT INTO threads (thread_type, direct_key, name)
        VALUES ('group', NULL, ?)
    `);

    const insertParticipant = db.prepare(`INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?)`);

    const transaction = db.transaction(() => {
        const result = insertThread.run(groupName); // 🛑 Save the name
        const threadId = result.lastInsertRowid;
        for (const userId of uniqueUsers) {
            insertParticipant.run(threadId, userId);
        }
        return threadId;
    });

    const threadId = transaction();
    return getThreadById(threadId);
}


function removeParticipant(threadId, userId) {
    db.prepare(`
        DELETE FROM thread_participants 
        WHERE thread_id = ? AND user_id = ?
    `).run(threadId, userId);
}

function addParticipant(threadId, userId) {
    db.prepare(`
        INSERT OR IGNORE INTO thread_participants (thread_id, user_id)
        VALUES (?, ?)
    `).run(threadId, userId);
}

function deleteThread(threadId) {
    db.prepare('DELETE FROM threads WHERE id = ?').run(threadId);
}

function deleteMessage(messageId) {
    db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
}

function updateThreadName(threadId, newName) {
    const trimmedName = String(newName ?? '').trim();
    if (!trimmedName) {
        const error = new Error('Thread name cannot be empty.');
        error.statusCode = 400;
        throw error;
    }

    db.prepare('UPDATE threads SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(trimmedName, threadId);
    
    return getThreadById(threadId);
}

function blockUser(blockerId, blockedId) {
    db.prepare(`
        INSERT OR IGNORE INTO blocks (blocker_id, blocked_id)
        VALUES (?, ?)
    `).run(blockerId, blockedId);
}

function unblockUser(blockerId, blockedId) {
    db.prepare(`
        DELETE FROM blocks 
        WHERE blocker_id = ? AND blocked_id = ?
    `).run(blockerId, blockedId);
}

function isBlocked(userId, otherUserId) {
    // Checks if EITHER user has blocked the other
    const row = db.prepare(`
        SELECT 1 FROM blocks 
        WHERE (blocker_id = ? AND blocked_id = ?)
           OR (blocker_id = ? AND blocked_id = ?)
    `).get(userId, otherUserId, otherUserId, userId);
    return !!row;
}

function getBlockedUsers(userId) {
    // Returns an array of user IDs that this user has blocked
    const rows = db.prepare(`
        SELECT blocked_id 
        FROM blocks 
        WHERE blocker_id = ?
    `).all(userId);
    return rows.map(row => row.blocked_id);
}

module.exports = {
	db,
	dbPath,
	getMessagesForThread,
	getOrCreateDirectThread,
	getThreadById,
	insertMessage,
	makeDirectKey,
	pingDatabase,
	serializeMessage,
	serializeThread,
	normalizeUserIds,
	createPost,
    getRecentPosts,
	getUserInbox,
	createGroupThread,
	removeParticipant,
	addParticipant,
	deleteThread,
	deleteMessage,
	updateThreadName,
	blockUser,
	unblockUser,
	isBlocked,
	getBlockedUsers
};

