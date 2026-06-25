import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { getDb } from '../services/database';
import BalanceDisplay from '../components/BalanceDisplay';
import BudgetInput from '../components/BudgetInput';
import AddTransaction from '../components/AddTransaction';
import Analytics from '../components/Analytics';

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

export default function DashboardScreen({ user, onLogout }) {
  const userId = user?.id || user?.email;
  const [budget, setBudget] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('newest');
  const [modal, setModal] = useState({ open: false, tx: null });

  const totalBudget = Number(budget) || 0;
  const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const remaining = totalBudget - totalExpense;

  useEffect(() => {
    const init = async () => {
      const db = await getDb();
      const [txs, budgetResult] = await Promise.all([
        db.getAllAsync('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [userId]),
        db.getFirstAsync('SELECT amount FROM budgets WHERE userId = ?', [userId])
      ]);
      setTransactions(txs);
      setBudget(budgetResult?.amount || '');
    };
    init();
  }, [userId]);

  const saveBudget = async (value) => {
    const db = await getDb();
    setBudget(value);
    const existing = await db.getFirstAsync('SELECT * FROM budgets WHERE userId = ?', [userId]);
    if (existing) {
      await db.runAsync('UPDATE budgets SET amount = ? WHERE userId = ?', [value, userId]);
    } else {
      await db.runAsync('INSERT INTO budgets (userId, amount) VALUES (?, ?)', [userId, value]);
    }
  };

  const addTransaction = async (tx) => {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO transactions (userId, title, amount, category, date) VALUES (?, ?, ?, ?, ?)',
      [userId, tx.title, tx.amount, tx.category, tx.date]
    );
    const txs = await db.getAllAsync('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [userId]);
    setTransactions(txs);
  };

  const deleteTransaction = async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM transactions WHERE userId = ? AND id = ?', [userId, id]);
    const txs = await db.getAllAsync('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [userId]);
    setTransactions(txs);
  };

  const updateTransaction = async (id, updates) => {
    const db = await getDb();
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await db.runAsync(`UPDATE transactions SET ${setClause} WHERE userId = ? AND id = ?`, [...values, userId, id]);
    const txs = await db.getAllAsync('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [userId]);
    setTransactions(txs);
    setModal({ open: false, tx: null });
  };

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
    }
    return list;
  }, [transactions, category, dateFrom, dateTo, sort]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₱</Text>
          </View>
          <View>
            <Text style={styles.appTitle}>Expense Tracker</Text>
            <Text style={styles.appSubtitle}>Smart budget management</Text>
          </View>
        </View>
        {onLogout && (
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>🚪</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <WelcomeBanner user={user} />
        <BalanceDisplay budget={totalBudget} expense={totalExpense} remaining={remaining} />
        <BudgetInput onSave={saveBudget} />
        <Analytics transactions={transactions} />
        <AddTransaction onAdd={addTransaction} />
        
        <TransactionList
          transactions={filtered}
          onDelete={deleteTransaction}
          onOpenModal={setModal}
          category={category}
          dateFrom={dateFrom}
          dateTo={dateTo}
          sort={sort}
          onCategoryChange={setCategory}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onSortChange={setSort}
        />
      </View>

      <Modal visible={modal.open} transparent animationType="fade">
        <EditModal
          tx={modal.tx}
          onClose={() => setModal({ open: false, tx: null })}
          onSave={updateTransaction}
        />
      </Modal>
    </ScrollView>
  );
}

function WelcomeBanner({ user }) {
  const isAdmin = user?.role === 'admin';
  const subtitle = isAdmin 
    ? 'Manage users and oversee the system.' 
    : 'Track your spending and stay on budget.';
  
  return (
    <View style={[styles.welcomeCard, styles.card]}>
      <Text style={styles.welcomeTitle}>
        Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
      </Text>
      <Text style={styles.welcomeSubtitle}>{subtitle}</Text>
    </View>
  );
}

function TransactionList({ transactions, onDelete, onOpenModal, category, dateFrom, dateTo, sort, ...setters }) {
  return (
    <View style={[styles.transactionsCard, styles.card]}>
      <Text style={styles.cardTitle}>Transactions</Text>
      
      <View style={styles.filters}>
        <FilterSelect value={category} onChange={setters.onCategoryChange} />
        <TextInput
          style={styles.filterInput}
          value={dateFrom}
          onChangeText={setters.onDateFromChange}
          placeholder="From"
        />
        <TextInput
          style={styles.filterInput}
          value={dateTo}
          onChangeText={setters.onDateToChange}
          placeholder="To"
        />
        <SortSelect value={sort} onChange={setters.onSortChange} />
      </View>

      {transactions.length === 0 ? (
        <Text style={styles.empty}>No transactions found</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => onOpenModal({ open: true, tx: item })}>
              <View style={styles.rowLeft}>
                <View style={styles.iconDot}>
                  <Text>{ICONS[item.category] || '📦'}</Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSub}>{item.category} • {item.date}</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowAmount}>-₱{item.amount}</Text>
                <TouchableOpacity onPress={() => onDelete(item.id)}>
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function EditModal({ tx, onClose, onSave }) {
  const [title, setTitle] = useState(tx?.title || '');
  const [amount, setAmount] = useState(String(tx?.amount || ''));
  const [category, setCategory] = useState(tx?.category || 'Food');
  const [date, setDate] = useState(tx?.date || '');

  const save = () => {
    if (tx) {
      onSave(tx.id, { title, amount: Number(amount), category, date });
    }
  };

  return (
    <View style={styles.modalBackdrop}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Transaction</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalForm}>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
          />
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Category"
          />
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Date (YYYY-MM-DD)"
          />
        </View>
        
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={save}>
            <Text style={styles.primaryBtnText}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function FilterSelect({ value, onChange }) {
  return (
    <TextInput
      style={styles.filterInput}
      value={value}
      onChangeText={onChange}
      placeholder="Category"
    />
  );
}

function SortSelect({ value, onChange }) {
  return (
    <TextInput
      style={styles.filterInput}
      value={value}
      onChangeText={onChange}
      placeholder="Sort"
    />
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
    padding: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 18,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  welcomeCard: {
    backgroundColor: '#111827',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    marginTop: 4,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  filterInput: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    backgroundColor: '#fdfdfd',
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
    alignItems: 'center',
  },
  rowAmount: {
    fontWeight: '700',
    color: '#dc2626',
    marginRight: 10,
  },
  deleteBtn: {
    color: '#6b7280',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalForm: {
    gap: 10,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fdfdfd',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryBtn: {
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
  },
  primaryBtn: {
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
    padding: 18,
  },
});