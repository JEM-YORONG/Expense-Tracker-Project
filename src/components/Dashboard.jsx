import { useState, useEffect } from 'react';
import { api } from '../services/api';
import BalanceDisplay from './BalanceDisplay.jsx';
import BudgetInput from './BudgetInput.jsx';
import AddTransaction from './AddTransaction.jsx';
import TransactionList from './TransactionList.jsx';
import Analytics from './Analytics.jsx';
import WelcomeBanner from './WelcomeBanner.jsx';
import Admin from './Admin.jsx';

export default function Dashboard({ user }) {
  const userId = user?.id || user?.email;
  const isAdmin = user?.role === 'admin';
  const [budget, setBudget] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('newest');
  const [modal, setModal] = useState({ open: false, tx: null });

  const totalBudget = Number(budget) || 0;
  const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const remaining = totalBudget - totalExpense;

  useEffect(() => {
    const init = async () => {
      const [txs, savedBudget] = await Promise.all([api.getTransactions(userId), api.getBudget(userId)]);
      setTransactions(txs);
      setBudget(savedBudget);
    };
    init();
  }, [userId]);

  const saveBudget = async (value) => {
    setBudget(value);
    await api.saveBudget(userId, value);
  };

  const addTransaction = async (tx) => {
    const updated = await api.saveTransaction(userId, tx);
    setTransactions(updated);
  };

  const deleteTransaction = async (id) => {
    const updated = await api.deleteTransaction(userId, id);
    setTransactions(updated);
  };

  const updateTransaction = async (id, updates) => {
    const updated = await api.updateTransaction(userId, id, updates);
    setTransactions(updated);
    setModal({ open: false, tx: null });
  };

  const filters = {
    category,
    dateFrom,
    dateTo,
    sort,
    onCategoryChange: setCategory,
    onDateFromChange: setDateFrom,
    onDateToChange: setDateTo,
    onSortChange: setSort,
  };

  const dashboardContent = (
    <>
      <WelcomeBanner user={user} />

      <BalanceDisplay budget={totalBudget} expense={totalExpense} remaining={remaining} />
      <BudgetInput onSave={saveBudget} />
      <Analytics transactions={transactions} />

      <AddTransaction onAdd={addTransaction} />

      <TransactionList
        transactions={transactions}
        onDelete={deleteTransaction}
        onOpenModal={(tx) => setModal({ open: true, tx })}
        filters={filters}
      />
    </>
  );

  return (
    <>
      {isAdmin ? (
        <div>
          <div className="bento">
            <WelcomeBanner user={user} />
          </div>

          <Admin onBack={() => {}} />
        </div>
      ) : (
        <div className="bento">
          {dashboardContent}
        </div>
      )}

      {modal.open && (
        <EditModal
          tx={modal.tx}
          onClose={() => setModal({ open: false, tx: null })}
          onSave={updateTransaction}
        />
      )}
    </>
  );
}

function EditModal({ tx, onClose, onSave }) {
  const [title, setTitle] = useState(tx.title);
  const [amount, setAmount] = useState(tx.amount);
  const [category, setCategory] = useState(tx.category);
  const [date, setDate] = useState(tx.date);

  const save = (e) => {
    e.preventDefault();
    onSave(tx.id, { title, amount, category, date });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <div className="modal-header">
          <h3>Edit Transaction</h3>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-form">
          <label>
            <span className="form-label">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            <span className="form-label">Amount</span>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min="0.01" step="0.01" />
          </label>
          <label>
            <span className="form-label">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">Save changes</button>
        </div>
      </form>
    </div>
  );
}
