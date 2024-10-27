import mongoose, { Schema, model } from 'mongoose';

const locationSchema = new Schema({
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
});

const nonFoodItemSchema = new Schema({
  type: { type: String, required: true },  
  name: { type: String, required: true }, 
  condition: { type: String, required: true, enum: ['New', 'Used'] },  
  quantity: { type: Number, required: true },
  price: { type: Number },    
});

const nonFoodDonationSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  location: { type: locationSchema, required: true },
  nonFoodItems: { type: [nonFoodItemSchema], required: true, _id: false },
  availableUntil: { type: Date, required: true },
  donationType: { type: String, required: true, enum: ['free', 'priced'] }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NonFoodDonation = model('NonFoodDonation', nonFoodDonationSchema);

export default NonFoodDonation;