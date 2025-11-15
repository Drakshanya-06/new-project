const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/transactions', require('./routes/dashboard')); // optional, or keep single file endpoints as above

// after existing app.use('/api/auth', ...)
app.use('/api/transactions', require('./routes/transactions'));



// Enable CORS
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', require('./routes/auth'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'TaxPal API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
