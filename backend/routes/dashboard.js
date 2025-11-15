// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { getDashboard, getTransactions } = require('../controllers/dashboardController');

// public endpoints for now (you can add auth middleware protect)
router.get('/', getDashboard);
router.get('/transactions', getTransactions);

module.exports = router;
