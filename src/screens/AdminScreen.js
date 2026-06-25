import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { getDb } from '../services/database';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminScreen({ user, onLogout, onBack }) {
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
    const database = await getDb();
    const data = await database.getAllAsync('SELECT * FROM users');
    setUsers(data);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (!form.name.trim() || !form.email.trim() || (!form.password && !editingId)) {
        throw new Error('All fields are required.');
      }
      const database = await getDb();
      if (editingId) {
        const keys = Object.keys({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
        const values = [form.name.trim(), form.email.trim(), form.password, form.role];
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        await database.runAsync(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, editingId]);
        setEditingId(null);
      } else {
        await database.runAsync(
          'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
          [Date.now().toString(), form.email, form.password, form.name, form.role]
        );
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
    const database = await getDb();
    await database.runAsync('DELETE FROM users WHERE id = ?', [id]);
    await loadUsers();
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'user' });
    setError('');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₱</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <Text style={styles.headerSubtitle}>Manage users</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onLogout} style={styles.headerActionBtn}>
            <Text style={styles.headerActionText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
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
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
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
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.empty}>No users found. Add your first user above.</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              nestedScrollEnabled
              scrollEnabled={false}
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
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  headerText: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 25,
    elevation: 3,
  },
  usersCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
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
    color: '#111827',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  optional: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '400',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fdfdfd',
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.6,
  },
  empty: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginBottom: 10,
    minHeight: 64,
  },
  rowLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    alignItems: 'center',
  },
  iconDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowMeta: {
    flex: 1,
  },
  rowTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#111827',
  },
  rowSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  editBtnText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteBtnText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
});
