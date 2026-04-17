const express = require('express');
const cors = require('cors');
const http = require('http'); // Node's built-in HTTP module
const { Server } = require('socket.io'); //Import Socket.io

const threadsRouter = require('./routes/threads');
const messagesRouter = require('./routes/messages');
const postsRouter = require('./routes/posts');
const { dbPath, pingDatabase, getOrCreateDirectThread, insertMessage } = require('./db');

const app = express();

//Create an HTTP server and wrap the Express app
const server = http.createServer(app); 

//Initialize Socket.io with CORS settings so React Native can talk to it
const io = new Server(server, {
	cors: {
		origin: "*", 
		methods: ["GET", "POST"]
	}
});

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
app.use('/posts', postsRouter);

app.use((req, res) => {
	return res.status(404).json({ error: 'Not found' });
});

app.use((error, req, res, next) => {
	const statusCode = error.statusCode || 500;
	return res.status(statusCode).json({
		error: statusCode === 500 ? 'Internal server error' : error.message,
	});
});

//The Socket.io connection listener
io.on('connection', (socket) => {
	console.log(`⚡ User connected: ${socket.id}`);

	// NEW: Listen for the app telling us which chat room to join
	socket.on('join_thread', (threadId) => {
		socket.join(threadId);
		console.log(`User ${socket.id} joined thread room: ${threadId}`);
	});

	socket.on('send_message', (data) => {
		try {
			const savedMessage = insertMessage(data.threadId, data.senderId, data.content);
			
			// CHANGED: Broadcast the message ONLY to phones inside this specific thread room
			io.to(data.threadId).emit('receive_message', savedMessage);
		} catch (error) {
			console.error('❌ Database error:', error.message);
		}
	});

	socket.on('disconnect', () => {
		console.log(`❌ User disconnected: ${socket.id}`);
	});
});

server.listen(port, host, () => {
	console.log(`🚀 YOUSM messaging & socket backend listening on http://${host}:${port}`);
});