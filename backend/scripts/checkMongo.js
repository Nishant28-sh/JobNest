#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });
import mongoose from 'mongoose';
import Company from '../src/models/Company.js';
import Job from '../src/models/Job.js';
import User from '../src/models/User.js';
import Application from '../src/models/Application.js';

async function check() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';
    console.log('Connecting to MongoDB at:', uri);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB. DB name:', mongoose.connection.name);

    const companyCount = await Company.countDocuments();
    const jobCount = await Job.countDocuments();
    console.log(`Companies: ${companyCount}`);
    console.log(`Jobs: ${jobCount}`);

      const userCount = await User.countDocuments();
      const applicationCount = await Application.countDocuments();
      console.log(`Users: ${userCount}`);
      console.log(`Applications: ${applicationCount}`);

    // Show a sample job and company if available
    if (companyCount > 0) {
      const c = await Company.findOne().lean();
      console.log('Sample company:', { _id: c._id.toString(), name: c.name });
    }

    if (jobCount > 0) {
      const j = await Job.findOne().lean();
      console.log('Sample job:', { _id: j._id.toString(), title: j.title, companyId: j.companyId });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB check failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

check();
