// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

router.get('/', transactionsController.getAllTransactions);
router.post('/', transactionsController.createTransaction);

module.exports = router;
