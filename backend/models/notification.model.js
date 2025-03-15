import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  link: { type: String, required: true },
  type: { type: String, required: true, enum: ['food', 'nonfood'] },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 