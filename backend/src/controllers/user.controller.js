import User from '../models/User.js';

export const upsertUser = async (req, res) => {
  try {
    const { externalId, name, email, role } = req.body;
    if (!externalId || !name || !role) {
      return res.status(400).json({ error: 'externalId, name and role are required' });
    }

    // Map frontend role to backend enum
    const mappedRole = role === 'recruiter' ? 'employer' : role;

    const user = await User.findOneAndUpdate(
      { externalId },
      { externalId, name, email: email || null, role: mappedRole },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(user);
  } catch (err) {
    console.error('Upsert user error:', err);
    res.status(500).json({ error: 'Failed to upsert user', message: err.message });
  }
};

export default { upsertUser };
