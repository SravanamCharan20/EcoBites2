import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { FiEdit2 } from "react-icons/fi";
import { IoIosAddCircle, IoIosRemoveCircle } from "react-icons/io";
import { HiArrowSmRight } from "react-icons/hi";
import { MdCancelPresentation } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import { HiLocationMarker } from "react-icons/hi";

const ManageNonFood = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [currentDonor, setCurrentDonor] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    priceRange: '',
    qualityScore: '',
    sustainabilityScore: '',
    searchQuery: ''
  });

  // Filter options
  const categories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Appliances', 'Tools', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Used'];
  const qualityScores = ['High', 'Medium', 'Low'];
  const sustainabilityScores = ['Excellent', 'Good', 'Fair'];

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

        const response = await fetch(`/api/donor/usernonfooddonations/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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
      if (filters.searchQuery && !item.nonFoodItems.some(nonFood => 
        nonFood.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )) {
        return false;
      }

      // Category filter
      if (filters.category && !item.nonFoodItems.some(nonFood => 
        nonFood.category === filters.category
      )) {
        return false;
      }

      // Condition filter
      if (filters.condition && !item.nonFoodItems.some(nonFood => 
        nonFood.condition === filters.condition
      )) {
        return false;
      }

      // Price range filter
      if (filters.priceRange) {
        const hasItemInPriceRange = item.nonFoodItems.some(nonFood => {
          const price = parseFloat(nonFood.price || 0);
          switch (filters.priceRange) {
            case 'free':
              return price === 0;
            case 'under10':
              return price > 0 && price <= 10;
            case 'under50':
              return price > 0 && price <= 50;
            case 'over50':
              return price > 50;
            default:
              return true;
          }
        });
        if (!hasItemInPriceRange) return false;
      }

      // Quality score filter
      if (filters.qualityScore) {
        const scoreRanges = {
          'High': [4, 5],
          'Medium': [2.5, 3.9],
          'Low': [0, 2.4]
        };
        const range = scoreRanges[filters.qualityScore];
        
        if (!item.nonFoodItems.some(nonFood => {
          const score = nonFood.qualityMetrics?.rating || 0;
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
        
        if (!item.nonFoodItems.some(nonFood => {
          const score = nonFood.sustainabilityScore || 0;
          return score >= range[0] && score <= range[1];
        })) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredDonations = applyFilters(donations);

  const handleEditClick = (donor) => {
    setEditMode(donor._id);
    setCurrentDonor(donor);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/donor/nonfood/${currentDonor._id}`, {
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

  const handleNonFoodItemChange = (index, e) => {
    const { name, value } = e.target;
    setCurrentDonor(prevDonor => {
      const updatedNonFoodItems = [...prevDonor.nonFoodItems];
      updatedNonFoodItems[index] = {
        ...updatedNonFoodItems[index],
        [name]: value,
      };
      return {
        ...prevDonor,
        nonFoodItems: updatedNonFoodItems,
      };
    });
  };

  const addNonFoodItem = () => {
    setCurrentDonor(prevDonor => ({
      ...prevDonor,
      nonFoodItems: [
        ...prevDonor.nonFoodItems,
        {
          name: '',
          quantity: '',
        },
      ],
    }));
  };

  const removeNonFoodItem = (index) => {
    setCurrentDonor(prevDonor => {
      const updatedNonFoodItems = [...prevDonor.nonFoodItems];
      updatedNonFoodItems.splice(index, 1);
      return {
        ...prevDonor,
        nonFoodItems: updatedNonFoodItems,
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Non-Food Donations</h1>
            <p className="text-lg font-light text-gray-300">
              Track and manage your non-food donations efficiently
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-gray-50 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center border-2 rounded-full w-full p-2 bg-white">
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search by item name"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Conditions</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Prices</option>
                    <option value="free">Free</option>
                    <option value="under10">Under $10</option>
                    <option value="under50">Under $50</option>
                    <option value="over50">Over $50</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score</label>
                  <select
                    value={filters.qualityScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, qualityScore: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Scores</option>
                    {qualityScores.map(score => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sustainability Score</label>
                  <select
                    value={filters.sustainabilityScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, sustainabilityScore: e.target.value }))}
                    className="w-full p-3 border rounded-xl bg-white"
                  >
                    <option value="">All Scores</option>
                    {sustainabilityScores.map(score => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setFilters({
                    category: '',
                    condition: '',
                    priceRange: '',
                    qualityScore: '',
                    sustainabilityScore: '',
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Non-Food Donations Found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                You haven't made any non-food donations yet. When you donate items like electronics, furniture, or clothing, they will appear here for you to manage.
              </p>
              <a 
                href="/add-nonfood-donation" 
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

                        {/* Non-Food Items */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Non-Food Items</h3>
                            <button
                              type="button"
                              onClick={addNonFoodItem}
                              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"
                            >
                              <IoIosAddCircle /> Add Item
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            {currentDonor.nonFoodItems?.map((item, index) => (
                              <div key={index} className="p-6 border rounded-xl bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input
                                    type="text"
                                    name="name"
                                    placeholder="Item Name"
                                    value={item.name}
                                    onChange={(e) => handleNonFoodItemChange(index, e)}
                                    className="w-full px-4 py-3 border rounded-xl bg-white"
                                  />
                                  <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={item.quantity}
                                    onChange={(e) => handleNonFoodItemChange(index, e)}
                                    className="w-full px-4 py-3 border rounded-xl bg-white"
                                  />
                                  <select
                                    name="category"
                                    value={item.category}
                                    onChange={(e) => handleNonFoodItemChange(index, e)}
                                    className="w-full px-4 py-3 border rounded-xl bg-white"
                                  >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                  <select
                                    name="condition"
                                    value={item.condition}
                                    onChange={(e) => handleNonFoodItemChange(index, e)}
                                    className="w-full px-4 py-3 border rounded-xl bg-white"
                                  >
                                    <option value="">Select Condition</option>
                                    {conditions.map(cond => (
                                      <option key={cond} value={cond}>{cond}</option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeNonFoodItem(index)}
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

                      {/* Non-Food Items Grid */}
                      <div className="grid gap-6">
                        {donation.nonFoodItems.map((item, index) => (
                          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                item.condition === 'New' ? 'bg-green-100 text-green-600' :
                                item.condition === 'Like New' ? 'bg-blue-100 text-blue-600' :
                                item.condition === 'Good' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {item.condition}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Quantity</p>
                                <p className="text-lg font-medium text-gray-900">{item.quantity}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="text-lg font-medium text-gray-900">{item.category}</p>
                              </div>
                              {item.qualityScore && (
                                <div>
                                  <p className="text-sm text-gray-500">Quality Score</p>
                                  <p className="text-lg font-medium text-gray-900">{item.qualityScore}</p>
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

export default ManageNonFood;