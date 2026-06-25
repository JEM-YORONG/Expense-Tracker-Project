import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDb() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('expenseTracker.db');
  await db.execAsync('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, email TEXT UNIQUE, password TEXT, name TEXT, role TEXT);');
  await db.execAsync('CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL, title TEXT, amount REAL, category TEXT, date TEXT);');
  await db.execAsync('CREATE TABLE IF NOT EXISTS budgets (userId TEXT PRIMARY KEY, amount TEXT);');
  return db;
}

// Themes
export const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'ocean', label: 'Ocean' }
];
