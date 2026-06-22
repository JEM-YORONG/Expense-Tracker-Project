// Abstract database interface - easy to swap implementations
export class DatabaseService {
  async init() { throw new Error('Not implemented'); }
  async login(email, password) { throw new Error('Not implemented'); }
  async logout() { throw new Error('Not implemented'); }
  async getSession() { throw new Error('Not implemented'); }
  async getTransactions(userId) { throw new Error('Not implemented'); }
  async saveTransaction(userId, tx) { throw new Error('Not implemented'); }
  async deleteTransaction(userId, id) { throw new Error('Not implemented'); }
  async updateTransaction(userId, id, updates) { throw new Error('Not implemented'); }
  async getBudget(userId) { throw new Error('Not implemented'); }
  async saveBudget(userId, value) { throw new Error('Not implemented'); }
  async getUsers() { throw new Error('Not implemented'); }
  async saveUser(user) { throw new Error('Not implemented'); }
  async updateUser(id, updates) { throw new Error('Not implemented'); }
  async deleteUser(id) { throw new Error('Not implemented'); }
}

// SQLite implementation
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SQLiteService extends DatabaseService {
  constructor() {
    super();
    this.db = null;
  }

  async init() {
    this.db = await SQLite.openDatabaseAsync('expenseTracker.db');
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT,
        title TEXT,
        amount REAL,
        category TEXT,
        date TEXT
      );
      CREATE TABLE IF NOT EXISTS budgets (
        userId TEXT PRIMARY KEY,
        amount TEXT
      );
      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        userId TEXT
      );
    `);
  }

  async runQuery(query, params = []) {
    if (!this.db) await this.init();
    return await this.db.runAsync(query, params);
  }

  async getQuery(query, params = []) {
    if (!this.db) await this.init();
    return await this.db.getAllAsync(query, params);
  }

  async login(email, password) {
    const users = await this.getQuery(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (users.length === 0) {
      // Check for default admin
      if (email === 'admin@ExpenseTracker.com' && password === 'admin123') {
        const admin = { id: 'admin', email, name: 'Admin', role: 'admin' };
        await this.saveUser(admin);
        await AsyncStorage.setItem('session', JSON.stringify(admin));
        return admin;
      }
      throw new Error('Invalid email or password.');
    }
    const user = users[0];
    const { password: _, ...safeUser } = user;
    await AsyncStorage.setItem('session', JSON.stringify(safeUser));
    return safeUser;
  }

  async logout() {
    await AsyncStorage.removeItem('session');
  }

  async getSession() {
    const session = await AsyncStorage.getItem('session');
    return session ? JSON.parse(session) : null;
  }

  async getTransactions(userId) {
    return await this.getQuery(
      'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC',
      [userId]
    );
  }

  async saveTransaction(userId, tx) {
    await this.runQuery(
      'INSERT INTO transactions (id, userId, title, amount, category, date) VALUES (?, ?, ?, ?, ?, ?)',
      [tx.id || Date.now().toString(), userId, tx.title, tx.amount, tx.category, tx.date]
    );
    return await this.getTransactions(userId);
  }

  async deleteTransaction(userId, id) {
    await this.runQuery('DELETE FROM transactions WHERE userId = ? AND id = ?', [userId, id]);
    return await this.getTransactions(userId);
  }

  async updateTransaction(userId, id, updates) {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await this.runQuery(
      `UPDATE transactions SET ${setClause} WHERE userId = ? AND id = ?`,
      [...values, userId, id]
    );
    return await this.getTransactions(userId);
  }

  async getBudget(userId) {
    const result = await this.getQuery('SELECT amount FROM budgets WHERE userId = ?', [userId]);
    return result.length > 0 ? result[0].amount : '';
  }

  async saveBudget(userId, value) {
    const existing = await this.getQuery('SELECT * FROM budgets WHERE userId = ?', [userId]);
    if (existing.length > 0) {
      await this.runQuery('UPDATE budgets SET amount = ? WHERE userId = ?', [value, userId]);
    } else {
      await this.runQuery('INSERT INTO budgets (userId, amount) VALUES (?, ?)', [userId, value]);
    }
    return value;
  }

  async getUsers() {
    return await this.getQuery('SELECT * FROM users');
  }

  async saveUser(user) {
    try {
      await this.runQuery(
        'INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [user.id || Date.now().toString(), user.email, user.password, user.name, user.role || 'user']
      );
      return await this.getUsers();
    } catch (e) {
      throw new Error('User with this email already exists.');
    }
  }

  async updateUser(id, updates) {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await this.runQuery(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    return await this.getUsers();
  }

  async deleteUser(id) {
    await this.runQuery('DELETE FROM users WHERE id = ?', [id]);
    return await this.getUsers();
  }
}

// Export singleton instance
export const db = new SQLiteService();

// Themes
export const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'ocean', label: 'Ocean' }
];