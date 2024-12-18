import mongoose, { Schema } from 'mongoose';

const nonFoodRequestSchema = new Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'NonFoodDonation', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    postalCode: { type: String, required: false },
    country: { type: String, required: false },
  },
  location: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
  },
  description: { type: String, required: false },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
});

export default mongoose.model('NonFoodRequest', nonFoodRequestSchema);