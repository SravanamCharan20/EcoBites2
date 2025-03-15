import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaBox as FaBoxOpen,
  FaChartPie,
  FaChartLine,
  FaCircleCheck,
  FaHandHolding as FaHandHoldingHeart,
  FaUsers,
  FaRobot,
  FaRegLightbulb as FaLightbulb,
  FaSeedling as FaLeaf
} from 'react-icons/fa6';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import AIInsights from '../components/AIInsights';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [overallStats, setOverallStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

        console.log('API Response - Overall:', overall);
        console.log('API Response - User Trends:', userTrends);

        // Ensure we have valid data before setting state
        if (userTrends?.requestStats) {
          setUserStats(userTrends);
        } else {
          console.error('Invalid user trends data:', userTrends);
        }
        
        if (overall) {
          setOverallStats(overall);
        } else {
          console.error('Invalid overall stats data:', overall);
        }
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

  // Helper functions for insights
  const calculateDonationRate = (stats) => {
    if (!stats?.accepted || !stats?.total) return 0;
    return Math.round((stats.accepted / stats.total) * 100);
  };

  const calculateTrend = (donations) => {
    if (!donations || !Array.isArray(donations)) return 'stable';
    const lastThreeMonths = donations.slice(-3);
    if (lastThreeMonths.length === 0) return 'stable';
    const trend = lastThreeMonths[lastThreeMonths.length - 1]?.items - lastThreeMonths[0]?.items;
    return trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable';
  };

  const getTopCategories = (donations) => {
    if (!donations || !Array.isArray(donations)) return [];
    const categoryCounts = donations.reduce((acc, donation) => {
      const category = donation.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  };

  const calculateImpactMetrics = (stats, type) => {
    if (!stats) return { items: 0, people: 0, waste: 0 };
    
    // Use actual total items from stats
    const totalItems = type === 'food' 
      ? (stats.totalItems || stats.accepted || 0)
      : (stats.totalItems || stats.accepted || 0);
      
    // Calculate real impact metrics based on actual data
    const impactMultipliers = {
      food: {
        peoplePerItem: 3, // Each food item helps 3 people on average
        wastePerItem: 0.75 // Each food item prevents 0.75kg of waste
      },
      nonFood: {
        peoplePerItem: 2, // Each non-food item helps 2 people on average
        wastePerItem: 1.2 // Each non-food item prevents 1.2kg of waste
      }
    };

    const multiplier = type === 'food' ? impactMultipliers.food : impactMultipliers.nonFood;
    
    return {
      items: totalItems,
      people: Math.round(totalItems * multiplier.peoplePerItem),
      waste: Math.round(totalItems * multiplier.wastePerItem)
    };
  };

  const generateRecommendations = (stats, type, trend) => {
    if (!stats) return [];
    
    const recommendations = [];
    const acceptanceRate = calculateDonationRate(stats);
    
    // Use actual stats to generate personalized recommendations
    if (stats.total > 0) {
      if (acceptanceRate < 70) {
        recommendations.push(`Improve ${type} donation acceptance rate (currently ${acceptanceRate}%) by following guidelines`);
      }
      
      if (trend === 'decreasing') {
        recommendations.push(`Your ${type} donations have decreased recently. Consider maintaining a steady donation schedule.`);
      }

      if (type === 'food') {
        const perishableRate = (stats.perishableCount || 0) / stats.total;
        if (perishableRate > 0.7) {
          recommendations.push('Consider balancing your donations with more non-perishable items');
        }
        
        if (stats.accepted > 0 && stats.accepted < 5) {
          recommendations.push('Increase your food donation frequency for more consistent community support');
        }
      } else {
        const seasonalItems = stats.seasonalCount || 0;
        if (seasonalItems < stats.total * 0.3) {
          recommendations.push('Consider including more seasonal items in your donations');
        }
        
        if (stats.qualityRejections > 0) {
          recommendations.push('Ensure all items are in good condition before donating');
        }
      }
    } else {
      recommendations.push(`Start your ${type} donation journey to make an impact in your community`);
    }

    return recommendations;
  };

  // Prepare insights data outside the render function
  const prepareInsightsData = () => {
    const foodStats = userStats?.requestStats?.food || {};
    const nonFoodStats = userStats?.requestStats?.nonFood || {};
    
    const foodTrend = calculateTrend(userStats?.monthlyStats?.foodDonations);
    const nonFoodTrend = calculateTrend(userStats?.monthlyStats?.nonFoodDonations);
    
    const foodMetrics = calculateImpactMetrics(foodStats, 'food');
    const nonFoodMetrics = calculateImpactMetrics(nonFoodStats, 'nonFood');
    
    const foodRecommendations = generateRecommendations(foodStats, 'food', foodTrend);
    const nonFoodRecommendations = generateRecommendations(nonFoodStats, 'nonFood', nonFoodTrend);

    return {
      foodStats,
      nonFoodStats,
      foodTrend,
      nonFoodTrend,
      foodMetrics,
      nonFoodMetrics,
      foodRecommendations,
      nonFoodRecommendations,
      totalDonations: (foodStats.total || 0) + (nonFoodStats.total || 0)
    };
  };

  const donationTrendsData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Food Items Donated',
        data: Array(12).fill(0).map((_, i) => {
          const monthData = userStats?.monthlyStats?.foodDonations?.find(m => m._id === i + 1);
          return monthData ? monthData.items : 0;
        }),
        borderColor: '#4B5563',
        backgroundColor: 'rgba(75, 85, 99, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Non-Food Items Donated',
        data: Array(12).fill(0).map((_, i) => {
          const monthData = userStats?.monthlyStats?.nonFoodDonations?.find(m => m._id === i + 1);
          return monthData ? monthData.items : 0;
        }),
        borderColor: '#9CA3AF',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      },
    ],
  };

  // Add more detailed console logging
  console.log('User Stats Structure:', {
    requestStats: userStats?.requestStats,
    food: userStats?.requestStats?.food,
    nonFood: userStats?.requestStats?.nonFood,
    rawData: userStats
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6" role="region" aria-label="Analytics Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" role="article" aria-labelledby="total-donations-label">
                <div className="flex items-center justify-between">
                  <div>
                    <p id="total-donations-label" className="text-gray-500">Total Donations</p>
                    <p className="text-2xl font-bold" aria-label={`${(overallStats?.userStats.foodDonations || 0) + (overallStats?.userStats.nonFoodDonations || 0)} total donations`}>
                      {(overallStats?.userStats.foodDonations || 0) + 
                       (overallStats?.userStats.nonFoodDonations || 0)}
                    </p>
                  </div>
                  <FaChartLine className="text-3xl text-gray-600" aria-hidden="true" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" role="article" aria-labelledby="success-rate-label">
                <div className="flex items-center justify-between">
                  <div>
                    <p id="success-rate-label" className="text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold" aria-label={`${userStats?.requestStatusCounts?.accepted > 0 ? Math.round((userStats.requestStatusCounts.accepted / (userStats.requestStatusCounts.accepted + userStats.requestStatusCounts.pending + userStats.requestStatusCounts.rejected)) * 100) : 0}% success rate`}>
                      {userStats?.requestStatusCounts?.accepted > 0 
                        ? Math.round((userStats.requestStatusCounts.accepted / 
                           (userStats.requestStatusCounts.accepted + 
                            userStats.requestStatusCounts.pending + 
                            userStats.requestStatusCounts.rejected)) * 100)
                        : 0}%
                    </p>
                  </div>
                  <FaCircleCheck className="text-3xl text-gray-600" aria-hidden="true" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" role="article" aria-labelledby="active-donations-label">
                <div className="flex items-center justify-between">
                  <div>
                    <p id="active-donations-label" className="text-gray-500">Active Donations</p>
                    <p className="text-2xl font-bold" aria-label={`${userStats?.activeDonations.total || 0} active donations`}>
                      {userStats?.activeDonations.total || 0}
                    </p>
                  </div>
                  <FaHandHoldingHeart className="text-3xl text-gray-600" aria-hidden="true" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" role="article" aria-labelledby="total-items-label">
                <div className="flex items-center justify-between">
                  <div>
                    <p id="total-items-label" className="text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold" aria-label={`${(overallStats?.userStats.totalFoodItems || 0) + (overallStats?.userStats.totalNonFoodItems || 0)} total items`}>
                      {(overallStats?.userStats.totalFoodItems || 0) + 
                       (overallStats?.userStats.totalNonFoodItems || 0)}
                    </p>
                  </div>
                  <FaBoxOpen className="text-3xl text-gray-600" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md" role="region" aria-labelledby="monthly-trends-title">
                  <h2 id="monthly-trends-title" className="text-xl font-bold mb-4 text-gray-800">Monthly Donation Trends</h2>
                  <div className="h-80" role="img" aria-label="Line chart showing monthly donation trends">
                    <Line 
                      data={donationTrendsData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                              precision: 0
                            },
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)'
                            },
                            title: {
                              display: true,
                              text: 'Number of Items'
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            },
                            title: {
                              display: true,
                              text: 'Month'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              padding: 20,
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} items`;
                              }
                            }
                          }
                        },
                        interaction: {
                          mode: 'nearest',
                          axis: 'x',
                          intersect: false
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md" role="region" aria-labelledby="request-stats-title">
                  <h2 id="request-stats-title" className="text-xl font-bold mb-4 text-gray-800">Request Statistics</h2>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50" role="region" aria-labelledby="food-requests-title">
                      <p id="food-requests-title" className="text-gray-500 mb-2">Food Requests</p>
                      <p className="text-xl font-bold" aria-label={`${userStats?.requestStats?.food?.total || 0} total food requests`}>
                        {userStats?.requestStats?.food?.total || 0}
                      </p>
                      <div className="mt-2 space-y-1" role="list">
                        <div className="flex justify-between items-center text-sm" role="listitem">
                          <span className="text-green-600">Accepted</span>
                          <span aria-label={`${userStats?.requestStats?.food?.accepted || 0} accepted requests`}>
                            {userStats?.requestStats?.food?.accepted || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm" role="listitem">
                          <span className="text-yellow-600">Pending</span>
                          <span aria-label={`${userStats?.requestStats?.food?.pending || 0} pending requests`}>
                            {userStats?.requestStats?.food?.pending || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm" role="listitem">
                          <span className="text-red-600">Rejected</span>
                          <span aria-label={`${userStats?.requestStats?.food?.rejected || 0} rejected requests`}>
                            {userStats?.requestStats?.food?.rejected || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50" role="region" aria-labelledby="non-food-requests-title">
                      <p id="non-food-requests-title" className="text-gray-500 mb-2">Non-Food Requests</p>
                      <p className="text-xl font-bold" aria-label={`${userStats?.requestStats?.nonFood?.total || 0} total non-food requests`}>
                        {userStats?.requestStats?.nonFood?.total || 0}
                      </p>
                      <div className="mt-2 space-y-1" role="list">
                        <div className="flex justify-between items-center text-sm" role="listitem">
                          <span className="text-green-600">Accepted</span>
                          <span aria-label={`${userStats?.requestStats?.nonFood?.accepted || 0} accepted requests`}>
                            {userStats?.requestStats?.nonFood?.accepted || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm" role="listitem">
                          <span className="text-yellow-600">Pending</span>
                          <span aria-label={`${userStats?.requestStats?.nonFood?.pending || 0} pending requests`}>
                            {userStats?.requestStats?.nonFood?.pending || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm" role="listitem">
                          <span className="text-red-600">Rejected</span>
                          <span aria-label={`${userStats?.requestStats?.nonFood?.rejected || 0} rejected requests`}>
                            {userStats?.requestStats?.nonFood?.rejected || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'insights': {
        const insights = prepareInsightsData();
        
        return (
          <div className="space-y-6" role="region" aria-label="AI Insights">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <FaRobot className="text-2xl text-indigo-600 mr-3" aria-hidden="true" />
                <h2 className="text-xl font-bold text-gray-800">AI-Powered Insights</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Real-time analytics and personalized recommendations based on your {insights.totalDonations} donations.
              </p>
              <div className="grid grid-cols-1 gap-6">
                {/* Category Performance Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Food Donations Analysis */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <FaChartLine className="text-xl text-blue-500 mr-3" aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-gray-800">Food Donations Analysis</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-700 font-medium">Success Rate</p>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                            style={{ width: `${calculateDonationRate(insights.foodStats)}%` }}
                            role="progressbar"
                            aria-valuenow={calculateDonationRate(insights.foodStats)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {calculateDonationRate(insights.foodStats)}% acceptance rate
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Trend Analysis</p>
                        <div className={`mt-2 flex items-center ${
                          insights.foodTrend === 'increasing' ? 'text-green-600' :
                          insights.foodTrend === 'decreasing' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {insights.foodTrend === 'increasing' ? '↗' :
                           insights.foodTrend === 'decreasing' ? '↘' : '→'}
                          <span className="ml-2">
                            {insights.foodTrend === 'increasing' ? 'Upward trend in donations' :
                             insights.foodTrend === 'decreasing' ? 'Downward trend in donations' :
                             'Stable donation pattern'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Top Categories</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {getTopCategories(userStats?.foodDonations).map((category, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Non-Food Donations Analysis */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <FaChartLine className="text-xl text-purple-500 mr-3" aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-gray-800">Non-Food Donations Analysis</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-700 font-medium">Success Rate</p>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                            style={{ width: `${calculateDonationRate(insights.nonFoodStats)}%` }}
                            role="progressbar"
                            aria-valuenow={calculateDonationRate(insights.nonFoodStats)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {calculateDonationRate(insights.nonFoodStats)}% acceptance rate
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Trend Analysis</p>
                        <div className={`mt-2 flex items-center ${
                          insights.nonFoodTrend === 'increasing' ? 'text-green-600' :
                          insights.nonFoodTrend === 'decreasing' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {insights.nonFoodTrend === 'increasing' ? '↗' :
                           insights.nonFoodTrend === 'decreasing' ? '↘' : '→'}
                          <span className="ml-2">
                            {insights.nonFoodTrend === 'increasing' ? 'Upward trend in donations' :
                             insights.nonFoodTrend === 'decreasing' ? 'Downward trend in donations' :
                             'Stable donation pattern'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Top Categories</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {getTopCategories(userStats?.nonFoodDonations).map((category, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Recommendations */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <FaLightbulb className="text-xl text-yellow-500 mr-3" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-gray-800">Smart Recommendations</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-yellow-800 font-medium mb-3">Food Donation Tips</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {insights.foodRecommendations.map((tip, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="text-purple-800 font-medium mb-3">Non-Food Donation Tips</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {insights.nonFoodRecommendations.map((tip, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <FaLeaf className="text-xl text-green-500 mr-3" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-gray-800">Category Impact Metrics</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-green-800 font-medium mb-2">Food Donation Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Items Donated</span>
                          <span className="font-bold text-green-700">{insights.foodMetrics.items}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">People Helped</span>
                          <span className="font-bold text-green-700">{insights.foodMetrics.people}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Food Waste Prevented</span>
                          <span className="font-bold text-green-700">{insights.foodMetrics.waste}kg</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="text-purple-800 font-medium mb-2">Non-Food Donation Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Items Donated</span>
                          <span className="font-bold text-purple-700">{insights.nonFoodMetrics.items}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">People Supported</span>
                          <span className="font-bold text-purple-700">{insights.nonFoodMetrics.people}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Waste Diverted</span>
                          <span className="font-bold text-purple-700">{insights.nonFoodMetrics.waste}kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'community':
        return (
          <div className="space-y-6" role="region" aria-label="Community Impact">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Community Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center" role="article" aria-labelledby="food-donations-label">
                  <p id="food-donations-label" className="text-gray-500">Total Food Donations</p>
                  <p className="text-2xl font-bold" aria-label={`${overallStats?.communityStats.totalFoodDonations || 0} total food donations`}>
                    {overallStats?.communityStats.totalFoodDonations || 0}
                  </p>
                </div>
                <div className="text-center" role="article" aria-labelledby="non-food-donations-label">
                  <p id="non-food-donations-label" className="text-gray-500">Total Non-Food Donations</p>
                  <p className="text-2xl font-bold" aria-label={`${overallStats?.communityStats.totalNonFoodDonations || 0} total non-food donations`}>
                    {overallStats?.communityStats.totalNonFoodDonations || 0}
                  </p>
                </div>
                <div className="text-center" role="article" aria-labelledby="active-members-label">
                  <p id="active-members-label" className="text-gray-500">Active Members</p>
                  <p className="text-2xl font-bold" aria-label={`${overallStats?.communityStats.totalUsers || 0} active members`}>
                    {overallStats?.communityStats.totalUsers || 0}
                  </p>
                </div>
                <div className="text-center" role="article" aria-labelledby="active-community-donations-label">
                  <p id="active-community-donations-label" className="text-gray-500">Active Donations</p>
                  <p className="text-2xl font-bold" aria-label={`${overallStats?.communityStats.totalActiveDonations || 0} active donations`}>
                    {overallStats?.communityStats.totalActiveDonations || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <AIInsights 
              userStats={overallStats?.communityStats} 
              donationType="community" 
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaChartPie className="text-lg" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'insights' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaRobot className="text-lg" />
              <span>AI Insights</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'community' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaUsers className="text-lg" />
              <span>Community Impact</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Analytics; 