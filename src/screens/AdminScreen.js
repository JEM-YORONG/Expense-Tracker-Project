import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { db } from '../services/database';

export default function AdminScreen({ onBack }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (form.name.trim()) {
      const slug = form.name.trim().replace(/\s+/g, '').toLowerCase();
      const currentYear = new Date().getFullYear();
      setForm((prev) => ({ ...prev, email: `${slug}${currentYear}@ExpenseTracker.com` }));
    }
  }, [form.name]);

  const loadUsers = async () => {
    const data = await db.getUsers();
    setUsers(data);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
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
        await db.updateUser(editingId, payload);
        setEditingId(null);
      } else {
        await db.saveUser(payload);
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
    await db.deleteUser(id);
    await loadUsers();
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'user' });
    setError('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.layout}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingId ? 'Edit User' : 'Add New User'}</Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Enter user name"
                maxLength={20}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Auto-generated email"
                editable={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password {editingId && <Text style={styles.optional}>(optional)</Text>}
              </Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                placeholder={editingId ? 'Leave blank to keep current' : 'Enter user password'}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <TextInput
                style={styles.input}
                value={form.role}
                onChangeText={(text) => setForm({ ...form, role: text })}
                placeholder="user or admin"
              />
            </View>
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <View style={styles.formActions}>
              {editingId && (
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleCancel}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Saving...' : editingId ? 'Update User' : 'Add User'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.usersCard}>
          <Text style={styles.cardTitle}>Users ({users.length})</Text>
          {users.length === 0 ? (
            <Text style={styles.empty}>No users found.</Text>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <View style={styles.iconDot}>
                      <Text>👤</Text>
                    </View>
                    <View style={styles.rowMeta}>
                      <Text style={styles.rowTitle}>{item.name}</Text>
                      <Text style={styles.rowSub}>{item.email} • {item.role}</Text>
                    </View>
                  </View>
                  <View style={styles.rowRight}>
                    <TouchableOpacity onPress={() => handleEdit(item)}>
                      <Text style={styles.editBtn}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: 16,
  },
  layout: {
    flexDirection: 'row',
    gap: 16,
  },
  formCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 25,
    elevation: 3,
  },
  usersCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 25,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
  },
  optional: {
    color: '#6b7280',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fdfdfd',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryBtn: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
  },
  primaryBtn: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 10,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  empty: {
    color: '#6b7280',
    fontSize: 13,
    padding: 18,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  iconDot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowMeta: {
    flex: 1,
  },
  rowTitle: {
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    color: '#6b7280',
  },
  rowRight: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    fontSize: 16,
  },
  deleteBtn: {
    color: '#6b7280',
    fontSize: 16,
  },
});