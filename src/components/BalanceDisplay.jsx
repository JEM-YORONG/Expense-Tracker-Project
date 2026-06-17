export default function BalanceDisplay({ budget, expense, remaining }) {
  return (
    <div className="card span-3">
      <div className="card-title">Balance</div>
      <div className="big-number">
        {remaining < 0 ? `-₱${Math.abs(remaining)}` : `₱${remaining}`}
      </div>
      <div className="summary-row" style={{ marginTop: 16 }}>
        <div className="summary-item">
          <div className="summary-label">Budget</div>
          <div className="summary-value">₱{budget}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Spent</div>
          <div className="summary-value danger">₱{expense}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Remaining</div>
          <div className={`summary-value ${remaining < 0 ? 'danger' : 'ok'}`}>
            ₱{remaining}
          </div>
        </div>
      </div>
    </div>
  );
}
