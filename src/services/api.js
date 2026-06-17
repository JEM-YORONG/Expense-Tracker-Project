const STORAGE_KEYS = {
  user: 'expenseTrackerUser',
  theme: 'expenseTrackerTheme',
  transactions: 'expenseTrackerTransactions',
  budget: 'expenseTrackerBudget',
  users: 'expenseTrackerUsers',
};

function readStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeStorage(key) {
  localStorage.removeItem(key);
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async login(email, password) {
    await delay(350);
    const adminEmail = 'admin@ExpenseTracker.com';
    const adminPassword = 'admin123';
    if (email === adminEmail && password === adminPassword) {
      const adminUser = { id: 'admin', email: adminEmail, name: 'Admin', role: 'admin' };
      writeStorage(STORAGE_KEYS.user, adminUser);
      return adminUser;
    }
    const users = await this.getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid email or password.');
    }
    const { password: _, ...safeUser } = found;
    writeStorage(STORAGE_KEYS.user, safeUser);
    return safeUser;
  },

  async logout() {
    await delay(150);
    removeStorage(STORAGE_KEYS.user);
  },

  async getSession() {
    return readStorage(STORAGE_KEYS.user, null);
  },

  async getTransactions(userId) {
    await delay(100);
    const key = `${STORAGE_KEYS.transactions}_${userId}`;
    return readStorage(key, []);
  },

  async saveTransaction(userId, tx) {
    await delay(100);
    const key = `${STORAGE_KEYS.transactions}_${userId}`;
    const list = readStorage(key, []);
    const updated = [{ ...tx, userId }, ...list];
    writeStorage(key, updated);
    return updated;
  },

  async deleteTransaction(userId, id) {
    await delay(100);
    const key = `${STORAGE_KEYS.transactions}_${userId}`;
    const list = readStorage(key, []);
    const updated = list.filter((t) => t.id !== id);
    writeStorage(key, updated);
    return updated;
  },

  async updateTransaction(userId, id, updates) {
    await delay(100);
    const key = `${STORAGE_KEYS.transactions}_${userId}`;
    const list = readStorage(key, []);
    const updated = list.map((t) => (t.id === id ? { ...t, ...updates } : t));
    writeStorage(key, updated);
    return updated;
  },

  async getBudget(userId) {
    await delay(100);
    const key = `${STORAGE_KEYS.budget}_${userId}`;
    return readStorage(key, '');
  },

  async saveBudget(userId, value) {
    await delay(100);
    const key = `${STORAGE_KEYS.budget}_${userId}`;
    writeStorage(key, value);
    return value;
  },

  async getUsers() {
    await delay(100);
    return readStorage(STORAGE_KEYS.users, []);
  },

  async saveUser(user) {
    await delay(100);
    const list = await this.getUsers();
    const existing = list.find((u) => u.email === user.email);
    if (existing) {
      throw new Error('User with this email already exists.');
    }
    const updated = [{ ...user, id: user.id || Date.now().toString() }, ...list];
    writeStorage(STORAGE_KEYS.users, updated);
    return updated;
  },

  async updateUser(id, updates) {
    await delay(100);
    const list = await this.getUsers();
    const updated = list.map((u) => (u.id === id ? { ...u, ...updates } : u));
    writeStorage(STORAGE_KEYS.users, updated);
    return updated;
  },

  async deleteUser(id) {
    await delay(100);
    const list = await this.getUsers();
    const updated = list.filter((u) => u.id !== id);
    writeStorage(STORAGE_KEYS.users, updated);
    return updated;
  },
};

export const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'ocean', label: 'Ocean' },
];
