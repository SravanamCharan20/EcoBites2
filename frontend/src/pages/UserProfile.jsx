import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiMail, FiUser } from 'react-icons/fi';
import { HiLocationMarker } from 'react-icons/hi';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get('http://localhost:6001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.data.message || 'Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(error.message || 'Failed to fetch user details');
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleUpdateProfile = () => {
    navigate('/update-profile');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - Profile Picture and Actions */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Header Section */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Your Profile</h1>
            <p className="text-lg font-light text-gray-300">
              Manage your personal information
            </p>
          </div>

          {/* Profile Picture Section */}
          <motion.div 
            className="bg-gray-50 rounded-3xl p-6 shadow-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative inline-block">
              <img 
                src={user?.profilePicture || '/default-profile-pic.jpg'} 
                alt="Profile" 
                className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
              />
              <button 
                onClick={handleUpdateProfile}
                className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-all duration-300"
              >
                <FiEdit2 className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={handleUpdateProfile}
              className="mt-6 w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiEdit2 />
              Update Profile
            </button>
          </motion.div>
        </div>

        {/* Right Column - User Information */}
        <div className="col-span-full lg:col-span-8 space-y-6">
          {error ? (
            <div className="bg-red-50 rounded-3xl p-6 text-red-600">
              {error}
            </div>
          ) : !user ? (
            <div className="bg-gray-50 rounded-3xl p-6 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <motion.div 
                className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                  <div className="grid gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <FiUser className="text-gray-400 text-xl" />
                        <h3 className="text-lg font-medium text-gray-900">Username</h3>
                      </div>
                      <p className="text-gray-600 ml-9">{user.username}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <FiMail className="text-gray-400 text-xl" />
                        <h3 className="text-lg font-medium text-gray-900">Email</h3>
                      </div>
                      <p className="text-gray-600 ml-9">{user.email}</p>
                    </div>

                    {user.location && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <HiLocationMarker className="text-blue-600 text-xl" />
                          <h3 className="text-lg font-medium text-gray-900">Location</h3>
                        </div>
                        <div className="space-y-2 ml-9">
                          <p className="text-gray-600">
                            {user.location.state && user.location.city && (
                              <span className="block">{user.location.city}, {user.location.state}</span>
                            )}
                            {user.location.latitude && user.location.longitude && (
                              <span className="block">
                                Lat: {user.location.latitude}, Long: {user.location.longitude}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;