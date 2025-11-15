// backend/controllers/dashboardController.js
const Transaction = require('../models/Transaction');

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    // If you have user auth, use req.user._id to filter by user
    // For demo, compute totals from DB or return dummy data

    // Example: aggregate totals (if you have transactions)
    const txs = await Transaction.find({}).limit(100).lean();

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    txs.forEach(t => {
      if (t.type === 'Income') monthlyIncome += Math.abs(t.amount || 0);
      else monthlyExpenses += Math.abs(t.amount || 0);
    });

    const breakdown = [
      { label: 'Rent/Mortgage', value: 32 },
      { label: 'Business', value: 28 },
      { label: 'Utilities', value: 15 },
      { label: 'Food', value: 12 },
      { label: 'Other', value: 13 },
    ];

    return res.json({
      stats: { monthlyIncome, monthlyExpenses, estimatedTax: 12, savingsRate: 18 },
      breakdown,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find({}).sort({ date: -1 }).limit(10).lean();
    // map to front-end shape
    const out = txs.map(t => ({
      date: t.date.toISOString().slice(0,10),
      desc: t.desc,
      category: t.category,
      amount: t.amount,
      type: t.type
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
