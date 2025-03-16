/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { MdOutlinePriceChange } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { HiArrowSmRight } from "react-icons/hi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddNonFood = () => {
  const initialFormData = {
    name: '',
    email: '',
    contactNumber: '',
    location: {
      latitude: '',
      longitude: '',
    },
    nonFoodItems: [
      {
        type: 'Clothing',
        name: '',
        condition: 'New',
        quantity: '',
        price: '',
        itemDetails: {
          brand: '',
          model: '',
          ageGroup: '',
          gender: '',
          size: '',
          color: '',
          material: [],
          specifications: {},
          features: [],
          accessories: [],
          dimensions: {
            length: '',
            width: '',
            height: '',
            weight: '',
          },
        },
        qualityMetrics: {
          rating: 5,
          wear: 'None',
          damages: 'None',
          completeness: 'Complete',
          functionalityScore: 100,
          aestheticScore: 100,
          durabilityScore: 100,
          refurbishmentNeeded: false,
          qualityNotes: [],
        },
        sustainability: {
          reusability: 5,
          recyclable: true,
          estimatedLifespan: '',
          environmentalImpact: 'Low',
          materialSustainability: [],
          energyEfficiency: '',
          repairability: 5,
          wasteReduction: '',
          carbonFootprint: '',
        },
        usageInstructions: '',
        maintenanceNeeded: 'None',
        certifications: [],
        preferredTransport: 'Standard',
        safetyInfo: {
          warnings: [],
          precautions: [],
          regulations: [],
          safetyRating: 5,
          hazardousMaterials: [],
        },
        marketValue: {
          originalPrice: '',
          currentValue: '',
          depreciationRate: '',
          potentialResaleValue: '',
        },
        donationPriority: 'Normal',
        specialRequirements: [],
        targetBeneficiaries: [],
        itemHistory: {
          previousOwners: 0,
          purchaseDate: '',
          usageDuration: '',
          maintenanceHistory: [],
          repairs: [],
        },
        impactMetrics: {
          potentialBeneficiaries: 0,
          resourcesSaved: 0,
          carbonFootprintReduced: 0,
          socialImpactScore: 0,
          economicValue: 0,
          wastePreventionScore: 0,
        },
      },
    ],
    availableUntil: '',
    donationType: 'free',
    donationFrequency: 'one-time',
    preferredPickupTime: {
      start: '',
      end: '',
    },
    additionalNotes: '',
    impactMetrics: {
      potentialBeneficiaries: 0,
      resourcesSaved: 0,
      carbonFootprintReduced: 0,
      socialImpactScore: 0,
      economicValue: 0,
      wastePreventionScore: 0,
    },
    aiGeneratedTags: [],
    sustainabilityScore: 0,
    qualityAssurance: {
      verificationStatus: 'pending',
      lastChecked: new Date().toISOString(),
      certifications: [],
      inspectionNotes: [],
      conditionVerification: [],
    },
    aiInsights: {
      recommendedRecipients: [],
      optimalDistributionStrategy: '',
      valueRetentionPrediction: '',
      qualityPrediction: '',
      handlingRecommendations: [],
      matchScore: 0,
      marketAnalysis: {
        demandLevel: '',
        competitiveValue: '',
        targetDemographic: [],
      },
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSuccessMessage('');
    setErrorMessage('');
    setLocationStatus('');
  
    // Check if the input is for latitude or longitude
    if (name === 'latitude' || name === 'longitude') {
      setFormData((prevData) => ({
        ...prevData,
        location: {
          ...prevData.location,
          [name]: value, // Update latitude or longitude
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value, // Update other fields
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
            location: { latitude, longitude },
          }));
          setLocationStatus('Location acquired successfully!');
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setLocationStatus('Failed to acquire location.');
        },
        {
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus('Geolocation is not supported by this browser.');
    }
  };

  const addNonFoodItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      nonFoodItems: [
        ...prevData.nonFoodItems,
        {
          type: 'Clothing',
          name: '',
          condition: 'New',
          quantity: '',
          price: '',
          itemDetails: {
            brand: '',
            model: '',
            ageGroup: '',
            gender: '',
            size: '',
            color: '',
            material: [],
            specifications: {},
            features: [],
            accessories: [],
            dimensions: {
              length: '',
              width: '',
              height: '',
              weight: '',
            },
          },
          qualityMetrics: {
            rating: 5,
            wear: 'None',
            damages: 'None',
            completeness: 'Complete',
            functionalityScore: 100,
            aestheticScore: 100,
            durabilityScore: 100,
            refurbishmentNeeded: false,
            qualityNotes: [],
          },
          sustainability: {
            reusability: 5,
            recyclable: true,
            estimatedLifespan: '',
            environmentalImpact: 'Low',
            materialSustainability: [],
            energyEfficiency: '',
            repairability: 5,
            wasteReduction: '',
            carbonFootprint: '',
          },
          usageInstructions: '',
          maintenanceNeeded: 'None',
          certifications: [],
          preferredTransport: 'Standard',
          safetyInfo: {
            warnings: [],
            precautions: [],
            regulations: [],
            safetyRating: 5,
            hazardousMaterials: [],
          },
          marketValue: {
            originalPrice: '',
            currentValue: '',
            depreciationRate: '',
            potentialResaleValue: '',
          },
          donationPriority: 'Normal',
          specialRequirements: [],
          targetBeneficiaries: [],
          itemHistory: {
            previousOwners: 0,
            purchaseDate: '',
            usageDuration: '',
            maintenanceHistory: [],
            repairs: [],
          },
          impactMetrics: {
            potentialBeneficiaries: 0,
            resourcesSaved: 0,
            carbonFootprintReduced: 0,
            socialImpactScore: 0,
            economicValue: 0,
            wastePreventionScore: 0,
          },
        },
      ],
    }));
  };

  const removeNonFoodItem = (index) => {
    setFormData((prevData) => {
      const updatedNonFoodItems = [...prevData.nonFoodItems];
      updatedNonFoodItems.splice(index, 1);
      return {
        ...prevData,
        nonFoodItems: updatedNonFoodItems,
      };
    });
  };

  const handleNonFoodItemChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedNonFoodItems = [...prevData.nonFoodItems];
      
      // Handle nested objects
      if (field.includes('.')) {
        const [mainField, subField] = field.split('.');
        updatedNonFoodItems[index] = {
          ...updatedNonFoodItems[index],
          [mainField]: {
            ...updatedNonFoodItems[index][mainField],
            [subField]: value,
          },
        };
      } else {
        updatedNonFoodItems[index] = {
          ...updatedNonFoodItems[index],
          [field]: value,
        };
      }

      // Calculate impact metrics using AI
      const newImpactMetrics = calculateImpactMetrics(updatedNonFoodItems[index]);
      
      return {
        ...prevData,
        nonFoodItems: updatedNonFoodItems,
        impactMetrics: newImpactMetrics,
      };
    });
  };

  // Enhanced impact metrics calculation
  const calculateImpactMetrics = (nonFoodItem) => {
    const quantity = parseFloat(nonFoodItem.quantity) || 0;
    
    // Calculate beneficiaries based on item type and specifications
    const beneficiaries = calculatePotentialBeneficiaries(nonFoodItem);
    
    // Calculate resources saved based on item type and materials
    const resourcesSaved = calculateResourcesSaved(nonFoodItem);
    
    // Calculate carbon footprint reduction
    const carbonReduced = calculateCarbonReduction(nonFoodItem);
    
    // Calculate social impact score
    const socialImpactScore = calculateSocialImpact(nonFoodItem);
    
    // Calculate economic value
    const economicValue = calculateEconomicValue(nonFoodItem);
    
    // Calculate waste prevention score
    const wastePreventionScore = calculateWastePreventionScore(nonFoodItem);
    
    return {
      potentialBeneficiaries: beneficiaries,
      resourcesSaved: resourcesSaved,
      carbonFootprintReduced: carbonReduced,
      socialImpactScore,
      economicValue,
      wastePreventionScore,
    };
  };

  // Helper functions for impact calculations
  const calculatePotentialBeneficiaries = (nonFoodItem) => {
    const baseMultiplier = {
      'Clothing': 1,
      'Furniture': 3,
      'Electronics': 2,
      'Books': 4,
      'Toys': 2,
    }[nonFoodItem.type] || 1;
    
    const quantity = parseFloat(nonFoodItem.quantity) || 0;
    return Math.round(quantity * baseMultiplier * (nonFoodItem.qualityMetrics.rating / 5));
  };

  const calculateResourcesSaved = (nonFoodItem) => {
    const baseWeight = {
      'Furniture': 50,
      'Electronics': 20,
      'Clothing': 5,
      'Books': 2,
      'Toys': 3,
    }[nonFoodItem.type] || 5;
    
    const quantity = parseFloat(nonFoodItem.quantity) || 0;
    return Math.round(quantity * baseWeight * (nonFoodItem.sustainability.reusability / 5));
  };

  const calculateCarbonReduction = (nonFoodItem) => {
    const baseCarbon = calculateResourcesSaved(nonFoodItem) * 2.5;
    const efficiencyMultiplier = nonFoodItem.sustainability.energyEfficiency ? 1.5 : 1;
    return Math.round(baseCarbon * efficiencyMultiplier);
  };

  const calculateSocialImpact = (nonFoodItem) => {
    let score = 0;
    
    // Target beneficiaries impact
    score += nonFoodItem.targetBeneficiaries.length * 10;
    
    // Quality impact
    score += (nonFoodItem.qualityMetrics.rating / 5) * 30;
    
    // Accessibility impact
    if (nonFoodItem.donationType === 'free') score += 20;
    
    // Community need impact
    if (nonFoodItem.donationPriority === 'Emergency') score += 20;
    
    return Math.min(score, 100);
  };

  const calculateEconomicValue = (nonFoodItem) => {
    const originalPrice = parseFloat(nonFoodItem.marketValue.originalPrice) || 0;
    const quantity = parseFloat(nonFoodItem.quantity) || 0;
    const condition = {
      'New': 1,
      'Like New': 0.8,
      'Good': 0.6,
      'Fair': 0.4,
      'Poor': 0.2,
    }[nonFoodItem.condition] || 0.5;
    
    return Math.round(originalPrice * quantity * condition);
  };

  const calculateWastePreventionScore = (nonFoodItem) => {
    let score = 0;
    
    // Reusability impact
    score += (nonFoodItem.sustainability.reusability / 5) * 30;
    
    // Recyclability impact
    if (nonFoodItem.sustainability.recyclable) score += 20;
    
    // Lifespan impact
    const lifespan = parseInt(nonFoodItem.sustainability.estimatedLifespan) || 0;
    score += Math.min(lifespan / 12 * 10, 30); // Max 30 points for lifespan (based on months)
    
    // Repairability impact
    score += (nonFoodItem.sustainability.repairability / 5) * 20;
    
    return Math.min(score, 100);
  };

  // Enhanced sustainability score calculation
  const calculateSustainabilityScore = (nonFoodItem) => {
    let score = 0;
    
    // Material sustainability (30%)
    score += calculateMaterialSustainability(nonFoodItem);
    
    // Reusability and recyclability (25%)
    score += (nonFoodItem.sustainability.reusability / 5) * 15;
    if (nonFoodItem.sustainability.recyclable) score += 10;
    
    // Environmental impact (25%)
    score += calculateEnvironmentalImpact(nonFoodItem);
    
    // Repairability and durability (20%)
    score += (nonFoodItem.sustainability.repairability / 5) * 10;
    score += (nonFoodItem.qualityMetrics.durabilityScore / 100) * 10;
    
    return Math.min(score, 100);
  };

  const calculateMaterialSustainability = (nonFoodItem) => {
    let score = 0;
    const sustainableMaterials = ['Organic', 'Recycled', 'Biodegradable', 'Renewable'];
    
    nonFoodItem.itemDetails.material.forEach(material => {
      if (sustainableMaterials.some(sustainable => material.includes(sustainable))) {
        score += 7.5; // Max 30 points for 4 sustainable materials
      }
    });
    
    return Math.min(score, 30);
  };

  const calculateEnvironmentalImpact = (nonFoodItem) => {
    let score = 0;
    
    switch (nonFoodItem.sustainability.environmentalImpact.toLowerCase()) {
      case 'low':
        score += 25;
        break;
      case 'medium':
        score += 15;
        break;
      case 'high':
        score += 5;
        break;
    }
    
    return score;
  };

  // Enhanced AI tag generation
  const generateAITags = (nonFoodItem) => {
    const tags = [];
    
    // Condition tags
    if (nonFoodItem.condition === 'New') tags.push('brand-new');
    if (nonFoodItem.qualityMetrics.rating >= 4) tags.push('excellent-condition');
    
    // Sustainability tags
    if (nonFoodItem.sustainability.recyclable) tags.push('recyclable');
    if (nonFoodItem.sustainability.environmentalImpact === 'Low') tags.push('eco-friendly');
    if (nonFoodItem.sustainability.repairability >= 4) tags.push('easily-repairable');
    
    // Value tags
    if (nonFoodItem.marketValue.depreciationRate < 0.2) tags.push('value-retention');
    if (calculateEconomicValue(nonFoodItem) > 100) tags.push('high-value');
    
    // Special feature tags
    if (nonFoodItem.itemDetails.features.length > 0) {
      tags.push(...nonFoodItem.itemDetails.features.map(f => f.toLowerCase()));
    }
    
    // Category-specific tags
    addCategorySpecificTags(nonFoodItem, tags);
    
    return tags;
  };

  const addCategorySpecificTags = (nonFoodItem, tags) => {
    switch (nonFoodItem.type) {
      case 'Clothing':
        if (nonFoodItem.itemDetails.material.includes('Organic')) tags.push('organic');
        if (nonFoodItem.itemDetails.material.includes('Cotton')) tags.push('cotton');
        break;
      case 'Electronics':
        if (nonFoodItem.qualityMetrics.functionalityScore > 90) tags.push('fully-functional');
        if (nonFoodItem.sustainability.energyEfficiency === 'High') tags.push('energy-efficient');
        break;
      case 'Furniture':
        if (nonFoodItem.maintenanceNeeded === 'None') tags.push('ready-to-use');
        if (nonFoodItem.itemDetails.material.includes('Wood')) tags.push('wooden');
        break;
      case 'Books':
        if (nonFoodItem.qualityMetrics.completeness === 'Complete') tags.push('complete-set');
        break;
      case 'Toys':
        if (nonFoodItem.safetyInfo.safetyRating >= 4) tags.push('child-safe');
        break;
    }
  };

  // Generate AI insights
  const generateAIInsights = (nonFoodItem) => {
    return {
      recommendedRecipients: determineRecommendedRecipients(nonFoodItem),
      optimalDistributionStrategy: calculateDistributionStrategy(nonFoodItem),
      valueRetentionPrediction: predictValueRetention(nonFoodItem),
      qualityPrediction: predictQualityOverTime(nonFoodItem),
      handlingRecommendations: generateHandlingRecommendations(nonFoodItem),
      matchScore: calculateMatchScore(nonFoodItem),
      marketAnalysis: analyzeMarketPotential(nonFoodItem),
    };
  };

  // Helper functions for AI insights
  const determineRecommendedRecipients = (nonFoodItem) => {
    const recipients = [];
    
    switch (nonFoodItem.type) {
      case 'Clothing':
        if (nonFoodItem.itemDetails.ageGroup === 'Children') recipients.push('Children\'s Homes');
        if (nonFoodItem.condition === 'New') recipients.push('Emergency Relief');
        break;
      case 'Electronics':
        if (nonFoodItem.qualityMetrics.functionalityScore > 80) recipients.push('Educational Institutions');
        if (nonFoodItem.type.includes('Computer')) recipients.push('Digital Literacy Programs');
        break;
      case 'Furniture':
        if (nonFoodItem.condition === 'Good') recipients.push('Community Centers');
        if (nonFoodItem.itemDetails.type === 'Office') recipients.push('Non-profit Organizations');
        break;
    }
    
    return recipients;
  };

  const calculateDistributionStrategy = (nonFoodItem) => {
    if (nonFoodItem.donationPriority === 'Emergency') return 'Immediate Distribution';
    if (nonFoodItem.condition === 'New') return 'Direct Distribution';
    if (nonFoodItem.maintenanceNeeded !== 'None') return 'Refurbishment Required';
    return 'Standard Distribution';
  };

  const predictValueRetention = (nonFoodItem) => {
    const currentValue = calculateEconomicValue(nonFoodItem);
    const originalValue = parseFloat(nonFoodItem.marketValue.originalPrice) || currentValue;
    const retentionRate = (currentValue / originalValue) * 100;
    
    if (retentionRate > 80) return 'Excellent Value Retention';
    if (retentionRate > 60) return 'Good Value Retention';
    if (retentionRate > 40) return 'Moderate Value Retention';
    return 'Low Value Retention';
  };

  const predictQualityOverTime = (nonFoodItem) => {
    const durabilityScore = nonFoodItem.qualityMetrics.durabilityScore;
    const usageDuration = parseInt(nonFoodItem.itemHistory.usageDuration) || 0;
    
    if (durabilityScore > 80 && usageDuration < 12) return 'Long-lasting Quality';
    if (durabilityScore > 60) return 'Maintained Quality';
    if (durabilityScore > 40) return 'Gradual Degradation';
    return 'Quality Concerns';
  };

  const generateHandlingRecommendations = (nonFoodItem) => {
    const recommendations = [];
    
    // Add safety recommendations
    if (nonFoodItem.safetyInfo.warnings.length > 0) {
      recommendations.push(...nonFoodItem.safetyInfo.warnings);
    }
    
    // Add maintenance recommendations
    if (nonFoodItem.maintenanceNeeded !== 'None') {
      recommendations.push(`Requires ${nonFoodItem.maintenanceNeeded.toLowerCase()} maintenance`);
    }
    
    // Add storage recommendations
    if (nonFoodItem.type === 'Electronics') {
      recommendations.push('Store in a dry, temperature-controlled environment');
    }
    
    return recommendations;
  };

  const calculateMatchScore = (nonFoodItem) => {
    let score = 0;
    
    // Quality factors (40%)
    score += (nonFoodItem.qualityMetrics.rating / 5) * 20;
    score += (nonFoodItem.qualityMetrics.functionalityScore / 100) * 20;
    
    // Sustainability factors (30%)
    score += (calculateSustainabilityScore(nonFoodItem) / 100) * 30;
    
    // Value factors (30%)
    const valueRetention = parseFloat(nonFoodItem.marketValue.depreciationRate) || 0.5;
    score += (1 - valueRetention) * 15;
    score += nonFoodItem.condition === 'New' ? 15 : 10;
    
    return Math.min(Math.round(score), 100);
  };

  const analyzeMarketPotential = (nonFoodItem) => {
    return {
      demandLevel: calculateDemandLevel(nonFoodItem),
      competitiveValue: assessCompetitiveValue(nonFoodItem),
      targetDemographic: determineTargetDemographic(nonFoodItem),
    };
  };

  const calculateDemandLevel = (nonFoodItem) => {
    const seasonalDemand = isSeasonallyRelevant(nonFoodItem) ? 'High' : 'Moderate';
    const qualityDemand = nonFoodItem.qualityMetrics.rating >= 4 ? 'High' : 'Moderate';
    const priceDemand = nonFoodItem.donationType === 'free' ? 'High' : 'Moderate';
    
    const demandScores = {
      'High': 3,
      'Moderate': 2,
      'Low': 1,
    };
    
    const averageDemand = (demandScores[seasonalDemand] + demandScores[qualityDemand] + demandScores[priceDemand]) / 3;
    
    return averageDemand > 2.5 ? 'High' : averageDemand > 1.5 ? 'Moderate' : 'Low';
  };

  const isSeasonallyRelevant = (nonFoodItem) => {
    const currentMonth = new Date().getMonth();
    const season = currentMonth >= 2 && currentMonth <= 4 ? 'Spring' :
                  currentMonth >= 5 && currentMonth <= 7 ? 'Summer' :
                  currentMonth >= 8 && currentMonth <= 10 ? 'Fall' : 'Winter';
                  
    return nonFoodItem.seasonality?.bestSeason === season;
  };

  const assessCompetitiveValue = (nonFoodItem) => {
    const currentValue = calculateEconomicValue(nonFoodItem);
    const marketValue = parseFloat(nonFoodItem.marketValue.currentValue) || currentValue;
    
    if (currentValue > marketValue * 1.2) return 'Excellent Value';
    if (currentValue > marketValue) return 'Good Value';
    if (currentValue > marketValue * 0.8) return 'Fair Value';
    return 'Below Market Value';
  };

  const determineTargetDemographic = (nonFoodItem) => {
    const demographics = [];
    
    // Age-based targeting
    if (nonFoodItem.itemDetails.ageGroup) {
      demographics.push(nonFoodItem.itemDetails.ageGroup);
    }
    
    // Need-based targeting
    if (nonFoodItem.donationType === 'free') {
      demographics.push('Low-income Communities');
    }
    
    // Usage-based targeting
    switch (nonFoodItem.type) {
      case 'Electronics':
        demographics.push('Students', 'Professionals');
        break;
      case 'Furniture':
        demographics.push('Homeowners', 'Renters');
        break;
      case 'Clothing':
        if (nonFoodItem.itemDetails.gender) {
          demographics.push(nonFoodItem.itemDetails.gender);
        }
        break;
    }
    
    return demographics;
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

      // Calculate AI-powered metrics for each non-food item
      const enhancedNonFoodItems = formData.nonFoodItems.map(item => ({
        ...item,
        sustainabilityScore: calculateSustainabilityScore(item),
        aiGeneratedTags: generateAITags(item),
        impactMetrics: calculateImpactMetrics(item),
        aiInsights: generateAIInsights(item),
      }));

      const dataToSend = {
        ...formData,
        userId,
        nonFoodItems: enhancedNonFoodItems,
      };

      const res = await fetch('/api/donor/nfdonorform', {
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
          title: 'New Non-Food Item Available',
          message: `${formData.nonFoodItems.map(item => item.name).join(', ')} ${formData.nonFoodItems.length > 1 ? 'are' : 'is'} now available`,
          link: '/avlnf',
          type: 'nonfood'
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
        toast.success('Non-food item added successfully! 📦');
        setFormData(initialFormData);
      } else {
        setErrorMessage(data.message || 'Form submission failed. Please try again.');
        toast.error(data.message || 'Failed to add non-food item. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('An error occurred while submitting the form. Please try again.');
      toast.error('An error occurred while adding the non-food item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.contactNumber || !formData.availableUntil) {
      return 'Please fill out all required fields.';
    }
    for (const item of formData.nonFoodItems) {
      if (!item.name || !item.quantity) {
        return 'Please fill out all non-food item fields.';
      }
      if (formData.donationType === 'priced' && !item.price) {
        return 'Please specify a price for all items in a priced donation.';
      }
    }
    if (locationMethod === 'auto' && (!formData.location.latitude || !formData.location.longitude)) {
      return 'Please wait until the location is acquired.';
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-6 max-w-4xl w-full text-gray-800 rounded-lg grid grid-cols-2 gap-4">
          <h1 className="col-span-2 text-6xl text-gray-800 font-semibold mb-6 text-center">Donate Non-Food</h1>

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
              className={`p-3 rounded-full ${formData.donationType === 'free' ? 'bg-gray-800 text-white border border-black' : 'border border-black text-black'}`}
            >
              Donate for Free
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, donationType: 'priced' })}
              className={`p-3 rounded-full flex items-center gap-2 ${formData.donationType === 'priced' ? 'bg-gray-800 text-white border border-black' : 'border border-black text-black'}`}
            >
              Donate for Price <MdOutlinePriceChange />
            </button>
          </div>

          {locationMethod === 'auto' && locationStatus && (
            <div className="col-span-2 text-left mt-2">{locationStatus}</div>
          )}

          <div className="col-span-2 flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleLocationMethodChange('auto')}
              className={`p-3 rounded-full flex items-center gap-2 ${locationMethod === 'auto' ? 'bg-blue-400 text-white border-2' : 'border-2 text-black'}`}
            >
              Use My Location <CiLocationArrow1 />
            </button>
          </div>

          {/* Non-Food Items */}
          {formData.nonFoodItems.map((item, index) => (
            <div key={index} className="col-span-2 grid grid-cols-2 gap-4 mb-4">
              <select
                name="type"
                value={item.type}
                onChange={(e) => handleNonFoodItemChange(index, 'type', e.target.value)}
                className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
              >
                <option value="Clothing">Clothing</option>
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Toys">Toys</option>
                <option value="Others">Others</option>
              </select>

              <input
                type="text"
                placeholder="Item Name"
                value={item.name}
                onChange={(e) => handleNonFoodItemChange(index, 'name', e.target.value)}
                className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
              />

              <select
                value={item.condition}
                onChange={(e) => handleNonFoodItemChange(index, 'condition', e.target.value)}
                className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>

              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleNonFoodItemChange(index, 'quantity', e.target.value)}
                className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
              />

              {formData.donationType === 'priced' && (
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleNonFoodItemChange(index, 'price', e.target.value)}
                  className="border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
                />
              )}

              <button
                type="button"
                onClick={() => removeNonFoodItem(index)}
                className="col-span-3 bg-red-600 text-white p-3 w-1/3 rounded-3xl flex items-center gap-2"
              >
                Remove Non-Food Item <IoIosRemoveCircle />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addNonFoodItem}
            className="col-span-2 w-1/3 rounded-3xl bg-green-500 text-white p-3 flex items-center gap-2"
          >
            Add Another Non-Food Item <IoIosAddCircle />
          </button>

          {/* Location Method */}
          

         

          {/* Available Until */}
          <input
            type="datetime-local"
            name="availableUntil"
            value={formData.availableUntil}
            onChange={handleInputChange}
            className="col-span-2 border-2 border-gray-600 p-3 rounded text-black focus:outline-none focus:ring-2"
          />

          {/* Success and Error Messages */}
          {successMessage && <div className="col-span-2 text-green-500 text-center mt-4">{successMessage}</div>}
          {errorMessage && <div className="col-span-2 text-red-500 text-center mt-4">{errorMessage}</div>}

          <button
          type="submit"
          onClick={handleSubmit}
          className="col-span-2 bg-gray-800 hover:bg-black w-1/3 text-white p-2 rounded-3xl mt-4 disabled:opacity-50 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
          <HiArrowSmRight className="ml-2" />
        </button>
        </div>
      </div>
    </div>
  );
};

export default AddNonFood;