# Kishan Seva (किसान सेवा)
### Smart Agricultural Procurement & Queue Management Platform
**"Samay ki bachat, Kisanon ki unnati"**  
*SIH 2026 — Problem Statement ID: 26032*

---

## 🌾 Overview & Problem Statement

Indian farmers routinely face severe challenges when selling their seasonal harvests at government-authorized Mandi procurement centres:
- **Exhausting Queue Waiting Times**: Spending 6–18 hours idling in tractor-trolley queues.
- **Uncertainty & Stalling**: Lack of visibility into current yard congestion and processing throughput.
- **Overcrowded Mandis**: Farmers default to their nearest mandi, causing extreme bottlenecks while neighbouring larger centres remain underutilized.
- **Opacity in Quality Assay & Payouts**: Lack of real-time visibility into moisture grading, weighbridge slips, and Direct Benefit Transfer (DBT) disbursement status.

**Kishan Seva** transforms this process through an end-to-end digital platform that **does NOT simply find the nearest mandi, but computes the most efficient procurement centre for the farmer**.

---

## ⚡ Key Innovations & Features

### 1. 🧠 Smart Centre Recommendation Engine (Explainable Weighted Scoring)
The platform dynamically computes a **0–100 Journey Score** evaluating:
- **25% Distance / Travel Efficiency** (Haversine road model)
- **20% Current Queue Depth** (Live yard count)
- **20% Predicted Waiting Time** (Forecast model)
- **15% Slot Quota Availability**
- **10% Remaining Processing Capacity**
- **5% Processing Speed & Scale Throughput**
- **5% Crop & Quantity Compatibility**

> **Explainability Principle**: The platform clearly explains *why* an optimal centre is recommended (e.g., *"Travelling 2.9 km farther saves ~2 hours of queue waiting"*).

### 2. ⏱️ Queue Prediction & Pre-booked Token Forecasting
- Mathematical model computing waiting times based on checked-in vehicles, rolling average scale throughput (default ~4.5 min/vehicle), and expected slot arrivals.
- Confidence tiers (High / Medium / Low) with non-guaranteed estimated delivery windows.

### 3. 🎫 Digital Tokens & Live Queue Tracker
- Instant digital pass (`KSP-1042`) with QR code, assigned yard sequence, and vehicle number.
- 5-stage live progress stepper (`BOOKED` &rarr; `CHECKED_IN` &rarr; `QUALITY_TESTING` &rarr; `WEIGHMENT` &rarr; `COMPLETED`).
- Supabase Realtime synchronization without page refreshing.

### 4. 🔬 Mandi Operator Console
- **Moisture Assay Lab**: Automated moisture meter capture with FCI quality grading (Grade A &le; 14%, Common &le; 17%, Rejected > 17%).
- **Electronic Weighbridge**: Gross weight, Tare weight, Net weight calculation, automated MSP rate calculation, and official **electronic J-Form (e-J-Form)** generation.

### 5. 📊 State Command & Analytics Portal
- Live real-time dashboard for Directorate of Agriculture with Recharts visualizations.
- Mandi operational status toggling, slot quota management, and CSV audit logs export.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui components, Lucide icons, Recharts, Leaflet & React-Leaflet, Sonner.
- **State Management**: Reactive centralized state engine with cross-tab `localStorage` synchronization and dual-mode Supabase RPC integration.
- **Backend & Database**: Supabase PostgreSQL, Stored Procedures (`create_booking`, `advance_booking_state`), Row Level Security (RLS), Supabase Realtime channels.
- **PWA**: Service worker offline cache, responsive mobile-first bottom navigation.

---

## 📂 Project Structure

```
src/
├── components/
│   ├── auth/              # Route protection (RequireRole, RequireAuth)
│   ├── layout/            # RootLayout, FarmerLayout, OperatorLayout
│   └── ui/                # UI components, Dialogs, Select, Tabs, etc.
├── context/
│   └── SupabaseContext.tsx # Central Auth & Session Provider (useAuth, useSupabase)
├── lib/
│   ├── supabase.ts        # Supabase client initializer & connection checker
│   └── utils.ts           # Classnames helper
├── pages/
│   ├── LandingPage.tsx    # Official Public Landing Page
│   ├── RoleSelection.tsx  # SSO / Role gateway
│   ├── auth/              # FarmerLogin, FarmerRegistration
│   ├── farmer/            # FarmerDashboard, CentreDiscovery, SlotBooking, LiveQueue
│   ├── operator/          # OperatorDashboard, OperatorQueue, QualityCheck, Weighment
│   └── admin/             # AdminDashboard (Command, Mandis, Slots, Analytics, Audits)
├── services/
│   ├── recommendationEngine.ts   # Multi-factor explainable recommendation
│   ├── queuePredictionEngine.ts  # Turnaround & arrival forecast model
│   ├── supabaseAuth.service.ts   # Auth & role session service
│   ├── supabaseData.service.ts   # Data layer with Supabase RPC & realtime
│   ├── mockStore.ts              # Persistent hybrid state engine & 20+ Mandi seed data
│   └── i18n.ts                   # Trilingual support (English, Hindi, Bengali)
└── types/
    └── index.ts                  # Comprehensive TypeScript domain interfaces
```

---

## 🔑 Demo Credentials

| Role | Identifier / Email / Mobile | PIN / OTP | Name |
| :--- | :--- | :--- | :--- |
| **Farmer** | `rohit.mandal@demo.gov.in` *(or 9876543210)* | `123456` | Rohit Mandal (4.3 Acres, Basirhat) |
| **Operator** | `OP-001` | `1234` | Pradip Ghosh (Weighbridge In-charge) |
| **Operator** | `OP-002` | `1234` | Subhasish Das (Chief Quality Inspector) |
| **Admin** | `ADMIN` | `admin123` | State Directorate Admin |

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/rohitmandal2004/Kishan-Seva.git
cd Kishan-Seva
npm install
```

### 2. Configure Environment Variables
Create `.env` from `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Supabase Database (Optional for Cloud Mode)
Execute the idempotent SQL script in `supabase/complete_setup.sql` in your Supabase project SQL Editor.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🧪 End-to-End Verification Scenario

1. **Farmer Experience**:
   - Go to `/roles` &rarr; Enter Farmer Portal with Email `rohit.mandal@demo.gov.in` (OTP: `123456`).
   - Observe Rohit Mandal's Dashboard with 4.3 Acres, Land Khata, and masked Aadhaar `XXXX-XXXX-8842`.
   - Click **Book New Slot** &rarr; Select Paddy (45 Q).
   - The Smart Recommendation Engine identifies **Rajarhat Krishi Mandi (KSP-002)** as the Best Match with Journey Score `92/100` over the Nearest Mandi (`58/100`) because it saves ~2 hours waiting.
   - Confirm booking &rarr; Receive Digital Token **KSP-1042** with QR code.
2. **Operator Flow**:
   - Switch role to Operator (`OP-001`, PIN: `1234`).
   - In Live Token Queue, search `KSP-1042`.
   - Move to **Quality Assay Lab** &rarr; Record Moisture (13.8%) &rarr; Auto-certified **Grade A**.
   - Move to **Weighbridge** &rarr; Enter Gross (62.5 Q) and Tare (17.5 Q) &rarr; Net (45.0 Q) &rarr; Issue **e-J-Form Slip** &rarr; Disburse ₹97,785 via DBT.
3. **Admin Monitoring**:
   - Switch to Admin (`ADMIN`, PIN: `admin123`).
   - Monitor real-time charts (Procurement by Crop, Queue Trends, Mandi Utilization).
   - Export official transaction audit logs as CSV.

---

## 📄 License
Developed for Smart India Hackathon (SIH 2026). Government of India & Ministry of Agriculture and Farmers Welfare.
