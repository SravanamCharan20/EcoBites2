import { useState } from 'react';
import { MdOutlinePriceChange } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { HiArrowSmRight } from "react-icons/hi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




const AddFood = () => {
  const initialFormData = {
    name: '',
    email: '',
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
    foodItems: [
      {
        type: 'Perishable',
        name: '',
        quantity: '',
        unit: 'kg',
        expiryDate: '',
        nutritionalInfo: {
          calories: '',
          protein: '',
          carbs: '',
          fats: '',
          allergens: [],
          vitamins: [],
          minerals: [],
          dietaryRestrictions: [],
        },
        storageInstructions: '',
        qualityRating: 5,
        freshnessDuration: '',
        dietaryTags: [],
        preparationTime: '',
        servingSize: '',
        preferredTransport: 'Any',
        foodSafety: {
          temperature: '',
          handlingInstructions: '',
          packagingType: '',
          storageConditions: '',
          crossContamination: false,
        },
        seasonality: {
          bestSeason: '',
          seasonalAvailability: [],
          locallySourced: false,
          growthLocation: '',
        },
        nutritionalScore: 0,
        qualityAssurance: {
          inspectionDate: '',
          inspectedBy: '',
          certifications: [],
          qualityStandards: [],
          packagingIntegrity: 'Good',
        },
        distributionPriority: 'Normal', // Emergency, High, Normal, Low
        specialHandling: [],
        allergenWarnings: [],
        portionSuggestions: '',
        communityImpact: {
          targetGroups: [],
          nutritionalBenefits: [],
          culturalRelevance: [],
        },
      },
    ],
    availableUntil: '',
    donationType: 'free',
    price: '',
    donationFrequency: 'one-time',
    preferredPickupTime: {
      start: '',
      end: '',
    },
    additionalNotes: '',
    impactMetrics: {
      potentialMealsProvided: 0,
      carbonFootprintSaved: 0,
      waterFootprintSaved: 0,
      foodWastePrevented: 0,
      nutritionalValue: 0,
      communityBenefit: 0,
    },
    aiGeneratedTags: [],
    sustainabilityScore: 0,
    qualityAssurance: {
      verificationStatus: 'pending',
      lastChecked: new Date().toISOString(),
      certifications: [],
      safetyChecks: [],
      handlingGuidelines: [],
    },
    aiInsights: {
      recommendedRecipients: [],
      optimalDistributionTime: '',
      shelfLifePrediction: '',
      qualityPrediction: '',
      handlingRecommendations: [],
      matchScore: 0,
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSuccessMessage('');  // Clear success message
    setErrorMessage('');    // Clear error message
    setLocationStatus('');  // Clear location status

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

  const handleLocationMethodChange = (method) => {
    setLocationMethod(method);
    if (method === 'auto') {
      handleUseLocation();
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

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

            if (data && data.address) {
              const { road, county, state, postcode, country } = data.address;
              setFormData((prevData) => ({
                ...prevData,
                address: {
                  street: road || '',
                  city: county || '',
                  state: state || '',
                  postalCode: postcode || '',
                  country: country || '',
                },
              }));
              setLocationStatus('Location acquired successfully!');
            } else {
              setLocationStatus('Failed to retrieve address.');
            }
          } catch (error) {
            console.error('Error fetching address:', error);
            setLocationStatus('Failed to acquire address.');
          }
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setLocationStatus('Failed to acquire location.');
        },
        {
          timeout: 100000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus('Geolocation is not supported by this browser.');
    }
  };

  const addFoodItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      foodItems: [
        ...prevData.foodItems,
        {
          type: 'Perishable',
          name: '',
          quantity: '',
          unit: 'kg',
          expiryDate: '',
          nutritionalInfo: {
            calories: '',
            protein: '',
            carbs: '',
            fats: '',
            allergens: [],
            vitamins: [],
            minerals: [],
            dietaryRestrictions: [],
          },
          storageInstructions: '',
          qualityRating: 5,
          freshnessDuration: '',
          dietaryTags: [],
          preparationTime: '',
          servingSize: '',
          preferredTransport: 'Any',
          foodSafety: {
            temperature: '',
            handlingInstructions: '',
            packagingType: '',
            storageConditions: '',
            crossContamination: false,
          },
          seasonality: {
            bestSeason: '',
            seasonalAvailability: [],
            locallySourced: false,
            growthLocation: '',
          },
          nutritionalScore: 0,
          qualityAssurance: {
            inspectionDate: '',
            inspectedBy: '',
            certifications: [],
            qualityStandards: [],
            packagingIntegrity: 'Good',
          },
          distributionPriority: 'Normal',
          specialHandling: [],
          allergenWarnings: [],
          portionSuggestions: '',
          communityImpact: {
            targetGroups: [],
            nutritionalBenefits: [],
            culturalRelevance: [],
          },
        },
      ],
    }));
  };

  const removeFoodItem = (index) => {
    setFormData((prevData) => {
      const updatedFoodItems = [...prevData.foodItems];
      updatedFoodItems.splice(index, 1);
      return {
        ...prevData,
        foodItems: updatedFoodItems,
      };
    });
  };

  const handleFoodItemChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedFoodItems = [...prevData.foodItems];
      
      // Handle nested objects
      if (field.includes('.')) {
        const [mainField, subField] = field.split('.');
        updatedFoodItems[index] = {
          ...updatedFoodItems[index],
          [mainField]: {
            ...updatedFoodItems[index][mainField],
            [subField]: value,
          },
        };
      } else {
        updatedFoodItems[index] = {
          ...updatedFoodItems[index],
          [field]: value,
        };
      }

      // Calculate impact metrics using AI
      const newImpactMetrics = calculateImpactMetrics(updatedFoodItems[index]);
      
      return {
        ...prevData,
        foodItems: updatedFoodItems,
        impactMetrics: newImpactMetrics,
      };
    });
  };

  // Enhanced AI-powered impact metrics calculation
  const calculateImpactMetrics = (foodItem) => {
    const quantity = parseFloat(foodItem.quantity) || 0;
    const calories = parseFloat(foodItem.nutritionalInfo.calories) || 0;
    
    // Calculate meals based on nutritional value and quantity
    const mealsProvided = Math.round((quantity * calories) / 500); // Assuming 500 calories per meal
    
    // Calculate environmental impact
    const carbonSaved = Math.round(quantity * 2.5 * 0.35); // CO2 equivalent
    const waterSaved = Math.round(quantity * 1000); // Water footprint in liters
    const wastePrevented = Math.round(quantity * 0.8); // 80% of quantity would be waste
    
    // Calculate nutritional value score (0-100)
    const nutritionalValue = calculateNutritionalValue(foodItem.nutritionalInfo);
    
    // Calculate community benefit score (0-100)
    const communityBenefit = calculateCommunityBenefit(foodItem);
    
    return {
      potentialMealsProvided: mealsProvided,
      carbonFootprintSaved: carbonSaved,
      waterFootprintSaved: waterSaved,
      foodWastePrevented: wastePrevented,
      nutritionalValue,
      communityBenefit,
    };
  };

  // Calculate nutritional value score
  const calculateNutritionalValue = (nutritionalInfo) => {
    let score = 0;
    
    // Score based on macro nutrients
    if (nutritionalInfo.protein) score += 20;
    if (nutritionalInfo.carbs) score += 15;
    if (nutritionalInfo.fats) score += 15;
    
    // Score based on vitamins and minerals
    score += Math.min(nutritionalInfo.vitamins.length * 5, 25);
    score += Math.min(nutritionalInfo.minerals.length * 5, 25);
    
    return Math.min(score, 100);
  };

  // Calculate community benefit score
  const calculateCommunityBenefit = (foodItem) => {
    let score = 0;
    
    // Score based on target groups
    score += Math.min(foodItem.communityImpact.targetGroups.length * 10, 30);
    
    // Score based on nutritional benefits
    score += Math.min(foodItem.communityImpact.nutritionalBenefits.length * 10, 40);
    
    // Score based on cultural relevance
    score += Math.min(foodItem.communityImpact.culturalRelevance.length * 10, 30);
    
    return Math.min(score, 100);
  };

  // Enhanced sustainability score calculation
  const calculateSustainabilityScore = (foodItem) => {
    let score = 0;
    
    // Freshness score (0-30)
    const daysUntilExpiry = Math.round((new Date(foodItem.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    score += Math.min(daysUntilExpiry / 7 * 15, 30);
    
    // Storage and transport score (0-20)
    if (foodItem.storageInstructions) score += 10;
    if (foodItem.preferredTransport !== 'Any') score += 10;
    
    // Local sourcing score (0-20)
    if (foodItem.seasonality.locallySourced) score += 20;
    
    // Packaging score (0-15)
    if (foodItem.foodSafety.packagingType === 'Eco-friendly') score += 15;
    
    // Quality assurance score (0-15)
    score += Math.min(foodItem.qualityAssurance.certifications.length * 5, 15);
    
    return Math.min(score, 100);
  };

  // Enhanced AI tag generation
  const generateAITags = (foodItem) => {
    const tags = [];
    
    // Nutritional tags
    if (foodItem.nutritionalInfo.protein > 20) tags.push('high-protein');
    if (foodItem.nutritionalInfo.vitamins.length > 3) tags.push('vitamin-rich');
    if (foodItem.nutritionalInfo.minerals.length > 3) tags.push('mineral-rich');
    
    // Dietary tags
    foodItem.dietaryTags.forEach(tag => tags.push(tag.toLowerCase()));
    
    // Quality tags
    if (foodItem.qualityRating >= 4) tags.push('premium-quality');
    if (foodItem.freshnessDuration > 7) tags.push('long-lasting');
    
    // Safety tags
    if (foodItem.foodSafety.packagingType === 'Sealed') tags.push('safely-packed');
    if (!foodItem.foodSafety.crossContamination) tags.push('allergen-safe');
    
    // Seasonality tags
    if (foodItem.seasonality.locallySourced) tags.push('locally-sourced');
    if (foodItem.seasonality.bestSeason === getCurrentSeason()) tags.push('in-season');
    
    // Impact tags
    if (foodItem.distributionPriority === 'Emergency') tags.push('urgent-need');
    if (foodItem.communityImpact.targetGroups.length > 0) tags.push('community-focused');
    
    return tags;
  };

  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  // Generate AI insights
  const generateAIInsights = (foodItem) => {
    return {
      recommendedRecipients: determineRecommendedRecipients(foodItem),
      optimalDistributionTime: calculateOptimalDistributionTime(foodItem),
      shelfLifePrediction: predictShelfLife(foodItem),
      qualityPrediction: predictQualityOverTime(foodItem),
      handlingRecommendations: generateHandlingRecommendations(foodItem),
      matchScore: calculateMatchScore(foodItem),
    };
  };

  // Helper functions for AI insights
  const determineRecommendedRecipients = (foodItem) => {
    const recipients = [];
    
    if (foodItem.nutritionalInfo.protein > 15) recipients.push('Athletic Programs');
    if (foodItem.dietaryTags.includes('Vegetarian')) recipients.push('Vegetarian Communities');
    if (foodItem.preparationTime < 15) recipients.push('Emergency Shelters');
    if (foodItem.nutritionalValue > 80) recipients.push('School Programs');
    
    return recipients;
  };

  const calculateOptimalDistributionTime = (foodItem) => {
    const expiryDate = new Date(foodItem.expiryDate);
    const now = new Date();
    const timeUntilExpiry = expiryDate - now;
    
    if (timeUntilExpiry < 24 * 60 * 60 * 1000) return 'Immediate';
    if (timeUntilExpiry < 72 * 60 * 60 * 1000) return 'Within 3 days';
    return 'Standard';
  };

  const predictShelfLife = (foodItem) => {
    const baseShelfLife = foodItem.type === 'Perishable' ? 7 : 30;
    let modifier = 1;
    
    if (foodItem.foodSafety.temperature) modifier *= 1.2;
    if (foodItem.storageInstructions) modifier *= 1.1;
    if (foodItem.foodSafety.packagingType === 'Sealed') modifier *= 1.3;
    
    return Math.round(baseShelfLife * modifier);
  };

  const predictQualityOverTime = (foodItem) => {
    const daysUntilExpiry = Math.round((new Date(foodItem.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry > 14) return 'Excellent';
    if (daysUntilExpiry > 7) return 'Very Good';
    if (daysUntilExpiry > 3) return 'Good';
    return 'Fair';
  };

  const generateHandlingRecommendations = (foodItem) => {
    const recommendations = [];
    
    if (foodItem.foodSafety.temperature) {
      recommendations.push(`Store at ${foodItem.foodSafety.temperature}°C`);
    }
    
    if (foodItem.foodSafety.crossContamination) {
      recommendations.push('Keep separated from allergens');
    }
    
    if (foodItem.foodSafety.storageConditions) {
      recommendations.push(foodItem.foodSafety.storageConditions);
    }
    
    return recommendations;
  };

  const calculateMatchScore = (foodItem) => {
    let score = 0;
    
    // Quality factors (40%)
    score += (foodItem.qualityRating / 5) * 20;
    score += foodItem.qualityAssurance.certifications.length * 5;
    
    // Impact factors (30%)
    score += (calculateCommunityBenefit(foodItem) / 100) * 15;
    score += (calculateNutritionalValue(foodItem.nutritionalInfo) / 100) * 15;
    
    // Logistics factors (30%)
    const daysUntilExpiry = Math.round((new Date(foodItem.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    score += Math.min(daysUntilExpiry / 14 * 15, 15);
    score += foodItem.storageInstructions ? 15 : 0;
    
    return Math.min(Math.round(score), 100);
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.contactNumber || !formData.availableUntil) {
      return 'Please fill out all required fields.';
    }
    for (const item of formData.foodItems) {
      if (!item.name || !item.quantity || !item.expiryDate) {
        return 'Please fill out all food item fields.';
      }
    }
    if (formData.donationType === 'priced' && !formData.price) {
      return 'Please specify a price for the donation.';
    }
    if (locationMethod === 'auto' && (!formData.location.latitude || !formData.location.longitude)) {
      return 'Please wait until the location is acquired.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(base64);
      const { id: userId } = JSON.parse(jsonPayload);

      // Calculate AI-powered metrics for each food item
      const enhancedFoodItems = formData.foodItems.map(item => ({
        ...item,
        sustainabilityScore: calculateSustainabilityScore(item),
        aiGeneratedTags: generateAITags(item),
        impactMetrics: calculateImpactMetrics(item),
        aiInsights: generateAIInsights(item),
      }));

      const dataToSend = {
        ...formData,
        userId,
        foodItems: enhancedFoodItems,
      };

      const res = await fetch('/api/donor/donorform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });
      const data = await res.json();
      if (res.ok) {
        // Create notification through API
        const notificationData = {
          title: 'New Food Item Available',
          message: `${formData.foodItems.map(item => item.name).join(', ')} ${formData.foodItems.length > 1 ? 'are' : 'is'} now available`,
          link: '/avl',
          type: 'food'
        };

        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(notificationData),
        });

        // Dispatch event to update notification component
        window.dispatchEvent(new Event('newNotification'));

        setSuccessMessage('Form submitted successfully!');
        toast.success('Food item added successfully! 🍽️');
        setFormData(initialFormData);
      } else {
        setErrorMessage(data.message || 'Form submission failed. Please try again.');
        toast.error(data.message || 'Failed to add food item. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('An error occurred while submitting the form. Please try again.');
      toast.error('An error occurred while adding the food item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-6 max-w-4xl w-full text-gray-800 rounded-lg grid grid-cols-2 gap-4">
          <h1 className="col-span-2 text-6xl text-gray-800 font-semibold mb-6 text-center">Donate Food</h1>

          {/* Personal Information */}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
          />
          <input
            type="tel"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleInputChange}
            className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
          />

          {/* Donation Type Selection */}
          <div className="col-span-2 flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, donationType: 'free' })}
              className={`p-3 rounded-full flex items-center justify-center ${formData.donationType === 'free' ? 'bg-gray-800 text-white border border-black' : 'border border-black text-black'}`}
            >
              Donate for Free
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, donationType: 'priced' })}
              className={`p-3 rounded-full flex items-center justify-center ${formData.donationType === 'priced' ? 'bg-gray-800 text-white border border-black' : 'border border-black text-black'}`}
            >
              Donate for Price
              <MdOutlinePriceChange className="ml-2" />
            </button>
          </div>

          {/* Price Input */}
          {formData.donationType === 'priced' && (
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
              className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
            />
          )}

          {/* Location Method Selection */}
          {locationMethod === 'auto' && locationStatus && (
            <div className="text-left mt-2">{locationStatus}</div>
          )}
          <div className="col-span-2 flex gap-4">
            <button
              type="button"
              onClick={() => handleLocationMethodChange('auto')}
              className={`p-3 rounded-full flex items-center justify-center ${locationMethod === 'auto' ? 'bg-blue-400 text-white border-2' : 'border-2 text-black'}`}
            >
              Use My Location
              <CiLocationArrow1 className="ml-2" />
            </button>
          </div>

          {/* Location Status */}
          

          {/* Food Items */}
          <div className="col-span-2">
            {formData.foodItems.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                <select
                  value={item.type}
                  onChange={(e) => handleFoodItemChange(index, 'type', e.target.value)}
                  className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
                >
                  <option value="Perishable">Perishable</option>
                  <option value="Non-Perishable">Non-Perishable</option>
                </select>
                <input
                  type="text"
                  placeholder="Food Name"
                  value={item.name}
                  onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
                  className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleFoodItemChange(index, 'quantity', e.target.value)}
                  className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
                />
                <select
                  value={item.unit}
                  onChange={(e) => handleFoodItemChange(index, 'unit', e.target.value)}
                  className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
                >
                  <option value="kg">kg</option>
                  <option value="liters">liters</option>
                  <option value="units">units</option>
                </select>
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={item.expiryDate}
                  onChange={(e) => handleFoodItemChange(index, 'expiryDate', e.target.value)}
                  className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => removeFoodItem(index)}
                  className="col-span-2 bg-red-600 text-white p-3 w-1/3 rounded-3xl flex items-center justify-center"
                >
                  Remove Food Item
                  <IoIosRemoveCircle className="ml-2" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFoodItem}
            className="col-span-2 bg-green-400 text-gray-600 p-3 w-1/3 rounded-3xl flex items-center justify-center"
          >
            Add Another Food Item
            <IoIosAddCircle className="ml-2" />
          </button>

          {/* Available Until */}
          <div><h1>Available Until</h1></div>
          <input
            type="datetime-local"
            name="availableUntil"
            placeholder="Available Until"
            value={formData.availableUntil}
            onChange={handleInputChange}
            className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
          />

          {/* Submit */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="col-span-2 bg-gray-800 hover:bg-black w-1/3 text-white p-2 rounded-3xl mt-4 disabled:opacity-50 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
            <HiArrowSmRight className="ml-2" />
          </button>

          {/* Success and Error Messages */}
          {successMessage && <div className="col-span-2 text-green-500 text-center mt-4">{successMessage}</div>}
          {errorMessage && <div className="col-span-2 text-red-500 text-center mt-4">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default AddFood;