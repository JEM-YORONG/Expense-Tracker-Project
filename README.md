# Expense Tracker

A responsive React expense tracker for managing budgets, transactions, users, themes, and spending analytics.

## Features

- Budget management
- Add, edit, delete, filter, and sort transactions
- Real-time balance and remaining budget display
- Category-based spending analytics
- Light, dark, and ocean themes
- Simple email/password login with persistent sessions
- Admin user management
- Philippine Peso currency formatting
- Mobile-first responsive layout

## Tech Stack

- React
- Vite
- CSS variables and responsive CSS
- LocalStorage-backed API service

## Installation

Install dependencies:

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Share on Your Network

Run the app with network access:

```bash
npm run dev -- --host 0.0.0.0
```

Then share the `Network` URL shown in the terminal, for example:

```text
http://192.168.x.x:5173/
```

Devices on the same Wi-Fi or LAN can open that URL.

## Build

```bash
npm run build
```

Production files are generated in `dist/`.

## Default Admin Login

Use these credentials if no users exist:

```text
Email: admin@ExpenseTracker.com
Password: admin123
```

## Notes

- User, transaction, budget, and theme data are stored in the browser using `localStorage`.
- The API service is structured for easy replacement with a real backend later.
