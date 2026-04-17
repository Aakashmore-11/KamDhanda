require('dotenv').config()
const cookieParser = require('cookie-parser');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors")
const connectMongoDB = require('./config/mongooseConnection');
const userRouter = require('./routes/user');
const freelancerProjectRouter = require('./routes/freelancerProject');
const notificationRouter = require('./routes/notification');
const projectTrackingRouter = require('./routes/projectTracking');
const adminRouter = require('./routes/admin');
const jobsRouter = require('./routes/jobs');
const applicationsRouter = require('./routes/applications');
const aiRouter = require('./routes/ai');
const mocktestRouter = require('./routes/mocktest');
const paymentRouter = require('./routes/payment');
const interviewsRouter = require('./routes/interviews');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

const allowedOrigin = [
    "http://localhost:5173", 
    "http://localhost:3000",
    process.env.CLIENT_URL
].filter(Boolean);

connectMongoDB(process.env.MONGODB_URI || "mongodb://localhost:27017/KamDhanda")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigin, credentials: true }))

// ─── Socket.IO for WebRTC Signaling ─────────────────────────────────────────
const io = new Server(httpServer, {
    cors: { origin: allowedOrigin, methods: ["GET", "POST"] }
});

// Map: roomId → Set of socket IDs in that room
const rooms = {};

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join an interview room
    socket.on('join-room', ({ roomId, userId, userName, role }) => {
        socket.join(roomId);
        if (!rooms[roomId]) rooms[roomId] = new Set();
        rooms[roomId].add(socket.id);

        // Notify others in room
        socket.to(roomId).emit('user-joined', { userId, userName, role, socketId: socket.id });

        // Send current participants count
        io.to(roomId).emit('room-users', { count: rooms[roomId].size });
        console.log(`${userName} (${role}) joined room ${roomId}`);
    });

    // WebRTC: exchange offer/answer/ICE
    socket.on('offer', ({ to, offer }) => {
        io.to(to).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ to, answer }) => {
        io.to(to).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
        io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    // Chat messages in interview room
    socket.on('chat-message', ({ roomId, message, senderName, senderId }) => {
        io.to(roomId).emit('chat-message', {
            message, senderName, senderId,
            timestamp: new Date().toISOString()
        });
    });

    // Status updates (mute/video toggle)
    socket.on('media-status', ({ roomId, audio, video }) => {
        socket.to(roomId).emit('peer-media-status', { socketId: socket.id, audio, video });
    });

    // Leave room
    socket.on('leave-room', ({ roomId }) => {
        socket.leave(roomId);
        if (rooms[roomId]) {
            rooms[roomId].delete(socket.id);
            if (rooms[roomId].size === 0) delete rooms[roomId];
        }
        socket.to(roomId).emit('user-left', { socketId: socket.id });
    });

    socket.on('disconnect', () => {
        // Clean up all rooms
        for (const roomId in rooms) {
            rooms[roomId].delete(socket.id);
            socket.to(roomId).emit('user-left', { socketId: socket.id });
            if (rooms[roomId].size === 0) delete rooms[roomId];
        }
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

app.get("/", (req, res) => { res.send("HELLO FROM SERVER!") })

app.use('/user', userRouter)
app.use('/freelancerProject', freelancerProjectRouter)
app.use('/notification', notificationRouter)
app.use('/projectTracking', projectTrackingRouter)
app.use('/admin', adminRouter)
app.use('/jobs', jobsRouter);
app.use('/applications', applicationsRouter);
app.use('/ai', aiRouter);
app.use('/mocktest', mocktestRouter);
app.use('/interviews', interviewsRouter);
app.use('/api/payment', paymentRouter);

const path = require('path');

// -- Serving Frontend in Production --
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
}

httpServer.listen(PORT, () => console.log(`Server Started At ${PORT} with Socket.IO`))