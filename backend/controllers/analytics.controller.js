import DonorForm from '../models/donor.model.js';
import NonFood from '../models/nonfood.model.js';
import Request from '../models/request.model.js';
import NonFoodRequest from '../models/nonfoodrequest.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const getOverallStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's food donations
    const userFoodDonations = await DonorForm.countDocuments({ userId });
    const userNonFoodDonations = await NonFood.countDocuments({ userId });
    
    // Get user's active donations
    const userActiveFoodDonations = await DonorForm.countDocuments({
      userId,
      availableUntil: { $gt: new Date() }
    });
    
    const userActiveNonFoodDonations = await NonFood.countDocuments({
      userId,
      availableUntil: { $gt: new Date() }
    });

    // Get user's total items donated
    const userFoodItems = await DonorForm.aggregate([
      { $match: { userId } },
      { $unwind: '$foodItems' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    const userNonFoodItems = await NonFood.aggregate([
      { $match: { userId } },
      { $unwind: '$nonFoodItems' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    // Get user's request statistics
    const userFoodRequests = await Request.countDocuments({ userId });
    const userNonFoodRequests = await NonFoodRequest.countDocuments({ userId });
    const successfulFoodRequests = await Request.countDocuments({ userId, status: 'accepted' });
    const successfulNonFoodRequests = await NonFoodRequest.countDocuments({ userId, status: 'accepted' });

    // Get community impact (total platform statistics)
    const totalFoodDonations = await DonorForm.countDocuments();
    const totalNonFoodDonations = await NonFood.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalActiveDonations = await DonorForm.countDocuments({ availableUntil: { $gt: new Date() } });

    res.json({
      userStats: {
        foodDonations: userFoodDonations,
        nonFoodDonations: userNonFoodDonations,
        activeFoodDonations: userActiveFoodDonations,
        activeNonFoodDonations: userActiveNonFoodDonations,
        totalFoodItems: userFoodItems[0]?.total || 0,
        totalNonFoodItems: userNonFoodItems[0]?.total || 0,
        foodRequests: userFoodRequests,
        nonFoodRequests: userNonFoodRequests,
        successfulFoodRequests,
        successfulNonFoodRequests
      },
      communityStats: {
        totalFoodDonations,
        totalNonFoodDonations,
        totalUsers,
        totalActiveDonations
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overall stats' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get monthly donation trends for the current year
    const currentYear = new Date().getFullYear();
    
    const monthlyFoodDonations = await DonorForm.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $unwind: '$foodItems'
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          items: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const monthlyNonFoodDonations = await NonFood.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $unwind: '$nonFoodItems'
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          items: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // First get all donations by this user
    const [foodDonations, nonFoodDonations] = await Promise.all([
      DonorForm.find({ userId: new mongoose.Types.ObjectId(userId) }),
      NonFood.find({ userId: new mongoose.Types.ObjectId(userId) })
    ]);

    // Get donation IDs
    const foodDonationIds = foodDonations.map(d => d._id);
    const nonFoodDonationIds = nonFoodDonations.map(d => d._id);

    console.log('Food Donation IDs:', foodDonationIds);
    console.log('Non-Food Donation IDs:', nonFoodDonationIds);

    // Get all requests for these donations
    const [foodRequests, nonFoodRequests] = await Promise.all([
      Request.aggregate([
        {
          $match: {
            donationId: { $in: foodDonationIds.map(id => new mongoose.Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      NonFoodRequest.aggregate([
        {
          $match: {
            donationId: { $in: nonFoodDonationIds.map(id => new mongoose.Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    console.log('Food Requests by Status:', foodRequests);
    console.log('Non-Food Requests by Status:', nonFoodRequests);

    // Convert aggregation results to the required format
    const getStatusCounts = (requests) => {
      const counts = {
        total: 0,
        accepted: 0,
        pending: 0,
        rejected: 0
      };
      
      requests.forEach(req => {
        counts[req._id] = req.count;
        counts.total += req.count;
      });
      
      return counts;
    };

    const requestStats = {
      food: getStatusCounts(foodRequests),
      nonFood: getStatusCounts(nonFoodRequests)
    };

    console.log('Final Request Stats:', requestStats);

    // Get active donations count
    const [activeFoodDonations, activeNonFoodDonations] = await Promise.all([
      DonorForm.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        availableUntil: { $gt: new Date() }
      }),
      NonFood.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        availableUntil: { $gt: new Date() }
      })
    ]);

    // For development/testing - add sample data if no requests exist
    if (process.env.NODE_ENV === 'development' && 
        requestStats.food.total === 0 && 
        requestStats.nonFood.total === 0) {
      requestStats.food = {
        total: 10,
        accepted: 4,
        pending: 4,
        rejected: 2
      };
      requestStats.nonFood = {
        total: 6,
        accepted: 2,
        pending: 3,
        rejected: 1
      };
    }

    res.json({
      monthlyStats: {
        foodDonations: monthlyFoodDonations,
        nonFoodDonations: monthlyNonFoodDonations
      },
      requestStats,
      activeDonations: {
        food: activeFoodDonations,
        nonFood: activeNonFoodDonations,
        total: activeFoodDonations + activeNonFoodDonations
      }
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};

export const getDonationImpact = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's total food items donated
    const foodItemsCount = await DonorForm.aggregate([
      { $match: { userId } },
      { $unwind: '$foodItems' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    // Get user's total non-food items donated
    const nonFoodItemsCount = await NonFood.aggregate([
      { $match: { userId } },
      { $unwind: '$nonFoodItems' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    // Get user's successful donation requests
    const successfulFoodRequests = await Request.countDocuments({ 
      userId, 
      status: 'accepted' 
    });
    
    const successfulNonFoodRequests = await NonFoodRequest.countDocuments({ 
      userId, 
      status: 'accepted' 
    });

    // Get user's impact percentage
    const totalDonations = await DonorForm.countDocuments();
    const userDonations = await DonorForm.countDocuments({ userId });
    const impactPercentage = totalDonations > 0 ? (userDonations / totalDonations) * 100 : 0;

    res.json({
      totalFoodItems: foodItemsCount[0]?.total || 0,
      totalNonFoodItems: nonFoodItemsCount[0]?.total || 0,
      successfulFoodRequests,
      successfulNonFoodRequests,
      impactPercentage: Math.round(impactPercentage)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donation impact' });
  }
}; 