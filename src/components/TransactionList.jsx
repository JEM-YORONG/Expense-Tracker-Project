import { useState, useEffect, useMemo } from 'react';
import { ICONS, CATEGORIES } from './AddTransaction.jsx';

function useScreen() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 560);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 560);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function TransactionList({ transactions, onDelete, onOpenModal, filters }) {
  const isMobile = useScreen();
  const limit = isMobile ? 15 : 50;
  const { category, dateFrom, dateTo, sort } = filters;

  const filtered = useMemo(() => {
    let list = transactions;
    if (category && category !== 'All') {
      list = list.filter((t) => t.category === category);
    }
    if (dateFrom) {
      list = list.filter((t) => t.date >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((t) => t.date <= dateTo);
    }
    list = [...list];
    if (sort === 'newest') {
      list.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sort === 'oldest') {
      list.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sort === 'amount-high') {
      list.sort((a, b) => Number(b.amount) - Number(a.amount));
    } else if (sort === 'amount-low') {
      list.sort((a, b) => Number(a.amount) - Number(b.amount));
    }
    return list;
  }, [transactions, category, dateFrom, dateTo, sort]);

  return (
    <div className="card span-4">
      <div className="card-title">Transactions</div>
      <div className="transaction-controls">
        <select value={category} onChange={(e) => filters.onCategoryChange(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => filters.onDateFromChange(e.target.value)}
          placeholder="From"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => filters.onDateToChange(e.target.value)}
          placeholder="To"
        />
        <select value={sort} onChange={(e) => filters.onSortChange(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="amount-high">Amount: High to Low</option>
          <option value="amount-low">Amount: Low to High</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="empty">No transactions found</div>
      ) : (
        <div className="transactions">
          {filtered.map((t) => {
            const displayTitle = t.title.length > limit ? `${t.title.slice(0, limit)}...` : t.title;
            return (
              <div key={t.id} className="row" onClick={() => onOpenModal(t)}>
                <div className="row-left">
                  <div className="icon-dot">{ICONS[t.category] || '📦'}</div>
                  <div className="row-meta">
                    <div className="row-title" title={t.title}>{displayTitle}</div>
                    <div className="row-sub">{t.category} • {t.date}</div>
                  </div>
                </div>
                <div className="row-right">
                  <div className="row-amount danger">-₱{t.amount}</div>
                  <button
                    className="row-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(t.id);
                    }}
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
