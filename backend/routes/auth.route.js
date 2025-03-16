import express from 'express';
import { signup, signin, updateUser, userProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/verifyUser.js';
import { uploadMiddleware } from '../middlewares/upload.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  async (req, res) => {
    try {
      // Create JWT token
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Get user data without password
      const userData = { ...req.user._doc };
      delete userData.password;

      // Encode user data
      const encodedUserData = encodeURIComponent(JSON.stringify(userData));

      // Redirect to frontend with token and user data
      const redirectUrl = `${process.env.CLIENT_URL}/oauth/callback?token=${token}&userData=${encodedUserData}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/signin`);
    }
  }
);

router.put('/update', verifyToken, uploadMiddleware, updateUser);
router.get('/profile', verifyToken, userProfile);

export default router;