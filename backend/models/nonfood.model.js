import mongoose, { Schema, model } from 'mongoose';

const dimensionsSchema = new Schema({
  length: { type: String },
  width: { type: String },
  height: { type: String },
  weight: { type: String },
});

const itemDetailsSchema = new Schema({
  brand: { type: String },
  model: { type: String },
  ageGroup: { type: String },
  gender: { type: String },
  size: { type: String },
  color: { type: String },
  material: [String],
  specifications: { type: Map, of: String },
  features: [String],
  accessories: [String],
  dimensions: { type: dimensionsSchema, default: () => ({}) },
});

const qualityMetricsSchema = new Schema({
  rating: { type: Number, default: 5 },
  wear: { type: String, default: 'None' },
  damages: { type: String, default: 'None' },
  completeness: { type: String, default: 'Complete' },
  functionalityScore: { type: Number, default: 100 },
  aestheticScore: { type: Number, default: 100 },
  durabilityScore: { type: Number, default: 100 },
  refurbishmentNeeded: { type: Boolean, default: false },
  qualityNotes: [String],
});

const sustainabilitySchema = new Schema({
  reusability: { type: Number, default: 5 },
  recyclable: { type: Boolean, default: true },
  estimatedLifespan: { type: String },
  environmentalImpact: { type: String, default: 'Low' },
  materialSustainability: [String],
  energyEfficiency: { type: String },
  repairability: { type: Number, default: 5 },
  wasteReduction: { type: String },
  carbonFootprint: { type: String },
});

const safetyInfoSchema = new Schema({
  warnings: [String],
  precautions: [String],
  regulations: [String],
  safetyRating: { type: Number, default: 5 },
  hazardousMaterials: [String],
});

const marketValueSchema = new Schema({
  originalPrice: { type: Number },
  currentValue: { type: Number },
  depreciationRate: { type: String },
  potentialResaleValue: { type: Number },
});

const itemHistorySchema = new Schema({
  previousOwners: { type: Number, default: 0 },
  purchaseDate: { type: Date },
  usageDuration: { type: String },
  maintenanceHistory: [String],
  repairs: [String],
});

const impactMetricsSchema = new Schema({
  potentialBeneficiaries: { type: Number, default: 0 },
  resourcesSaved: { type: Number, default: 0 },
  carbonFootprintReduced: { type: Number, default: 0 },
  socialImpactScore: { type: Number, default: 0 },
  economicValue: { type: Number, default: 0 },
  wastePreventionScore: { type: Number, default: 0 },
});

const marketAnalysisSchema = new Schema({
  demandLevel: { type: String },
  competitiveValue: { type: String },
  targetDemographic: [String],
});

const aiInsightsSchema = new Schema({
  recommendedRecipients: [String],
  optimalDistributionStrategy: { type: String },
  valueRetentionPrediction: { type: String },
  qualityPrediction: { type: String },
  handlingRecommendations: [String],
  matchScore: { type: Number, default: 0 },
  marketAnalysis: { type: marketAnalysisSchema, default: () => ({}) },
});

const nonFoodItemSchema = new Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  condition: { type: String, required: true, enum: ['New', 'Used'] },
  quantity: { type: Number, required: true },
  price: { type: Number },
  itemDetails: { type: itemDetailsSchema, default: () => ({}) },
  qualityMetrics: { type: qualityMetricsSchema, default: () => ({}) },
  sustainability: { type: sustainabilitySchema, default: () => ({}) },
  usageInstructions: { type: String },
  maintenanceNeeded: { type: String, default: 'None' },
  certifications: [String],
  preferredTransport: { type: String, default: 'Standard' },
  safetyInfo: { type: safetyInfoSchema, default: () => ({}) },
  marketValue: { type: marketValueSchema, default: () => ({}) },
  donationPriority: { type: String, default: 'Normal' },
  specialRequirements: [String],
  targetBeneficiaries: [String],
  itemHistory: { type: itemHistorySchema, default: () => ({}) },
  impactMetrics: { type: impactMetricsSchema, default: () => ({}) },
});

const nonFoodDonationSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  location: {
    latitude: { type: String },
    longitude: { type: String },
  },
  nonFoodItems: [nonFoodItemSchema],
  availableUntil: { type: Date, required: true },
  donationType: { type: String, required: true, enum: ['free', 'priced'] },
  donationFrequency: { type: String, default: 'one-time' },
  preferredPickupTime: {
    start: { type: Date },
    end: { type: Date },
  },
  additionalNotes: { type: String },
  impactMetrics: { type: impactMetricsSchema, default: () => ({}) },
  aiGeneratedTags: [String],
  sustainabilityScore: { type: Number, default: 0 },
  qualityAssurance: {
    verificationStatus: { type: String, default: 'pending' },
    lastChecked: { type: Date, default: Date.now },
    certifications: [String],
    inspectionNotes: [String],
    conditionVerification: [String],
  },
  aiInsights: { type: aiInsightsSchema, default: () => ({}) },
}, { timestamps: true });

export default model('NonFoodDonation', nonFoodDonationSchema);