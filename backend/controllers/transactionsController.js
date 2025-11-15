const Transaction = require('../models/Transaction');

// GET /api/transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }).limit(100);
    const income = transactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    const stats = {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      estimatedTax: Math.round(income * 0.03),
      savingsRate: income ? Math.round(((income - expenses) / income) * 100) : 0,
    };
    res.json({ transactions, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { description, amount, category, date, notes, type } = req.body;
    if (!description || typeof amount === 'undefined' || !type) {
      return res.status(400).json({ message: 'description, amount and type are required' });
    }
    const tx = await Transaction.create({
      description,
      amount: Number(amount),
      category,
      date: date ? new Date(date) : undefined,
      notes,
      type,
    });
    res.status(201).json({ transaction: tx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
