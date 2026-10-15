require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedAll = require('./seed/seeder');

// Route imports
const authRoutes = require('./routes/authRoutes');
const studyRoutes = require('./routes/studyRoutes');
const codingRoutes = require('./routes/codingRoutes');
const aptitudeRoutes = require('./routes/aptitudeRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const notesRoutes = require('./routes/notesRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'SkillTrack Placement Intelligence API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/admin', adminRoutes);

// Catch 404 for unspecified API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    // Auto-seed default materials and mock test data
    await seedAll();

    app.listen(PORT, () => {
      console.log(`[SkillTrack] Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[SkillTrack] Health API available at http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[SkillTrack] Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
