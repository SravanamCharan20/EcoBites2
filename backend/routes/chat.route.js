import express from 'express';
import {
  initializeChat,
  sendMessage,
  getUserChats,
  getChatMessages
} from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/initialize', initializeChat);
router.post('/:chatId/messages', sendMessage);
router.get('/user/:userId', getUserChats);
router.get('/:chatId/messages', getChatMessages);

export default router; 