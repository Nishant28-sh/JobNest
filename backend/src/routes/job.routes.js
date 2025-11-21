import express from 'express';
import { getJobs, getJob, createJob, updateJob, deleteJob } from '../controllers/job.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJob);
// NOTE: Creating jobs currently allows unauthenticated requests for development convenience.
// In production you should protect this route (e.g., with `authenticateToken`).
router.post('/', createJob);
router.put('/:id', authenticateToken, updateJob);
router.delete('/:id', authenticateToken, deleteJob);

export default router;

