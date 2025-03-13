import express from 'express';
import { signin, signup, updateUser, userProfile } from '../controllers/auth.controller.js';
import authenticateToken from '../middlewares/auth.middleware.js'
import upload from '../middlewares/upload.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';


const router = express.Router();

router.post("/signup", signup)
router.post("/signin", signin)

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    try {
      // Create JWT token
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const redirectUrl = `${process.env.CLIENT_URL}/oauth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/signin`);
    }
  }
);

router.put("/update",authenticateToken,upload.single('profilePicture'), updateUser);
router.get('/user', authenticateToken, userProfile);

export default router;