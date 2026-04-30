const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./backend/config/db');

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Railway / proxy support
app.set('trust proxy', 1);

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // Railway frontend URL
].filter(Boolean);

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or Postman requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/projects', require('./backend/routes/projects'));
app.use('/api/tasks', require('./backend/routes/tasks'));
app.use('/api/notifications', require('./backend/routes/notifications'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));

  app.get('/*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);