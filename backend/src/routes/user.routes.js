import express from 'express';
import { upsertUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/', upsertUser);

export default router;
