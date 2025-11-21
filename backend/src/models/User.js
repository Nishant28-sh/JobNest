import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  externalId: {
    type: String,
    default: null,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'employer'],
  },
  companyId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for faster queries
userSchema.index({ name: 1, role: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

