import express from 'express';
import { getAISuggestions, getSmartRecommendations } from '../controllers/ai.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/suggestions', verifyToken, getAISuggestions);
router.post('/recommendations', verifyToken, getSmartRecommendations);

export default router; 