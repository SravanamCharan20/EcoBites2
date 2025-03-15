import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HiArrowSmRight } from 'react-icons/hi';
import { CiLocationArrow1 } from "react-icons/ci";


const NonFoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [nonFoodDetails, setNonFoodDetails] = useState(null);
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
  const [locationStatus, setLocationStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const requestFormRef = useRef(null);

  useEffect(() => {
    const fetchNonFoodDetails = async () => {
      try {
        const response = await fetch(`/api/donor/get-nondonor/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch non-food details.');
        }
        const data = await response.json();
        console.log('Fetched non-food details:', data);
        setNonFoodDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNonFoodDetails();
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
      const response = await fetch('/api/donor/request-nonfood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId: nonFoodDetails?._id?.toString(),
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
      const donorId = nonFoodDetails.userId;
      
      console.log('NonFoodDetails - Full item details:', nonFoodDetails);
      console.log('NonFoodDetails - Chat initialization details:', {
        donorId,
        requesterId: currentUser.id,
        nonFoodItemId: nonFoodDetails._id,
        itemDetails: nonFoodDetails.nonFoodItems?.[0],
        location: nonFoodDetails.location,
        contactInfo: {
          email: nonFoodDetails.email,
          contactNumber: nonFoodDetails.contactNumber
        }
      });

      const response = await fetch('/api/chat/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId: donorId,
          requesterId: currentUser.id,
          foodItemId: nonFoodDetails._id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NonFoodDetails - Chat initialization error:', errorData);
        throw new Error(errorData.message || 'Failed to initialize chat');
      }
      
      const chat = await response.json();
      console.log('NonFoodDetails - Chat initialized successfully:', chat);
      
      // Navigate directly to the chat page with the specific chat selected
      const chatPath = `/chats?chatId=${chat._id}`;
      navigate(chatPath);
    } catch (error) {
      console.error('NonFoodDetails - Error initializing chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  // Update the AI estimation helper functions with more specific logic
  const estimateQualityMetrics = (itemName, condition, type) => {
    // Base quality scores by condition
    const conditionScores = {
      new: { base: 95, durability: 100 },
      'like new': { base: 85, durability: 90 },
      good: { base: 75, durability: 80 },
      fair: { base: 60, durability: 65 },
      used: { base: 50, durability: 55 }
    };

    // Type-specific modifiers
    const typeModifiers = {
      electronics: { baseModifier: 1.1, durabilityModifier: 0.9 },
      furniture: { baseModifier: 1.0, durabilityModifier: 1.1 },
      clothing: { baseModifier: 0.9, durabilityModifier: 0.95 },
      books: { baseModifier: 1.0, durabilityModifier: 1.0 },
      appliances: { baseModifier: 1.0, durabilityModifier: 0.9 },
      tools: { baseModifier: 1.1, durabilityModifier: 1.2 }
    };

    const itemCondition = (condition || 'used').toLowerCase();
    const itemType = (type || 'general').toLowerCase();
    
    const baseScores = conditionScores[itemCondition] || conditionScores.used;
    const modifiers = typeModifiers[itemType] || { baseModifier: 1.0, durabilityModifier: 1.0 };

    const qualityScore = Math.min(100, Math.round(baseScores.base * modifiers.baseModifier));
    const durabilityScore = Math.min(100, Math.round(baseScores.durability * modifiers.durabilityModifier));
    
    return {
      rating: Math.ceil(qualityScore / 20),
      durabilityScore: durabilityScore,
      conditionDetails: `${itemCondition.charAt(0).toUpperCase() + itemCondition.slice(1)} condition ${type} item`
    };
  };

  const estimateImpact = (itemName, condition, type) => {
    // Impact metrics based on item type
    const typeImpact = {
      electronics: { beneficiaries: 3, resourcesSaved: 75, impact: 'High impact through e-waste reduction' },
      furniture: { beneficiaries: 4, resourcesSaved: 100, impact: 'Significant wood and material conservation' },
      clothing: { beneficiaries: 2, resourcesSaved: 25, impact: 'Reduces textile waste and water usage' },
      books: { beneficiaries: 5, resourcesSaved: 15, impact: 'Promotes education and paper conservation' },
      appliances: { beneficiaries: 3, resourcesSaved: 85, impact: 'Reduces electronic waste and energy consumption' },
      tools: { beneficiaries: 4, resourcesSaved: 45, impact: 'Extends product lifecycle and reduces manufacturing demand' }
    };

    const itemType = (type || 'general').toLowerCase();
    const metrics = typeImpact[itemType] || { beneficiaries: 2, resourcesSaved: 30, impact: 'Positive impact through reuse' };

    return {
      potentialBeneficiaries: metrics.beneficiaries,
      resourcesSaved: metrics.resourcesSaved,
      environmentalImpact: metrics.impact
    };
  };

  const estimateMarketValue = (itemName, condition, type) => {
    // Market analysis based on item type and condition
    const typeMarketInfo = {
      electronics: { demand: 'High', value: 'Strong resale potential' },
      furniture: { demand: 'Moderate', value: 'Good value for quality pieces' },
      clothing: { demand: 'Variable', value: 'Depends on brand and condition' },
      books: { demand: 'Steady', value: 'Educational materials in high demand' },
      appliances: { demand: 'High', value: 'Essential items with good value' },
      tools: { demand: 'Moderate', value: 'Practical items retain value well' }
    };

    const itemType = (type || 'general').toLowerCase();
    const marketInfo = typeMarketInfo[itemType] || { demand: 'Moderate', value: 'Standard resale value' };

    return {
      demandLevel: marketInfo.demand,
      competitiveValue: marketInfo.value
    };
  };

  const scrollToRequestForm = () => {
    setShowRequestForm(true);
    requestFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!nonFoodDetails) return <p className="text-center text-gray-500">No details available for this item.</p>;

  return (
    <div className="min-h-screen bg-white">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - Map and Donor Info */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Map Section */}
          <div className="h-[40vh] rounded-3xl overflow-hidden shadow-lg">
            {nonFoodDetails?.location ? (
              <MapContainer
                center={[nonFoodDetails.location?.latitude || 51.505, nonFoodDetails.location?.longitude || -0.09]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {nonFoodDetails.location?.latitude && nonFoodDetails.location?.longitude && (
                  <Marker position={[nonFoodDetails.location.latitude, nonFoodDetails.location.longitude]}>
                    <Popup>
                      Donor Location: {nonFoodDetails.location?.city || ''}, {nonFoodDetails.location?.state || ''}
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
                <p className="text-xl font-medium text-gray-900">{nonFoodDetails?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="text-xl font-medium text-gray-900">{nonFoodDetails?.contactNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-xl font-medium text-gray-900">
                  {nonFoodDetails?.address ? 
                    [nonFoodDetails.address.city, nonFoodDetails.address.state].filter(Boolean).join(', ') : 
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
              Request Item <HiArrowSmRight />
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

        {/* Right Column - Item Details */}
        <div className="col-span-full lg:col-span-8 space-y-6">
          {/* Header */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {nonFoodDetails?.nonFoodItems?.[0]?.name || 'Item Details'}
            </h1>
            <p className="text-lg font-light text-gray-300">
              Share resources, reduce waste, and make a difference in your community
            </p>
          </div>

          {/* Non-Food Items */}
          <div className="space-y-8">
            {(nonFoodDetails?.nonFoodItems || []).map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-3xl p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Item Specifications */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Specifications</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="text-lg font-medium text-gray-900">{item?.type || 'General'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Condition</p>
                        <p className="text-lg font-medium text-gray-900">{item?.condition || 'Used'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Material</p>
                        <p className="text-lg font-medium text-gray-900">{item?.material || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Features</p>
                        <p className="text-lg font-medium text-gray-900">{item?.features?.join(', ') || 'None specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quality Metrics */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Assessment</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(estimateQualityMetrics(item?.name || '', item?.condition, item?.type)).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                          <p className="text-3xl font-medium text-gray-900">
                            {key === 'rating' ? '⭐'.repeat(value) : value}
                            {key !== 'rating' && <span className="text-base text-gray-500 ml-1">%</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm md:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Accessories</p>
                        <p className="text-lg font-medium text-gray-900">
                          {item?.accessories?.join(', ') || 'None included'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dimensions</p>
                        <p className="text-lg font-medium text-gray-900">
                          {item?.dimensions || 'Not specified'}
                        </p>
                      </div>
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

export default NonFoodDetails;