import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";
import { motion } from 'framer-motion';
import { MdPendingActions } from "react-icons/md";
import { FcAcceptDatabase } from "react-icons/fc";
import { ImCancelCircle } from "react-icons/im";

const MyNonFoodRequests = () => {
  const { userId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [loadingAction, setLoadingAction] = useState('');
  const [filter, setFilter] = useState('accepted'); // 'accepted', 'rejected', or 'pending'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing.');
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/donor/requests-nonfood/${userId}`);
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
      const response = await fetch(`/api/donor/requests-nonfood/${requestId}/status`, {
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

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">My Requests</h2>
        <div className="flex justify-between mb-4">
          <div className="flex items-center border-2 rounded-full w-1/3 p-2">
            <FiSearch className="mr-2" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="outline-none w-full"
            />
          </div>
        <div>
        <div className='flex'>
          <button
            onClick={() => setFilter('pending')}
            className={`flex px-4 py-2 rounded-full button-transition ${filter === 'pending' ? 'bg-amber-400 text-white' : ''}`}
          >
            <MdPendingActions className='mr-2 mt-1' />
            Pending
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`flex px-4 py-2 rounded-full button-transition ${filter === 'accepted' ? 'bg-teal-600 text-white' : ''}`}
          >
            <FcAcceptDatabase className='mr-2 mt-1' />
            Accepted
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`flex px-4 py-2 ml-4 rounded-full button-transition ${filter === 'rejected' ? 'bg-red-500 text-white' : ''}`}
          >
            <ImCancelCircle className='mr-2 mt-1' />
            Rejected
          </button>
        </div>
          
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length === 0 ? (
          <p className="text-center text-gray-500">No requests found.</p>
        ) : (
          filteredRequests.map(request => (
            <motion.div
              key={request._id}
              className="border-b border-gray-300 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p><strong>Requester Name:</strong> {request.requesterName}</p>
              <p><strong>Contact Number:</strong> {request.contactNumber}</p>
              <p><strong>Address:</strong> {`${request.address?.street || 'N/A'}, ${request.address?.city || 'N/A'}, ${request.address?.state || 'N/A'}, ${request.address?.postalCode || 'N/A'}, ${request.address?.country || 'N/A'}`}</p>
              <p><strong>Description:</strong> {request.description}</p>
              <p className={`mt-1 ${request.status === 'Accepted' ? 'text-teal-600' : request.status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                <strong>Status:</strong> {request.status}
              </p>
              <div className="flex gap-2 mt-2">
                {request.status === 'Pending' && (
                  <>
                    <button
                      className="border rounded-full bg-teal-600 hover:bg-teal-800 text-white px-4 py-2"
                      onClick={() => handleStatusChange(request._id, 'Accepted')}
                      disabled={loadingRequestId === request._id && loadingAction !== 'Accepted'}
                    >
                      {loadingRequestId === request._id && loadingAction === 'Accepted' ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      className="border rounded-full bg-red-500 hover:bg-red-600 text-white  px-4 py-2"
                      onClick={() => handleStatusChange(request._id, 'Rejected')}
                      disabled={loadingRequestId === request._id && loadingAction !== 'Rejected'}
                    >
                      {loadingRequestId === request._id && loadingAction === 'Rejected' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyNonFoodRequests;