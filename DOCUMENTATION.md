# Expense Tracker - Project Documentation

## Overview

The Expense Tracker is a responsive web application built with React that helps users monitor their spending against a set budget. It provides a clean, Bento-style interface that works seamlessly on desktop, tablet, and mobile devices.

## Features

- **Budget Management**: Users can set and update their desired budget.
- **Transaction Tracking**: Add, view, and delete expenses or income transactions.
- **Balance Display**: Real-time calculation of balance shows how much budget remains.
- **Responsive UI**: Bento grid layout adapts from desktop (4 columns) to tablet (2 columns) to mobile (1 column).
- **Categorization**: Transactions can be assigned to categories like Food, Transport, Shopping, etc.
- **Visual Feedback**: Color-coded values indicate healthy (green) or overspent (red) balances.
- **Welcome Banner**: Styled hero card using the theme’s accent color with white text, matching the primary button color scheme.
- **Styled Form Controls**: Custom-styled dropdowns and date picker matching the UI theme.
- **Peso Currency**: All amounts display in Philippine Peso (₱).
- **Transaction Filtering**: Filter transactions by category, date range, and sort by newest/oldest/amount.
- **Authentication**: Simple email/password login with persistent sessions via localStorage.
- **Theme Switcher**: Light, Dark, and Ocean themes with persistent preference.
- **API-Ready Architecture**: Centralized API service layer with per-user data scoping for personal use.
- **Per-User Data**: Each user has their own isolated transactions and budget.

## Project Structure

```
Expense-Tracker/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite bundler configuration
├── DOCUMENTATION.md        # Project documentation
├── src/
│   ├── main.jsx            # React app bootstrap
│   ├── index.css           # Global styles & responsive layout
│   ├── App.jsx             # Root shell: auth, theme, routing, layout
│   ├── services/
│   │   └── api.js          # Centralized API/data service layer
│   └── components/
│       ├── Dashboard.jsx       # Main dashboard: state, handlers, data loading, edit modal
│       ├── Admin.jsx           # Admin user management page
│       ├── Admin.css           # Admin page styles
│       ├── BudgetInput.jsx     # Budget input form
│       ├── AddTransaction.jsx  # Add transaction form
│       ├── BalanceDisplay.jsx  # Balance summary cards
│       ├── TransactionList.jsx # List of transactions with truncation and modal trigger
│       ├── Analytics.jsx       # Vertical bar chart analytics
│       ├── Settings.jsx        # Settings component (theme definitions)
│       ├── Login.jsx           # Login form
│       └── Login.css           # Login styles
```

## Architecture

The Expense Tracker follows a **component-based architecture** with **separation of concerns**:

- **App.jsx** — root shell. Handles auth (login/logout), theme switching, page routing (Dashboard/Admin/Denied), and renders page-specific components.
- **Dashboard.jsx** — main feature module. Owns all dashboard state (budget, transactions, filters), data operations via the API service, and the transaction edit modal.
- **Admin.jsx** — admin user management page. Owns user CRUD state and operations via the API service.
- **services/api.js** — centralized data layer. Encapsulates auth, budget, transaction, and user calls. Currently backed by localStorage but structured for easy backend swap.

### Data Flow

```
App (Auth / Theme / Router Shell)
  ├── Dashboard (State + Handlers + Edit Modal)
  │     ├── BudgetInput (onSave → Dashboard.saveBudget → api.saveBudget)
  │     ├── AddTransaction (onAdd → Dashboard.addTransaction → api.saveTransaction)
  │     ├── BalanceDisplay (receives budget, expense, remaining)
  │     ├── TransactionList (receives transactions, onDelete → Dashboard.deleteTransaction, onOpenModal → Dashboard.setModal)
  │     ├── TransactionList (filters → Dashboard filter state)
  │     ├── Analytics (receives transactions)
  │     └── EditModal (tx → Dashboard.updateTransaction → api.updateTransaction)
  └── Admin (User CRUD)
        ├── api.getUsers / saveUser / updateUser / deleteUser
        └── Settings (theme → App.handleThemeChange)
```

### API Service Layer

`src/services/api.js` exposes:
- `login(email, password)`, `logout()`, `getSession()`
- `getTransactions(userId)`, `saveTransaction(userId, tx)`, `deleteTransaction(userId, id)`, `updateTransaction(userId, id, updates)`
- `getBudget(userId)`, `saveBudget(userId, value)`
- `getUsers()`, `saveUser(user)`, `updateUser(id, updates)`, `deleteUser(id)`
- `THEMES` array

Currently uses `localStorage` with per-user keys and simulated delays for async behavior, making it easy to replace with real HTTP endpoints later. All create/update/delete methods validate and return the updated list.

## State Management

- **Dashboard.jsx** owns:
  - `budget` — user's monthly budget
  - `transactions` — array of transaction objects with `id`, `title`, `amount`, `category`, `date`
  - `category`, `dateFrom`, `dateTo`, `sort` — filter/sort state
  - `modal` — transaction edit modal state (`open`, `tx`)
  - derived values: `totalBudget`, `totalExpense`, `remaining`

- **Admin.jsx** owns:
  - `users` — array of user objects with `id`, `name`, `email`, `password`, `role`
  - `form` — user creation/edit form state
  - `editingId` — tracks which user is being edited

- **App.jsx** owns:
  - `theme` — active theme key (`light`, `dark`, `ocean`)
  - `user` — logged-in user session
  - `page` — current page (`dashboard`, `admin`, or `denied`)

## Component Reference

### App.jsx
**Role**: Root shell — auth, theme, routing, layout orchestration.  
**Key Logic**:
- Initializes theme from `localStorage` and applies `data-theme` to `documentElement`
- Restores session from `api.getSession()` on mount
- Manages `page` state to switch between Dashboard, Admin, and Access Denied views
- Renders `Login` when unauthenticated, otherwise renders active page + Settings
- Exposes `SettingsInline` component
- Enforces admin-only access to the Admin page via `isAdmin` check

### Dashboard.jsx
**Role**: Main dashboard feature module — owns all dashboard state, data logic, and the transaction edit modal.  
**Key Logic**:
- Loads initial `transactions` and `budget` via `api` on mount
- `saveBudget`, `addTransaction`, `deleteTransaction`, `updateTransaction` — all async via `api`
- Computes `totalBudget`, `totalExpense`, `remaining`
- Manages filter/sort state and passes `filters` prop to `TransactionList`
- Owns transaction edit modal state (`modal`, `setModal`) and renders `EditModal`
- `EditModal` uses the same `.admin-form` styling as Admin.jsx for consistent UI
- Renders welcome banner, Balance, Budget, Analytics, Add Transaction, and Transaction List

### Admin.jsx
**Props**: `onBack()`  
**Behavior**:
- Displays a two-column layout: add/edit form on the left, user list on the right
- Loads users via `api.getUsers()` on mount
- `saveUser(user)` — validates and persists new users, preventing duplicate emails
- `updateUser(id, updates)` — updates existing user fields
- `deleteUser(id)` — removes user by ID
- Form supports name, auto-generated email, password, and role (user/admin)
- Name is limited to 20 characters with warning displayed if exceeded
- Password must be 4-16 characters; warnings shown for invalid lengths
- Password is optional during edit (shows "(optional)" label, empty password keeps current)
- Email is auto-generated from name (`{name}{year}@ExpenseTracker.com`) and always disabled
- Uses the same CSS variables and theme system as the rest of the app
- User list card expands height based on content; form card retains fixed height
- User list reuses the shared `.row` styling from the Transaction section for consistent list UI
- Row action buttons use minimal borderless styling (`.btn-minimal`) with subtle hover states

### BudgetInput
**Props**: `onSave(value)`  
**Behavior**: Form with number input for monthly budget. On submit, calls `onSave`.

### AddTransaction
**Props**: `onAdd(transaction)`  
**Behavior**: Form with fields for title, amount, category, and date. Features custom-styled dropdown and date picker. On submit, creates a new transaction object and calls `onAdd`.

### BalanceDisplay
**Props**: `budget`, `expense`, `remaining`  
**Behavior**: Renders the primary balance large number with ₱ symbol, plus three summary cards showing budget, spent, and remaining in pesos.

### TransactionList
**Props**: `transactions`, `onDelete(id)`, `onOpenModal(tx)`, `filters`  
**Behavior**: 
- Maps over transactions, displaying each with a category icon, title, date, and amount
- Built-in controls for category filter, date range, and sorting (newest/oldest/amount)
- Clicking a row opens the edit modal via `onOpenModal`

### Analytics
**Props**: `transactions`  
**Behavior**: Computes spending breakdown by category and renders a vertical bar chart with colored bars showing percentage of total spending. Each bar includes a category icon, percentage label, and category name.

### Settings
**Props**: `theme`, `onThemeChange`  
**Behavior**: Theme switcher dropdown using `THEMES` from `api.js`.

### Login
**Props**: `onLogin(email, password)`  
**Behavior**: Email/password login form with validation. Calls async `onLogin` and shows loading/error states.

## Styling Strategy

The app uses a **mobile-first CSS approach** with CSS variables for theming.

### Themes
- **Light** (default) — clean white/gray palette
- **Dark** — dark slate palette with blue accent
- **Ocean** — light blue-tinted palette with sky accent

All themes are defined via `[data-theme="..."]` selectors on the root element, using the same CSS variable names. The Admin page inherits the active theme automatically.

### Currency
All monetary values use the Philippine Peso sign (₱) instead of dollar sign ($), including:
- Balance display
- Summary cards (Budget, Spent, Remaining)
- Transaction amounts
- Logo icon

### Form Controls
Custom-styled form controls:
- **Dropdowns**: Custom chevron icon, styled options with white background
- **Date Picker**: Custom calendar icon, native picker functionality maintained with custom styling
- **Inputs**: Consistent rounded corners, hover/focus transitions with accent color glow

### Grid System (Bento Layout)
- **Desktop (>900px)**: 4-column grid.
- **Tablet (560px-900px)**: 2-column grid.
- **Mobile (<560px)**: Single column.

Cards span multiple columns using the `.span-2`, `.span-3`, and `.span-4` classes.

### Responsive Breakpoints
```css
@media (max-width: 900px)  /* Tablet: 2 columns */
@media (max-width: 560px)  /* Mobile: 1 column + stacked header */
```

## Running the App

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Opens the app at `http://localhost:5173` (Vite default).

### Production Build
```bash
npm run build
```
Outputs static assets to the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Usage Guide

1. **Login**: Use `admin@expense-tracker.com` / `admin123` to log in.
2. **Set Budget**: Enter your monthly budget in pesos in the "Budget" card and click "Save Budget".
3. **Add Transaction**: Fill out the "Add Transaction" form with a title, amount in ₱, category, and date. Click "Add Transaction".
4. **Monitor Balance**: The "Balance" card updates automatically to show budget, total spent, and remaining funds in pesos.
5. **Review Transactions**: The "Transactions" card lists all entries. Use the filter controls to narrow by category, date range, or sort order. Click any transaction row to open edit modal, or click ✕ to delete.
6. **Edit Transaction**: Click a transaction to open the edit modal. Modify title, amount, category, or date, then save changes.
7. **View Analytics**: The "Analytics" section shows a vertical bar chart with spending breakdown by category, including percentages and category icons.
8. **Change Theme**: Use the Theme dropdown in Settings to switch between Light, Dark, and Ocean. Preference is saved to localStorage.
9. **Manage Users (Admin)**: Click "Admin" in the header to access user management. Add new users with name, email, password, and role. Edit existing users or delete them. Email cannot be changed during edit.
10. **Responsive View**: Resize your browser or use mobile view to see the layout adapt.
11. **Logout**: Click "Logout" in the header to clear session and local data.

## Technical Notes

- **Framework**: React 18
- **Bundler**: Vite 5
- **Styling**: Plain CSS with CSS variables for consistent theming.
- **No External UI Libraries**: The bento grid layout and components are built from scratch to ensure a lean bundle.
- **Currency**: Philippine Peso (₱) used throughout the application.
- **API Layer**: `src/services/api.js` centralizes all data operations for easy backend integration.
