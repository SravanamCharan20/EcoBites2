import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        // Navigate to the sign-in page on successful sign-up
        navigate('/signin');
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className='p-4 max-w-lg mx-auto'>
      <h1 className='text-3xl text-gray-800 text-center font-semibold my-11 mb-6'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='text'
          placeholder='Username'
          id='username'
          className='text-gray-900 p-4 rounded-md border-2 border-gray-300 focus:outline-none transition-all duration-300 ease-out'
          onChange={handleChange}
          required
          aria-label='Username'
        />
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
          className='bg-gray-800 text-white p-4 rounded-md uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? <SyncLoader size={6} color="#fff" /> : 'Sign Up'}
        </button>
      </form>
      <div className='flex gap-2 mt-5'>
        <p className='text-gray-800'>Already have an account?</p>
        <Link to='/signin'>
          <span className='text-gray-600 hover:underline'>Sign In</span>
        </Link>
      </div>
      {error && <p className='text-red-700 mt-5' aria-live='assertive'>{error}</p>}
    </div>
  );
}
