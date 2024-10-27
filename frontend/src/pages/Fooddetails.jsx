import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';  // Import leaflet CSS
import { HiArrowSmRight } from 'react-icons/hi';
import { CiLocationArrow1 } from "react-icons/ci";


const FoodDetails = () => {
  const { id } = useParams();
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
  const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const response = await fetch(`/api/donor/get-donor/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch food details.');
        }
        const data = await response.json();
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
          donorId: foodDetails._id,
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

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!foodDetails) return <p className="text-center text-gray-500">No details available for this item.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <p className="text-xl text-gray-600 mb-12">Explore the details and request any item if you need it!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-lg shadow-lg border border-slate-200 transition-transform duration-300 hover:scale-105">
          <MapContainer
            center={[foodDetails.location.latitude || 51.505, foodDetails.location.longitude || -0.09]}
            zoom={13}
            style={{ height: '400px', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {foodDetails.location.latitude && foodDetails.location.longitude && (
              <Marker position={[foodDetails.location.latitude, foodDetails.location.longitude]}>
                <Popup>
                  Donor Location: {foodDetails.location.city}, {foodDetails.location.state}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="rounded-lg shadow-lg border-2 border-lime-200 p-6 bg-lime-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Food Details</h2>
          <p className="text-gray-600 mb-2"><strong>Donor Name:</strong> {foodDetails.name}</p>
          <p className="text-gray-600 mb-2"><strong>Contact Number:</strong> {foodDetails.contactNumber}</p>
          <p className="text-gray-600 mb-2"><strong>Address:</strong> {foodDetails.address.street}, {foodDetails.address.city}, {foodDetails.address.state}, {foodDetails.address.postalCode}, {foodDetails.address.country}</p>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">Food Items</h3>
          {foodDetails.foodItems.map((item) => (
            <div key={item._id} className="mb-4 border-t border-gray-300 pt-2">
              <p className="text-gray-600 mb-1"><strong>Name:</strong> {item.name}</p>
              <p className="text-gray-600 mb-1"><strong>Quantity:</strong> {item.quantity}</p>
              <p className="text-gray-600 mb-1"><strong>Unit:</strong> {item.unit}</p>
              <p className="text-gray-600 mb-1"><strong>Expiry Date:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
            </div>
          ))}

          <p className="text-gray-600 mb-2"><strong>Available Until:</strong> {new Date(foodDetails.availableUntil).toLocaleDateString()}</p>
          <div className="mt-6">
            <button
              className="bg-gray-700 text-white rounded-3xl py-2 px-4 flex items-center justify-center hover:bg-slate-950"
              onClick={() => setShowRequestForm(!showRequestForm)}
            >
              {showRequestForm ? 'Cancel Request' : 'Request Item '}<HiArrowSmRight className='ml-2'/>
            </button>
          </div>
        </div>
      </div>

      {showRequestForm && (
        <form onSubmit={handleRequestSubmit} className="mt-8 rounded-lg shadow-lg border-2 border-pink-200 p-6 bg-pink-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Request Form</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              required
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-4">Location</h3>
          <p className="mb-2">{locationStatus}</p>
          <button type="button" onClick={handleUseLocation} className="bg-blue-400 mb-4 text-white rounded-3xl py-2 px-4 flex items-center justify-center hover:bg-blue-500">
            Use My Location<CiLocationArrow1 className='ml-2'/>
          </button>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
          </div>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
          <button type="submit" className="bg-gray-700 mb-4 mt-4 text-white rounded-3xl py-2 px-4 flex items-center justify-center hover:bg-slate-950">
            Submit<HiArrowSmRight className='ml-2'/>
          </button>
        </form>
      )}
    </div>
  );
};

export default FoodDetails;