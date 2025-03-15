import React, { useState, useEffect } from 'react';
import { HiArrowSmRight } from 'react-icons/hi';
import { FiFilter } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const AvailableNonFoodList = () => {
  const [nonFoodItems, setNonFoodItems] = useState([]);
  const [sortedNonFoodItems, setSortedNonFoodItems] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDistances, setLoadingDistances] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    maxDistance: '',
    condition: '',
    category: '',
    priceRange: '',
    sortBy: 'distance' // default sort by distance
  });
  const [showFilters, setShowFilters] = useState(false);

  // Add categories and conditions for non-food items
  const categories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Appliances', 'Tools', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Used'];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const getCoordinatesFromAddress = async (address) => {
    if (!address || !address.city || !address.state || !address.country) {
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

  const fetchNonFoodItems = async () => {
    try {
      const response = await fetch('/api/donor/nfdonorform');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setNonFoodItems(data);
    } catch (error) {
      setError('Failed to load non-food items.');
    } finally {
      setLoading(false);
    }
  };

  const getAddressFromCoordinates = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch address from coordinates');
      }
      const data = await response.json();
      if (data && data.address) {
        return data.address;
      } else {
        console.warn('No address found for coordinates:', lat, lon);
        return null;
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };

  const applyFilters = (items) => {
    return items.filter(item => {
      // Filter by distance
      if (filters.maxDistance && item.distance > parseFloat(filters.maxDistance)) {
        return false;
      }

      // Filter by condition
      if (filters.condition && !item.nonFoodItems.some(nonFood => 
        nonFood.condition?.toLowerCase() === filters.condition.toLowerCase()
      )) {
        return false;
      }

      // Filter by category
      if (filters.category && !item.nonFoodItems.some(nonFood => 
        nonFood.type?.toLowerCase() === filters.category.toLowerCase()
      )) {
        return false;
      }

      // Filter by price range
      if (filters.priceRange) {
        const hasItemInPriceRange = item.nonFoodItems.some(nonFood => {
          const price = parseFloat(nonFood.price || 0);
          switch (filters.priceRange) {
            case 'free':
              return price === 0 || nonFood.donationType === 'free';
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

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'condition':
          const conditionOrder = { 'new': 0, 'like new': 1, 'good': 2, 'fair': 3, 'used': 4 };
          const aCondition = a.nonFoodItems[0]?.condition?.toLowerCase() || 'used';
          const bCondition = b.nonFoodItems[0]?.condition?.toLowerCase() || 'used';
          return conditionOrder[aCondition] - conditionOrder[bCondition];
        case 'price':
          const aPrice = Math.min(...a.nonFoodItems.map(item => parseFloat(item.price) || 0));
          const bPrice = Math.min(...b.nonFoodItems.map(item => parseFloat(item.price) || 0));
          return aPrice - bPrice;
        default:
          return (a.distance || 0) - (b.distance || 0);
      }
    });
  };

  const calculateAndSortNonFoodItems = async () => {
    if (!userLocation || nonFoodItems.length === 0) return;

    setLoadingDistances(true);

    const sortedItems = await Promise.all(
      nonFoodItems.map(async (item) => {
        let itemCoords;

        if (item.location.latitude && item.location.longitude) {
          itemCoords = { lat: parseFloat(item.location.latitude), lon: parseFloat(item.location.longitude) };
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

        const addressFromCoords = await getAddressFromCoordinates(itemCoords.lat, itemCoords.lon);
        
        return { 
          ...item, 
          distance, 
          address: addressFromCoords || item.address
        };
      })
    );

    const filtered = sortedItems
      .filter(item => item !== null);

    setSortedNonFoodItems(applyFilters(filtered));
    setLoadingDistances(false);
  };

  useEffect(() => {
    fetchNonFoodItems();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && nonFoodItems.length > 0) {
      calculateAndSortNonFoodItems();
    }
  }, [userLocation, nonFoodItems, filters]);

  const handleViewDetails = (id) => {
    navigate(`/nonfood-details/${id}`);
  };

  const formatFullAddress = (address) => {
    if (!address) return 'Address not available';
  
    const street = address.road || address.street || 'Street not available';
    const city = address.city || address.town || address.village || 'City not available';
    const state = address.state || 'State not available';
    const postalCode = address.postcode || 'Postal Code not available';
    const country = address.country || 'Country not available';
  
    return `${street}, ${city}, ${state} - ${postalCode}, ${country}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto rounded-lg text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-6xl text-gray-800 font-bold">Available Non-Food List</h1>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
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
                <option value="distance">Distance</option>
                <option value="condition">Condition</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setFilters({
                maxDistance: '',
                condition: '',
                category: '',
                priceRange: '',
                sortBy: 'distance'
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
      {loading && <p className="text-center text-gray-800 opacity-50">Loading non-food items...</p>}
      {loadingDistances && !loading && <p className="text-center text-gray-800 opacity-50">Calculating distances...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {sortedNonFoodItems.length === 0 && !loading && !loadingDistances && (
        <p className="text-center text-gray-800">No donated non-food items available.</p>
      )}

      {sortedNonFoodItems.length > 0 && (
        <table className="min-w-full border-collapse mt-4 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700 text-white text-left rounded-t-lg">
              <th className="px-4 py-3 border-b-2 border-gray-300">Donor</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Non-Food Items</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Distance (km)</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Price</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Quality</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Impact</th>
              <th className="px-4 py-3 border-b-2 border-gray-300">Address</th>
              <th className="px-4 py-3 border-b-2 border-gray-300 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedNonFoodItems.map((item, index) => (
              <tr
                key={item._id}
                className={`border-t border-gray-300 ${index === sortedNonFoodItems.length - 1 ? 'rounded-b-lg' : ''}`}
              >
                <td className="px-4 py-4">{item.name}</td>
                <td className="px-4 py-4">
                  <ul>
                    {item.nonFoodItems.map((nonFood, i) => (
                      <li key={i} className="mb-1">
                        <div className="flex flex-col">
                          <span>{nonFood.name} ({nonFood.condition})</span>
                          <div className="flex gap-1 flex-wrap">
                            {nonFood.aiGeneratedTags?.map((tag, tagIndex) => (
                              <span key={tagIndex} className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-4">{item.distance !== null ? item.distance.toFixed(2) : 'Calculating...'}</td>
                <td className="px-4 py-4">
                  <ul>
                    {item.nonFoodItems.map((nonFood, i) => (
                      <li key={i}>
                        {nonFood.donationType === 'free' || nonFood.price === null 
                          ? 'Free' 
                          : nonFood.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {item.nonFoodItems.map((nonFood, i) => (
                      <div key={i} className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" 
                               style={{backgroundColor: `hsl(${nonFood.qualityMetrics?.rating * 20}, 70%, 50%)`}}></div>
                          <span>Rating: {nonFood.qualityMetrics?.rating}/5</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {nonFood.qualityMetrics?.completeness}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {item.nonFoodItems.map((nonFood, i) => (
                      <div key={i} className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" 
                               style={{backgroundColor: `hsl(${nonFood.sustainabilityScore}, 70%, 50%)`}}></div>
                          <span>Score: {nonFood.sustainabilityScore}</span>
                        </div>
                        {nonFood.impactMetrics && (
                          <div className="text-xs text-gray-600">
                            <div>Benefits: {nonFood.impactMetrics.potentialBeneficiaries} people</div>
                            <div>Saves: {nonFood.impactMetrics.resourcesSaved}kg resources</div>
                            <div>CO2: {nonFood.impactMetrics.carbonFootprintReduced}kg reduced</div>
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

export default AvailableNonFoodList;