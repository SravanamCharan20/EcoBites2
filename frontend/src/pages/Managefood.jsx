import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { FiEdit2 } from "react-icons/fi";
import { IoIosAddCircle, IoIosRemoveCircle } from "react-icons/io";
import { HiArrowSmRight } from "react-icons/hi";
import { MdCancelPresentation } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import { HiLocationMarker } from "react-icons/hi";

const ManageFood = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [currentDonor, setCurrentDonor] = useState({});
  const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    foodType: '',
    donationType: '',
    expiryRange: '',
    nutritionalScore: '',
    sustainabilityScore: '',
    distributionPriority: '',
    searchQuery: ''
  });

  // Filter options
  const foodTypes = ['Perishable', 'Non-Perishable'];
  const donationTypes = ['free', 'priced'];
  const expiryRanges = ['1 day', '3 days', '7 days', '15 days', '30 days'];
  const nutritionalScores = ['High', 'Medium', 'Low'];
  const sustainabilityScores = ['Excellent', 'Good', 'Fair'];
  const distributionPriorities = ['Emergency', 'High', 'Normal', 'Low'];

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No Donations found');
          setLoading(false);
          return;
        }

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = atob(base64);
        const { id: userId } = JSON.parse(jsonPayload);

        const response = await fetch(`/api/donor/userdonations/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDonations(data);
      } catch (error) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const applyFilters = (items) => {
    return items.filter(item => {
      // Search query filter
      if (filters.searchQuery && !item.foodItems.some(food => 
        food.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )) {
        return false;
      }

      // Food type filter
      if (filters.foodType && !item.foodItems.some(food => 
        food.type === filters.foodType
      )) {
        return false;
      }

      // Donation type filter
      if (filters.donationType && item.donationType !== filters.donationType) {
        return false;
      }

      // Expiry range filter
      if (filters.expiryRange) {
        const days = parseInt(filters.expiryRange);
        const now = new Date();
        const expiryLimit = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        
        if (!item.foodItems.some(food => {
          const expiryDate = new Date(food.expiryDate);
          return expiryDate <= expiryLimit;
        })) {
          return false;
        }
      }

      // Nutritional score filter
      if (filters.nutritionalScore) {
        const scoreRanges = {
          'High': [80, 100],
          'Medium': [50, 79],
          'Low': [0, 49]
        };
        const range = scoreRanges[filters.nutritionalScore];
        
        if (!item.foodItems.some(food => {
          const score = food.impactMetrics?.nutritionalValue || 0;
          return score >= range[0] && score <= range[1];
        })) {
          return false;
        }
      }

      // Sustainability score filter
      if (filters.sustainabilityScore) {
        const scoreRanges = {
          'Excellent': [80, 100],
          'Good': [60, 79],
          'Fair': [0, 59]
        };
        const range = scoreRanges[filters.sustainabilityScore];
        
        if (!item.foodItems.some(food => {
          const score = food.sustainabilityScore || 0;
          return score >= range[0] && score <= range[1];
        })) {
          return false;
        }
      }

      // Distribution priority filter
      if (filters.distributionPriority && !item.foodItems.some(food => 
        food.distributionPriority === filters.distributionPriority
      )) {
        return false;
      }

      return true;
    });
  };

  const filteredDonations = applyFilters(donations);

  const handleDropdownToggle = (dropdownName) => {
    setDropdown(dropdown === dropdownName ? null : dropdownName);
  };

  const fetchLocation = async (latitude, longitude) => {
    setLocationStatus('Fetching address...');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      if (data && data.address) {
        const { road, county, state, postcode, country } = data.address;
        setCurrentDonor(prevDonor => ({
          ...prevDonor,
          address: {
            street: road || '',
            city: county || '',
            state: state || '',
            postalCode: postcode || '',
            country: country || '',
          },
        }));
        setLocationStatus('Location fetched successfully!');
      } else {
        setLocationStatus('Failed to retrieve address.');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setLocationStatus('Failed to acquire address.');
    }
  };

  const handleEditClick = (donor) => {
    setEditMode(donor._id);
    setCurrentDonor(donor);
    if (donor.latitude && donor.longitude) {
      fetchLocation(donor.latitude, donor.longitude);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/donor/${currentDonor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentDonor),
      });
      if (response.ok) {
        const updatedDonor = await response.json();
        setDonations(donations.map(d => d._id === currentDonor._id ? updatedDonor : d));
        setEditMode(null);
      } else {
        throw new Error('Failed to update donation.');
      }
    } catch (error) {
      setError('Failed to update donation.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentDonor(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLocationMethodChange = (method) => {
    setLocationMethod(method);
    if (method === 'auto' && navigator.geolocation) {
      setLocationStatus('Acquiring location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentDonor(prevDonor => ({
            ...prevDonor,
            latitude,
            longitude,
          }));
          fetchLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setLocationStatus('Failed to acquire location. Please enable location services.');
        },
        {
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  const handleFoodItemChange = (index, e) => {
    const { name, value } = e.target;
    setCurrentDonor(prevDonor => {
      const updatedFoodItems = [...prevDonor.foodItems];
      updatedFoodItems[index] = {
        ...updatedFoodItems[index],
        [name]: value,
      };
      return {
        ...prevDonor,
        foodItems: updatedFoodItems,
      };
    });
  };

  const addFoodItem = () => {
    setCurrentDonor(prevDonor => ({
      ...prevDonor,
      foodItems: [
        ...prevDonor.foodItems,
        {
          type: 'Perishable',
          name: '',
          quantity: '',
          unit: 'kg',
          expiryDate: '',
        },
      ],
    }));
  };

  const removeFoodItem = (index) => {
    setCurrentDonor(prevDonor => {
      const updatedFoodItems = [...prevDonor.foodItems];
      updatedFoodItems.splice(index, 1);
      return {
        ...prevDonor,
        foodItems: updatedFoodItems,
      };
    });
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - Search, Filters, and Stats */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Header Section */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Food Donations</h1>
            <p className="text-lg font-light text-gray-300">
              Track and manage your food donations efficiently
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-gray-50 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center border-2 rounded-full w-full p-2 bg-white">
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search by food item name"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="outline-none w-full"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300"
            >
              <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {showFilters && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                  <select
                    value={filters.foodType}
                    onChange={(e) => setFilters(prev => ({ ...prev, foodType: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Types</option>
                    {foodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donation Type</label>
                  <select
                    value={filters.donationType}
                    onChange={(e) => setFilters(prev => ({ ...prev, donationType: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Types</option>
                    {donationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Range</label>
                  <select
                    value={filters.expiryRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, expiryRange: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Ranges</option>
                    {expiryRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distribution Priority</label>
                  <select
                    value={filters.distributionPriority}
                    onChange={(e) => setFilters(prev => ({ ...prev, distributionPriority: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Priorities</option>
                    {distributionPriorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setFilters({
                    foodType: '',
                    donationType: '',
                    expiryRange: '',
                    nutritionalScore: '',
                    sustainabilityScore: '',
                    distributionPriority: '',
                    searchQuery: ''
                  })}
                  className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Donations List */}
        <div className="col-span-full lg:col-span-8 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading donations...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-3xl p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Donations Found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                You haven't made any food donations yet. When you donate food items, they will appear here for you to manage.
              </p>
              <a 
                href="/add-food-donation" 
                className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
              >
                Make Your First Donation
                <HiArrowSmRight />
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredDonations.map((donation) => (
                <div key={donation._id} className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg">
                  {editMode === donation._id ? (
                    <div className="p-8">
                      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                        {/* Donor Information */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">Donor Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="name"
                              placeholder="Name"
                              value={currentDonor.name}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900"
                            />
                            <input
                              type="email"
                              name="email"
                              placeholder="Email"
                              value={currentDonor.email}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900"
                            />
                            <input
                              type="tel"
                              name="contactNumber"
                              placeholder="Contact Number"
                              value={currentDonor.contactNumber}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900"
                            />
                          </div>
                        </div>

                        {/* Location Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
                          <button
                            type="button"
                            onClick={() => handleLocationMethodChange('auto')}
                            className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <CiLocationArrow1 /> Use Current Location
                          </button>
                          {locationStatus && (
                            <p className="mt-2 text-sm text-gray-600">{locationStatus}</p>
                          )}
                        </div>

                        {/* Food Items */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Food Items</h3>
                            <button
                              type="button"
                              onClick={addFoodItem}
                              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"
                            >
                              <IoIosAddCircle /> Add Food Item
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            {currentDonor.foodItems?.map((item, index) => (
                              <div key={index} className="p-6 border rounded-xl bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input
                                    type="text"
                                    name="name"
                                    placeholder="Food Item Name"
                                    value={item.name}
                                    onChange={(e) => handleFoodItemChange(index, e)}
                                    className="w-full px-4 py-3 border rounded-xl bg-white"
                                  />
                                  <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={item.quantity}
                                    onChange={(e) => handleFoodItemChange(index, e)}
                                    className="w-full px-4 py-3 border rounded-xl bg-white"
                                  />
                                  <input
                                    type="date"
                                    name="expiryDate"
                                    value={item.expiryDate}
                                    onChange={(e) => handleFoodItemChange(index, e)}
                                    className="w-full px-4 py-3 border rounded-xl bg-white"
                                  />
                                  <select
                                    name="type"
                                    value={item.type}
                                    onChange={(e) => handleFoodItemChange(index, e)}
                                    className="w-full px-4 py-3 border rounded-xl bg-white"
                                  >
                                    <option value="">Select Type</option>
                                    {foodTypes.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFoodItem(index)}
                                  className="mt-4 flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                                >
                                  <IoIosRemoveCircle /> Remove Item
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                          <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            Save Changes <HiArrowSmRight />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditMode(null)}
                            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <MdCancelPresentation /> Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">{donation.name}</h2>
                          <p className="text-gray-600">{donation.email}</p>
                          <p className="text-gray-600">{donation.contactNumber}</p>
                        </div>
                        <button
                          onClick={() => handleEditClick(donation)}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200 transition-all duration-300"
                        >
                          <FiEdit2 /> Edit
                        </button>
                      </div>

                      {/* Location Information */}
                      <div className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <HiLocationMarker className="text-blue-600 text-xl" />
                          <h3 className="text-xl font-semibold text-gray-900">Location</h3>
                        </div>
                        {donation.address ? (
                          <div className="space-y-2">
                            <p className="text-gray-600">
                              {donation.address.street && <span className="block">{donation.address.street}</span>}
                              {donation.address.city && donation.address.state && (
                                <span className="block">{donation.address.city}, {donation.address.state}</span>
                              )}
                              {donation.address.postalCode && (
                                <span className="block">{donation.address.postalCode}</span>
                              )}
                              {donation.address.country && (
                                <span className="block">{donation.address.country}</span>
                              )}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500">No location information available</p>
                        )}
                      </div>

                      {/* Food Items Grid */}
                      <div className="grid gap-6">
                        {donation.foodItems.map((item, index) => (
                          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                item.type === 'Perishable' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {item.type}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Quantity</p>
                                <p className="text-lg font-medium text-gray-900">{item.quantity} {item.unit}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Expiry Date</p>
                                <p className="text-lg font-medium text-gray-900">
                                  {new Date(item.expiryDate).toLocaleDateString()}
                                </p>
                              </div>
                              {item.nutritionalValue && (
                                <div>
                                  <p className="text-sm text-gray-500">Nutritional Value</p>
                                  <p className="text-lg font-medium text-gray-900">{item.nutritionalValue}</p>
                                </div>
                              )}
                              {item.sustainabilityScore && (
                                <div>
                                  <p className="text-sm text-gray-500">Sustainability Score</p>
                                  <p className="text-lg font-medium text-gray-900">{item.sustainabilityScore}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageFood;