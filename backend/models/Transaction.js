const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  type: { type: String, enum: ['Income','Expense'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// guard against recompilation in dev/hot-reload
module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
