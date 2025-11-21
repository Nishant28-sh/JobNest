import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company;

