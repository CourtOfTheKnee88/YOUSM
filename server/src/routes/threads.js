const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { getOrCreateDirectThread, getThreadById, insertMessage, getMessagesForThread, getUserInbox, createGroupThread, addParticipant, removeParticipant, deleteThread, deleteMessage, updateThreadName, blockUser, unblockUser, isBlocked, getBlockedUsers } = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir); // Create folder if it doesn't exist
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function pickDirectParticipants(body = {}) {
	if (Array.isArray(body.participantIds)) {
		return body.participantIds;
	}

	if (Array.isArray(body.userIds)) {
		return body.userIds;
	}

	if (body.userId !== undefined && body.otherUserId !== undefined) {
		return [body.userId, body.otherUserId];
	}

	if (body.senderId !== undefined && body.recipientId !== undefined) {
		return [body.senderId, body.recipientId];
	}

	return [];
}

//new inbox route
router.get('/inbox/:userId', (req, res, next) => {
	try {
		const inbox = getUserInbox(req.params.userId);
		return res.status(200).json({ inbox });
	} catch (error) {
		return next(error);
	}
});

// ==========================================
// THREAD MANAGEMENT ROUTES
// ==========================================
// GET a specific thread's details (including participants)
router.get('/:threadId', (req, res, next) => {
    try {
        // getThreadById is already in your db.js!
        const thread = getThreadById(Number(req.params.threadId));
        if (!thread) return res.status(404).json({ error: 'Thread not found' });
        return res.status(200).json({ thread });
    } catch (error) {
        return next(error);
    }
});

// DELETE a user from a thread
router.delete('/:threadId/participants/:userId', (req, res, next) => {
    try {
        const { threadId, userId } = req.params;
        removeParticipant(Number(threadId), userId);
        return res.status(200).json({ success: true });
    } catch (error) {
        return next(error);
    }
});

// GET a user's blocked list
router.get('/blocks/:userId', (req, res, next) => {
    try {
        const blockedUsers = getBlockedUsers(req.params.userId);
        return res.status(200).json({ blockedUsers });
    } catch (error) {
        return next(error);
    }
});

// POST to unblock a user
router.post('/unblock', (req, res, next) => {
    try {
        const { blocker, blocked } = req.body;
        unblockUser(blocker, blocked);
        return res.status(200).json({ success: true, message: `User ${blocked} unblocked.` });
    } catch (error) {
        return next(error);
    }
});

router.post('/:threadId/participants', (req, res, next) => {
    try {
        const { threadId } = req.params;
        const { userId } = req.body;
        addParticipant(Number(threadId), userId);
        return res.status(200).json({ success: true });
    } catch (error) {
        return next(error);
    }
});

router.post('/direct', (req, res, next) => {
	try {
		const participantIds = pickDirectParticipants(req.body);
		const thread = getOrCreateDirectThread(participantIds);

		return res.status(200).json({ thread });
	} catch (error) {
		return next(error);
	}
});

router.post('/group', (req, res, next) => {
    try {
        const { participantIds, name } = req.body; // 🛑 Accept name
        
        if (!Array.isArray(participantIds)) {
            return res.status(400).json({ error: "participantIds must be an array." });
        }

        const thread = createGroupThread(participantIds, name); // 🛑 Pass name
        return res.status(201).json({ thread });
    } catch (error) {
        return next(error);
    }
});

router.post('/:threadId/messages', upload.single('media'), (req, res, next) => {
	try {
		const { threadId } = req.params;
		const senderId = req.body.senderId ?? req.body.userId;
		const content = req.body.content ?? req.body.message;
        
        let mediaUrl = null;
        let mediaType = null;

        // If Multer caught a file, generate the URL and determine the type
        if (req.file) {
            // This assumes your server is running on localhost/your IP.
            // You will pass the BASE_URL from the frontend later.
            mediaUrl = `/uploads/${req.file.filename}`; 
            
            // Basic check if it's an image or video based on mimetype
            if (req.file.mimetype.startsWith('image/')) {
                mediaType = 'image';
            } else if (req.file.mimetype.startsWith('video/')) {
                mediaType = 'video';
            }
        }

		const message = insertMessage(Number(threadId), senderId, content, mediaUrl, mediaType);

		return res.status(201).json({ message });
	} catch (error) {
		return next(error);
	}
});

router.post('/block', (req, res, next) => {
    try {
        const { blocker, blocked } = req.body;
        if (!blocker || !blocked) {
            return res.status(400).json({ error: "Both blocker and blocked IDs are required." });
        }
        
        blockUser(blocker, blocked);
        return res.status(200).json({ success: true, message: `User ${blocked} has been blocked.` });
    } catch (error) {
        return next(error);
    }
});

router.patch('/:threadId/name', (req, res, next) => {
    try {
        const { threadId } = req.params;
        const { name } = req.body;
        const thread = updateThreadName(Number(threadId), name);
        return res.status(200).json({ thread });
    } catch (error) {
        return next(error);
    }
});

// DELETE an entire thread
router.delete('/:threadId', (req, res, next) => {
    try {
        deleteThread(Number(req.params.threadId));
        return res.status(200).json({ success: true });
    } catch (error) {
        return next(error);
    }
});

// DELETE a specific message
router.delete('/message/:messageId', (req, res, next) => {
    try {
        deleteMessage(Number(req.params.messageId));
        return res.status(200).json({ success: true });
    } catch (error) {
        return next(error);
    }
});

// POST to report a user (Placeholder for your future reports table)
router.post('/report', (req, res) => {
    console.log(`User ${req.body.reporter} reported ${req.body.reported} for: ${req.body.reason}`);
    return res.status(200).json({ success: true });
});

router.get('/:threadId/messages', (req, res, next) => {
	try {
		const threadId = Number(req.params.threadId);
		const after = req.query.after === undefined ? 0 : Number(req.query.after);

		if (!Number.isInteger(threadId) || threadId <= 0) {
			return res.status(400).json({ error: 'threadId must be a positive integer.' });
		}

		if (!Number.isInteger(after) || after < 0) {
			return res.status(400).json({ error: 'after must be a non-negative integer.' });
		}

		const thread = getThreadById(threadId);
		if (!thread) {
			return res.status(404).json({ error: 'Thread not found.' });
		}

		const messages = getMessagesForThread(threadId, after);

		return res.status(200).json({
			thread,
			messages,
			after,
			nextAfter: messages.length > 0 ? messages[messages.length - 1].id : after,
		});
	} catch (error) {
		return next(error);
	}
});

module.exports = router;

// VERY IMPORTANT: This exports the router so your server doesn't crash
module.exports = router;
