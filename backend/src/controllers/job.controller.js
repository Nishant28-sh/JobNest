import Job from '../models/Job.js';
import Company from '../models/Company.js';

export const getJobs = async (req, res) => {
  try {
    const { companyId, recruiterId } = req.query;
    const query = {};
    if (companyId) query.companyId = companyId;
    if (recruiterId) query.recruiterId = recruiterId;
    const jobs = await Job.find(query).sort({ createdAt: -1 });

    // Attach company name to each job for frontend convenience
    const jobsWithCompany = await Promise.all(
      jobs.map(async (j) => {
        const company = await Company.findById(j.companyId).select('name');
        return {
          ...j.toObject(),
          companyName: company ? company.name : null,
        };
      })
    );

    res.json(jobsWithCompany);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', message: error.message });
  }
};

export const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const company = await Company.findById(job.companyId).select('name');
    const jobObj = {
      ...job.toObject(),
      companyName: company ? company.name : null,
    };
    res.json(jobObj);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job', message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const { companyId, company, recruiterId, title, location, type, description, salary_range, requirements } = req.body;

    if (!title || !location || !type || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Resolve companyId: prefer explicit companyId, else find or create by company name
    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && company) {
      let existing = await Company.findOne({ name: company });
      if (!existing) {
        // Provide a sensible default for `about` to satisfy Company model validation
        existing = await Company.create({ name: company, about: 'Company added via job posting' });
      }
      resolvedCompanyId = existing._id.toString();
    }

    if (!resolvedCompanyId) {
      return res.status(400).json({ error: 'companyId or company name is required' });
    }

    const job = await Job.create({
      companyId: resolvedCompanyId,
      recruiterId: recruiterId || null,
      title,
      location,
      type,
      description,
      salary_range: salary_range || null,
      requirements: requirements || null,
      is_active: true,
    });

    const companyDoc = await Company.findById(resolvedCompanyId).select('name');
    const jobObj = { ...job.toObject(), companyName: companyDoc ? companyDoc.name : null };
    res.status(201).json(jobObj);
  } catch (error) {
    console.error('Create job error:', error);
    if (error.name === 'ValidationError') {
      // Return validation errors to the client for better UX
      return res.status(400).json({ error: 'Validation failed', message: error.message });
    }
    res.status(500).json({ error: 'Failed to create job', message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, type, description } = req.body;
    
    const job = await Job.findByIdAndUpdate(
      id,
      { title, location, type, description },
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job', message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job', message: error.message });
  }
};
