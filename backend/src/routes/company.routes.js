import express from 'express';
import { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } from '../controllers/company.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', authenticateToken, createCompany);
router.put('/:id', authenticateToken, updateCompany);
router.delete('/:id', authenticateToken, deleteCompany);

export default router;

