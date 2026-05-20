const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
// IMPORTANT: Adjust helmet for cross-origin resources if serving PDFs locally
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

module.exports = app;
