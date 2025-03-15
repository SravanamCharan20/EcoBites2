// AI Metrics Calculation Utilities

// Food Donation Metrics
export const calculateFoodMetrics = (foodItem) => {
  const metrics = {
    potentialMealsProvided: calculatePotentialMeals(foodItem),
    carbonFootprintSaved: calculateCarbonFootprint(foodItem),
    waterFootprintSaved: calculateWaterFootprint(foodItem),
    foodWastePrevented: calculateFoodWaste(foodItem),
    nutritionalValue: calculateNutritionalValue(foodItem),
    communityBenefit: calculateCommunityBenefit(foodItem),
  };

  const insights = {
    recommendedRecipients: determineRecommendedRecipients(foodItem),
    optimalDistributionTime: calculateOptimalDistribution(foodItem),
    shelfLifePrediction: predictShelfLife(foodItem),
    qualityPrediction: predictQuality(foodItem),
    handlingRecommendations: generateHandlingRecommendations(foodItem),
    matchScore: calculateMatchScore(foodItem),
  };

  const tags = generateFoodTags(foodItem);
  const sustainabilityScore = calculateFoodSustainability(foodItem);

  return { metrics, insights, tags, sustainabilityScore };
};

// Non-Food Donation Metrics
export const calculateNonFoodMetrics = (nonFoodItem) => {
  const metrics = {
    potentialBeneficiaries: calculatePotentialBeneficiaries(nonFoodItem),
    resourcesSaved: calculateResourcesSaved(nonFoodItem),
    carbonFootprintReduced: calculateCarbonReduction(nonFoodItem),
    socialImpactScore: calculateSocialImpact(nonFoodItem),
    economicValue: calculateEconomicValue(nonFoodItem),
    wastePreventionScore: calculateWastePreventionScore(nonFoodItem),
  };

  const insights = {
    recommendedRecipients: determineNonFoodRecipients(nonFoodItem),
    optimalDistributionStrategy: calculateDistributionStrategy(nonFoodItem),
    valueRetentionPrediction: predictValueRetention(nonFoodItem),
    qualityPrediction: predictItemQuality(nonFoodItem),
    handlingRecommendations: generateItemHandlingRecommendations(nonFoodItem),
    matchScore: calculateItemMatchScore(nonFoodItem),
    marketAnalysis: analyzeMarketPotential(nonFoodItem),
  };

  const tags = generateNonFoodTags(nonFoodItem);
  const sustainabilityScore = calculateItemSustainability(nonFoodItem);

  return { metrics, insights, tags, sustainabilityScore };
};

// Food Metrics Helper Functions
const calculatePotentialMeals = (foodItem) => {
  const quantity = parseFloat(foodItem.quantity) || 0;
  const calories = foodItem.nutritionalInfo?.calories || 500;
  return Math.round((quantity * calories) / 500); // Assuming 500 calories per meal
};

const calculateCarbonFootprint = (foodItem) => {
  const quantity = parseFloat(foodItem.quantity) || 0;
  return Math.round(quantity * 2.5 * 0.35); // CO2 equivalent in kg
};

const calculateWaterFootprint = (foodItem) => {
  const quantity = parseFloat(foodItem.quantity) || 0;
  return Math.round(quantity * 1000); // Water footprint in liters
};

const calculateFoodWaste = (foodItem) => {
  const quantity = parseFloat(foodItem.quantity) || 0;
  return Math.round(quantity * 0.8); // 80% of quantity would be waste if not donated
};

const calculateNutritionalValue = (foodItem) => {
  let score = 0;
  const nutritionalInfo = foodItem.nutritionalInfo || {};
  
  if (nutritionalInfo.protein) score += 20;
  if (nutritionalInfo.carbs) score += 15;
  if (nutritionalInfo.fats) score += 15;
  if (nutritionalInfo.vitamins?.length) score += Math.min(nutritionalInfo.vitamins.length * 5, 25);
  if (nutritionalInfo.minerals?.length) score += Math.min(nutritionalInfo.minerals.length * 5, 25);
  
  return Math.min(score, 100);
};

const calculateCommunityBenefit = (foodItem) => {
  let score = 0;
  const impact = foodItem.communityImpact || {};
  
  if (impact.targetGroups?.length) score += Math.min(impact.targetGroups.length * 10, 30);
  if (impact.nutritionalBenefits?.length) score += Math.min(impact.nutritionalBenefits.length * 10, 40);
  if (impact.culturalRelevance?.length) score += Math.min(impact.culturalRelevance.length * 10, 30);
  
  return Math.min(score, 100);
};

// Non-Food Metrics Helper Functions
const calculatePotentialBeneficiaries = (nonFoodItem) => {
  const baseMultiplier = {
    'Clothing': 1,
    'Furniture': 3,
    'Electronics': 2,
    'Books': 4,
    'Toys': 2,
  }[nonFoodItem.type] || 1;
  
  const quantity = parseFloat(nonFoodItem.quantity) || 0;
  return Math.round(quantity * baseMultiplier * (nonFoodItem.qualityMetrics?.rating || 5) / 5);
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
  return Math.round(quantity * baseWeight * ((nonFoodItem.sustainability?.reusability || 5) / 5));
};

const calculateCarbonReduction = (nonFoodItem) => {
  const baseCarbon = calculateResourcesSaved(nonFoodItem) * 2.5;
  const efficiencyMultiplier = nonFoodItem.sustainability?.energyEfficiency ? 1.5 : 1;
  return Math.round(baseCarbon * efficiencyMultiplier);
};

const calculateSocialImpact = (nonFoodItem) => {
  let score = 0;
  
  if (nonFoodItem.targetBeneficiaries?.length) score += nonFoodItem.targetBeneficiaries.length * 10;
  if (nonFoodItem.qualityMetrics?.rating) score += (nonFoodItem.qualityMetrics.rating / 5) * 30;
  if (nonFoodItem.donationType === 'free') score += 20;
  if (nonFoodItem.donationPriority === 'Emergency') score += 20;
  
  return Math.min(score, 100);
};

const calculateEconomicValue = (nonFoodItem) => {
  const originalPrice = parseFloat(nonFoodItem.marketValue?.originalPrice) || 0;
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
  const sustainability = nonFoodItem.sustainability || {};
  
  if (sustainability.reusability) score += (sustainability.reusability / 5) * 30;
  if (sustainability.recyclable) score += 20;
  if (sustainability.estimatedLifespan) {
    const lifespan = parseInt(sustainability.estimatedLifespan) || 0;
    score += Math.min(lifespan / 12 * 10, 30);
  }
  if (sustainability.repairability) score += (sustainability.repairability / 5) * 20;
  
  return Math.min(score, 100);
};

// Tag Generation Functions
const generateFoodTags = (foodItem) => {
  const tags = [];
  const nutritionalInfo = foodItem.nutritionalInfo || {};
  
  if (nutritionalInfo.protein > 20) tags.push('high-protein');
  if (nutritionalInfo.vitamins?.length > 3) tags.push('vitamin-rich');
  if (nutritionalInfo.minerals?.length > 3) tags.push('mineral-rich');
  if (foodItem.dietaryTags?.length) tags.push(...foodItem.dietaryTags);
  if (foodItem.qualityRating >= 4) tags.push('premium-quality');
  if (foodItem.freshnessDuration > 7) tags.push('long-lasting');
  
  return tags;
};

const generateNonFoodTags = (nonFoodItem) => {
  const tags = [];
  
  if (nonFoodItem.condition === 'New') tags.push('brand-new');
  if (nonFoodItem.qualityMetrics?.rating >= 4) tags.push('excellent-condition');
  if (nonFoodItem.sustainability?.recyclable) tags.push('recyclable');
  if (nonFoodItem.sustainability?.environmentalImpact === 'Low') tags.push('eco-friendly');
  if (nonFoodItem.itemDetails?.features?.length) {
    tags.push(...nonFoodItem.itemDetails.features.map(f => f.toLowerCase()));
  }
  
  return tags;
};

// Additional Helper Functions
const predictShelfLife = (foodItem) => {
  const baseShelfLife = foodItem.type === 'Perishable' ? 7 : 30;
  let modifier = 1;
  
  if (foodItem.foodSafety?.temperature) modifier *= 1.2;
  if (foodItem.storageInstructions) modifier *= 1.1;
  if (foodItem.foodSafety?.packagingType === 'Sealed') modifier *= 1.3;
  
  return Math.round(baseShelfLife * modifier);
};

const analyzeMarketPotential = (nonFoodItem) => {
  return {
    demandLevel: calculateDemandLevel(nonFoodItem),
    competitiveValue: assessCompetitiveValue(nonFoodItem),
    targetDemographic: determineTargetDemographic(nonFoodItem),
  };
};

const calculateDemandLevel = (nonFoodItem) => {
  const qualityScore = nonFoodItem.qualityMetrics?.rating || 3;
  const condition = nonFoodItem.condition === 'New' ? 2 : 1;
  const price = nonFoodItem.donationType === 'free' ? 2 : 1;
  
  const score = (qualityScore / 5 + condition + price) / 3;
  return score > 0.8 ? 'High' : score > 0.5 ? 'Moderate' : 'Low';
};

const assessCompetitiveValue = (nonFoodItem) => {
  const currentValue = calculateEconomicValue(nonFoodItem);
  const marketValue = parseFloat(nonFoodItem.marketValue?.currentValue) || currentValue;
  
  if (currentValue > marketValue * 1.2) return 'Excellent Value';
  if (currentValue > marketValue) return 'Good Value';
  if (currentValue > marketValue * 0.8) return 'Fair Value';
  return 'Below Market Value';
};

const determineTargetDemographic = (nonFoodItem) => {
  const demographics = [];
  
  if (nonFoodItem.itemDetails?.ageGroup) demographics.push(nonFoodItem.itemDetails.ageGroup);
  if (nonFoodItem.donationType === 'free') demographics.push('Low-income Communities');
  if (nonFoodItem.itemDetails?.gender) demographics.push(nonFoodItem.itemDetails.gender);
  
  return demographics;
};

// Additional Food Helper Functions
const determineRecommendedRecipients = (foodItem) => {
  const recipients = [];
  
  if (foodItem.nutritionalInfo?.protein > 15) recipients.push('Athletic Programs');
  if (foodItem.dietaryTags?.includes('Vegetarian')) recipients.push('Vegetarian Communities');
  if (foodItem.preparationTime < 15) recipients.push('Emergency Shelters');
  if (foodItem.nutritionalInfo?.calories > 400) recipients.push('Food Banks');
  if (foodItem.freshnessDuration > 7) recipients.push('Long-term Storage Facilities');
  
  return recipients;
};

const calculateOptimalDistribution = (foodItem) => {
  const expiryDate = new Date(foodItem.expiryDate);
  const now = new Date();
  const timeUntilExpiry = expiryDate - now;
  
  if (timeUntilExpiry < 24 * 60 * 60 * 1000) return 'Immediate Distribution Required';
  if (timeUntilExpiry < 72 * 60 * 60 * 1000) return 'Distribute Within 3 Days';
  return 'Standard Distribution Timeline';
};

const predictQuality = (foodItem) => {
  const daysUntilExpiry = Math.round((new Date(foodItem.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry > 14) return 'Excellent';
  if (daysUntilExpiry > 7) return 'Very Good';
  if (daysUntilExpiry > 3) return 'Good';
  return 'Fair';
};

const generateHandlingRecommendations = (foodItem) => {
  const recommendations = [];
  
  if (foodItem.foodSafety?.temperature) {
    recommendations.push(`Store at ${foodItem.foodSafety.temperature}°C`);
  }
  
  if (foodItem.foodSafety?.crossContamination) {
    recommendations.push('Keep separated from allergens');
  }
  
  if (foodItem.storageInstructions) {
    recommendations.push(foodItem.storageInstructions);
  }
  
  return recommendations;
};

const calculateMatchScore = (foodItem) => {
  let score = 0;
  
  // Quality factors (40%)
  score += (foodItem.qualityRating / 5) * 20;
  score += foodItem.nutritionalInfo?.calories ? 20 : 0;
  
  // Impact factors (30%)
  score += (calculateCommunityBenefit(foodItem) / 100) * 15;
  score += (calculateNutritionalValue(foodItem.nutritionalInfo) / 100) * 15;
  
  // Logistics factors (30%)
  const daysUntilExpiry = Math.round((new Date(foodItem.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  score += Math.min(daysUntilExpiry / 14 * 15, 15);
  score += foodItem.storageInstructions ? 15 : 0;
  
  return Math.min(Math.round(score), 100);
};

const calculateFoodSustainability = (foodItem) => {
  let score = 0;
  
  // Freshness score (30%)
  const daysUntilExpiry = Math.round((new Date(foodItem.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  score += Math.min(daysUntilExpiry / 7 * 15, 30);
  
  // Storage and transport score (20%)
  if (foodItem.storageInstructions) score += 10;
  if (foodItem.preferredTransport !== 'Any') score += 10;
  
  // Local sourcing score (20%)
  if (foodItem.seasonality?.locallySourced) score += 20;
  
  // Packaging score (15%)
  if (foodItem.foodSafety?.packagingType === 'Eco-friendly') score += 15;
  
  // Quality assurance score (15%)
  score += Math.min((foodItem.qualityAssurance?.certifications?.length || 0) * 5, 15);
  
  return Math.min(score, 100);
};

// Additional Non-Food Helper Functions
const determineNonFoodRecipients = (nonFoodItem) => {
  const recipients = [];
  
  switch (nonFoodItem.type) {
    case 'Clothing':
      if (nonFoodItem.itemDetails?.ageGroup === 'Children') recipients.push('Children\'s Homes');
      if (nonFoodItem.condition === 'New') recipients.push('Emergency Relief');
      break;
    case 'Electronics':
      if (nonFoodItem.qualityMetrics?.functionalityScore > 80) recipients.push('Educational Institutions');
      if (nonFoodItem.type.includes('Computer')) recipients.push('Digital Literacy Programs');
      break;
    case 'Furniture':
      if (nonFoodItem.condition === 'Good') recipients.push('Community Centers');
      if (nonFoodItem.itemDetails?.type === 'Office') recipients.push('Non-profit Organizations');
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
  const originalValue = parseFloat(nonFoodItem.marketValue?.originalPrice) || currentValue;
  const retentionRate = (currentValue / originalValue) * 100;
  
  if (retentionRate > 80) return 'Excellent Value Retention';
  if (retentionRate > 60) return 'Good Value Retention';
  if (retentionRate > 40) return 'Moderate Value Retention';
  return 'Low Value Retention';
};

const predictItemQuality = (nonFoodItem) => {
  const durabilityScore = nonFoodItem.qualityMetrics?.durabilityScore || 0;
  const usageDuration = parseInt(nonFoodItem.itemHistory?.usageDuration) || 0;
  
  if (durabilityScore > 80 && usageDuration < 12) return 'Long-lasting Quality';
  if (durabilityScore > 60) return 'Maintained Quality';
  if (durabilityScore > 40) return 'Gradual Degradation';
  return 'Quality Concerns';
};

const generateItemHandlingRecommendations = (nonFoodItem) => {
  const recommendations = [];
  
  if (nonFoodItem.safetyInfo?.warnings?.length) {
    recommendations.push(...nonFoodItem.safetyInfo.warnings);
  }
  
  if (nonFoodItem.maintenanceNeeded !== 'None') {
    recommendations.push(`Requires ${nonFoodItem.maintenanceNeeded.toLowerCase()} maintenance`);
  }
  
  if (nonFoodItem.type === 'Electronics') {
    recommendations.push('Store in a dry, temperature-controlled environment');
  }
  
  return recommendations;
};

const calculateItemMatchScore = (nonFoodItem) => {
  let score = 0;
  
  // Quality factors (40%)
  score += ((nonFoodItem.qualityMetrics?.rating || 5) / 5) * 20;
  score += ((nonFoodItem.qualityMetrics?.functionalityScore || 100) / 100) * 20;
  
  // Sustainability factors (30%)
  const sustainabilityScore = calculateItemSustainability(nonFoodItem);
  score += (sustainabilityScore / 100) * 30;
  
  // Value factors (30%)
  const valueRetention = parseFloat(nonFoodItem.marketValue?.depreciationRate) || 0.5;
  score += (1 - valueRetention) * 15;
  score += nonFoodItem.condition === 'New' ? 15 : 10;
  
  return Math.min(Math.round(score), 100);
};

const calculateItemSustainability = (nonFoodItem) => {
  let score = 0;
  const sustainability = nonFoodItem.sustainability || {};
  
  // Material sustainability (30%)
  if (sustainability.materialSustainability?.length) {
    score += Math.min(sustainability.materialSustainability.length * 7.5, 30);
  }
  
  // Reusability and recyclability (25%)
  if (sustainability.reusability) score += (sustainability.reusability / 5) * 15;
  if (sustainability.recyclable) score += 10;
  
  // Environmental impact (25%)
  switch (sustainability.environmentalImpact?.toLowerCase()) {
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
  
  // Repairability and durability (20%)
  if (sustainability.repairability) score += (sustainability.repairability / 5) * 10;
  if (nonFoodItem.qualityMetrics?.durabilityScore) {
    score += (nonFoodItem.qualityMetrics.durabilityScore / 100) * 10;
  }
  
  return Math.min(score, 100);
}; 