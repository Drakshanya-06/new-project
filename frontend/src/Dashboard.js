// frontend/src/Dashboard.js
import React, { useEffect, useState } from 'react';
import { FaHome, FaExchangeAlt, FaWallet, FaCalculator, FaChartPie, FaPlus, FaTimes, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useNavigate, NavLink } from 'react-router-dom';
import { transactionsAPI } from './services/api'; // add to your services/api.js (see below)
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('Income'); // 'Income' or 'Expense'
  const [loadingSave, setLoadingSave] = useState(false);

  // data state
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    estimatedTax: 0,
    savingsRate: 0,
  });

  // categories (simple local categories manager; replace with API if needed)
  const [categories, setCategories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tp_categories')) || ['Salary','Rent','Food','Utilities','Other'];
    } catch { return ['Salary','Rent','Food','Utilities','Other']; }
  });
  const [newCategory, setNewCategory] = useState('');

  // modal form
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Salary',
    date: '',
    notes: '',
    type: 'Income',
  });

  useEffect(() => {
    // load dashboard (transactions + stats)
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await transactionsAPI.getAll();
      const data = res.data;
      setTransactions(data.transactions || []);
      setStats(data.stats || {
        monthlyIncome: 0, monthlyExpenses: 0, estimatedTax: 0, savingsRate: 0
      });
    } catch (err) {
      console.error('Failed to load transactions', err);
      // fallback: keep sample values if backend not available
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setForm({
      description: '',
      amount: '',
      category: categories[0] || 'Salary',
      date: new Date().toISOString().slice(0,10),
      notes: '',
      type,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Save handler that calls backend endpoint and updates UI
  const saveTransaction = async () => {
    // basic validation
    if (!form.description || form.amount === '' || isNaN(Number(form.amount))) {
      alert('Please provide description and numeric amount.');
      return;
    }
    setLoadingSave(true);
    try {
      const payload = {
        description: form.description,
        amount: Number(form.amount) * (form.type === 'Income' ? 1 : -1), // keep your backend type semantics if you prefer positive/negative
        category: form.category,
        date: form.date || new Date().toISOString(),
        notes: form.notes,
        type: form.type,
      };
      const res = await transactionsAPI.create(payload);
      const newTx = res.data.transaction || res.data; // depends on backend response
      // prepend to local list and recompute stats simply
      const updated = [newTx, ...transactions];
      setTransactions(updated);

      // recompute simple stats client-side (safe to do, backend also returns stats on fetch)
      const income = updated.filter(t => t.type === 'Income').reduce((s,t)=> s + Math.abs(Number(t.amount)), 0);
      const expenses = updated.filter(t => t.type === 'Expense').reduce((s,t)=> s + Math.abs(Number(t.amount)), 0);
      setStats({
        monthlyIncome: income,
        monthlyExpenses: expenses,
        estimatedTax: Math.round(income * 0.03),
        savingsRate: income ? Math.round(((income - expenses)/income)*100) : 0
      });

      alert('Saved');
      setShowModal(false);
    } catch (err) {
      console.error('Save failed', err);
      alert('Save failed');
    } finally {
      setLoadingSave(false);
    }
  };

  // categories manager (stored to localStorage for now)
  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      alert('Category exists');
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    localStorage.setItem('tp_categories', JSON.stringify(updated));
    setNewCategory('');
  };
  const deleteCategory = (c) => {
    const updated = categories.filter(x=> x !== c);
    setCategories(updated);
    localStorage.setItem('tp_categories', JSON.stringify(updated));
  };

  // logout (clears token and user and redirects)
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // helper to render pie SVG
  const Pie = ({items}) => {
    const total = items.reduce((s,i) => s + i.value, 0) || 1;
    let start = 0;
    const colors = ['#4CAF50','#2196F3','#FF9800','#E91E63','#9C27B0','#00BCD4'];
    return (
      <svg viewBox="0 0 32 32" className="tp-pie">
        {items.map((slice,i) => {
          const value = slice.value / total;
          const end = start + value;
          const large = value > 0.5 ? 1 : 0;
          const x1 = 16 + 16 * Math.cos(2 * Math.PI * start);
          const y1 = 16 + 16 * Math.sin(2 * Math.PI * start);
          const x2 = 16 + 16 * Math.cos(2 * Math.PI * end);
          const y2 = 16 + 16 * Math.sin(2 * Math.PI * end);
          const d = `M16 16 L ${x1} ${y1} A 16 16 0 ${large} 1 ${x2} ${y2} Z`;
          start = end;
          return <path key={i} d={d} fill={colors[i % colors.length]}></path>
        })}
      </svg>
    );
  };

  // prepare pie data from stats (demo percentages if no transactions)
  const pieData = [
    { label: 'Rent/Mortgage', value: 32 },
    { label: 'Business', value: 28 },
    { label: 'Utilities', value: 15 },
    { label: 'Food', value: 12 },
    { label: 'Other', value: 13 }
  ];

  return (
    <div className="tp-dashboard-root">
      <aside className="tp-sidebar">
        <div className="tp-brand">TaxPal</div>
        <nav className="tp-nav">
          <NavLink to="/dashboard" className={({isActive})=>isActive ? 'active' : ''}><FaHome/> Dashboard</NavLink>
          <NavLink to="/transactions"><FaExchangeAlt/> Transactions</NavLink>
          <NavLink to="/budgets"><FaWallet/> Budgets</NavLink>
          <NavLink to="/tax-estimator"><FaCalculator/> Tax Estimator</NavLink>
          <NavLink to="/reports"><FaChartPie/> Reports</NavLink>
        </nav>

        <div className="tp-user">
          <div className="avatar">{(JSON.parse(localStorage.getItem('user')||'{}')?.name || 'U').split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div className="user-info">
            <div className="name">{JSON.parse(localStorage.getItem('user')||'{}')?.name || 'Demo User'}</div>
            <div className="email">{JSON.parse(localStorage.getItem('user')||'{}')?.email || 'demo@gmail.com'}</div>
          </div>
        </div>

        <div className="tp-settings">
          <button className="settings-btn" onClick={()=>{ /* scroll to settings area */ document.getElementById('settings-panel')?.scrollIntoView({behavior:'smooth'})}}>
            <FaCog/> Settings
          </button>
          <button className="logout-btn" onClick={logout}><FaSignOutAlt/> Logout</button>
        </div>
      </aside>

      <main className="tp-main">
        <header className="tp-header">
          <h1>Dashboard</h1>
          <div className="tp-actions">
            <button className="btn primary" onClick={()=>openModal('Income')}><FaPlus/> Record Income</button>
            <button className="btn outline" onClick={()=>openModal('Expense')}><FaPlus/> Record Expense</button>
          </div>
        </header>

        <section className="tp-cards">
          <div className="card">
            <div className="card-title">Monthly Income</div>
            <div className="card-value">${Number(stats.monthlyIncome || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          </div>
          <div className="card">
            <div className="card-title">Monthly Expenses</div>
            <div className="card-value">${Number(stats.monthlyExpenses || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          </div>
          <div className="card">
            <div className="card-title">Estimated Tax Due</div>
            <div className="card-value">${Number(stats.estimatedTax || 0).toLocaleString()}</div>
          </div>
          <div className="card">
            <div className="card-title">Savings Rate</div>
            <div className="card-value">{Number(stats.savingsRate || 0)}%</div>
          </div>
        </section>

        <section className="tp-grid">
          <div className="panel chart-panel">
            <h3>Income vs Expenses</h3>
            <div className="bar-chart">
              <div className="bar-row">
                <div className="label">Income</div>
                <div className="bar-wrap">
                  <div className="bar-bg"><div className="bar income" style={{ width: `${Math.min(100, (stats.monthlyIncome && stats.monthlyExpenses) ? (stats.monthlyIncome/( (stats.monthlyIncome||1) + (stats.monthlyExpenses||0)) * 100) : 0)}%` }} /></div>
                </div>
                <div className="value">${stats.monthlyIncome}</div>
              </div>
              <div className="bar-row">
                <div className="label">Expenses</div>
                <div className="bar-wrap">
                  <div className="bar-bg"><div className="bar expense" style={{ width: `${Math.min(100, (stats.monthlyIncome && stats.monthlyExpenses) ? (stats.monthlyExpenses/( (stats.monthlyIncome||0) + (stats.monthlyExpenses||1)) * 100) : 0)}%` }} /></div>
                </div>
                <div className="value">${stats.monthlyExpenses}</div>
              </div>
            </div>
          </div>

          <div className="panel pie-panel">
            <h3>Expense Breakdown</h3>
            <div className="pie-and-legend">
              <Pie items={pieData} />
              <ul className="legend">
                {pieData.map((s,i)=>(
                  <li key={i}><span className="dot" style={{background: ['#4CAF50','#2196F3','#FF9800','#E91E63','#9C27B0'][i%5]}}></span>{s.label} <strong>{s.value}%</strong></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel transactions-panel">
            <h3>Recent Transactions</h3>
            <table className="transactions">
              <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
              <tbody>
                {transactions.length === 0 && <tr><td colSpan="4" style={{textAlign:'center'}}>No transactions yet</td></tr>}
                {transactions.map((t,i)=>(
                  <tr key={i} className={t.type === 'Income' ? 'income-row' : 'expense-row'}>
                    <td>{(t.date || '').slice(0,10)}</td>
                    <td>{t.description}</td>
                    <td>{t.category}</td>
                    <td className="amount">{Number(t.amount) >= 0 ? `$${Number(t.amount)}` : `-$${Math.abs(Number(t.amount))}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Settings panel (category manager & logout) */}
        <section id="settings-panel" className="settings-panel panel">
          <h3>Category management</h3>
          <div className="category-grid">
            <div className="category-list">
              {categories.map((c,i)=>(
                <div className="category-row" key={i}>
                  <div className="swatch" />
                  <div className="cat-name">{c}</div>
                  <div className="cat-actions">
                    <button title="delete" onClick={()=>deleteCategory(c)}>x</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="category-add">
              <input placeholder="New category" value={newCategory} onChange={e=>setNewCategory(e.target.value)} />
              <button className="btn primary" onClick={addCategory}>Add New Category</button>
            </div>
          </div>
        </section>

      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>{modalType === 'Income' ? 'Record New Income' : 'Record New Expense'}</h4>
              <button className="icon-btn" onClick={closeModal}><FaTimes/></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
                <input placeholder="Amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} type="number" />
              </div>
              <div className="form-row">
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {categories.map((c,i)=>(<option value={c} key={i}>{c}</option>))}
                </select>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
              </div>
              <div className="form-row">
                <textarea placeholder="Notes (optional)" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn outline" onClick={closeModal}>Cancel</button>
              <button className="btn primary" onClick={saveTransaction} disabled={loadingSave}>{loadingSave ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
