import Application from '../models/Application.js';

export const getApplications = async (req, res) => {
  try {
    const { jobId, student, jobIds } = req.query;
    const query = {};
    if (jobId) query.jobId = jobId;
    if (student) query.student = student;
    if (jobIds) {
      // jobIds can be comma-separated list
      const ids = String(jobIds).split(',').map(s => s.trim()).filter(Boolean);
      if (ids.length > 0) query.jobId = { $in: ids };
    }

    const apps = await Application.find(query).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications', message: err.message });
  }
};

export const getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to fetch application', message: error.message });
  }
};

export const createApplication = async (req, res) => {
  try {
    // When using multipart/form-data via multer, text fields are in req.body and file in req.file
    const { jobId, studentId, cover_letter } = req.body;
    const resumeFile = req.file; // multer sets this when upload.single('resume') used
    if (!jobId || !studentId) {
      return res.status(400).json({ error: 'jobId and studentId are required' });
    }

    // Prevent duplicate applications (unique index will also enforce)
    const existing = await Application.findOne({ jobId, student: studentId });
    if (existing) {
      return res.status(409).json({ error: 'Application already exists' });
    }

    const appData = { jobId, student: studentId, cover_letter: cover_letter || null };
    if (resumeFile) {
      // store relative path for resume
      appData.resume_url = `/uploads/${resumeFile.filename}`;
    }
    const app = await Application.create(appData);
    res.status(201).json(app);
  } catch (err) {
    console.error('Create application error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Already applied' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', message: err.message });
    }
    res.status(500).json({ error: 'Failed to create application', message: err.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['submitted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application', message: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Failed to delete application', message: error.message });
  }
};
