import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '.env') });

// Verify required environment variables
const requiredEnvVars = [
  'MONGO',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'CLIENT_URL',
  'SESSION_SECRET'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import DonorForm from './routes/donor.route.js';
import notificationRouter from './routes/notification.route.js';
import analyticsRouter from './routes/analytics.route.js';
import cors from 'cors';
import chatRoutes from './routes/chat.route.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Chat from './models/chat.model.js';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';

const PORT = process.env.PORT || 6001;
const app = express();

// Apply CORS before other middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log('User joined:', userId);
  });

  socket.on('sendMessage', async ({ chatId, message }) => {
    try {
      const chat = await Chat.findById(chatId).populate('donorId requesterId');
      if (!chat) {
        console.error('Chat not found:', chatId);
        return;
      }

      if (chat.donorId._id.toString() === chat.requesterId._id.toString()) {
        console.error('Self-chat is not allowed');
        return;
      }
      
      const recipientId = message.senderId === chat.donorId._id.toString()
        ? chat.requesterId._id.toString()
        : chat.donorId._id.toString();
      
      const recipientSocketId = activeUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', {
          chatId,
          message: {
            ...message,
            senderId: message.senderId
          }
        });
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

app.use('/uploads', express.static(path.resolve('uploads')));
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/donor', DonorForm);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRouter);
app.use('/api/analytics', analyticsRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
    });
});

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});