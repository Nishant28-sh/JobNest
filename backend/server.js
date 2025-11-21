import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import MongoDB connection
import { connectDB } from './src/models/mongodb.js';
import { initDemoData } from './src/models/initDemoData.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
import fs from 'fs';
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
// Enable CORS with credentials support so the frontend can send cookies/auth headers
// Use a dynamic origin (reflect the request origin) to allow local dev servers.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import companyRoutes from './src/routes/company.routes.js';
import jobRoutes from './src/routes/job.routes.js';
import applicationRoutes from './src/routes/application.routes.js';
import followRequestRoutes from './src/routes/followRequest.routes.js';
import userRoutes from './src/routes/user.routes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/follow-requests', followRequestRoutes);
app.use('/api/users', userRoutes);

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();
    await initDemoData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

