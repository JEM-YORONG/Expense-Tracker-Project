# Expense Tracker - React Native Documentation

## Overview

The Expense Tracker is a mobile application built with React Native (Expo) that helps users monitor their spending against a set budget. It provides a clean interface for managing transactions, budget, and users with data stored in SQLite.

## Features

- **Budget Management**: Users can set and update their desired budget.
- **Transaction Tracking**: Add, view, and delete expenses or income transactions.
- **Balance Display**: Real-time calculation of balance shows how much budget remains.
- **Categorization**: Transactions can be assigned to categories (Food, Transport, Shopping, Bills, Entertainment, Health, Other).
- **Visual Feedback**: Color-coded values indicate healthy (green) or overspent (red) balances.
- **Peso Currency**: All amounts display in Philippine Peso (₱).
- **Transaction Filtering**: Filter transactions by category, date range, and sort by newest/oldest/amount.
- **Authentication**: Simple email/password login with persistent sessions via AsyncStorage.
- **Admin User Management**: Admin can add/edit/delete users (admin role only).
- **SQLite Storage**: Data persisted locally using expo-sqlite.

## Project Structure

```
Expense-Tracker-Mobile/
├── App.js                 # Root entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── src/
│   ├── services/
│   │   └── database.js    # Abstract database service (SQLite implementation)
│   ├── screens/
│   │   ├── LoginScreen.js # Login screen
│   │   ├── DashboardScreen.js # Main dashboard
│   │   └── AdminScreen.js # Admin user management
│   └── components/
│       ├── BalanceDisplay.js
│       ├── BudgetInput.js
│       ├── AddTransaction.js
│       ├── Analytics.js
│       └── TransactionList.js
```

## Architecture

### Database Service Layer

`src/services/database.js` provides:

- `DatabaseService` - Abstract base class for easy database migration
- `SQLiteService` - SQLite implementation using `expo-sqlite`
- Session storage via `AsyncStorage`

**To swap databases**: Create a new class extending `DatabaseService` and implement all methods.

### Screens

- **App.js** - Root shell, initializes database, handles authentication state
- **LoginScreen.js** - Login form with email/password validation
- **DashboardScreen.js** - Main dashboard with transactions, budget, analytics
- **AdminScreen.js** - User management for admin role

### Components

- **BalanceDisplay** - Shows balance with summary cards
- **BudgetInput** - Form to set/update budget
- **AddTransaction** - Form to add new transactions
- **Analytics** - Bar chart showing spending by category
- **TransactionList** - List of transactions with filtering

## Database Schema

```sql
users:       id (TEXT PK), email, password, name, role
transactions: id (TEXT PK), userId, title, amount, category, date
budgets:     userId (TEXT PK), amount
session:     id (TEXT PK), userId
```

## Running the App

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Android/iOS simulator or physical device

### Installation
```bash
npm install
```

### Development
```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run in web browser
```

### Build
```bash
eas build -p android  # Build Android APK
eas build -p ios      # Build iOS IPA
```

## Default Credentials

- **Admin**: `admin@ExpenseTracker.com` / `admin123`
- After first login, admin is saved to database and users can be created via Admin page

## Migration Notes

To swap SQLite for another database (e.g., Supabase, Firebase):
1. Create a new service class extending `DatabaseService`
2. Implement all CRUD methods
3. Update the `db` export in `src/services/database.js`