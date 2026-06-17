import { THEMES } from '../services/api';

export default function AppHeader({ page, setPage, user, onAdminClick, onLogout }) {
  return (
    <div className="header">
      <div className="brand">
        <div className="logo">₱</div>
        <div>
          <h1>Expense Tracker</h1>
          <p>Smart budget management</p>
        </div>
      </div>
      <nav className="nav">
        <button
          className={`nav-pill ${page === 'dashboard' ? 'active' : ''}`}
          onClick={() => setPage('dashboard')}
        >
          Dashboard
        </button>
        <button className="nav-pill logout" onClick={onLogout}>Logout</button>
      </nav>
    </div>
  );
}
