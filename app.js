require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config');
const { post_GetToken, get_GetUserInfo } = require('./esignetService');
const connectDB = require('./db');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3005',
    'http://localhost:5173',
    'https://mosip-dev.klefki.io',
    'http://13.203.236.51',
    'http://13.203.236.51:8888',
    'http://13.203.236.51:3000',
    'http://13.203.236.51:3005',
    'https://e-governance.klefki.io'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Allow preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (optional - for viewing documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Social Grant Application REST APIs!!');
});

// eSignet - Token Request Handler
app.post('/fetchUserInfo', async (req, res) => {
  try {
    const tokenResponse = await post_GetToken(req.body);
    res.send(await get_GetUserInfo(tokenResponse.access_token));
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// Application Routes
app.use('/api/applications', applicationRoutes);

// Test email endpoint (remove in production)
app.post('/api/test-email', async (req, res) => {
  try {
    const { sendTestEmail } = require('./services/emailService');
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const result = await sendTestEmail(email);
    res.json({ success: true, message: 'Test email sent', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const port = PORT || 8888;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📦 MongoDB connecting...`);
});