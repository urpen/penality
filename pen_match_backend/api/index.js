const express = require('express');
const cors = require('cors');

// Import database connection
const db = require('../db/connection');

// Import routes
const authRoutes = require('../routes/auth');
const questionRoutes = require('../routes/questions');
const penTypeRoutes = require('../routes/pentype');
const matchRoutes = require('../routes/match');
const aiAnalysisRoutes = require('../routes/ai_analysis');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/questions', questionRoutes);
app.use('/answer', questionRoutes);
app.use('/pen-type', penTypeRoutes);
app.use('/match', matchRoutes);
app.use('/ai-analysis', aiAnalysisRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Pen Match Backend API is running',
        version: '1.0.0'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Export the Express app for Vercel
module.exports = app;
