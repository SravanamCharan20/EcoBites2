import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiSearch, FiFilter } from "react-icons/fi";
import { motion } from 'framer-motion';
import { MdPendingActions } from "react-icons/md";
import { FcAcceptDatabase } from "react-icons/fc";
import { ImCancelCircle } from "react-icons/im";
import { HiLocationMarker } from "react-icons/hi";

const MyRequests = () => {
  const { userId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [loadingAction, setLoadingAction] = useState('');
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing.');
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/donor/requests/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        setError('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  const handleStatusChange = async (requestId, status) => {
    setLoadingRequestId(requestId);
    setLoadingAction(status);
    try {
      const response = await fetch(`/api/donor/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === requestId ? { ...request, status } : request
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update request status.');
    } finally {
      setLoadingRequestId(null);
      setLoadingAction('');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = 
      (filter === 'accepted' && request.status === 'Accepted') ||
      (filter === 'rejected' && request.status === 'Rejected') ||
      (filter === 'pending' && request.status === 'Pending');

    const matchesSearchTerm = request.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearchTerm;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'bg-teal-100 text-teal-600';
      case 'Rejected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-amber-100 text-amber-600';
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - Search and Filters */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Header Section */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Requests</h1>
            <p className="text-lg font-light text-gray-300">
              Track and manage your donation requests
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-gray-50 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center border-2 rounded-full w-full p-2 bg-white">
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search by requester name"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
                <button
                  onClick={() => setFilter('pending')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    filter === 'pending' 
                      ? 'bg-amber-100 text-amber-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MdPendingActions className="text-xl" />
                  Pending Requests
                </button>

                <button
                  onClick={() => setFilter('accepted')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    filter === 'accepted' 
                      ? 'bg-teal-100 text-teal-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FcAcceptDatabase className="text-xl" />
                  Accepted Requests
                </button>

                <button
                  onClick={() => setFilter('rejected')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    filter === 'rejected' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ImCancelCircle className="text-xl" />
                  Rejected Requests
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Requests List */}
        <div className="col-span-full lg:col-span-8 space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-3xl p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <MdPendingActions className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {filter === 'pending' 
                  ? "You don't have any pending requests at the moment."
                  : filter === 'accepted'
                  ? "You haven't accepted any requests yet."
                  : "You haven't rejected any requests yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <motion.div
                  key={request._id}
                  className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">{request.requesterName}</h2>
                        <p className="text-gray-600">{request.contactNumber}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>

                    {/* Location Information */}
                    <div className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <HiLocationMarker className="text-blue-600 text-xl" />
                        <h3 className="text-xl font-semibold text-gray-900">Location</h3>
                      </div>
                      {request.address ? (
                        <div className="space-y-2">
                          <p className="text-gray-600">
                            {request.address.street && <span className="block">{request.address.street}</span>}
                            {request.address.city && request.address.state && (
                              <span className="block">{request.address.city}, {request.address.state}</span>
                            )}
                            {request.address.postalCode && (
                              <span className="block">{request.address.postalCode}</span>
                            )}
                            {request.address.country && (
                              <span className="block">{request.address.country}</span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500">No location information available</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Request Description</h3>
                      <p className="text-gray-600">{request.description || 'No description provided'}</p>
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'Pending' && (
                      <div className="flex gap-4">
                        <button
                          className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                          onClick={() => handleStatusChange(request._id, 'Accepted')}
                          disabled={loadingRequestId === request._id}
                        >
                          <FcAcceptDatabase className="text-xl" />
                          {loadingRequestId === request._id && loadingAction === 'Accepted' ? 'Accepting...' : 'Accept Request'}
                        </button>
                        <button
                          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                          onClick={() => handleStatusChange(request._id, 'Rejected')}
                          disabled={loadingRequestId === request._id}
                        >
                          <ImCancelCircle className="text-xl" />
                          {loadingRequestId === request._id && loadingAction === 'Rejected' ? 'Rejecting...' : 'Reject Request'}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRequests;