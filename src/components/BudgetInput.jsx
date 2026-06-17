import { useState } from 'react';

export default function BudgetInput({ onSave }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onSave(value);
  };

  return (
    <div className="card">
      <div className="card-title">Budget</div>
      <form className="form" onSubmit={submit}>
        <input
          type="number"
          placeholder="Budget"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="0"
          step="0.01"
        />
        <button type="submit" className="btn primary">Save Budget</button>
      </form>
    </div>
  );
}
