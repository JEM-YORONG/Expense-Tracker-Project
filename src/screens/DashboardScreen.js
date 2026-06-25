import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₱</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Expense Tracker</Text>
            <Text style={styles.headerSubtitle}>Smart budget management</Text>
          </View>
        </View>
        {onLogout && (
          <TouchableOpacity onPress={onLogout} style={styles.headerActionBtn}>
            <Text style={styles.headerActionText}>Logout</Text>
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
    </SafeAreaView>
  );
}

function WelcomeBanner({ user }) {
  const isAdmin = user?.role === 'admin';
  const userName = user?.email ? user.email.split('@')[0] : 'User';
  const subtitle = isAdmin
    ? 'Manage users and oversee the system.'
    : 'Track your spending and stay on budget.';

  return (
    <View style={[styles.card, styles.welcomeCard]}>
      <View style={styles.welcomeHeader}>
        <View style={styles.welcomeIcon}>
          <Text style={styles.welcomeIconText}>{isAdmin ? '👨‍💼' : '👋'}</Text>
        </View>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeGreeting}>Welcome, {userName}</Text>
          <Text style={styles.welcomeSubtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

function TransactionList({ transactions, onDelete, onOpenModal, category, dateFrom, dateTo, sort, ...setters }) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);

  return (
    <View style={[styles.transactionsCard, styles.card]}>
      <Text style={styles.cardTitle}>Transactions</Text>

      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterInput} onPress={() => setShowCategoryPicker(true)}>
          <Text style={category && category !== 'All' ? styles.filterText : styles.filterPlaceholder}>
            {category || 'Category'}
          </Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.filterInput} onPress={() => setShowSortPicker(true)}>
          <Text style={sort ? styles.filterText : styles.filterPlaceholder}>
            {sort === 'newest' ? 'Newest' : sort === 'oldest' ? 'Oldest' : 'Amount ↓'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.modalOption, category === cat && styles.modalOptionSelected]}
                onPress={() => {
                  setters.onCategoryChange(cat);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[styles.modalOptionText, category === cat && styles.modalOptionTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showSortPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSortPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {[
              { key: 'newest', label: 'Newest' },
              { key: 'oldest', label: 'Oldest' },
              { key: 'amount-high', label: 'Amount ↓' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.modalOption, sort === opt.key && styles.modalOptionSelected]}
                onPress={() => {
                  setters.onSortChange(opt.key);
                  setShowSortPicker(false);
                }}
              >
                <Text style={[styles.modalOptionText, sort === opt.key && styles.modalOptionTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.empty}>No transactions found</Text>
          <Text style={styles.emptyHint}>Add your first transaction below</Text>
        </View>
      ) : (
        <View>
          {transactions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.row} onPress={() => onOpenModal({ open: true, tx: item })}>
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
                <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function EditModal({ tx, onClose, onSave }) {
  const [title, setTitle] = useState(tx?.title || '');
  const [amount, setAmount] = useState(String(tx?.amount || ''));
  const [category, setCategory] = useState(tx?.category || 'Food');
  const [date, setDate] = useState(tx?.date || '');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

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
          <TouchableOpacity style={styles.input} onPress={() => setShowCategoryPicker(true)}>
            <Text style={category ? styles.inputText : styles.placeholderText}>{category}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Date (YYYY-MM-DD)"
          />
        </View>

        <Modal visible={showCategoryPicker} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalOption, cat === category && styles.modalOptionSelected]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, cat === category && styles.modalOptionTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={save}>
            <Text style={styles.primaryBtnText}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  welcomeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIconText: {
    fontSize: 22,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  filterInput: {
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: '#fdfdfd',
    minHeight: 36,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 13,
    color: '#111827',
  },
  filterPlaceholder: {
    fontSize: 13,
    color: '#9ca3af',
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
  rowAmount: {
    fontWeight: '700',
    color: '#dc2626',
    marginRight: 10,
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
  emptyHint: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  inputText: {
    fontSize: 13,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 300,
    padding: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#111827',
  },
  modalOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
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
  closeBtn: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalForm: {
    gap: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
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
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
    padding: 18,
  },
});