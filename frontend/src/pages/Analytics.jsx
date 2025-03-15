import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaBox, FaUtensils, FaUsers, FaHandHoldingHeart, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [overallStats, setOverallStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [overallRes, userStatsRes] = await Promise.all([
          fetch('/api/analytics/overall', { headers }),
          fetch('/api/analytics/user', { headers })
        ]);

        const [overall, userTrends] = await Promise.all([
          overallRes.json(),
          userStatsRes.json()
        ]);

        setOverallStats(overall);
        setUserStats(userTrends);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAnalytics();
    }
  }, [currentUser]);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const donationTrendsData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Food Items Donated',
        data: Array(12).fill(0).map((_, i) => {
          const monthData = userStats?.monthlyStats.foodDonations.find(m => m._id === i + 1);
          return monthData ? monthData.items : 0;
        }),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Non-Food Items Donated',
        data: Array(12).fill(0).map((_, i) => {
          const monthData = userStats?.monthlyStats.nonFoodDonations.find(m => m._id === i + 1);
          return monthData ? monthData.items : 0;
        }),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const successRateData = {
    labels: ['Food Success Rate', 'Non-Food Success Rate'],
    datasets: [{
      data: [
        userStats?.successRates.food || 0,
        userStats?.successRates.nonFood || 0
      ],
      backgroundColor: [
        'rgb(75, 192, 192)',
        'rgb(255, 99, 132)'
      ]
    }]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Your Donation Impact</h1>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Your Food Donations</p>
              <p className="text-2xl font-bold">{overallStats?.userStats.foodDonations || 0}</p>
              <p className="text-sm text-gray-500">Items: {overallStats?.userStats.totalFoodItems || 0}</p>
              <p className="text-sm text-gray-500">Active: {userStats?.activeDonations.food || 0}</p>
            </div>
            <FaUtensils className="text-3xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Your Non-Food Donations</p>
              <p className="text-2xl font-bold">{overallStats?.userStats.nonFoodDonations || 0}</p>
              <p className="text-sm text-gray-500">Items: {overallStats?.userStats.totalNonFoodItems || 0}</p>
              <p className="text-sm text-gray-500">Active: {userStats?.activeDonations.nonFood || 0}</p>
            </div>
            <FaBox className="text-3xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Donations</p>
              <p className="text-2xl font-bold">{userStats?.activeDonations.total || 0}</p>
              <p className="text-sm text-gray-500">Food: {userStats?.activeDonations.food || 0}</p>
              <p className="text-sm text-gray-500">Non-Food: {userStats?.activeDonations.nonFood || 0}</p>
            </div>
            <FaHandHoldingHeart className="text-3xl text-red-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Overall Success Rate</p>
              <p className="text-2xl font-bold">{userStats?.successRates.overall || 0}%</p>
              <p className="text-sm text-gray-500">Food: {userStats?.successRates.food || 0}%</p>
              <p className="text-sm text-gray-500">Non-Food: {userStats?.successRates.nonFood || 0}%</p>
            </div>
            <FaCheckCircle className="text-3xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Success Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Donation Success Rates</h2>
          <div className="h-64">
            <Doughnut 
              data={successRateData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Request Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Request Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Food Requests</p>
              <p className="text-xl font-bold">{userStats?.requestStats.food.total || 0}</p>
              <p className="text-sm text-gray-500">Accepted: {userStats?.requestStats.food.accepted || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Non-Food Requests</p>
              <p className="text-xl font-bold">{userStats?.requestStats.nonFood.total || 0}</p>
              <p className="text-sm text-gray-500">Accepted: {userStats?.requestStats.nonFood.accepted || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Community Impact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Total Food Donations</p>
              <p className="text-xl font-bold">{overallStats?.communityStats.totalFoodDonations || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Non-Food Donations</p>
              <p className="text-xl font-bold">{overallStats?.communityStats.totalNonFoodDonations || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Active Community Members</p>
              <p className="text-xl font-bold">{overallStats?.communityStats.totalUsers || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Active Donations</p>
              <p className="text-xl font-bold">{overallStats?.communityStats.totalActiveDonations || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Your Donation Trends (This Year)</h2>
        <div className="h-80">
          <Line data={donationTrendsData} options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            },
            plugins: {
              legend: {
                position: 'top'
              },
              title: {
                display: true,
                text: 'Monthly Donation Items'
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
};

export default Analytics; 