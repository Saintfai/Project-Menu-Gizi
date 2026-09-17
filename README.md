# 🥗 Hospital Dietary Management System (Sistem Manajemen & Pemesanan Menu Gizi RS)

[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.19-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

A modern, responsive digital dietary and food ordering platform designed for inpatient hospital care. This system automates the meal ordering process for hospitalized patients and consolidates real-time dietary requirements for hospital nutrition and kitchen departments.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Patient Portal](#1-patient-portal)
  - [2. Kitchen & Dietary Admin Portal](#2-kitchen--dietary-admin-portal)
- [Business Rules & Logic](#-business-rules--logic)
- [Tech Stack](#-tech-stack)
- [Database Schema (Prisma)](#-database-schema-prisma)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Environment Setup](#installation--environment-setup)
  - [Database Migration & Seeding](#database-migration--seeding)
  - [Running the Development Server](#running-the-development-server)
- [Available Scripts](#-available-scripts)
- [Security & Authentication](#-security--authentication)

---

## 🌟 Overview

The **Hospital Dietary Management System** replaces traditional paper-based menu selection with an intuitive QR-based digital interface for inpatients, while giving dietary staff full visibility into daily kitchen production, room-by-room delivery allocations, patient allergy indicators, and nutritional statistics.

---

## ✨ Key Features

### 1. Patient Portal
- **QR Code / Fast Login:** Authenticate using Medical Record Number (No. RM) or Patient Name + Date of Birth.
- **Onboarding & Allergy Verification:** Automatic profile retrieval with confirmation of room, class, and critical allergy history.
- **11-Day Menu Cycle:** Dynamic meal options based on the delivery date ($T+1$) mapped against an 11-day dietary cycle.
- **Main Meal Ordering (Paket Utama - Ranap Include):** Room class-based quotas (VIP vs Regular), supporting partial meal selection (Breakfast, Lunch, Dinner).
- **Extra Meal Ordering (Paket Ekstra - Ranap Exclude):** Paid extra meals for patients or companions for Lunch and Dinner.
- **Interactive Cart & Checkout:** Add special meal notes, adjust portion counts, and complete orders before the daily cut-off time.
- **Visual Allergy Alerts:** Real-time dietary badges to ensure patient safety.

### 2. Kitchen & Dietary Admin Portal
- **Real-Time Kitchen Dashboard:**
  - **4 Summary KPI Cards:** Real-time portion totals for Breakfast, Lunch, Dinner, and Extra meals.
  - **Integrated Order Recap Table:** Comprehensive table showing patient details, room numbers, meal selections, delivery times, and order notes.
  - **Special Notation:** Clear formatting using `/` (Patient / Companion separator), `|` (Main / Extra package separator), and `-` (Unselected meal slot).
  - **Allergy Indicators:** Prominent red badge (🔴) for patients with recorded allergies.
  - **Search & Filters:** Real-time filtering by Patient Name, No. RM, and Room Number.
- **11-Day Cycle Management:** Admin interface to view, update, and manage meal sets (Paket A & Paket B) across all 11 cycles and meal times (Pagi, Siang, Sore).
- **Nutrition Statistics & Analytics:** Visual charts tracking consumption trends, package preference distribution (Paket A vs Paket B vs Extra), and room class allocation.

---

## 📐 Business Rules & Logic

| Rule | Specification |
| :--- | :--- |
| **Delivery Schedule** | Order placed on day $T$ is prepared and delivered for **Tomorrow ($T+1$)**. No same-day delivery. |
| **Cut-Off Time** | - **Paket Utama (Main Meal):** **15:00 WIB**<br>- **Ekstra Siang (Extra Lunch):** **10:00 WIB**<br>- **Ekstra Sore (Extra Afternoon):** **14:00 WIB** |
| **Single Checkout Session** | Patients complete all meal choices in **1 single checkout session** per day for $T+1$. After checkout, main meal selection locks permanently. |
| **11-Day Cycle Logic** | - Days 1–10: Cycles 1–10<br>- Days 11–20: Cycles 1–10<br>- Days 21–30: Cycles 1–10<br>- Day 31: **Cycle 11** |
| **Main Package Quotas** | - **VIP A and above (VIP A, Suite):** Up to 2 portions per mealtime (Breakfast: 2, Lunch: 2, Afternoon: 2).<br>- **VIP B and below (VIP B, Kelas 1, 2, 3):** Breakfast: 2 portions, Lunch: 1 portion, Afternoon: 1 portion. |
| **Extra Package Rules** | Available only for **Lunch (Siang)** and **Afternoon (Sore)**. Charged automatically to hospital patient billing. |
| **Partial Orders** | Patients are free to order 1, 2, or all 3 meals. Unselected meal slots default to `-` in the kitchen dashboard. |
| **Order Immutability** | Once checked out, orders cannot be edited or canceled by the patient (forwarded directly to kitchen production). |

---

## 🛠️ Tech Stack

- **Frontend:**
  - [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)
  - [React Router DOM v7](https://reactrouter.com/)
  - [TailwindCSS v3](https://tailwindcss.com/)
  - [Framer Motion](https://www.framer.com/motion/) (Animations & Transitions)
  - [Lucide React](https://lucide.dev/) (Icons)
  - [React Hot Toast](https://react-hot-toast.zackf.dev/) (Notifications)
  - [@formkit/auto-animate](https://auto-animate.formkit.com/) (Smooth DOM transitions)
- **Backend & Database:**
  - [Supabase](https://supabase.com/) (PostgreSQL & Supabase Edge Functions)
  - [Prisma ORM v7](https://www.prisma.io/) (Data modeling, migrations, client generation, and seeding)

---

## 🗄️ Database Schema (Prisma)

The application uses PostgreSQL with Prisma ORM:

```prisma
// Menu Cycle (1 - 11)
model MenuCycle {
  id          Int        @id
  description String
  menuItems   MenuItem[]
}

// Menu Items in Cycle
model MenuItem {
  id          String    @id @default(uuid())
  name        String
  description String?
  cycleId     Int
  cycle       MenuCycle @relation(fields: [cycleId], references: [id])
  mealTime    MealTime  // PAGI | SIANG | SORE
  paketName   String?   // "Paket A" | "Paket B"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Patient Records
model Patient {
  id          String    @id @default(uuid())
  rmNumber    String    @unique
  name        String
  dob         DateTime
  phone       String?
  address     String?
  roomName    String
  roomClass   String    // VIP_A, Kelas_1, etc.
  allergies   String?
  orders      Order[]
  createdAt   DateTime  @default(now())
}

// Flat Order Transactions
model Order {
  id          String       @id @default(uuid())
  orderCode   String       // ORD-YYYYMMDD-XXX
  patientId   String
  patient     Patient      @relation(fields: [patientId], references: [id])
  roomNumber  String
  classType   String
  menuName    String
  paketName   String?
  mealTime    MealTime     // PAGI | SIANG | SORE
  servingDate DateTime     // T+1
  quantity    Int          @default(1)
  type        OrderType    @default(INCLUDE) // INCLUDE | EXCLUDE
  consumer    Consumer     @default(PASIEN)  // PASIEN | PENDAMPING
  notes       String?
  createdAt   DateTime     @default(now())

  @@index([orderCode])
  @@index([servingDate, mealTime])
  @@index([patientId])
}
```

---

## 📁 Project Structure

```text
Project-Menu-Gizi/
├── prisma/
│   ├── schema.prisma         # Database schema definition
│   ├── seed.js               # Database seeder (11 Cycles, demo patients & orders)
│   └── rls_policies.sql      # Supabase Row Level Security configurations (Hardened)
├── public/                   # Static assets & icons
├── src/
│   ├── assets/               # Local images and graphic assets
│   ├── components/           # Reusable UI & layout components
│   │   ├── guards/           # Route guards (AdminRoute, PatientRoute)
│   │   └── ui/               # Buttons, Tabs, Inputs, Cards, Modals, Tables
│   ├── context/              # React Context (AuthContext, PatientContext, CartContext)
│   ├── hooks/                # Custom React hooks
│   ├── layouts/              # AdminLayout & PatientLayout
│   ├── pages/
│   │   ├── Admin/            # Dashboard, MenuCycle, Statistics, Admin Login
│   │   ├── Patient/          # Login, Onboarding, MenuPortal, Cart, OrderSuccess
│   │   └── ComponentsShowcase.jsx # Development UI gallery (DEV mode only)
│   ├── services/             # Supabase & API services (menuService, orderService)
│   ├── utils/                # Date formatting, cycle calculation, cut-off helpers
│   ├── App.jsx               # Main React router configuration
│   ├── index.css             # TailwindCSS and global styles
│   └── main.jsx              # React entrypoint
├── supabase/
│   └── functions/            # Supabase Edge Functions:
│       ├── admin-login/      # Admin password validation & JWT generation
│       ├── admin-verify/     # Admin session JWT token verification
│       ├── patient-lookup/   # Secure server-side patient search with rate limiting
│       └── create-order/     # Server-side validation (cut-offs, quotas) & transactional insert
├── .env.example              # Environment variables template
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) project or local PostgreSQL instance

### Installation & Environment Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/Saintfai/Project-Menu-Gizi.git
   cd Project-Menu-Gizi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # PostgreSQL Connection (Supabase / Local)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

   # Supabase Client API
   VITE_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

### Database Migration & Seeding

1. **Push Prisma Schema to Database:**
   ```bash
   npx prisma db push
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Seed Initial Data (11 Cycles, Menus, Patients):**
   ```bash
   npm run seed
   ```

### Running the Development Server

Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with HMR |
| `npm run build` | Compiles and builds the production bundle in `/dist` |
| `npm run preview` | Previews the local production build |
| `npm run lint` | Runs ESLint to check for code quality and errors |
| `npm run seed` | Runs `prisma/seed.js` to populate cycle and menu data |

---

## 🔐 Security & Authentication

- **Patient Lookup & Rate Limiting:** Server-side verification via Supabase Edge Function (`patient-lookup`) using IP-based sliding window rate limiting (max 10 req/min) to prevent medical record number brute-force enumeration.
- **Server-Side Order Enforcement:** Orders are submitted and validated via Supabase Edge Function (`create-order`), which server-side enforces cut-off times (WIB), room class quotas, and single checkout session integrity.
- **Admin Authentication:** Protected via serverless Supabase Edge Functions (`admin-login` and `admin-verify`) using secure environment secrets (`ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`) producing signed 8-hour JWT tokens.
- **Hardened Row Level Security (RLS):** Configured in `prisma/rls_policies.sql` to block anonymous client-side reads on `Patient` records and anonymous direct inserts on `Order` records, restricting sensitive operations exclusively to `service_role` Edge Functions.

---

## 👥 Contributors & Acknowledgements

Developed as part of the **Hospital Dietary Internship & Digitalization Project (Kerja Praktek)**.
