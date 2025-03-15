import DonorForm from '../models/donor.model.js';
import NonFood from '../models/nonfood.model.js';
import Request from '../models/request.model.js';
import NonFoodRequest from '../models/nonfoodrequest.model.js';
import User from '../models/user.model.js';

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
          userId,
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          items: { $sum: { $size: '$foodItems' } }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const monthlyNonFoodDonations = await NonFood.aggregate([
      {
        $match: {
          userId,
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          items: { $sum: { $size: '$nonFoodItems' } }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get donation success rates for both food and non-food
    const totalFoodRequests = await Request.countDocuments({ userId });
    const acceptedFoodRequests = await Request.countDocuments({ userId, status: 'accepted' });
    const foodSuccessRate = totalFoodRequests > 0 ? (acceptedFoodRequests / totalFoodRequests) * 100 : 0;

    const totalNonFoodRequests = await NonFoodRequest.countDocuments({ userId });
    const acceptedNonFoodRequests = await NonFoodRequest.countDocuments({ userId, status: 'accepted' });
    const nonFoodSuccessRate = totalNonFoodRequests > 0 ? (acceptedNonFoodRequests / totalNonFoodRequests) * 100 : 0;

    // Get active donations count
    const activeFoodDonations = await DonorForm.countDocuments({
      userId,
      availableUntil: { $gt: new Date() }
    });

    const activeNonFoodDonations = await NonFood.countDocuments({
      userId,
      availableUntil: { $gt: new Date() }
    });

    res.json({
      monthlyStats: {
        foodDonations: monthlyFoodDonations,
        nonFoodDonations: monthlyNonFoodDonations
      },
      successRates: {
        food: Math.round(foodSuccessRate),
        nonFood: Math.round(nonFoodSuccessRate),
        overall: Math.round((foodSuccessRate + nonFoodSuccessRate) / 2)
      },
      activeDonations: {
        food: activeFoodDonations,
        nonFood: activeNonFoodDonations,
        total: activeFoodDonations + activeNonFoodDonations
      },
      requestStats: {
        food: {
          total: totalFoodRequests,
          accepted: acceptedFoodRequests
        },
        nonFood: {
          total: totalNonFoodRequests,
          accepted: acceptedNonFoodRequests
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats' });
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