import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getApplications, getApplication, createApplication, updateApplication, deleteApplication } from '../controllers/application.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer to store uploads in backend/uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../uploads'));
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, `${unique}-${file.originalname}`);
	}
});
const upload = multer({ storage });

const router = express.Router();

router.get('/', getApplications);
router.get('/:id', getApplication);
// Accept multipart/form-data for application creation (resume upload optional)
router.post('/', upload.single('resume'), createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', authenticateToken, deleteApplication);

export default router;

