# Expense Tracker - Development Roadmap

## Phase 1: Foundation (Completed)
- [x] Expo SDK 54 compatibility - fix dependency versions
- [x] SQLite database integration with expo-sqlite
- [x] User authentication with session persistence
- [x] Basic dashboard with balance display
- [x] Admin user management screen
- [x] Transaction CRUD operations
- [x] Budget management
- [x] Analytics bar chart visualization

## Phase 2: Bug Fixes & Stability (In Progress)
- [x] Fix "no such table" database errors (SQLite API changes)
- [x] Add loading/error states to App.js
- [x] Add logout buttons to dashboard and admin screens
- [ ] Add error boundaries to prevent crashes
- [ ] Implement proper form validation (currently minimal)
- [ ] Add input masking for date fields
- [ ] Handle expo-asset/Metro bundler errors

## Phase 3: UX Improvements (Pending)
- [ ] Add user-friendly logout confirmation dialog
- [ ] Add password visibility toggle
- [ ] Add pull-to-refresh on transaction list
- [ ] Add empty state illustrations
- [ ] Improve form accessibility (labels, hints)
- [ ] Add haptic feedback for actions

## Phase 4: Feature Enhancements (Pending)
- [ ] Transaction categories as dropdown/picker instead of text input
- [ ] Date picker for transaction date instead of manual input
- [ ] Search/filter transactions by title
- [ ] Export transactions to CSV/JSON
- [ ] Dark/light theme toggle
- [ ] Budget progress visualization

## Phase 5: Admin Features (Pending)
- [ ] Admin analytics dashboard
- [ ] User activity logs
- [ ] Bulk user import/export
- [ ] Role-based access control (role field exists, no enforcement)

## Phase 6: Technical Debt (Pending)
- [ ] Centralize database access (getDb duplicated in App.js, DashboardScreen.js, AdminScreen.js)
- [ ] Add TypeScript types
- [ ] Add unit tests
- [ ] Add ESLint rules (basic config exists)
- [ ] Optimize SQLite queries with indexes

---

## Sprint Planning

### Sprint 1 (Current Priority)
- Centralize database access (resolve getDb() duplication)
- Add error boundaries to prevent crashes
- Fix expo-asset/Metro bundler compatibility issues
- Verify expo-doctor checks pass

### Sprint 2
- Implement form validation (transactions, users)
- Add date picker component
- Add category picker component

### Sprint 3
- Add logout confirmation dialog
- Add password visibility toggle
- Theme system implementation

---

## Known Technical Debt

### Current Critical Issues
- `getDb()` function duplicated in 3 files (App.js, DashboardScreen.js, AdminScreen.js) - NOT centralized
- No TypeScript types across codebase
- SQL queries inline in screens (not abstracted into service)
- No automated tests
- No error boundaries for crash recovery
- Form validation is minimal (client-side only)

### Architecture Observations
- Expo SDK 54 + React Native 0.81.5 + expo-sqlite 16.0.0
- No expo-asset version conflicts detected in current package.json
- Session storage uses AsyncStorage (no encryption)
- Role field exists in users table but no RBAC enforcement