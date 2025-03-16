import express from 'express';
import { verifyToken } from '../middlewares/verifyUser.js';
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.post('/', verifyToken, createNotification);
router.put('/:notificationId/read', verifyToken, markAsRead);
router.put('/mark-all-read', verifyToken, markAllAsRead);

export default router; 