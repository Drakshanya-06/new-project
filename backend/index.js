require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // <-- import db connection

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/transactions', require('./routes/transactions'));


// Connect to MongoDB
connectDB();

// Test route
app.get('/', (req, res) => {
  res.send('TaxPal Backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


