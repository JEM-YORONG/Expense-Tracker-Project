import { useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

const ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '💊',
  Other: '📦',
};

export { CATEGORIES };
export { ICONS };

export default function AddTransaction({ onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    onAdd({
      id: id(),
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
    });
    setTitle('');
    setAmount('');
  };

  return (
    <div className="card span-1">
      <div className="card-title">Add Transaction</div>
      <form className="form" onSubmit={submit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit" className="btn primary">Add Transaction</button>
      </form>
    </div>
  );
}
