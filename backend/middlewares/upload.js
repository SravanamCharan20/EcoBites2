import multer from 'multer';
import axios from 'axios';

const storage = multer.memoryStorage(); // Use memory storage for file uploads

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  },
});

export const uploadImage = async (req, res, next) => {
  if (!req.file) {
    return next(); // No file uploaded, continue to the next middleware
  }

  try {
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64')); // Convert buffer to base64
    formData.append('type', 'base64');

    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        'Authorization': `82712046c7d5144`, // Replace with your Client ID
        ...formData.getHeaders(), // Ensure the right headers for form data
      },
    });

    req.file.imageUrl = response.data.data.link; // Save the image URL to the request object
    next(); // Proceed to the next middleware
  } catch (error) {
    console.error('Error uploading to Imgur:', error.message);
    return res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};

export default upload;