import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { db } from './src/services/database';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      await db.init();
      const session = await db.getSession();
      if (session) setUser(session);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const user = await db.login(email, password);
    setUser(user);
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
  };

  if (!user) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLogin={login} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <DashboardScreen user={user} onLogout={logout} />
    </SafeAreaProvider>
  );
}