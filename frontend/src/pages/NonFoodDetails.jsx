import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HiArrowSmRight } from 'react-icons/hi';
import { CiLocationArrow1 } from "react-icons/ci";


const NonFoodDetails = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchNonFoodDetails = async () => {
      try {
        const response = await fetch(`/api/donor/get-nondonor/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch non-food details.');
        }
        const data = await response.json();
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
          donorId: nonFoodDetails._id,
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
  if (!nonFoodDetails) return <p className="text-center text-gray-500">No details available for this item.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <p className="text-xl text-gray-600 mb-12">Explore the details and request any item if you need it!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-lg shadow-lg border border-slate-200 transition-transform duration-300 hover:scale-105">
          <MapContainer
            center={[nonFoodDetails.location.latitude || 51.505, nonFoodDetails.location.longitude || -0.09]}
            zoom={13}
            style={{ height: '400px', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {nonFoodDetails.location.latitude && nonFoodDetails.location.longitude && (
              <Marker position={[nonFoodDetails.location.latitude, nonFoodDetails.location.longitude]}>
                <Popup>
                  Donor Location: {nonFoodDetails.location.city}, {nonFoodDetails.location.state}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="rounded-lg shadow-lg border-2 border-lime-200 p-6 bg-lime-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Non-Food Details</h2>
          <p className="text-gray-600 mb-2"><strong>Donor Name:</strong> {nonFoodDetails.name}</p>
          <p className="text-gray-600 mb-2"><strong>Contact Number:</strong> {nonFoodDetails.contactNumber}</p>
          <p className="text-gray-600 mb-2"><strong>Location:</strong> {nonFoodDetails.location ? `${nonFoodDetails.location.latitude}, ${nonFoodDetails.location.longitude}` : 'N/A'}</p>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">Non-Food Items</h3>
          {nonFoodDetails.nonFoodItems && nonFoodDetails.nonFoodItems.map((item, index) => (
            <div key={index} className="mb-4 border-t border-gray-300 pt-2">
              <p className="text-gray-600 mb-1"><strong>Name:</strong> {item.name}</p>
              <p className="text-gray-600 mb-1"><strong>Type:</strong> {item.type}</p>
              <p className="text-gray-600 mb-1"><strong>Condition:</strong> {item.condition}</p>
              <p className="text-gray-600 mb-1"><strong>Quantity:</strong> {item.quantity}</p>
              <p className="text-gray-600 mb-1"><strong>Price:</strong> {item.price}</p>
            </div>
          ))}
          <p className="text-gray-600 mb-2"><strong>Available Until:</strong> {new Date(nonFoodDetails.availableUntil).toLocaleDateString()}</p>

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
            <label className="block text-gray-700 mb-1" htmlFor="name">Name:</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="contactNumber">Contact Number:</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2"
              type="text"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              required
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

        
          {successMessage && <p className="text-green-500">{successMessage}</p>}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <button type="submit" className="bg-gray-700 mb-4 mt-4 text-white rounded-3xl py-2 px-4 flex items-center justify-center hover:bg-slate-950">
            Submit<HiArrowSmRight className='ml-2'/>
          </button>
        </form>
      )}
    </div>
  );
};

export default NonFoodDetails;