# Expense Tracker - Development Roadmap

## Phase 1: Foundation (Completed)
- [x] Expo SDK 54 compatibility - fix dependency versions
- [x] SQLite database integration with expo-sqlite
- [x] User authentication with session persistence
- [x] Basic dashboard with balance display
- [x] Admin user management screen
- [x] Transaction CRUD operations
- [x] Budget management
- [x] Analytics visualization
- [x] Centralize database access (getDb in src/services/database.js)
- [x] SafeAreaView on all screens (no status bar overlap)
- [x] Password visibility toggle on login
- [x] Category dropdown picker (AddTransaction)
- [x] Role dropdown picker (AdminScreen)
- [x] Sort dropdown picker (Dashboard transaction list)
- [x] Mobile UI/UX alignment across all screens and components

## Phase 2: Bug Fixes & Stability (Completed)
- [x] Fix "no such table" database errors (SQLite API changes)
- [x] Add loading/error states to App.js
- [x] Add logout buttons to dashboard and admin screens
- [x] Fix VirtualizedList warning (nested FlatList inside ScrollView)
- [x] Fix header UI and safe area handling

## Phase 3: UX Improvements (In Progress)
- [x] Add password visibility toggle
- [x] Improve form accessibility (labels, hints)
- [x] Add empty state illustrations with icons and guidance text
- [x] Standardize touch targets to 44x44 minimum
- [ ] Add user-friendly logout confirmation dialog
- [ ] Add pull-to-refresh on transaction list
- [ ] Add haptic feedback for actions
- [ ] Add date picker component for transaction date

## Phase 4: Feature Enhancements (Pending)
- [x] Transaction categories as dropdown/picker instead of text input
- [ ] Search/filter transactions by title
- [ ] Export transactions to CSV/JSON
- [ ] Dark/light theme toggle
- [ ] Budget progress visualization (enhanced)
- [ ] Transaction edit modal improvements

## Phase 5: Admin Features (Pending)
- [x] Admin analytics dashboard (Analytics component)
- [ ] User activity logs
- [ ] Bulk user import/export
- [ ] Role-based access control enforcement (role field exists, needs UI enforcement)

## Phase 6: Technical Debt (Pending)
- [x] Centralize database access (getDb in src/services/database.js)
- [ ] Add TypeScript types
- [ ] Add unit tests
- [ ] Add ESLint rules (basic config exists)
- [ ] Optimize SQLite queries with indexes
- [ ] Add error boundaries for crash recovery
- [ ] Implement proper form validation (schema validation)

---

## Current Sprint Focus

### Completed
- Centralize database access
- Fix VirtualizedList warning
- Redesign Admin screen layout and headers
- Convert category and role to dropdown pickers
- Align all screens/components with mobile UI/UX standards
- Redesign welcome banner
- Redesign Analytics to horizontal category breakdown

### Next Up
- Date picker component
- Pull-to-refresh on transaction list
- Logout confirmation dialog
- Form validation improvements

---

## Known Technical Debt

### Resolved
- [x] `getDb()` duplicated in 3 files — now centralized in `src/services/database.js`
- [x] Nested FlatList inside ScrollView causing VirtualizedList warning — replaced with mapped View
- [x] No SafeAreaView on screens — added to LoginScreen, DashboardScreen, AdminScreen
- [x] Category and Role fields as plain text inputs — converted to modal dropdowns
- [x] Emoji-only action buttons — replaced with styled text buttons
- [x] Inconsistent touch targets — standardized to 44x44 minimum
- [x] Missing labels — added explicit labels to all form fields
- [x] No empty states — added icon + message + hint to all empty lists

### Current Issues
- No TypeScript types across codebase
- No automated tests
- No error boundaries for crash recovery
- Form validation is minimal (client-side only)
- Session storage uses AsyncStorage (no encryption)
- Role field exists in users table but no RBAC enforcement in UI

### Architecture
- Expo SDK 54 + React Native 0.81.5 + expo-sqlite 16.0.0
- No expo-asset version conflicts detected
- No .NET backend — pure Expo mobile app with local SQLite
