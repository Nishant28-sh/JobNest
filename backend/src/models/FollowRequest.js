import mongoose from 'mongoose';

const followRequestSchema = new mongoose.Schema({
  student: {
    type: String,
    required: true,
    index: true,
  },
  companyId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Unique constraint to prevent duplicate follow requests
followRequestSchema.index({ student: 1, companyId: 1 }, { unique: true });

const FollowRequest = mongoose.models.FollowRequest || mongoose.model('FollowRequest', followRequestSchema);
export default FollowRequest;

