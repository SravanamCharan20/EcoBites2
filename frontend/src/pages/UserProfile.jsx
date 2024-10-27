import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      console.log(data); // Log the API response
      setUser(data.user); // Ensure data.user contains profilePicture
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Construct the full URL for the profile picture
  const profilePictureUrl = user && user.profilePicture 
    ? `${import.meta.env.VITE_API_URL}/uploads/${user.profilePicture}` 
    : 'default-profile-pic.jpg'; // Fallback image

  // Function to handle navigation to update profile page
  const handleUpdateProfile = () => {
    navigate('/update-profile'); // Replace with your actual update profile route
  };

  return (
    <motion.div
      className="max-w-lg mx-auto p-6 bg-lime-200 rounded-lg shadow-lg mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-semibold text-center mb-4">Your Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      {user ? (
        <div className="text-center">
          <img 
            src={profilePictureUrl} 
            alt="Profile" 
          className="w-36 h-36 rounded-full mx-auto mb-4 border border-green-200" 
          />
          <p className="text-lg font-medium">Username: {user.username}</p>
          <p className="text-gray-600">Email: {user.email}</p>
          {/* Update Profile Button */}
          <button 
            onClick={handleUpdateProfile} 
            className="mt-4 bg-gray-800 text-white p-2 rounded-3xl px-3 hover:bg-gray-700"
          >
            Update Profile
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </motion.div>
  );
};

export default UserProfile;