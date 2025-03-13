import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Verify environment variables are loaded
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile); // Debug log
        
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log('Existing user found:', user); // Debug log
          return done(null, user);
        }

        // If user doesn't exist, create a new user
        user = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          password: 'google-oauth', // You might want to handle this differently
        });

        await user.save();
        console.log('New user created:', user); // Debug log
        return done(null, user);
      } catch (error) {
        console.error('Google auth error:', error); // Debug log
        return done(error, null);
      }
    }
  )
); 