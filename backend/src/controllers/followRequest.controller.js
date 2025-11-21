import FollowRequest from '../models/FollowRequest.js';

export const getFollowRequests = async (req, res) => {
  try {
    const { student, companyId } = req.query;
    const query = {};
    
    if (student) query.student = student;
    if (companyId) query.companyId = companyId;
    
    const requests = await FollowRequest.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get follow requests error:', error);
    res.status(500).json({ error: 'Failed to fetch follow requests', message: error.message });
  }
};

export const getFollowRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FollowRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Follow request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Get follow request error:', error);
    res.status(500).json({ error: 'Failed to fetch follow request', message: error.message });
  }
};

export const createFollowRequest = async (req, res) => {
  try {
    const { student, companyId } = req.body;
    
    if (!student || !companyId) {
      return res.status(400).json({ error: 'Student and company ID are required' });
    }

    // Check if request already exists (unique constraint will also catch this)
    const existing = await FollowRequest.findOne({ student, companyId });
    if (existing) {
      return res.status(400).json({ error: 'Follow request already exists' });
    }

    const request = await FollowRequest.create({ student, companyId, status: 'pending' });
    res.status(201).json(request);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Follow request already exists' });
    }
    console.error('Create follow request error:', error);
    res.status(500).json({ error: 'Failed to create follow request', message: error.message });
  }
};

export const updateFollowRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    const request = await FollowRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({ error: 'Follow request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Update follow request error:', error);
    res.status(500).json({ error: 'Failed to update follow request', message: error.message });
  }
};

export const deleteFollowRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FollowRequest.findByIdAndDelete(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Follow request not found' });
    }
    
    res.json({ message: 'Follow request deleted successfully' });
  } catch (error) {
    console.error('Delete follow request error:', error);
    res.status(500).json({ error: 'Failed to delete follow request', message: error.message });
  }
};
