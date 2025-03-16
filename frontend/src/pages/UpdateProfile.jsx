import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../reducers/userSlice';
import axios from 'axios';
import { SyncLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ProfileImage from '../components/ProfileImage';

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [username, setUsername] = useState(currentUser?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (currentUser) {
      console.log('UpdateProfile: Current user changed:', {
        username: currentUser.username,
        profilePicture: currentUser.profilePicture
      });
      setUsername(currentUser.username || '');
      setProfilePicture(null);
      setPreview(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (profilePicture) {
      console.log('UpdateProfile: New profile picture selected:', {
        name: profilePicture.name,
        size: profilePicture.size,
        type: profilePicture.type
      });

      // Validate file size
      if (profilePicture.size > 5 * 1024 * 1024) { // 5MB limit
        console.warn('UpdateProfile: File size too large:', profilePicture.size);
        setUploadError('Image size should be less than 5MB');
        setProfilePicture(null);
        setPreview(null);
        return;
      }

      // Validate file type
      if (!profilePicture.type.startsWith('image/')) {
        console.warn('UpdateProfile: Invalid file type:', profilePicture.type);
        setUploadError('Please upload an image file');
        setProfilePicture(null);
        setPreview(null);
        return;
      }

      try {
        // Clean up previous preview URL if it exists
        if (preview) {
          URL.revokeObjectURL(preview);
        }

        const objectUrl = URL.createObjectURL(profilePicture);
        console.log('UpdateProfile: Created preview URL:', objectUrl);
        setPreview(objectUrl);
        setUploadError('');
      } catch (error) {
        console.error('UpdateProfile: Error creating preview URL:', error);
        setUploadError('Error creating image preview');
        setProfilePicture(null);
        setPreview(null);
      }

      return () => {
        if (preview) {
          console.log('UpdateProfile: Cleaning up preview URL:', preview);
          URL.revokeObjectURL(preview);
        }
      };
    } else {
      // Clean up preview when profilePicture is cleared
      if (preview) {
        console.log('UpdateProfile: Cleaning up preview URL on profile picture clear:', preview);
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    }
  }, [profilePicture]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('UpdateProfile: File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      setProfilePicture(file);
    } else {
      setProfilePicture(null);
      setPreview(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (uploadError) {
      console.error('UpdateProfile: Cannot update due to upload error:', uploadError);
      setMessage(uploadError);
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    const formData = new FormData();
    formData.append('username', username);

    if (oldPassword && newPassword) {
      console.log('UpdateProfile: Password update requested');
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
    }

    if (profilePicture) {
      console.log('UpdateProfile: Adding profile picture to form data:', {
        name: profilePicture.name,
        size: profilePicture.size,
        type: profilePicture.type
      });
      formData.append('profilePicture', profilePicture);
    }

    try {
      console.log('UpdateProfile: Sending update request');
      const response = await axios.put('http://localhost:6001/api/auth/update', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log('UpdateProfile: Update successful:', response.data);
        
        // Ensure we have the complete profile URL
        const profilePicture = response.data.user.profilePicture;
        console.log('UpdateProfile: New profile picture URL:', profilePicture);

        const updatedUser = {
          ...currentUser,
          ...response.data.user,
          profilePicture: profilePicture, // Explicitly set the profile picture
          token: localStorage.getItem('access_token')
        };
        
        // Update Redux state with the new user data
        dispatch(setUser({
          user: updatedUser,
          token: localStorage.getItem('access_token')
        }));

        setMessage('Profile updated successfully');
        setIsSuccess(true);
        
        // Update local storage with new user data
        const userData = {
          ...response.data.user,
          profilePicture: profilePicture // Ensure profile picture is included
        };
        
        console.log('UpdateProfile: Updating local storage:', userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Clear the preview and profile picture states
        setPreview(null);
        setProfilePicture(null);
        
        setTimeout(() => {
          navigate('/userprofile');
        }, 2000);
      } else {
        console.error('UpdateProfile: Update failed:', response.data.message);
        setMessage(response.data.message || 'Failed to update profile');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('UpdateProfile: Error during update:', error);
      setMessage(error.response?.data?.message || 'Failed to update profile');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - Preview and Header */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Header Section */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Update Profile</h1>
            <p className="text-lg font-light text-gray-300">
              Customize your profile information
            </p>
          </div>

          {/* Profile Picture Preview */}
          <motion.div 
            className="bg-gray-50 rounded-3xl p-6 shadow-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative inline-block">
              <ProfileImage
                src={preview || currentUser?.profilePicture}
                size="large"
                className="border-4 border-white shadow-lg"
                alt={`${currentUser?.username || 'User'}'s profile picture`}
              />
            </div>
            <label className="mt-6 w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
              <FiUpload />
              Choose Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
          </motion.div>
        </div>

        {/* Right Column - Update Form */}
        <div className="col-span-full lg:col-span-8">
          <motion.div 
            className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid gap-6">
                {/* Username Field */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <FiUser className="text-gray-400 text-xl" />
                    <label htmlFor="username" className="text-lg font-medium text-gray-900">
                      Username
                    </label>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                {/* Old Password Field */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <FiLock className="text-gray-400 text-xl" />
                    <label htmlFor="oldPassword" className="text-lg font-medium text-gray-900">
                      Current Password
                    </label>
                  </div>
                  <input
                    type="password"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                {/* New Password Field */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <FiLock className="text-gray-400 text-xl" />
                    <label htmlFor="newPassword" className="text-lg font-medium text-gray-900">
                      New Password
                    </label>
                  </div>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-xl ${
                    isSuccess ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {message}
                </motion.div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? <SyncLoader size={6} color="#fff" /> : 'Update Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/userprofile')}
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;