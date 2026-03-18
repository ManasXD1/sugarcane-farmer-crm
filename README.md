# 🌾 SugarCRM – Sugarcane Farmer CRM

> A mobile CRM for field agents and managers to track 70,000 sugarcane farmers — managing profiles, crop progress, deliveries, payments, and field visits.

[![TypeScript](https://img.shields.io/badge/TypeScript-97%25-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/license-Private-red.svg)]()

---

## 📖 Overview

SugarCRM is a mobile-first field operations app built to help agricultural teams manage large-scale sugarcane farming operations. Field agents and managers can log visits, record deliveries, track crop progress, and view payments — all from their mobile device, designed for one-handed use in the field.

---

## ✨ Features

- 👨‍🌾 **Farmer Directory** — Searchable, filterable list of 70,000+ farmer profiles with crop stage badges
- 📊 **Dashboard** — Summary cards, recent activity feed, monthly delivery bar charts
- 🚜 **Field Visits** — Log and manage field visits with notes and follow-up actions
- 📦 **Deliveries** — Record cane deliveries with quantity, quality grade, and seasonal totals
- 💰 **Payments** — Per-farmer payment history and records
- 🌱 **Crop Progress** — Track planting dates, growth stages, and expected harvest
- 📈 **Reports** — Season summaries, farmer status breakdowns, and export options
- 🔔 **Notifications** — App-wide alerts and reminders for agents

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile Framework | Expo (React Native) ~54.0 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router + React Navigation (Bottom Tabs) |
| Styling | NativeWind 4 (Tailwind for React Native) |
| API Layer | tRPC 11 + TanStack Query 5 |
| Backend | Node.js + Express 4 |
| Database | MySQL 2 + Drizzle ORM |
| Auth | JOSE (JWT) |
| Package Manager | pnpm 9.12 |
| Testing | Vitest |

---

## 📁 Project Structure

```
sugarcane-farmer-crm/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (tabs)/             # Bottom tab screens
│   │   ├── dashboard       # Overview stats & quick actions
│   │   ├── farmers         # Farmer directory
│   │   ├── visits          # Field visits
│   │   ├── deliveries      # Delivery records
│   │   └── reports         # Analytics & reports
│   └── (stack)/            # Modal/stack screens
│       ├── farmer/[id]     # Farmer profile
│       ├── farmer/add      # Add farmer form
│       ├── visit/add       # Log a field visit
│       └── delivery/add    # Record a delivery
├── components/             # Shared UI components
├── constants/              # App-wide constants & theme
├── drizzle/                # DB migrations & schema
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities
├── scripts/                # Dev scripts (e.g. QR generator)
├── server/                 # Express + tRPC backend
│   └── _core/              # Server entry point
├── shared/                 # Types & logic shared between client/server
├── tests/                  # Vitest test suite
├── assets/images/          # App images & icons
├── app.config.ts           # Expo config
├── drizzle.config.ts       # Drizzle ORM config
├── tailwind.config.js      # Tailwind / NativeWind config
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v9.12+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A running MySQL database

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ManasXD1/sugarcane-farmer-crm.git
cd sugarcane-farmer-crm

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database and config values
```

### Database Setup

```bash
# Generate and run migrations
pnpm db:push
```

### Running the App

```bash
# Run both server and Metro bundler together (recommended)
pnpm dev

# Or run them separately:
pnpm dev:server     # Express + tRPC backend
pnpm dev:metro      # Expo Metro bundler (web on port 8081)

# Native platforms
pnpm android
pnpm ios

# Generate QR code for Expo Go
pnpm qr
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=mysql://user:password@localhost:3306/sugarcane_crm
JWT_SECRET=your_jwt_secret_here
EXPO_PORT=8081
NODE_ENV=development
```

---

## 🧪 Testing & Linting

```bash
# Run tests
pnpm test

# Type check
pnpm check

# Lint
pnpm lint

# Format code
pnpm format
```

---

## 📱 App Navigation

```
(tabs)/
  dashboard     ← Home overview & charts
  farmers       ← Farmer directory (70k records)
  visits        ← Field visit log
  deliveries    ← Delivery records
  reports       ← Analytics & season summary

(stack)/
  farmer/[id]           ← Full farmer profile
  farmer/add            ← Add new farmer
  farmer/[id]/edit      ← Edit farmer record
  visit/add             ← Log a field visit
  delivery/add          ← Record a delivery
  notifications         ← Alerts & reminders
```

---

## 🎨 Design

The app uses an agriculture-inspired color scheme:

- **Primary Green** `#2E7D32` — sugarcane / field green
- **Accent Amber** `#F59E0B` — harvest gold
- **Background** `#F9FBF7` — soft off-white with green tint

Designed for **one-handed portrait use** with large 44pt tap targets, sticky search bars, and `FlatList` rendering for performance with large datasets.

See [`design.md`](./design.md) for the full interface design spec.

---

## 🏗️ Production Build

```bash
# Build the server
pnpm build

# Start production server
pnpm start
```

---

## 📄 License

Private repository — all rights reserved.

---

## 👤 Author

**ManasXD1** — [github.com/ManasXD1](https://github.com/ManasXD1)

Project: [github.com/ManasXD1/sugarcane-farmer-crm](https://github.com/ManasXD1/sugarcane-farmer-crm)
