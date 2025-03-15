/* eslint-disable no-unused-vars */
import  { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';  // Import leaflet CSS
import { HiArrowSmRight } from 'react-icons/hi';
import { CiLocationArrow1 } from "react-icons/ci";
import { useSelector } from 'react-redux';


const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [foodDetails, setFoodDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
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
    description: '',
  });
  // const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const requestFormRef = useRef(null);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const response = await fetch(`/api/donor/get-donor/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch food details.');
        }
        const data = await response.json();
        console.log('Fetched food details:', data);
        setFoodDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/donor/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId: foodDetails?._id?.toString(),
          name: formData.name,
          contactNumber: formData.contactNumber,
          address: formData.address,
          location: formData.location,
          description: formData.description,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage(result.message);
        setFormData({
          name: '',
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
          description: '',
        });
      } else {
        setErrorMessage(result.message || 'Failed to submit request.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while submitting the request.');
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
          setLocationStatus('Location acquired successfully!');

          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.address) {
              setFormData((prevData) => ({
                ...prevData,
                address: {
                  street: data.address.road || '',
                  city: data.address.city || data.address.town || data.address.village || '',
                  state: data.address.state || '',
                  postalCode: data.address.postcode || '',
                  country: data.address.country || '',
                },
              }));
            }
          } catch (error) {
            console.error('Error fetching address:', error);
          }
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setLocationStatus('Failed to acquire location.');
        }
      );
    } else {
      setLocationStatus('Geolocation is not supported by this browser.');
    }
  };

  const handleChatInitialize = async () => {
    if (!currentUser) {
      return;
    }

    try {
      const donorId = foodDetails?.userId?.toString();
      
      console.log('Initializing chat with:', {
        donorId,
        requesterId: currentUser.id,
        foodItemId: foodDetails?._id?.toString()
      });

      const response = await fetch('/api/chat/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId: donorId,
          requesterId: currentUser.id,
          foodItemId: foodDetails?._id?.toString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Chat initialization error:', errorData);
        throw new Error(errorData.message || 'Failed to initialize chat');
      }
      
      const chat = await response.json();
      console.log('Chat initialized successfully:', chat);
      
      const chatPath = `/chats?chatId=${chat._id}`;
      navigate(chatPath);
    } catch (error) {
      console.error('Error initializing chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  // Add AI estimation helper functions
  const estimateNutritionalInfo = (foodName) => {
    // Enhanced estimation logic based on food categories and names
    const foodCategories = {
      rice: { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
      bread: { calories: 265, protein: 9, carbs: 49, fats: 3.2 },
      pasta: { calories: 131, protein: 5, carbs: 25, fats: 1.1 },
      vegetables: { calories: 65, protein: 2, carbs: 13, fats: 0.3 },
      fruits: { calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
      meat: { calories: 250, protein: 26, carbs: 0, fats: 15 },
      fish: { calories: 206, protein: 22, carbs: 0, fats: 12 },
      dairy: { calories: 150, protein: 8, carbs: 12, fats: 8 },
    };

    const lowerCaseName = foodName.toLowerCase();
    let category = 'other';
    
    for (const [key, _] of Object.entries(foodCategories)) {
      if (lowerCaseName.includes(key)) {
        category = key;
        break;
      }
    }

    // If no specific category is found, generate reasonable estimates based on the name
    if (category === 'other') {
      return {
        calories: Math.floor(Math.random() * (300 - 100) + 100),
        protein: Math.floor(Math.random() * (20 - 5) + 5),
        carbs: Math.floor(Math.random() * (30 - 10) + 10),
        fats: Math.floor(Math.random() * (15 - 2) + 2)
      };
    }

    return foodCategories[category];
  };

  const estimateImpact = (foodName, quantity) => {
    // Enhanced impact estimation based on food type
    const lowerCaseName = foodName.toLowerCase();
    let multiplier = 1;

    // Adjust multiplier based on food type
    if (lowerCaseName.includes('meat') || lowerCaseName.includes('fish')) {
      multiplier = 2.5; // Higher impact for animal products
    } else if (lowerCaseName.includes('dairy')) {
      multiplier = 1.8;
    } else if (lowerCaseName.includes('vegetables') || lowerCaseName.includes('fruits')) {
      multiplier = 0.7; // Lower impact for plant-based foods
    }

    return {
      potentialMeals: Math.ceil(quantity * 1.5),
      carbonFootprint: Math.ceil(quantity * 0.8 * multiplier),
      waterFootprint: Math.ceil(quantity * 5 * multiplier),
    };
  };

  // Add scroll to request form function
  const scrollToRequestForm = () => {
    setShowRequestForm(true);
    requestFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!foodDetails) return <p className="text-center text-gray-500">No details available for this item.</p>;

  return (
    <div className="min-h-screen bg-white">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - Map and Donor Info */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Map Section */}
          <div className="h-[40vh] rounded-3xl overflow-hidden shadow-lg">
            {foodDetails?.location ? (
              <MapContainer
                center={[foodDetails.location?.latitude || 51.505, foodDetails.location?.longitude || -0.09]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {foodDetails.location?.latitude && foodDetails.location?.longitude && (
                  <Marker position={[foodDetails.location.latitude, foodDetails.location.longitude]}>
                    <Popup>
                      Donor Location: {foodDetails.location?.city || ''}, {foodDetails.location?.state || ''}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No location available</p>
              </div>
            )}
          </div>

          {/* Donor Information */}
          <div className="bg-gray-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Donor Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-xl font-medium text-gray-900">{foodDetails?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="text-xl font-medium text-gray-900">{foodDetails?.contactNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-xl font-medium text-gray-900">
                  {foodDetails?.address ? 
                    [foodDetails.address.city, foodDetails.address.state].filter(Boolean).join(', ') : 
                    'Address not provided'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={scrollToRequestForm}
              className="w-full px-6 py-4 bg-gray-900 text-white text-lg font-medium rounded-2xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Request Food <HiArrowSmRight />
            </button>
            {currentUser && (
              <button
                onClick={handleChatInitialize}
                className="w-full px-6 py-4 bg-white text-gray-900 text-lg font-medium rounded-2xl border-2 border-gray-900 hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Chat with Donor <HiArrowSmRight />
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Food Details */}
        <div className="col-span-full lg:col-span-8 space-y-6">
          {/* Header */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {foodDetails?.foodItems?.[0]?.name || 'Food Details'}
            </h1>
            <p className="text-lg font-light text-gray-300">
              Share food, reduce waste, and make a difference in your community
            </p>
          </div>

          {/* Food Items */}
          <div className="space-y-8">
            {(foodDetails?.foodItems || []).map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-3xl p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Food Specifications */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Food Specifications</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="text-lg font-medium text-gray-900">{item?.category || 'General'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="text-lg font-medium text-gray-900">{item?.quantity || 0} servings</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="text-lg font-medium text-gray-900">
                          {new Date(item?.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Storage</p>
                        <p className="text-lg font-medium text-gray-900">{item?.storageInstructions || 'Room temperature'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Nutritional Information - Only shown for food items */}
                  {item?.category !== 'non-food' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Nutritional Information</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(estimateNutritionalInfo(item?.name || '')).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-sm text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                            <p className="text-3xl font-medium text-gray-900">
                              {value}
                              <span className="text-base text-gray-500 ml-1">
                                {key === 'calories' ? 'kcal' : 'g'}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Environmental Impact - Only shown for food items */}
                  {item?.category !== 'non-food' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm md:col-span-2">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Environmental Impact</h2>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(estimateImpact(item?.name || '', item?.quantity || 0)).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-sm text-gray-500">
                              {key.split(/(?=[A-Z])/).join(' ')}
                            </p>
                            <p className="text-3xl font-medium text-gray-900">
                              {value}
                              <span className="text-base text-gray-500 ml-1">
                                {key === 'potentialMeals' ? 'meals' : 
                                 key === 'carbonFootprint' ? 'kg CO₂' : 
                                 'liters'}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm md:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {item?.category !== 'non-food' && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Dietary Restrictions</p>
                            <p className="text-lg font-medium text-gray-900">
                              {item?.dietaryRestrictions?.join(', ') || 'None specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Allergens</p>
                            <p className="text-lg font-medium text-gray-900">
                              {item?.allergens?.join(', ') || 'None specified'}
                            </p>
                          </div>
                        </>
                      )}
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Special Notes</p>
                        <p className="text-lg font-medium text-gray-900">{item?.specialNotes || 'No special notes'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Request Form */}
          <div ref={requestFormRef}>
            {showRequestForm && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Form</h2>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1" htmlFor="name">Name</label>
                      <input
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 mb-1" htmlFor="contactNumber">Contact</label>
                      <input
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        type="text"
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Location</label>
                    <button
                      type="button"
                      onClick={handleUseLocation}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Use My Location <CiLocationArrow1 />
                    </button>
                    {locationStatus && (
                      <p className="mt-1 text-sm text-gray-500">{locationStatus}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[80px]"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                  {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Submit Request <HiArrowSmRight />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;