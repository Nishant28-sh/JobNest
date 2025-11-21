import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    index: true,
  },
  student: {
    type: String,
    required: true,
    index: true,
  },
  cover_letter: {
    type: String,
    default: null,
  },
  resume_url: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'accepted', 'rejected'],
    default: 'submitted',
  },
}, {
  timestamps: true,
});

// Unique constraint to prevent duplicate applications
applicationSchema.index({ jobId: 1, student: 1 }, { unique: true });

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export default Application;

