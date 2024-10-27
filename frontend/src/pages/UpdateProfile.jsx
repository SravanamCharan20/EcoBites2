import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../reducers/userSlice';
import axios from 'axios';
import { SyncLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook to manage navigation
  const { currentUser } = useSelector((state) => state.user);

  const [username, setUsername] = useState(currentUser?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null); // State for image preview
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // State for success status

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setProfilePicture(null);
      setPreview(null); // Reset preview on currentUser change
    }
  }, [currentUser]);

  // Effect to create image preview
  useEffect(() => {
    if (profilePicture) {
      const objectUrl = URL.createObjectURL(profilePicture);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // Cleanup on unmount
    }
  }, [profilePicture]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false); // Reset success status

    const formData = new FormData();
    formData.append('username', username);

    // Only append passwords if they are provided
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
        setIsSuccess(true); // Set success status
        setTimeout(() => {
          navigate('/userprofile'); // Navigate to user profile after a short delay
        }, 2000); // Adjust the delay as needed
      } else {
        setMessage('Failed to update profile');
        setIsSuccess(false); // Ensure success status is false
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
      setIsSuccess(false); // Ensure success status is false
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-lg mx-auto rounded-3xl'>
      <h1 className='text-3xl text-gray-800 text-center font-semibold my-4'>Update Profile</h1>
      <form onSubmit={handleUpdate} className='flex flex-col gap-4'>
        <div className='flex flex-col'>
          <label htmlFor='username' className='text-gray-600 mb-1'>Username:</label>
          <input
            type='text'
            id='username'
            placeholder='Enter new username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2'
            required
          />
        </div>

        <div className='flex flex-col'>
          <label htmlFor='oldPassword' className='text-gray-600 mb-1'>Old Password (optional):</label>
          <input
            type='password'
            id='oldPassword'
            placeholder='Enter old password (optional)'
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className='border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2'
          />
        </div>

        <div className='flex flex-col'>
          <label htmlFor='newPassword' className='text-gray-600 mb-1'>New Password (optional):</label>
          <input
            type='password'
            id='newPassword'
            placeholder='Enter new password (optional)'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className='border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2'
          />
        </div>
        <div className='text-center'>
          {preview && (
              <img src={preview} alt='Profile Preview' className='mt-4 w-32 h-32 rounded-full border-2 border-gray-300 object-cover' />
          )}
          </div>

        <div className='flex flex-col'>
          <label htmlFor='profilePicture' className='text-gray-600 mb-1'>Profile Picture:</label>
          <input
            type='file'
            id='profilePicture'
            accept='image/*'
            onChange={(e) => setProfilePicture(e.target.files[0])}
            className='border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2'
          />
          
        </div>

        <button
          type='submit'
          disabled={loading}
          className='bg-gray-800 text-white p-4 mt-4 rounded-md uppercase hover:opacity-90 disabled:opacity-70 transition-all duration-300'
        >
          {loading ? <SyncLoader size={6} color="#fff" /> : 'Update Profile'}
        </button>
      </form>
      {message && (
        <p className={`mt-5 text-center ${isSuccess ? 'text-green-700' : 'text-red-700'}`} aria-live='assertive'>
          {message}
        </p>
      )}
    </div>
  );
};

export default UpdateProfile;