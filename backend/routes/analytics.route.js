import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getOverallStats,
  getUserStats,
  getDonationImpact
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/overall', verifyToken, getOverallStats);
router.get('/user', verifyToken, getUserStats);
router.get('/impact', verifyToken, getDonationImpact);

export default router; 