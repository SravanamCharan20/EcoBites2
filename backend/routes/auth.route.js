import express from 'express';
import { signin, signup, updateUser, userProfile } from '../controllers/auth.controller.js';
import authenticateToken from '../middlewares/auth.middleware.js'
import upload from '../middlewares/upload.js';
import User from '../models/user.model.js';


const router = express.Router();

router.post("/signup", signup)
router.post("/signin", signin)
router.put("/update",authenticateToken,upload.single('profilePicture'), updateUser);
router.get('/user', authenticateToken, userProfile);

export default router;