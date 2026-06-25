import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDb } from './src/services/database';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AdminScreen from './src/screens/AdminScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await getDb();
        const session = await AsyncStorage.getItem('session');
        if (session) setUser(JSON.parse(session));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    try {
      const database = await getDb();
      const users = await database.getAllAsync(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
      );

      if (users.length === 0) {
        // Check for default admin
        if (email === 'admin@ExpenseTracker.com' && password === 'admin123') {
          const admin = { id: 'admin', email, name: 'Admin', role: 'admin' };
          await database.runAsync(
            'INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
            ['admin', email, password, 'Admin', 'admin']
          );
          setUser(admin);
          await AsyncStorage.setItem('session', JSON.stringify(admin));
          return;
        }
        throw new Error('Invalid email or password.');
      }

      const user = users[0];
      const { password: _, ...safeUser } = user;
      setUser(safeUser);
      await AsyncStorage.setItem('session', JSON.stringify(safeUser));
    } catch (e) {
      throw e;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('session');
    setUser(null);
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Initializing...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: 'red' }}>Error: {error}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLogin={login} />
      </SafeAreaProvider>
    );
  }

  if (user.role === 'admin') {
    return (
      <SafeAreaProvider>
        <AdminScreen user={user} onLogout={logout} onBack={() => setUser(null)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <DashboardScreen user={user} onLogout={logout} />
    </SafeAreaProvider>
  );
}