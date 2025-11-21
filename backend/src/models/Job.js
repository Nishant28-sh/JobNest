import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true,
  },
  recruiterId: {
    type: String,
    required: false,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Full-time', 'Internship', 'Part-time', 'Contract'],
  },
  description: {
    type: String,
    required: true,
  },
  salary_range: {
    type: String,
    required: false,
  },
  requirements: {
    type: String,
    required: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
jobSchema.index({ companyId: 1, createdAt: -1 });

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;

