/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowSmRight } from "react-icons/hi";
import { FiFilter } from "react-icons/fi";

const AvailableFoodList = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [sortedFoodItems, setSortedFoodItems] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDistances, setLoadingDistances] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    maxDistance: '',
    expiryDate: '',
    category: '',
    priceRange: '',
    sortBy: 'expiry' // default sort by expiry date
  });
  const [showFilters, setShowFilters] = useState(false);

  // Add categories for food items
  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Beverages', 'Snacks', 'Other'];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const getCoordinatesFromAddress = async (address) => {
    if (!address || !address.city || !address.state || !address.country) {
      console.error('Incomplete address:', address);
      return null;
    }

    const query = `${address.street ? address.street + ' ' : ''}${address.city}, ${address.state}, ${address.country}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      } else {
        console.warn('No coordinates found for query:', query);
        return null;
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError('');
        },
        (error) => {
          console.error('Error getting user location:', error);
          setLocationError('Failed to get user location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await fetch('/api/donor/donorform');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      setError('Failed to load food items.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (items) => {
    return items.filter(item => {
      // Filter by distance
      if (filters.maxDistance && item.distance > parseFloat(filters.maxDistance)) {
        return false;
      }

      // Filter by expiry date
      if (filters.expiryDate) {
        const today = new Date();
        const expiryDate = new Date(item.foodItems[0].expiryDate);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        switch (filters.expiryDate) {
          case '1':
            if (diffDays > 1) return false;
            break;
          case '3':
            if (diffDays > 3) return false;
            break;
          case '7':
            if (diffDays > 7) return false;
            break;
          default:
            break;
        }
      }

      // Filter by category
      if (filters.category && !item.foodItems.some(food => 
        food.category?.toLowerCase() === filters.category.toLowerCase()
      )) {
        return false;
      }

      // Filter by price range
      if (filters.priceRange) {
        const price = parseFloat(item.price || 0);
        switch (filters.priceRange) {
          case 'free':
            if (price !== 0) return false;
            break;
          case 'under10':
            if (price > 10) return false;
            break;
          case 'under50':
            if (price > 50) return false;
            break;
          case 'over50':
            if (price <= 50) return false;
            break;
          default:
            break;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'price':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'expiry':
        default:
          return new Date(a.foodItems[0].expiryDate) - new Date(b.foodItems[0].expiryDate);
      }
    });
  };

  const calculateAndSortFoodItems = async () => {
    if (!userLocation || foodItems.length === 0) return;

    setLoadingDistances(true);
    const currentDate = new Date();

    const sortedItems = await Promise.all(
      foodItems.map(async (item) => {
        let itemCoords;

        if (item.location.latitude && item.location.longitude) {
          itemCoords = { lat: item.location.latitude, lon: item.location.longitude };
        } else {
          itemCoords = await getCoordinatesFromAddress(item.address);
        }

        if (!itemCoords) return null;

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          itemCoords.lat,
          itemCoords.lon
        );

        const validFoodItems = item.foodItems.filter(food => new Date(food.expiryDate) >= currentDate);

        if (validFoodItems.length === 0) return null;

        return { ...item, distance, foodItems: validFoodItems };
      })
    );

    const filtered = sortedItems
      .filter(item => item !== null)
      .filter(item => item.foodItems.length > 0);

    setSortedFoodItems(applyFilters(filtered));
    setLoadingDistances(false);
  };

  useEffect(() => {
    fetchFoodItems();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && foodItems.length > 0) {
      calculateAndSortFoodItems();
    }
  }, [userLocation, foodItems, filters]);

  const handleViewDetails = (id) => {
    navigate(`/food-details/${id}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString(undefined, options);
  };

  const formatFullAddress = (address) => {
    const { street, city, state, postalCode, country } = address || {};
    return `${street ? street + ', ' : ''}${city}, ${state} - ${postalCode}, ${country}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto rounded-lg text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-6xl text-gray-800 font-bold">Available Food List</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          <FiFilter /> Filters
        </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance (km)</label>
              <input
                type="number"
                value={filters.maxDistance}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="Enter distance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Within</label>
              <select
                value={filters.expiryDate}
                onChange={(e) => setFilters(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All</option>
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Prices</option>
                <option value="free">Free</option>
                <option value="under10">Under $10</option>
                <option value="under50">Under $50</option>
                <option value="over50">Over $50</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="expiry">Expiry Date</option>
                <option value="distance">Distance</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setFilters({
                maxDistance: '',
                expiryDate: '',
                category: '',
                priceRange: '',
                sortBy: 'expiry'
              })}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {locationError ? (
        <p className="text-center text-red-500">{locationError}</p>
      ) : userLocation ? (
        <p className="text-center text-gray-800 opacity-50">Location acquired successfully.</p>
      ) : (
        <p className="text-center text-gray-800">Fetching your location...</p>
      )}
      {loading && <p className="text-center text-gray-800 opacity-50">Loading food items...</p>}
      {loadingDistances && !loading && <p className="text-center text-gray-800 opacity-50">Calculating distances...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {sortedFoodItems.length === 0 && !loading && !loadingDistances && (
        <p className="text-center text-gray-800">No donated food items available.</p>
      )}

      {sortedFoodItems.length > 0 && (
        <table className="min-w-full border-collapse mt-4 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700 text-white text-left rounded-t-lg">
              <th className="px-4 py-3 border-b-2 border-gray-300">Donor</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Food Items</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Expiry Date</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Distance (km)</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Price</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Impact</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Address</th>
              <th className="px-4 py-3 border-b-2 border-gray-300 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedFoodItems.map((item, index) => (
              <tr
                key={item._id}
                className={`border-t border-gray-300 ${index === sortedFoodItems.length - 1 ? 'rounded-b-lg' : ''}`}
              >
                <td className="px-4 py-4">{item.name}</td>
                <td className="px-4 py-4">
                  <ul>
                    {item.foodItems.map((food, i) => (
                      <li key={i} className="mb-1">
                        <div className="flex flex-col">
                          <span>{food.name}</span>
                          <div className="flex gap-1 flex-wrap">
                            {food.aiGeneratedTags?.map((tag, tagIndex) => (
                              <span key={tagIndex} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-4">{formatDate(item.foodItems[0].expiryDate)}</td>
                <td className="px-4 py-4">{item.distance ? item.distance.toFixed(2) : 'N/A'}</td>
                <td className="px-4 py-4">{item.price ? item.price.toFixed(2) : 'Free'}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {item.foodItems.map((food, i) => (
                      <div key={i} className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" 
                               style={{backgroundColor: `hsl(${food.sustainabilityScore}, 70%, 50%)`}}></div>
                          <span>Score: {food.sustainabilityScore}</span>
                        </div>
                        {food.impactMetrics && (
                          <div className="text-xs text-gray-600">
                            <div>Meals: {food.impactMetrics.potentialMealsProvided}</div>
                            <div>CO2: {food.impactMetrics.carbonFootprintSaved}kg</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">{formatFullAddress(item.address)}</td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleViewDetails(item._id)}
                    className="bg-gray-700 text-white rounded-3xl py-2 px-4 flex items-center justify-center hover:bg-slate-950"
                  >
                    More<HiArrowSmRight className='ml-2'/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AvailableFoodList;