import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import DonorForm from './routes/donor.route.js';
import path from 'path';
import cors from 'cors';
import chatRoutes from './routes/chat.route.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Chat from './models/chat.model.js';

dotenv.config();
const PORT = process.env.PORT || 6001; // Read the port from environment variables
const app = express();

// Apply CORS before other middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:6001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:6001'],
    methods: ["GET", "POST"],
    credentials: true
  }
});
const __dirname = path.resolve();

// Store active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log('User joined:', userId);
  });

  // Handle new messages
  socket.on('sendMessage', async ({ chatId, message }) => {
    try {
      const chat = await Chat.findById(chatId).populate('donorId requesterId');
      if (!chat) {
        console.error('Chat not found:', chatId);
        return;
      }

      // Prevent self-chat
      if (chat.donorId._id.toString() === chat.requesterId._id.toString()) {
        console.error('Self-chat is not allowed');
        return;
      }
      
      // Send to recipient if they're online
      const recipientId = message.senderId === chat.donorId._id.toString()
        ? chat.requesterId._id.toString()
        : chat.donorId._id.toString();
      
      const recipientSocketId = activeUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', {
          chatId,
          message: {
            ...message,
            senderId: message.senderId // Ensure senderId is passed correctly
          }
        });
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from active users
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

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
    });
});

app.use(express.static(path.join(__dirname, '/frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

// Use httpServer instead of app
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});