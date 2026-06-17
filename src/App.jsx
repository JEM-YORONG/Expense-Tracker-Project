import { useState, useEffect } from 'react';
import { api } from './services/api';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin.jsx';
import AppHeader from './components/AppHeader.jsx';
import Login from './components/Login.jsx';

export default function App() {
  const [user, setUser] = useState(() => null);
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    const init = async () => {
      const session = await api.getSession();
      if (session) {
        setUser(session);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const user = await api.login(email, password);
    setUser(user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setPage('dashboard');
  };

  const isAdmin = user && user.role === 'admin';

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="app">
      <AppHeader
        page={page}
        setPage={setPage}
        user={user}
        onAdminClick={() => setPage(isAdmin ? 'admin' : 'denied')}
        onLogout={logout}
      />

      {page === 'denied' && (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the Admin page. Only administrators can manage users.</p>
          <button className="btn primary" onClick={() => setPage('dashboard')}>Back to Dashboard</button>
        </div>
      )}

      {page === 'dashboard' && <Dashboard user={user} />}

      {page === 'admin' && isAdmin && <Admin onBack={() => setPage('dashboard')} />}
    </div>
  );
}
