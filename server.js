// server.js - Main Express Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ─── API ROUTES ───────────────────────────
const { router: authRouter } = require('./auth');
const districtsRouter = require('./districts');
const aiRouter = require('./ai');

app.use('/api/auth', authRouter);
app.use('/api/districts', districtsRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Telangana Tourism API running', timestamp: new Date() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── START ────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏛️  Telangana Tourism Server running!`);
  console.log(`🌐  Open: http://localhost:${PORT}`);
  console.log(`📡  API:  http://localhost:${PORT}/api/health\n`);
});
