import { useMemo } from 'react';
import { ICONS, CATEGORIES } from './AddTransaction.jsx';

const COLORS = {
  Food: '#dc2626',
  Transport: '#2563eb',
  Shopping: '#9333ea',
  Bills: '#d97706',
  Entertainment: '#059669',
  Health: '#db2777',
  Other: '#6b7280',
};

export default function Analytics({ transactions }) {
  const data = useMemo(() => {
    const counts = {};
    transactions.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + Number(t.amount);
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .map(([category, amount]) => ({ category, amount, pct: total ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  return (
    <div className="card span-3">
      <div className="card-title">Analytics</div>
      {data.length === 0 ? (
        <div className="empty">No data yet</div>
      ) : (
        <div className="analytics">
          <div className="bar-chart">
            {data.map((d) => (
              <div key={d.category} className="bar-chart-item">
                <div className="bar-chart-value">{Math.round(d.pct)}%</div>
                <div className="bar-chart-bar-wrapper">
                  <div
                    className="bar-chart-bar"
                    style={{
                      height: `${d.pct}%`,
                      background: COLORS[d.category] || COLORS.Other,
                    }}
                  />
                </div>
                <div className="bar-chart-label">
                  <span className="bar-chart-icon">{ICONS[d.category] || '📦'}</span>
                  <span>{d.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
