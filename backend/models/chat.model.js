import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  messages: [messageSchema],
  lastMessage: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Create indexes for better query performance
chatSchema.index({ donorId: 1, requesterId: 1, foodItemId: 1 });
chatSchema.index({ lastMessage: -1 });

export default mongoose.model('Chat', chatSchema); 