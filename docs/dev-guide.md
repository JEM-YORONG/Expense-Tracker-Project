# Expense Tracker - React Native Documentation

## Overview

The Expense Tracker is a mobile application built with React Native (Expo SDK 54) that helps users monitor their spending against a set budget. It provides a clean interface for managing transactions, budget, and users with data stored in SQLite.

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
├── App.js                 # Root entry point - handles auth state & DB init
├── app.json               # Expo configuration with expo-sqlite plugin
├── package.json           # Dependencies (SDK 54 compatible versions)
├── assets/                # Static assets
├── src/
│   ├── services/
│   │   └── database.js    # Re-exports openDatabaseAsync; theme constants (THEMES)
│   ├── screens/
│   │   ├── LoginScreen.js # Login form with email/password validation
│   │   ├── DashboardScreen.js # Main dashboard with logout button
│   │   └── AdminScreen.js # Admin user management with nav/logout
│   └── components/
│       ├── BalanceDisplay.js
│       ├── BudgetInput.js
│       ├── AddTransaction.js
│       └── Analytics.js
```

## Architecture

### Database Layer

Each file (**App.js**, **DashboardScreen.js**, **AdminScreen.js**) has its own `getDb()` function that:
- Opens SQLite database via `expo-sqlite`
- Creates tables if they don't exist (users, transactions, budgets)
- Uses SDK 54's `execAsync()` with string-based SQL

**Technical Debt**: The `getDb()` function is duplicated across 3 files. This should be centralized in a single service module.

### Screens

- **App.js** - Root shell, initializes database, handles authentication state
- **LoginScreen.js** - Login form with email/password validation, displays errors
- **DashboardScreen.js** - Main dashboard with:
  - Header with 🚪 logout button
  - Welcome banner
  - Balance display
  - Budget input
  - Analytics chart
  - Add transaction form
  - Transaction list with edit/delete
- **AdminScreen.js** - User management with:
  - Header with 🏠 (back to dashboard) and 🚪 (logout) buttons
  - User creation form
  - User list with edit/delete
  - Password fields (optional on edit)

### Components

- **BalanceDisplay** - Shows balance with summary cards (budget, spent, remaining)
- **BudgetInput** - Form to set/update budget
- **AddTransaction** - Form to add new transactions with title, amount, category, date
- **Analytics** - Bar chart showing spending by category

## Database Schema

```sql
users:       id (TEXT PK), email (UNIQUE), password, name, role
transactions: id (INTEGER PK AUTOINCREMENT), userId, title, amount, category, date
budgets:     userId (TEXT PK), amount
```

Note: Users use TEXT ID (for email-based or custom IDs like 'admin'), transactions use INTEGER AUTOINCREMENT for performance.

## Running the App

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (or use npx)
- Android/iOS device or simulator with Expo Go app

### Installation
```bash
npm install
```

### Development
```bash
npm start              # Start Expo dev server (clear cache with -c flag)
npm run android        # Run on Android device/emulator
npm run ios            # Run on iOS simulator
npm run web            # Run in web browser (limited SQLite support)
```

### Verify Compatibility
```bash
npx expo-doctor       # Run health checks (all 18 should pass)
```

### Build
```bash
eas build -p android  # Build Android APK
eas build -p ios      # Build iOS IPA
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ExpenseTracker.com` | `admin123` |

The admin user is auto-created on first login via `INSERT OR IGNORE`. After logging in as admin, additional users can be created via the Admin page.

## Expo SDK 54 Notes

### Required Dependency Versions
All packages must match SDK 54:
```json
{
  "expo": "~54.0.35",
  "expo-sqlite": "~16.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5"
}
```

### SQLite API Changes
```javascript
// SDK 54 - execAsync takes a string
await db.execAsync('CREATE TABLE IF NOT EXISTS users (...)');

// Old SDK - took array of objects (no longer works)
// await db.execAsync([{ sql: 'CREATE TABLE...', args: [] }]);
```

## Known Issues

- Expo Go must be updated to latest version for SDK 54 compatibility
- Clear Expo cache (`Settings → Advanced → Clear Cache` in Expo Go) if experiencing load issues
- Database errors display on screen instead of console when running in Expo Go

## Technical Debt

The following issues require attention in future sprints:

- **Database centralization**: `getDb()` duplicated in App.js, DashboardScreen.js, AdminScreen.js
- **No error boundaries**: App can crash without recovery UI
- **Form validation**: Minimal client-side validation only (no schema validation)
- **No TypeScript**: All `.js` files lack type safety
- **No tests**: No automated test coverage
- **No linting rules**: Only basic Expo eslint config exists