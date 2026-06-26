# 🏢 Shivalik AI Property Experience & CRM Platform

India's first AI & AR-driven property discovery, 3D interactive visualization, and full-stack CRM intelligence portal designed for modern home buyers, brokers, and developers.

---

## 📸 3D Property Visualization & Experience Showcase

### 🛋️ Luxury AI-Generated 3D Interior Styler
Below is the real-time simulation output of the **3D Room Customizer and Interior Designer** showing modern glassmorphic lighting and customized furniture layouts:

![3D Luxury Interior Style](public/interior_luxury.png)

### 🌇 Shivalik Residential High-Rise Portfolios
Experience structural height mappings, sunlight ratings, and interactive walk-through vacancies inside our featured properties:

![Shivalik Skyview Tower](public/skyview.png)

---

## ⚡ Core Features

### 1. 3D Township Explorer
* **Interactive WebGL Vector Canvas**: Directly map coordinates of towers, community pools, and green yoga sanctuaries.
* **Smart Orientation Metrics**: Sunlight indexes (hours/day), noise levels, and investment score telemetry.

### 2. Personal Customer Portal
* **Milestone Payout Tracker**: Clear installment schedulers with GST (18%) and pdfTax receipts.
* **Verified KYC Locker**: Aadhaar and PAN verification indicators with secure file upload.
* **Instant Digital Brochures**: Direct RERA approved booklet downloads.

### 3. CRM Lead Intelligence Dashboard
* **10-Stage Kanban Pipeline**: Track transactions from "New Lead" to "Closed/Lost".
* **Follow-up Reminders Center**: Reminders, due date triggers, and executive task assignments.
* **Builder & Broker Directories**: Payout terms, RERA registrations, and referrals records.
* **Executive Boardroom Analytics**: Gross Sales Value, traffic acquisition channels, and agent rankings.
* **AI Copilot**: Instantly generate customized WhatsApp messages, follow-up emails, and interaction logs.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite (HMR), HTML5 Canvas/WebGL, CSS variables.
* **Database**: Live Convex Cloud Backend (Real-time schema subscriptions, mutations, and query caching).
* **PDF Exporter**: jsPDF.
* **Analytics Rendering**: Chart.js.

---

## 🚀 Setup & Launching Locally

### 1. Clone & Install Packages
```bash
git clone https://github.com/Sujaltalreja04/Shivalik.git
cd "shivalik group"
npm install
```

### 2. Sync Convex Cloud Database
Make sure you have `npx convex dev` running to set up and bind your local workspace variables.
```bash
npx convex dev
```

### 3. Deploy Schema and Seed Mock Records
To push functions and seed the database with rich real-estate details:
```bash
npx convex deploy -y
npx convex run seed:seedDatabase
```

### 4. Boot Dev Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.
