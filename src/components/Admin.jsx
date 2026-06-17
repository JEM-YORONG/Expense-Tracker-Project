import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Admin.css';

export default function Admin({ onBack }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState({ name: '', password: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const nameWarn = !form.name.trim() ? '' : form.name.trim().length > 20 ? 'Name cannot exceed 20 characters.' : '';
    let passWarn = '';
    if (form.password && form.password.length < 4) {
      passWarn = 'Password must be at least 4 characters.';
    } else if (form.password && form.password.length > 16) {
      passWarn = 'Password cannot exceed 16 characters.';
    }
    setWarnings({ name: nameWarn, password: passWarn });
  }, [form.name, form.password]);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (form.name.trim()) {
      const slug = form.name.trim().replace(/\s+/g, '').toLowerCase();
      const generated = `${slug}${currentYear}@ExpenseTracker.com`;
      setForm((prev) => ({ ...prev, email: generated }));
    }
  }, [form.name, currentYear]);

  const loadUsers = async () => {
    const data = await api.getUsers();
    setUsers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (warnings.name || warnings.password) {
        throw new Error('Please fix the warnings before saving.');
      }
      if (!form.name.trim() || !form.email.trim() || (!form.password && !editingId)) {
        throw new Error('All fields are required.');
      }
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };
      if (editingId) {
        await api.updateUser(editingId, payload);
        setEditingId(null);
      } else {
        await api.saveUser(payload);
      }
      setForm({ name: '', email: '', password: '', role: 'user' });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role || 'user' });
  };

  const handleDelete = async (id) => {
    await api.deleteUser(id);
    await loadUsers();
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'user' });
    setError('');
    setWarnings({ name: '', password: '' });
  };

return (
    <div className="admin-page">
      <div className="admin-layout">
        <div className="admin-form-card">
          <h3>{editingId ? 'Edit User' : 'Add New User'}</h3>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter user name"
                maxLength={20}
              />
              {warnings.name && <span className="admin-warning">{warnings.name}</span>}
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Auto-generated email"
                disabled
              />
            </label>
            <label>
              Password {editingId && <span className="field-optional">(optional)</span>}
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingId ? 'Leave blank to keep current' : 'Enter user password'}
                minLength={4}
                maxLength={16}
              />
              {warnings.password && <span className="admin-warning">{warnings.password}</span>}
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {error && <p className="admin-error">{error}</p>}
            <div className="admin-form-actions">
              {editingId && (
                <button type="button" className="btn secondary" onClick={handleCancel}>Cancel</button>
              )}
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>

        <div className="admin-users-card">
          <div className="card-title">Users ({users.length})</div>
          {users.length === 0 ? (
            <p className="admin-empty">No users found.</p>
          ) : (
            <div className="transactions">
              {users.map((u) => (
                <div key={u.id} className="row">
                  <div className="row-left">
                    <div className="icon-dot">👤</div>
                    <div className="row-meta">
                      <div className="row-title">{u.name}</div>
                      <div className="row-sub">{u.email} • {u.role}</div>
                    </div>
                  </div>
                  <div className="row-right">
                    <button className="btn-minimal" onClick={() => handleEdit(u)} title="Edit user">✏️</button>
                    <button className="btn-minimal danger" onClick={() => handleDelete(u.id)} title="Delete user">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
