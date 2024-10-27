import React, { useState } from 'react';
import { MdOutlinePriceChange } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { HiArrowSmRight } from "react-icons/hi";




const AddFood = () => {
  const initialFormData = {
    name: '',
    email: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    location: {
      latitude: '',
      longitude: '',
    },
    foodItems: [
      {
        type: 'Perishable',
        name: '',
        quantity: '',
        unit: 'kg', // Added unit field to the initial state
        expiryDate: '',
      },
    ],
    availableUntil: '',
    donationType: 'free', // New state for donation type
    price: '', // New state for price
  };

  const [formData, setFormData] = useState(initialFormData);
  const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSuccessMessage('');  // Clear success message
    setErrorMessage('');    // Clear error message
    setLocationStatus('');  // Clear location status

    if (['street', 'city', 'state', 'postalCode', 'country'].includes(name)) {
      setFormData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
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
            location: {
              latitude,
              longitude,
            },
          }));

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

            if (data && data.address) {
              const { road, county, state, postcode, country } = data.address;
              setFormData((prevData) => ({
                ...prevData,
                address: {
                  street: road || '',
                  city: county || '',
                  state: state || '',
                  postalCode: postcode || '',
                  country: country || '',
                },
              }));
              setLocationStatus('Location acquired successfully!');
            } else {
              setLocationStatus('Failed to retrieve address.');
            }
          } catch (error) {
            console.error('Error fetching address:', error);
            setLocationStatus('Failed to acquire address.');
          }
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setLocationStatus('Failed to acquire location.');
        },
        {
          timeout: 100000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus('Geolocation is not supported by this browser.');
    }
  };

  const addFoodItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      foodItems: [
        ...prevData.foodItems,
        {
          type: 'Perishable',
          name: '',
          quantity: '',
          unit: 'kg', // Set default value for unit
          expiryDate: '',
        },
      ],
    }));
  };

  const removeFoodItem = (index) => {
    setFormData((prevData) => {
      const updatedFoodItems = [...prevData.foodItems];
      updatedFoodItems.splice(index, 1);
      return {
        ...prevData,
        foodItems: updatedFoodItems,
      };
    });
  };

  const handleFoodItemChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedFoodItems = [...prevData.foodItems];
      updatedFoodItems[index] = {
        ...updatedFoodItems[index],
        [field]: value,
      };
      return {
        ...prevData,
        foodItems: updatedFoodItems,
      };
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.contactNumber || !formData.availableUntil) {
      return 'Please fill out all required fields.';
    }
    for (const item of formData.foodItems) {
      if (!item.name || !item.quantity || !item.expiryDate) {
        return 'Please fill out all food item fields.';
      }
    }
    if (formData.donationType === 'priced' && !formData.price) {
      return 'Please specify a price for the donation.';
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
      const res = await fetch('/api/donor/donorform', {
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
      <h1 className="col-span-2 text-6xl text-gray-800 font-semibold mb-6 text-center">Donate Food</h1>

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
          className={`p-3 rounded-full flex items-center justify-center ${formData.donationType === 'free' ? 'bg-gray-800 text-white border border-black' : 'border border-black text-black'}`}
        >
          Donate for Free
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, donationType: 'priced' })}
          className={`p-3 rounded-full flex items-center justify-center ${formData.donationType === 'priced' ? 'bg-gray-800 text-white border border-black' : 'border border-black text-black'}`}
        >
          Donate for Price
          <MdOutlinePriceChange className="ml-2" />
        </button>
      </div>

      {/* Price Input */}
      {formData.donationType === 'priced' && (
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleInputChange}
          className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
        />
      )}

      {/* Location Method Selection */}
      {locationMethod === 'auto' && locationStatus && (
        <div className="text-left mt-2">{locationStatus}</div>
      )}
      <div className="col-span-2 flex gap-4">
        <button
          type="button"
          onClick={() => handleLocationMethodChange('auto')}
          className={`p-3 rounded-full flex items-center justify-center ${locationMethod === 'auto' ? 'bg-blue-400 text-white border-2' : 'border-2 text-black'}`}
        >
          Use My Location
          <CiLocationArrow1 className="ml-2" />
        </button>
      </div>

      {/* Location Status */}
      

      {/* Food Items */}
      <div className="col-span-2">
        {formData.foodItems.map((item, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={item.type}
              onChange={(e) => handleFoodItemChange(index, 'type', e.target.value)}
              className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            >
              <option value="Perishable">Perishable</option>
              <option value="Non-Perishable">Non-Perishable</option>
            </select>
            <input
              type="text"
              placeholder="Food Name"
              value={item.name}
              onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
              className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleFoodItemChange(index, 'quantity', e.target.value)}
              className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            />
            <select
              value={item.unit}
              onChange={(e) => handleFoodItemChange(index, 'unit', e.target.value)}
              className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            >
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="units">units</option>
            </select>
            <input
              type="date"
              placeholder="Expiry Date"
              value={item.expiryDate}
              onChange={(e) => handleFoodItemChange(index, 'expiryDate', e.target.value)}
              className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            />
            <button
              type="button"
              onClick={() => removeFoodItem(index)}
              className="col-span-2 bg-red-600 text-white p-3 w-1/3 rounded-3xl flex items-center justify-center"
            >
              Remove Food Item
              <IoIosRemoveCircle className="ml-2" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addFoodItem}
        className="col-span-2 bg-green-400 text-gray-600 p-3 w-1/3 rounded-3xl flex items-center justify-center"
      >
        Add Another Food Item
        <IoIosAddCircle className="ml-2" />
      </button>

      {/* Available Until */}
      <div><h1>Available Until</h1></div>
      <input
        type="datetime-local"
        name="availableUntil"
        placeholder="Available Until"
        value={formData.availableUntil}
        onChange={handleInputChange}
        className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
      />

      {/* Submit */}
      <button
        type="submit"
        onClick={handleSubmit}
        className="col-span-2 bg-gray-800 hover:bg-black w-1/3 text-white p-2 rounded-3xl mt-4 disabled:opacity-50 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
        <HiArrowSmRight className="ml-2" />
      </button>

      {/* Success and Error Messages */}
      {successMessage && <div className="col-span-2 text-green-500 text-center mt-4">{successMessage}</div>}
      {errorMessage && <div className="col-span-2 text-red-500 text-center mt-4">{errorMessage}</div>}
    </div>
  </div>
  );
};

export default AddFood;