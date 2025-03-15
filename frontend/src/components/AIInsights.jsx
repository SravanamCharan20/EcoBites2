import { useState, useEffect } from 'react';
import { FaLightbulb, FaChartLine, FaCalendarAlt, FaUsers, FaLeaf } from 'react-icons/fa';
import PropTypes from 'prop-types';

const BACKEND_URL = 'http://localhost:6001'; // Add backend URL

const AIInsights = ({ userStats, donationType }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setError(null);
        setLoading(true);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        if (!userStats) {
          setError('No user statistics available');
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/ai/suggestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userStats, donationType })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error || 
            errorData?.message || 
            `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        setInsights(data);
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userStats, donationType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-red-600 p-4">
          <p className="font-semibold">Error loading insights</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-600 p-4">
          <p>No insights available at this time</p>
        </div>
      </div>
    );
  }

  const categories = [
    { icon: FaLightbulb, title: 'Optimization Tips', key: 'donationOptimization' },
    { icon: FaChartLine, title: 'Impact Analysis', key: 'impactAnalysis' },
    { icon: FaCalendarAlt, title: 'Seasonal Tips', key: 'seasonalRecommendations' },
    { icon: FaUsers, title: 'Community Engagement', key: 'communityEngagement' },
    { icon: FaLeaf, title: 'Sustainability', key: 'sustainabilityInsights' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-gray-800">AI-Powered Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(({ icon: Icon, title, key }) => (
          <div key={key} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <Icon className="text-gray-600 text-xl mr-2" />
              <h3 className="font-semibold text-gray-700">{title}</h3>
            </div>
            <ul className="space-y-2">
              {insights[key]?.map((item, index) => (
                <li key={index} className="text-gray-600 text-sm">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

AIInsights.propTypes = {
  userStats: PropTypes.object,
  donationType: PropTypes.string
};

export default AIInsights; 