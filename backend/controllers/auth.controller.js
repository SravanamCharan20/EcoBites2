import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';


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
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = bcryptjs.compareSync(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }

    const updates = {};
    if (username) {
      updates.username = username;
    }

    if (newPassword) {
      updates.password = bcryptjs.hashSync(newPassword, 10);
    }

    // Handle image upload to Imgur
    if (req.file) {
      const imgurResponse = await axios.post('https://api.imgur.com/3/image', req.file.buffer, {
        headers: {
          Authorization: `82712046c7d5144`, // Replace with your Imgur Client ID
          'Content-Type': 'application/json',
        },
      });
      updates.profilePicture = imgurResponse.data.data.link; // Get the image link from Imgur
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Update failed' });
    }

    const { password: hashedPassword, ...rest } = updatedUser._doc;
    res.status(200).json({ success: true, user: { ...rest, profilePicture: updatedUser.profilePicture } });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred while updating the profile' });
    next(error);
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};