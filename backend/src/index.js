const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Root route (browser works now)
app.get('/', (req, res) => {
  res.json({
    message: "SmartSeason API is running 🌱",
    health: "/health",
    api: "/api"
  });
});

// Main API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) =>
  res.json({ status: 'ok', app: 'SmartSeason API' })
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 SmartSeason API running on http://localhost:${PORT}`);
});