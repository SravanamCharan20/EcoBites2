import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../reducers/userSlice';
import axios from 'axios';
import { SyncLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiUpload, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setProfilePicture(null);
      setPreview(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (profilePicture) {
      const objectUrl = URL.createObjectURL(profilePicture);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [profilePicture]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    const formData = new FormData();
    formData.append('username', username);

    if (oldPassword && newPassword) {
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
    }

    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const response = await axios.put('/api/auth/update', formData, {
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        dispatch(setUser({
          ...currentUser,
          profilePicture: response.data.user.profilePicture,
          username: response.data.user.username,
        }));
        setMessage('Profile updated successfully');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/userprofile');
        }, 2000);
      } else {
        setMessage('Failed to update profile');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
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
              <img 
                src={preview || (currentUser?.profilePicture ? 
                  `${import.meta.env.VITE_API_URL}/uploads/${currentUser.profilePicture}` : 
                  'default-profile-pic.jpg')} 
                alt="Profile Preview" 
                className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
              />
            </div>
            <label className="mt-6 w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
              <FiUpload />
              Choose Photo
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="hidden"
              />
            </label>
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