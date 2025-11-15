// frontend/src/Budgets.jsx
import React, { useEffect, useState } from 'react';
import { budgetsAPI } from './services/api'; // uses your axios instance
import './Budgets.css';

export default function Budgets() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    category: '',
    amount: '',
    month: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, []);

  async function fetchBudgets() {
    try {
      setLoading(true);
      const res = await budgetsAPI.list().catch(() => null); // if backend missing, ignore
      if (res && res.data) {
        setBudgets(res.data.budgets || res.data); // adapt to backend shape
      } else {
        // fallback demo items if backend not present
        setBudgets([
          // sample
          { id: 'b1', category: 'Groceries', budget: 500, spent: 120, month: '2025-11', status: 'Active' },
        ]);
      }
    } catch (err) {
      console.error('Could not load budgets', err);
    } finally {
      setLoading(false);
    }
  }

  const openModal = () => {
    setForm({ category: '', amount: '', month: '', description: '' });
    setError('');
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category || !form.amount || !form.month) {
      setError('Category, amount and month are required');
      return;
    }

    const payload = {
      category: form.category,
      amount: Number(form.amount),
      month: form.month,
      description: form.description,
    };

    try {
      setLoading(true);
      const res = await budgetsAPI.create(payload).catch(() => null);

      if (res && res.data) {
        // if backend returns created budget, use it
        const created = res.data.budget || res.data;
        setBudgets((p) => [created, ...p]);
      } else {
        // fallback: generate UI-only budget
        const fake = {
          id: `local-${Date.now()}`,
          category: payload.category,
          budget: payload.amount,
          spent: 0,
          month: payload.month,
          description: payload.description,
          status: 'Active',
        };
        setBudgets((p) => [fake, ...p]);
      }

      setShowModal(false);
    } catch (err) {
      console.error('Create budget failed', err);
      setError('Save failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await budgetsAPI.delete(id).catch(() => null);
      setBudgets((p) => p.filter((b) => (b.id || b._id) !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="tp-page-wrapper">
      <aside className="tp-sidebar-small">
        <div className="tp-brand">TaxPal</div>
        <nav className="tp-nav-small">
          <a className="active">Dashboard</a>
          <a>Transactions</a>
          <a className="active-link">Budgets</a>
          <a>Tax Estimator</a>
          <a>Reports</a>
        </nav>
      </aside>

      <main className="tp-main-wide">
        <header className="tp-header">
          <h1>Budgets</h1>
          <div>
            <button className="btn primary" onClick={openModal}>+ Create Budget</button>
          </div>
        </header>

        <section className="tp-card">
          <h3>Create and manage monthly budgets</h3>
          <p className="muted">Set budgets per category and monitor spending.</p>
        </section>

        <section className="tp-card">
          <table className="budgets-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Month</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.length === 0 && (
                <tr><td colSpan="7">No budgets found.</td></tr>
              )}
              {budgets.map((b) => {
                const id = b.id || b._id;
                const budgetAmt = b.budget ?? b.amount ?? b.budgetAmount ?? 0;
                const spent = b.spent ?? 0;
                return (
                  <tr key={id}>
                    <td>{b.category}</td>
                    <td>${Number(budgetAmt).toFixed(2)}</td>
                    <td>${Number(spent).toFixed(2)}</td>
                    <td>${(budgetAmt - spent).toFixed(2)}</td>
                    <td>{b.month}</td>
                    <td>{b.status || 'Active'}</td>
                    <td>
                      <button className="btn small" onClick={() => alert('Edit not implemented')}>Edit</button>{' '}
                      <button className="btn danger small" onClick={() => handleDelete(id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-head">
              <h4>Create New Budget</h4>
              <button className="icon-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleCreate} className="modal-body">
              {error && <div className="error-box">{error}</div>}

              <div className="row">
                <div className="col">
                  <label>Category</label>
                  <input name="category" value={form.category} onChange={handleChange} placeholder="Select a category" />
                </div>
                <div className="col">
                  <label>Budget Amount</label>
                  <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="$ 0.00" />
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <label>Month</label>
                  <input name="month" type="month" value={form.month} onChange={handleChange} />
                </div>
                <div className="col"></div>
              </div>

              <div>
                <label>Description (Optional)</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add any additional details..." />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn primary" disabled={loading}>{loading ? 'Creating...' : 'Create Budget'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
