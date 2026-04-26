const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://smartseason-field-monitoring-drab.vercel.app'
];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, server-to-server, health checks)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "SmartSeason API is running 🌱",
    health: "/health",
    api: "/api"
  });
});

// API routes
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

// Auto-seed on startup, then start server
const seed = require('./seed');
seed()
  .catch(err => console.error('Startup seed error:', err.message))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`🌱 SmartSeason API running on port ${PORT}`);
    });
  });