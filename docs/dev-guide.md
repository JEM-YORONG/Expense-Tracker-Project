# Expense Tracker - React Native Documentation

## Overview

The Expense Tracker is a mobile application built with React Native (Expo SDK 54) that helps users monitor their spending against a set budget. It provides a clean interface for managing transactions, budget, and users with data stored in SQLite.

## Features

- **Budget Management**: Users can set and update their desired budget.
- **Transaction Tracking**: Add, view, edit, and delete expenses or income transactions.
- **Balance Display**: Real-time calculation of balance with color-coded indicators (green for healthy, red for overspent).
- **Categorization**: Transactions assigned to categories via dropdown picker (Food, Transport, Shopping, Bills, Entertainment, Health, Other).
- **Peso Currency**: All amounts display in Philippine Peso (₱).
- **Transaction Filtering**: Filter transactions by category, date range, and sort by newest/oldest/amount-high.
- **Authentication**: Simple email/password login with persistent sessions via AsyncStorage. Includes password visibility toggle.
- **Admin User Management**: Admin can add/edit/delete users with role selection via dropdown (admin role only).
- **Analytics**: Horizontal category breakdown with progress bars showing spending distribution.
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
│   │   └── database.js    # Centralized getDb() singleton with table creation + theme constants
│   ├── screens/
│   │   ├── LoginScreen.js # Login form with SafeAreaView, password toggle, validation
│   │   ├── DashboardScreen.js # Main dashboard with header, welcome banner, transaction list
│   │   └── AdminScreen.js # Admin user management with header, role dropdown, user list
│   └── components/
│       ├── BalanceDisplay.js
│       ├── BudgetInput.js
│       ├── AddTransaction.js
│       └── Analytics.js
```

## Architecture

### Database Layer

Database access is centralized in `src/services/database.js` via a singleton `getDb()` function:
- Opens SQLite database via `expo-sqlite`
- Creates tables if they don't exist (users, transactions, budgets)
- Uses SDK 54's `execAsync()` with string-based SQL
- Imported and used by App.js, DashboardScreen.js, and AdminScreen.js

### Screens

- **App.js** - Root shell, initializes database, handles authentication state
- **LoginScreen.js** - Login form with SafeAreaView, email/password validation, password visibility toggle, error display
- **DashboardScreen.js** - Main dashboard with:
  - Header with "Logout" text button
  - Welcome banner with user name and role-based subtitle
  - Balance display with centered amount and stats row
  - Budget input with label
  - Analytics with horizontal category breakdown and progress bars
  - Add transaction form with category dropdown
  - Transaction list with category/sort dropdown filters, edit/delete actions
- **AdminScreen.js** - User management with:
  - Header with "Logout" text button
  - User creation form with role dropdown
  - User list with edit/delete text buttons
  - Password fields (optional on edit)

### Components

- **BalanceDisplay** - Centered large balance amount with horizontal stats row (Budget / Spent / Remaining)
- **BudgetInput** - Form to set/update budget with label and input
- **AddTransaction** - Form to add new transactions with title, amount, category dropdown, date
- **Analytics** - Horizontal category breakdown list with colored icon badges, amounts, percentages, and progress bars

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

## UI/UX Standards

The app follows these mobile UI standards:
- **SafeAreaView**: All screens wrapped in SafeAreaView for notch/status bar safety
- **Touch Targets**: All interactive elements have minHeight: 44
- **Typography**: Labels use fontSize 13, fontWeight '600', color #374151
- **Inputs**: Border 1px #e5e7eb, radius 10, padding 12, bg #fdfdfd, minHeight 44
- **Buttons**: bg #111827, radius 10, paddingVertical 12, paddingHorizontal 16, minHeight 44
- **Cards**: bg white, radius 16, padding 18, shadow
- **Dropdowns**: Modal-based pickers for category and role fields
- **Empty States**: Icon + message + hint text for empty lists

## Known Issues

- Expo Go must be updated to latest version for SDK 54 compatibility
- Clear Expo cache (`Settings → Advanced → Clear Cache` in Expo Go) if experiencing load issues
- Database errors display on screen instead of console when running in Expo Go

## Technical Debt

The following issues require attention in future sprints:

- **No error boundaries**: App can crash without recovery UI
- **Form validation**: Minimal client-side validation only (no schema validation)
- **No TypeScript**: All `.js` files lack type safety
- **No tests**: No automated test coverage
- **No linting rules**: Only basic Expo eslint config exists
