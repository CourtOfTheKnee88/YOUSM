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
			content TEXT NOT NULL,
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

function insertMessage(threadId, senderId, content) {
	const trimmedContent = String(content ?? '').trim();

	if (!trimmedContent) {
		const error = new Error('Message content is required.');
		error.statusCode = 400;
		throw error;
	}

	const thread = db
		.prepare(
			`
				SELECT id
				FROM threads
				WHERE id = ?
			`
		)
		.get(threadId);

	if (!thread) {
		const error = new Error('Thread not found.');
		error.statusCode = 404;
		throw error;
	}

	const result = db
		.prepare(
			`
				INSERT INTO messages (thread_id, sender_id, content)
				VALUES (?, ?, ?)
			`
		)
		.run(threadId, String(senderId).trim(), trimmedContent);

	return db
		.prepare(
			`
				SELECT id, thread_id, sender_id, content, created_at
				FROM messages
				WHERE id = ?
			`
		)
		.get(result.lastInsertRowid);
}

function getMessagesForThread(threadId, afterMessageId = 0) {
	const messages = db
		.prepare(
			`
				SELECT id, thread_id, sender_id, content, created_at
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
    // This query finds threads the user is in, grabs the OTHER participant's name, 
    // and fetches the most recent message for the preview.
    const stmt = db.prepare(`
        SELECT 
            t.id as threadId,
            p.user_id as targetUser,
            (SELECT content FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as lastMessage
        FROM threads t
        JOIN thread_participants p ON t.id = p.thread_id
        WHERE t.id IN (SELECT thread_id FROM thread_participants WHERE user_id = ?)
          AND p.user_id != ?
    `);
    return stmt.all(userId, userId);
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
	getUserInbox
};

