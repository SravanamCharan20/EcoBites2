import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { FiEdit2 } from "react-icons/fi";
import { IoIosAddCircle, IoIosRemoveCircle } from "react-icons/io";
import { HiArrowSmRight } from "react-icons/hi";
import { MdCancelPresentation } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";


const ManageFood = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [currentDonor, setCurrentDonor] = useState({});
  const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [dropdown, setDropdown] = useState(null);
  const [searchItemName, setSearchItemName] = useState(''); // Changed to searchItemName

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

  // Filter donations based on food item name search
  const filteredDonations = donations.filter(donation =>
    donation.foodItems.some(item => 
      item.name.toLowerCase().includes(searchItemName.toLowerCase())
    )
  );

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
    <div className="flex flex-col">
      <div className="flex-1 p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl text-gray-800 font-semibold mb-4">Manage Donations</h1>

        <div className="flex items-center border-2 mb-3 rounded-full w-auto p-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Search By Food Item Name"
            value={searchItemName}
            onChange={(e) => setSearchItemName(e.target.value)}
            className="outline-none w-full"
          />
        </div>

        {filteredDonations.length === 0 ? (
          <p className='text-red-500 ml-2'>No donations found.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {filteredDonations.map((donation) => (
              <li key={donation._id} className="border p-4 mb-4 rounded shadow-lg hover:shadow-xl transition-shadow">
                {editMode === donation._id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={currentDonor.name}
                      onChange={handleChange}
                      className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2 mb-2 w-full"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={currentDonor.email}
                      onChange={handleChange}
                      className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2 mb-2 w-full"
                    />
                    <input
                      type="tel"
                      name="contactNumber"
                      placeholder="Contact Number"
                      value={currentDonor.contactNumber}
                      onChange={handleChange}
                      className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2 mb-2 w-full"
                    />

                    {locationStatus && <p className="text-gray-800 mt-2 mb-2">{locationStatus}</p>}
                    <div className="flex gap-4 mb-2">
                      <button
                        type="button"
                        onClick={() => handleLocationMethodChange('auto')}
                        className={`border-2 rounded-full p-2 px-3 ${locationMethod === 'auto' ? 'bg-blue-400 text-white border-2' : 'border-2 text-black'} transition-colors duration-300`}
                      >
                        Use Current Location <CiLocationArrow1 className="inline ml-1" />
                      </button>
                    </div>

                    <h2 className="text-xl font-semibold mb-2">Food Items</h2>
                    {currentDonor.foodItems.map((item, index) => (
                      <div key={index} className="mb-4 border p-3 rounded-lg">
                        <input
                          type="text"
                          name="name"
                          placeholder="Food Item Name"
                          value={item.name}
                          onChange={(e) => handleFoodItemChange(index, e)}
                          className="border p-2 rounded w-full mb-2"
                        />
                        <input
                          type="number"
                          name="quantity"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleFoodItemChange(index, e)}
                          className="border p-2 rounded w-full mb-2"
                        />
                        <input
                          type="date"
                          name="expiryDate"
                          placeholder="Expiry Date"
                          value={item.expiryDate}
                          onChange={(e) => handleFoodItemChange(index, e)}
                          className="border p-2 rounded w-full mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          className="text-white border-2 p-2 rounded-full bg-red-500 px-3 hover:bg-red-700"
                        >
                          Remove Food Item <IoIosRemoveCircle className="inline ml-1" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFoodItem}
                      className="bg-green-500 text-white p-2 px-3 rounded-full mb-4"
                    >
                      Add Food Item <IoIosAddCircle className="inline ml-1" />
                    </button>

                    <button
                      type="submit"
                      className="bg-gray-800 hover:bg-black rounded-full text-white p-2 px-3 ml-2"
                    >
                      Save Changes <HiArrowSmRight className="inline ml-1" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(null)}
                      className="bg-gray-300 text-black p-2 px-3 rounded-full ml-2"
                    >
                      Cancel <MdCancelPresentation className="inline ml-1" />
                    </button>
                  </form>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold">{donation.name}</h2>
                    <p>Email: {donation.email}</p>
                    <p>Contact: {donation.contactNumber}</p>
                    <p>Address: {donation.address?.street || 'N/A'}, {donation.address?.city || 'N/A'}, {donation.address?.state || 'N/A'}, {donation.address?.postalCode || 'N/A'}, {donation.address?.country || 'N/A'}</p>
                    <h3 className="text-lg font-semibold mt-2">Food Items:</h3>
                    <ul>
                      {donation.foodItems.map((item, index) => (
                        <li key={index}>
                          {item.name} - {item.quantity} {item.unit} (Expiry: {item.expiryDate})
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleEditClick(donation)}
                      className="bg-amber-300 text-black p-2 rounded-lg mt-2"
                    >
                      Edit Food <FiEdit2 className="inline ml-1" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageFood;