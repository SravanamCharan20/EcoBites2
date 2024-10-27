import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../reducers/userSlice';
import { SyncLoader } from 'react-spinners'; 

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem('access_token', data.token);
        dispatch(setUser({ token: data.token, user: data.user }));
        navigate('/');
        alert('Sign-in successful!');
      } else {
        setMessage(data.message || 'Invalid credentials, please try again.'); 
      }
    } catch (error) {
      setLoading(false);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-gray-800 text-center font-semibold my-11'>Sign In</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='email'
          placeholder='Email'
          id='email'
          className='text-gray-900 p-4 rounded-md border-2 border-gray-300 focus:outline-none transition-all duration-300 ease-out'
          onChange={handleChange}
          required
          aria-label='Email'
        />
        <input
          type='password'
          placeholder='Password'
          id='password'
          className='text-gray-900 p-4 rounded-md border-2 border-gray-300 focus:outline-none transition-all duration-300 ease-out'
          onChange={handleChange}
          required
          aria-label='Password'
        />
        <button
          disabled={loading}
          className='bg-gray-800 text-white p-4 mt-1 rounded-md uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? <SyncLoader size={6} color="#fff" /> : 'Sign In'}
        </button>
      </form>
      <div className='flex gap-2 mt-5'>
        <p className='text-gray-800'>Don't have an account?</p>
        <Link to='/signup'>
          <span className='text-gray-600 hover:underline'>Sign Up</span>
        </Link>
      </div>
      {message && <p className='text-red-700 mt-5' aria-live='assertive'>{message}</p>}
    </div>
  );
}
