import express from 'express';
import { getFollowRequests, getFollowRequest, createFollowRequest, updateFollowRequest, deleteFollowRequest } from '../controllers/followRequest.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFollowRequests);
router.get('/:id', getFollowRequest);
router.post('/', authenticateToken, createFollowRequest);
router.put('/:id', authenticateToken, updateFollowRequest);
router.delete('/:id', authenticateToken, deleteFollowRequest);

export default router;

