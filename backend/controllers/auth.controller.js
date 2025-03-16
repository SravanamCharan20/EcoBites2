import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'profile_pictures',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const signup = async (req, res, next) => {
  const { username, email, password, location } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'username, email, and password are required' });
  }
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, location });
  try {
    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This email is already in use. Please use a different email.' });
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

    const location = validUser.location;
    const tokenPayload = {
      id: validUser._id,
      ...(location?.state && location?.city
        ? { state: location.state, city: location.city }
        : { latitude: location?.latitude, longitude: location?.longitude }),
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password: hashedPassword, ...rest } = validUser._doc;
    res.status(200).json({ token, user: rest });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { oldPassword, username, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Only check password if oldPassword is provided
    if (oldPassword) {
      const isMatch = bcryptjs.compareSync(oldPassword, user.password);
      if (!isMatch) {
        return next(errorHandler(401, 'Old password is incorrect'));
      }
    }

    const updates = {};
    if (username) {
      updates.username = username;
    }

    if (newPassword) {
      updates.password = bcryptjs.hashSync(newPassword, 10);
    }

    // Handle profile picture upload
    if (req.file) {
      try {
        // Delete old image from Cloudinary if it exists
        if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
          try {
            const publicId = user.profilePicture.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError);
            // Continue with upload even if delete fails
          }
        }

        // Upload new image
        const result = await uploadToCloudinary(req.file.buffer);
        if (!result || !result.secure_url) {
          throw new Error('Failed to get image URL from Cloudinary');
        }
        updates.profilePicture = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return next(errorHandler(500, 'Error uploading profile picture: ' + uploadError.message));
      }
    }

    // Only update if there are changes
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No updates provided' 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: updates }, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return next(errorHandler(404, 'Update failed'));
    }

    return res.status(200).json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return next(errorHandler(500, 'An error occurred while updating the profile: ' + error.message));
  }
};

export const userProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return next(errorHandler(500, 'An error occurred while fetching user profile'));
  }
};