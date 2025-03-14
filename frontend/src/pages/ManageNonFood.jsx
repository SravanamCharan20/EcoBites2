import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { FiEdit2 } from "react-icons/fi";
import { IoIosAddCircle, IoIosRemoveCircle } from "react-icons/io";
import { HiArrowSmRight } from "react-icons/hi";
import { MdCancelPresentation } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";

const ManageNonFood = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [currentDonor, setCurrentDonor] = useState({});
  const [searchItemName, setSearchItemName] = useState('');

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

  const filteredDonations = donations.filter(donation =>
    donation.nonFoodItems && donation.nonFoodItems.some(item =>
      item.name.toLowerCase().includes(searchItemName.toLowerCase())
    )
  );

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
    <div className="flex flex-col">
      <div className="flex-1 p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl text-gray-800 font-semibold mb-4">Manage Non-Food Donations</h1>

        <div className="flex items-center border-2 mb-3 rounded-full w-auto p-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Search By Non-Food Item Name"
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

                    <h2 className="text-xl font-semibold mb-2">Non-Food Items</h2>
                    {currentDonor.nonFoodItems.map((item, index) => (
                      <div key={index} className="mb-4 border p-3 rounded-lg">
                        <input
                          type="text"
                          name="name"
                          placeholder="Non-Food Item Name"
                          value={item.name}
                          onChange={(e) => handleNonFoodItemChange(index, e)}
                          className="border p-2 rounded w-full mb-2"
                        />
                        <input
                          type="number"
                          name="quantity"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleNonFoodItemChange(index, e)}
                          className="border p-2 rounded w-full mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeNonFoodItem(index)}
                          className="text-white border-2 p-2 rounded-full bg-red-500 px-3 hover:bg-red-700"
                        >
                          Remove Non-Food Item <IoIosRemoveCircle className="inline ml-1" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addNonFoodItem}
                      className="bg-green-500 text-white p-2 px-3 rounded-full mb-4"
                    >
                      Add Non-Food Item <IoIosAddCircle className="inline ml-1" />
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
                    <h3 className="text-lg font-semibold mt-2">Non-Food Items:</h3>
                    <ul>
                      {donation.nonFoodItems.map((item, index) => (
                        <li key={index}>
                          {item.name} - {item.quantity}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleEditClick(donation)}
                      className="bg-amber-300 text-black p-2 rounded-lg mt-2"
                    >
                      Edit Non-Food <FiEdit2 className="inline ml-1" />
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

export default ManageNonFood;