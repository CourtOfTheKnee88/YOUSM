const express = require('express');
const cors = require('cors');

const threadsRouter = require('./routes/threads');
const messagesRouter = require('./routes/messages');
const { dbPath, pingDatabase } = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
	return res.status(200).json({
		ok: true,
		service: 'yousm-messaging-backend',
		environment: process.env.NODE_ENV || 'development',
		port,
		uptimeSeconds: Math.floor(process.uptime()),
		dbReady: pingDatabase(),
		dbPath,
		time: new Date().toISOString(),
	});
});

app.use('/threads', threadsRouter);
app.use('/messages', messagesRouter);

app.use((req, res) => {
	return res.status(404).json({ error: 'Not found' });
});

app.use((error, req, res, next) => {
	const statusCode = error.statusCode || 500;
	return res.status(statusCode).json({
		error: statusCode === 500 ? 'Internal server error' : error.message,
	});
});

app.listen(port, host, () => {
	console.log(`YOUSM messaging backend listening on http://${host}:${port}`);
});

