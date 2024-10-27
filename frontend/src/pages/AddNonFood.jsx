import React, { useState } from 'react';
import { MdOutlinePriceChange } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { HiArrowSmRight } from "react-icons/hi";

const AddNonFood = () => {
  const initialFormData = {
    name: '',
    email: '',
    contactNumber: '',
    location: {
      latitude: '',
      longitude: '',
    },
    nonFoodItems: [
      {
        type: 'Clothing', // Default type
        name: '',
        condition: 'New', // Condition (New/Used)
        quantity: '',
        price: '', // Price for 'priced' donationType
      },
    ],
    availableUntil: '',
    donationType: 'free', // State for donation type
  };

  const [formData, setFormData] = useState(initialFormData);
  const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSuccessMessage('');
    setErrorMessage('');
    setLocationStatus('');
  
    // Check if the input is for latitude or longitude
    if (name === 'latitude' || name === 'longitude') {
      setFormData((prevData) => ({
        ...prevData,
        location: {
          ...prevData.location,
          [name]: value, // Update latitude or longitude
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value, // Update other fields
      }));
    }
  };

  const handleLocationMethodChange = (method) => {
    setLocationMethod(method);
    if (method === 'auto') {
      handleUseLocation();
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('Acquiring location...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prevData) => ({
            ...prevData,
            location: { latitude, longitude },
          }));
          setLocationStatus('Location acquired successfully!');
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setLocationStatus('Failed to acquire location.');
        },
        {
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus('Geolocation is not supported by this browser.');
    }
  };

  const addNonFoodItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      nonFoodItems: [
        ...prevData.nonFoodItems,
        {
          type: 'Clothing', // Default type
          name: '',
          condition: 'New',
          quantity: '',
          price: '',
        },
      ],
    }));
  };

  const removeNonFoodItem = (index) => {
    setFormData((prevData) => {
      const updatedNonFoodItems = [...prevData.nonFoodItems];
      updatedNonFoodItems.splice(index, 1);
      return {
        ...prevData,
        nonFoodItems: updatedNonFoodItems,
      };
    });
  };

  const handleNonFoodItemChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedNonFoodItems = [...prevData.nonFoodItems];
      updatedNonFoodItems[index] = {
        ...updatedNonFoodItems[index],
        [field]: value,
      };
      return {
        ...prevData,
        nonFoodItems: updatedNonFoodItems,
      };
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.contactNumber || !formData.availableUntil) {
      return 'Please fill out all required fields.';
    }
    for (const item of formData.nonFoodItems) {
      if (!item.name || !item.quantity) {
        return 'Please fill out all non-food item fields.';
      }
      if (formData.donationType === 'priced' && !item.price) {
        return 'Please specify a price for all items in a priced donation.';
      }
    }
    if (locationMethod === 'auto' && (!formData.location.latitude || !formData.location.longitude)) {
      return 'Please wait until the location is acquired.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/donor/nfdonorform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Form submitted successfully!');
        setFormData(initialFormData);
      } else {
        setErrorMessage(data.message || 'Form submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('An error occurred while submitting the form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-6 max-w-4xl w-full text-gray-800 rounded-lg grid grid-cols-2 gap-4">
        <h1 className="col-span-2 text-6xl text-gray-800 font-semibold mb-6 text-center">Donate Non-Food</h1>

        {/* Personal Information */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
        />
        <input
          type="tel"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleInputChange}
          className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
        />

        {/* Donation Type Selection */}
        <div className="col-span-2 flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, donationType: 'free' })}
            className={`p-3 rounded-full ${formData.donationType === 'free' ? 'bg-gray-800 text-white border border-black' : 'border border-black text-black'}`}
          >
            Donate for Free
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, donationType: 'priced' })}
            className={`p-3 rounded-full flex items-center gap-2 ${formData.donationType === 'priced' ? 'bg-gray-800 text-white border border-black' : 'border border-black text-black'}`}
          >
            Donate for Price <MdOutlinePriceChange />
          </button>
        </div>

        {locationMethod === 'auto' && locationStatus && (
          <div className="col-span-2 text-left mt-2">{locationStatus}</div>
        )}

        <div className="col-span-2 flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => handleLocationMethodChange('auto')}
            className={`p-3 rounded-full flex items-center gap-2 ${locationMethod === 'auto' ? 'bg-blue-400 text-white border-2' : 'border-2 text-black'}`}
          >
            Use My Location <CiLocationArrow1 />
          </button>
        </div>

        {/* Non-Food Items */}
        {formData.nonFoodItems.map((item, index) => (
          <div key={index} className="col-span-2 grid grid-cols-2 gap-4 mb-4">
            <select
              name="type"
              value={item.type}
              onChange={(e) => handleNonFoodItemChange(index, 'type', e.target.value)}
              className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            >
              <option value="Clothing">Clothing</option>
              <option value="Furniture">Furniture</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Toys">Toys</option>
              <option value="Others">Others</option>
            </select>

            <input
              type="text"
              placeholder="Item Name"
              value={item.name}
              onChange={(e) => handleNonFoodItemChange(index, 'name', e.target.value)}
              className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            />

            <select
              value={item.condition}
              onChange={(e) => handleNonFoodItemChange(index, 'condition', e.target.value)}
              className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleNonFoodItemChange(index, 'quantity', e.target.value)}
              className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            />

            {formData.donationType === 'priced' && (
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleNonFoodItemChange(index, 'price', e.target.value)}
                className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
              />
            )}

            <button
              type="button"
              onClick={() => removeNonFoodItem(index)}
              className="col-span-3 bg-red-600 text-white p-3 w-1/3 rounded-3xl flex items-center gap-2"
            >
              Remove Non-Food Item <IoIosRemoveCircle />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addNonFoodItem}
          className="col-span-2 w-1/3 rounded-3xl bg-green-500 text-white p-3 flex items-center gap-2"
        >
          Add Another Non-Food Item <IoIosAddCircle />
        </button>

        {/* Location Method */}
        

       

        {/* Available Until */}
        <input
          type="datetime-local"
          name="availableUntil"
          value={formData.availableUntil}
          onChange={handleInputChange}
          className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
        />

        {/* Success and Error Messages */}
        {successMessage && <div className="col-span-2 text-green-500 text-center mt-4">{successMessage}</div>}
        {errorMessage && <div className="col-span-2 text-red-500 text-center mt-4">{errorMessage}</div>}

        <button
        type="submit"
        onClick={handleSubmit}
        className="col-span-2 bg-gray-800 hover:bg-black w-1/3 text-white p-2 rounded-3xl mt-4 disabled:opacity-50 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
        <HiArrowSmRight className="ml-2" />
      </button>
      </div>
    </div>
  );
};

export default AddNonFood;