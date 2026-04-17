const express = require('express');
const { getOrCreateDirectThread, getThreadById, insertMessage, getMessagesForThread, getUserInbox } = require('../db');

const router = express.Router();



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


router.post('/direct', (req, res, next) => {
	try {
		const participantIds = pickDirectParticipants(req.body);
		const thread = getOrCreateDirectThread(participantIds);

		return res.status(200).json({ thread });
	} catch (error) {
		return next(error);
	}
});

router.post('/:threadId/messages', (req, res, next) => {
	try {
		const { threadId } = req.params;
		const senderId = req.body.senderId ?? req.body.userId;
		const content = req.body.content ?? req.body.message;

		const message = insertMessage(Number(threadId), senderId, content);

		return res.status(201).json({ message });
	} catch (error) {
		return next(error);
	}
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

