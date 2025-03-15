import mongoose, { Schema, model } from 'mongoose';

const nutritionalInfoSchema = new Schema({
  calories: { type: Number },
  protein: { type: Number },
  carbs: { type: Number },
  fats: { type: Number },
  allergens: [String],
  vitamins: [String],
  minerals: [String],
  dietaryRestrictions: [String],
});

const foodSafetySchema = new Schema({
  temperature: { type: String },
  handlingInstructions: { type: String },
  packagingType: { type: String },
  storageConditions: { type: String },
  crossContamination: { type: Boolean, default: false },
});

const seasonalitySchema = new Schema({
  bestSeason: { type: String },
  seasonalAvailability: [String],
  locallySourced: { type: Boolean, default: false },
  growthLocation: { type: String },
});

const qualityAssuranceSchema = new Schema({
  inspectionDate: { type: Date },
  inspectedBy: { type: String },
  certifications: [String],
  qualityStandards: [String],
  packagingIntegrity: { type: String, default: 'Good' },
});

const communityImpactSchema = new Schema({
  targetGroups: [String],
  nutritionalBenefits: [String],
  culturalRelevance: [String],
});

const impactMetricsSchema = new Schema({
  potentialMealsProvided: { type: Number, default: 0 },
  carbonFootprintSaved: { type: Number, default: 0 },
  waterFootprintSaved: { type: Number, default: 0 },
  foodWastePrevented: { type: Number, default: 0 },
  nutritionalValue: { type: Number, default: 0 },
  communityBenefit: { type: Number, default: 0 },
});

const aiInsightsSchema = new Schema({
  recommendedRecipients: [String],
  optimalDistributionTime: { type: String },
  shelfLifePrediction: { type: String },
  qualityPrediction: { type: String },
  handlingRecommendations: [String],
  matchScore: { type: Number, default: 0 },
});

const foodItemSchema = new Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String, default: 'kg' },
  expiryDate: { type: Date, required: true },
  nutritionalInfo: { type: nutritionalInfoSchema, default: () => ({}) },
  storageInstructions: { type: String },
  qualityRating: { type: Number, default: 5 },
  freshnessDuration: { type: String },
  dietaryTags: [String],
  preparationTime: { type: String },
  servingSize: { type: String },
  preferredTransport: { type: String, default: 'Any' },
  foodSafety: { type: foodSafetySchema, default: () => ({}) },
  seasonality: { type: seasonalitySchema, default: () => ({}) },
  nutritionalScore: { type: Number, default: 0 },
  qualityAssurance: { type: qualityAssuranceSchema, default: () => ({}) },
  distributionPriority: { type: String, default: 'Normal' },
  specialHandling: [String],
  allergenWarnings: [String],
  portionSuggestions: { type: String },
  communityImpact: { type: communityImpactSchema, default: () => ({}) },
});

const donorSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
  },
  foodItems: [foodItemSchema],
  availableUntil: { type: Date },
  donationType: { type: String, enum: ['free', 'priced'], required: true },
  price: { type: Number, required: function() { return this.donationType === 'priced'; } },
  donationFrequency: { type: String, default: 'one-time' },
  preferredPickupTime: {
    start: { type: Date },
    end: { type: Date },
  },
  additionalNotes: { type: String },
  impactMetrics: { type: impactMetricsSchema, default: () => ({}) },
  aiGeneratedTags: [String],
  sustainabilityScore: { type: Number, default: 0 },
  qualityAssurance: { type: qualityAssuranceSchema, default: () => ({}) },
  aiInsights: { type: aiInsightsSchema, default: () => ({}) },
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

export default model('Donor', donorSchema);