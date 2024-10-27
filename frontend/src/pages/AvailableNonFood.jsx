import React, { useState, useEffect } from 'react';
import { HiArrowSmRight } from 'react-icons/hi';
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

    const sorted = sortedItems
      .filter(item => item !== null)
      .sort((a, b) => a.distance - b.distance);

    setSortedNonFoodItems(sorted);
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
  }, [userLocation, nonFoodItems]);

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
      <h1 className="text-6xl text-gray-800 font-bold mb-2 text-center">Available Non-Food List</h1>
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
                      <li key={i}>{nonFood.name} ({nonFood.condition})</li>
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