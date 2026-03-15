<p align="center">
  <img src="https://img.shields.io/badge/Solana-Testnet%20%7C%20Devnet-14F195?style=for-the-badge&logo=solana&logoColor=white" alt="Solana" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/AI-Qwen%20Plus-FF6A00?style=for-the-badge&logo=alibaba-cloud&logoColor=white" alt="AI" />
</p>

<h1 align="center">🏦 CompliPay AI</h1>

<p align="center">
  <strong>Institutional-Grade Programmable Stablecoin Payment Infrastructure with Built-in Compliance & AI</strong>
</p>

<p align="center">
  Built for <strong>StableHacks 2026</strong> — <em>Programmable Stablecoin Payments</em> Track
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Payment Flow](#-payment-flow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Demo Credentials](#-demo-credentials)
- [Core Demo Flow (3 Minutes)](#-core-demo-flow-3-minutes)
- [Compliance Decision Matrix](#-compliance-decision-matrix)
- [Security & Guardrails](#-security--guardrails)
- [Pages Overview](#-pages-overview)
- [Roadmap & Status](#-roadmap--status)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CompliPay AI** is a Solana-based institutional payment system that enables **programmable stablecoin payments** with a built-in compliance layer and full auditability. It is designed for regulated institutions that need fast settlement, policy enforcement, and transparent controls.

### Problem

Institutions handling cross-border value transfer face:
- ❌ Slow and expensive traditional rails
- ❌ Fragmented compliance processes
- ❌ Manual risk operations
- ❌ Weak real-time transparency for auditors and regulators

### Solution

CompliPay AI combines **fast on-chain settlement** with **strict compliance controls** in one unified workflow:

| Capability | Description |
|---|---|
| **Programmable Payments** | Create escrow, milestone, subscription, and automated treasury payment contracts |
| **Compliance-First Execution** | Mandatory KYC, KYT, AML, and Travel Rule checks before any payment executes |
| **AI-Assisted Operations** | LLM-powered recommendation engine for execution timing, routing, and optimization |
| **On-Chain Evidence** | Real Solana testnet/devnet transaction hashes with explorer deep links |
| **Complete Audit Trail** | Every action and decision is logged with timestamp, actor, and tx reference |

### Target Users

| Persona | Focus |
|---|---|
| 💼 **Treasury Manager** | Fast execution, low cost, FX efficiency |
| 🛡️ **Compliance Officer** | KYC/KYT/AML validation, regulator-ready audit trail |
| 📊 **Ops Analyst** | Payment status monitoring, incident handling |
| 🏛️ **Regulator/Auditor** | Tamper-proof transaction evidence, Travel Rule traceability |

---

## 🚀 Key Features

### Core Payment Engine
- ✅ Create programmable payment contracts (Escrow / Milestone / Subscription / Automated)
- ✅ Define execution conditions and trigger rules
- ✅ Schedule payments with fallback actions
- ✅ Full payment lifecycle management (draft → active → completed)
- ✅ Batch execution for selected payments (`/api/payments/batch-execute`)

### Compliance Engine
- ✅ **KYC (Know Your Customer)** — Identity/business verification gate
- ✅ **KYT (Know Your Transaction)** — Transaction behavior/risk scoring
- ✅ **AML (Anti-Money Laundering)** — Sanctions and illicit finance screening
- ✅ **Travel Rule** — Sender/receiver metadata compliance for threshold transfers
- ✅ Deterministic policy decision matrix: `ALLOW` / `REVIEW` / `BLOCK`
- ✅ External compliance provider connector support

### AI Assistant
- ✅ Live Qwen LLM integration via DashScope API
- ✅ Execution recommendations constrained by policy outcomes
- ✅ Chat interface for operational guidance
- ✅ AI cannot bypass compliance policy engine (guardrail enforced)

### Blockchain Execution
- ✅ Real transaction submission on Solana testnet
- ✅ Automatic fallback to devnet
- ✅ Explicit simulation fallback with clear labeling
- ✅ Explorer deep links for every transaction
- ✅ SPL token transfer flow (USDC/USDT-style mint + transfer on-chain)
- ✅ On-chain policy memo instruction (Memo Program) attached to execution tx

### Security & Auth
- ✅ Session-based authentication with JWT tokens
- ✅ Role-Based Access Control (Admin / Operator / Viewer)
- ✅ Rate limiting on sensitive endpoints
- ✅ SHA-256 password hashing with configurable salt
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

### Data Persistence
- ✅ SQLite database with WAL mode for concurrent access
- ✅ Append-only audit event storage
- ✅ Automatic seed data on first run
- ✅ CSV export for transaction evidence

---

## 🏗️ System Architecture

<p align="center">
  <img src="docs/assets/architecture_diagram.png" alt="CompliPay AI - System Architecture" width="780" />
</p>

CompliPay AI follows a **4-layer architecture** designed for security, auditability, and institutional-grade operations:

### Layer 1: Presentation Layer (React + TypeScript)
The frontend is built with **React 19** and **TypeScript**, providing 9 distinct pages for institutional operations. All pages share a consistent sidebar navigation with role-aware access control.

### Layer 2: Application Layer (State & Business Logic)
Two React contexts manage all client-side state:
- **`AuthContext`** — Authentication, session management, and role enforcement
- **`AppDataContext`** — Payment lifecycle orchestration, compliance flow, and data synchronization with the backend API

### Layer 3: Backend API (Node.js + Express)
A **Node.js server** with Express handles all business logic server-side:
- Authentication and session management
- Payment CRUD and lifecycle operations
- Compliance evaluation (local policy + external provider fallback)
- AI chat proxy (DashScope/Qwen)
- Solana transaction execution
- Audit event persistence in SQLite

### Layer 4: Blockchain Layer (Solana)
Payment execution targets the **Solana blockchain** using `@solana/web3.js`:
1. Primary: Execute on **testnet**
2. Fallback: Execute on **devnet**
3. Final fallback: Generate an explicit **simulation** result with clear labeling

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  Landing │ Dashboard │ Payments │ Compliance │ AI Agent │ ...   │
├─────────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                             │
│  AuthContext (Auth)  │  AppDataContext (State Orchestration)     │
│  CompliancePolicy    │  AI Client (Qwen LLM)                    │
├─────────────────────────────────────────────────────────────────┤
│                    BACKEND API LAYER                             │
│  Auth API │ Payment API │ Compliance API │ AI Proxy │ Audit API │
│                    ┌──────────────┐                              │
│                    │   SQLite DB  │                              │
│                    └──────────────┘                              │
├─────────────────────────────────────────────────────────────────┤
│                    BLOCKCHAIN LAYER                              │
│  Solana Testnet ──→ Devnet Fallback ──→ Simulation Fallback     │
│                    Solana Explorer Deep Links                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Payment Flow

<p align="center">
  <img src="docs/assets/payment_flow_diagram.png" alt="CompliPay AI - Payment Flow" width="680" />
</p>

### End-to-End Payment Execution Flow

```
User creates payment contract
         │
         ▼
┌──────────────────────────┐
│   COMPLIANCE SCREENING   │
│  ┌─────┐ ┌─────┐        │
│  │ KYC │ │ KYT │        │
│  └─────┘ └─────┘        │
│  ┌─────┐ ┌────────────┐ │
│  │ AML │ │Travel Rule │ │
│  └─────┘ └────────────┘ │
└──────────┬───────────────┘
           │
     ┌─────┼──────────┐
     ▼     ▼          ▼
  ALLOW  REVIEW     BLOCK
     │     │          │
     ▼     ▼          ▼
  AI Rec  Manual   Denied
     │   Approval     │
     ▼                │
  Execute             │
  on Solana           │
     │                │
     ▼                ▼
  ┌─────────────────────┐
  │    AUDIT TRAIL       │
  │  (All actions logged │
  │   with evidence)     │
  └─────────────────────┘
```

### Decision Flow Details

1. **Create Payment Contract** — User defines payer, beneficiary, token, amount, and conditions
2. **Run Compliance Screening** — All 4 mandatory checks execute in sequence
3. **Policy Decision** — Engine returns `ALLOW`, `REVIEW`, or `BLOCK` based on check results
4. **AI Recommendation** (optional) — LLM suggests optimal execution strategy
5. **Execute on Solana** — Only `ALLOW` decisions can trigger on-chain execution
6. **Audit Trail** — Every step is recorded with timestamp, actor, and transaction reference

---

## 🛠️ Tech Stack

<p align="center">
  <img src="docs/assets/tech_stack_diagram.png" alt="CompliPay AI - Tech Stack" width="680" />
</p>

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI component framework |
| TypeScript | 5.9 | Type safety and developer experience |
| Vite | 7.2 | Build tool and dev server |
| Tailwind CSS | 4.1 | Utility-first CSS styling |
| React Router | 7.13 | Client-side routing |
| Recharts | 3.8 | Data visualization charts |
| Lucide React | 0.577 | Icon library |
| clsx + tailwind-merge | latest | Conditional class name utilities |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22+ | Server runtime (uses native `node:sqlite`) |
| Express | 5.2 | HTTP server framework |
| SQLite | native | Persistent data storage (WAL mode) |
| dotenv | 17.3 | Environment variable management |

### Blockchain

| Technology | Version | Purpose |
|---|---|---|
| @solana/web3.js | 1.98 | Solana blockchain interaction |
| Solana Testnet/Devnet | — | Transaction submission networks |

### AI/ML

| Technology | Purpose |
|---|---|
| Qwen Plus (DashScope) | LLM for operational recommendations |
| OpenAI-compatible API | Standardized chat completion endpoint |

### DevTools

| Technology | Purpose |
|---|---|
| Concurrently | Run frontend + backend simultaneously |
| vite-plugin-singlefile | Single-file production build |
| @tailwindcss/vite | Vite-native Tailwind integration |

---

## 📁 Project Structure

```
CompliPay AI/
│
├── 📄 index.html                    # HTML entry point
├── 📄 package.json                  # Dependencies and scripts
├── 📄 vite.config.ts                # Vite + React + Tailwind config
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 .env.example                  # Environment variable template
├── 📄 .gitignore                    # Git ignore rules
├── 📄 PRD.md                        # Product Requirements Document
│
├── 📂 src/                          # Frontend source code
│   ├── 📄 main.tsx                  # React app entry point
│   ├── 📄 App.tsx                   # Router and protected layout
│   ├── 📄 index.css                 # Global styles and Tailwind imports
│   │
│   ├── 📂 pages/                    # Route-level page components
│   │   ├── 📄 LandingPage.tsx       # Public marketing/pitch landing page
│   │   ├── 📄 LandingPage.css       # Landing page custom styles
│   │   ├── 📄 Login.tsx             # Authentication login form
│   │   ├── 📄 Dashboard.tsx         # Operational KPI dashboard with charts
│   │   ├── 📄 Payments.tsx          # Programmable payment workflow UI
│   │   ├── 📄 Compliance.tsx        # Compliance monitoring & alert handling
│   │   ├── 📄 AIAgent.tsx           # AI assistant chat & automation tasks
│   │   ├── 📄 AuditTrail.tsx        # Filterable operational audit events
│   │   ├── 📄 Transactions.tsx      # Transaction evidence & export
│   │   ├── 📄 Wallets.tsx           # Institutional wallet management
│   │   └── 📄 Settings.tsx          # Profile, KYC, security, API settings
│   │
│   ├── 📂 components/               # Shared UI components
│   │   ├── 📄 Layout.tsx            # Sidebar navigation + header layout
│   │   └── 📄 StatCard.tsx          # Reusable KPI stat card
│   │
│   ├── 📂 context/                  # React context providers
│   │   ├── 📄 AuthContext.tsx       # Authentication state & session
│   │   └── 📄 AppDataContext.tsx    # App-wide data orchestration
│   │
│   ├── 📂 lib/                      # Core business logic
│   │   ├── 📄 api.ts               # HTTP client with auth token mgmt
│   │   ├── 📄 aiClient.ts          # AI chat API client
│   │   ├── 📄 compliancePolicy.ts  # Deterministic compliance engine
│   │   └── 📄 solanaExecutor.ts    # Solana blockchain executor
│   │
│   ├── 📂 types/                    # TypeScript type definitions
│   │   └── 📄 index.ts             # All shared interfaces
│   │
│   ├── 📂 data/                     # Mock/seed data
│   │   └── 📄 mockData.ts          # Demo scenario seed data
│   │
│   └── 📂 utils/                    # Utility functions
│       └── 📄 cn.ts                # clsx + tailwind-merge helper
│
├── 📂 server/                       # Backend API server
│   ├── 📄 server.js                 # Express server (1100+ lines)
│   │                                # - Auth (login/logout/session)
│   │                                # - Payment CRUD & lifecycle
│   │                                # - Compliance evaluation
│   │                                # - AI chat proxy
│   │                                # - Solana execution
│   │                                # - Audit event logging
│   │                                # - Wallet management
│   │                                # - Rate limiting & RBAC
│   │
│   └── 📂 data/                     # Database storage
│       └── 📄 complipay.db          # SQLite database (auto-created)
│
├── 📂 design-system/                # Design tokens
│   └── 📄 tokens.css                # CSS custom properties & base styles
│
├── 📂 prototype/                    # Interactive one-page prototype
│   ├── 📄 index.html                # Prototype HTML structure
│   ├── 📄 styles.css                # Prototype CSS styling
│   └── 📄 app.js                    # Prototype interaction simulation
│
├── 📂 docs/                         # Project documentation
│   ├── 📄 ARCHITECTURE.md           # Architecture & data-flow details
│   ├── 📄 ROADMAP.md                # Phase-by-phase delivery tracker
│   ├── 📄 DEMO_RUNBOOK.md           # Live demo script (3 minutes)
│   ├── 📄 SUBMISSION_CHECKLIST.md   # Pre-submit checklist
│   ├── 📄 UI_UX_DESIGN.md           # UI/UX design blueprint
│   ├── 📄 PROJECT_AUDIT_REPORT.md   # Code audit report
│   └── 📂 assets/                   # Architecture diagrams & images
│       ├── 📄 architecture_diagram.png
│       ├── 📄 payment_flow_diagram.png
│       └── 📄 tech_stack_diagram.png
│
└── 📂 dist/                         # Production build output
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** ≥ 22.0 (required for native `node:sqlite` module)
- **npm** ≥ 9.0

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/complipay-ai.git
cd complipay-ai

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Configure your API key (see Environment Variables section)
# Edit .env and set DASHSCOPE_API_KEY=your_key_here

# 5. Start development servers (frontend + backend concurrently)
npm run dev
```

### Application URLs

| Service | URL | Description |
|---|---|---|
| **Landing Page** | `http://localhost:5173/` | Public marketing page |
| **Login** | `http://localhost:5173/login` | Authentication page |
| **Dashboard** | `http://localhost:5173/dashboard` | Main operations dashboard |
| **API Health** | `http://localhost:8787/api/health` | Backend health check |

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start frontend + backend concurrently |
| `dev:web` | `npm run dev:web` | Start Vite dev server only |
| `dev:server` | `npm run dev:server` | Start Express API server only |
| `build` | `npm run build` | Create production build |
| `preview` | `npm run preview` | Preview production build |
| `start` | `npm run start` | Run production server |

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# ─── Server Configuration ─────────────────────────────────
SERVER_PORT=8787                         # API server port
SESSION_TTL_HOURS=24                     # Session duration
AUTH_PASSWORD_SALT=change-this-salt      # Password hashing salt

# ─── AI Configuration (Required for AI features) ──────────
DASHSCOPE_API_KEY=your_key_here          # Alibaba DashScope API key
# MODEL_STUDIO_API_KEY=                  # Alternative key name
AI_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen-plus                       # LLM model name
AI_SYSTEM_PROMPT=...                     # Custom system prompt (optional)

# ─── Compliance Provider (Optional) ───────────────────────
COMPLIANCE_PROVIDER_URL=                 # External compliance API endpoint
COMPLIANCE_PROVIDER_KEY=                 # External compliance API key

# ─── Solana Configuration (Optional) ──────────────────────
SOLANA_WALLET_CLUSTER=devnet             # Wallet balance query cluster
SOLANA_RPC_ENDPOINT=                     # Custom RPC endpoint override

# ─── SPL Execution Tuning (Optional) ──────────────────────
SPL_DEFAULT_DECIMALS=6                   # Decimals used for demo SPL mint
MEMO_PROGRAM_ID=MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
```

> **Note:** The AI chat feature requires a valid `DASHSCOPE_API_KEY`. All other features work without external API keys.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Login with email/password → returns JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current authenticated user |
| `POST` | `/api/auth/logout` | ✅ | Invalidate current session |

### Payments

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/payments` | ✅ | admin, operator | Create new payment contract |
| `POST` | `/api/payments/:id/compliance` | ✅ | admin, operator | Run compliance checks |
| `POST` | `/api/payments/:id/ai-recommendation` | ✅ | admin, operator | Request AI execution recommendation |
| `POST` | `/api/payments/:id/execute` | ✅ | admin, operator | Execute payment on Solana |
| `POST` | `/api/payments/batch-execute` | ✅ | admin, operator | Execute multiple policy-allowed payments in one batch |

### Compliance

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/compliance/alerts/:id/resolve` | ✅ | admin, operator | Resolve a compliance alert |

### Wallets

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/wallets/refresh` | ✅ | admin, operator | Refresh wallet balances from RPC |

### AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | ✅ | Send message to AI assistant |

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Health check and configuration status |
| `GET` | `/api/bootstrap` | ✅ | Load all initial app data in one request |

---

## 🗄️ Database Schema

CompliPay AI uses **SQLite** with **WAL (Write-Ahead Logging)** mode for optimal concurrent read performance.

```sql
-- Core tables
users              -- Institutional user accounts with roles
sessions           -- JWT session tokens with TTL
payments           -- Programmable payment contracts
transactions       -- Executed transaction records
compliance_alerts  -- Compliance check alerts
ai_tasks           -- AI agent task registry
wallets            -- Institutional wallet addresses
audit_events       -- Append-only audit event log
```

### Entity Relationship

```
users ──1:N──→ sessions
payments ──1:1──→ compliance_result (JSON)
payments ──1:N──→ compliance_alerts
payments ──1:N──→ transactions
transactions ──→ audit_events (referenced by ID)
payments ──→ audit_events (referenced by ID)
```

### Key Schema Details

| Table | Primary Key | Notable Fields |
|---|---|---|
| `users` | `id` (TEXT) | `email` (UNIQUE), `role`, `kyc_status`, `password_hash` |
| `sessions` | `token` (TEXT) | `user_id` (FK), `expires_at` |
| `payments` | `id` (TEXT) | `compliance_result_json`, `conditions_json`, `last_tx_hash` |
| `transactions` | `id` (TEXT) | `tx_hash`, `explorer_url`, `network`, `simulated` |
| `compliance_alerts` | `id` (TEXT) | `type`, `severity`, `status`, `payment_id` |
| `audit_events` | `id` (TEXT) | `category`, `action`, `message`, `payment_id`, `transaction_id` |
| `wallets` | `address` (TEXT) | `balance`, `currency`, `provider`, `status` |

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@complipay.ai` | `Admin123!` | Full access (create, execute, manage) |
| **Operator** | `ops@complipay.ai` | `Ops123!` | Operational access (create, execute) |
| **Viewer** | `viewer@complipay.ai` | `View123!` | Read-only dashboard access |

---

## 🎬 Core Demo Flow (3 Minutes)

```
Step 1 ─→ Open Landing Page and click "Launch Dashboard"
Step 2 ─→ Login with admin@complipay.ai / Admin123!
Step 3 ─→ View Dashboard KPIs and operational metrics
Step 4 ─→ Navigate to "Payments" and create a new programmable payment
Step 5 ─→ Run Compliance Checks (see ALLOW / REVIEW / BLOCK decision)
Step 6 ─→ Request AI Recommendation for the payment
Step 7 ─→ Execute payment (click "Execute Now" or "Execute With AI")
Step 8 ─→ Navigate to "Transactions" — verify tx hash and explorer link
Step 9 ─→ Navigate to "Audit Trail" — review all logged events
Step 10 ─→ Show Compliance Center alerts and resolution workflow
```

> 📖 For the full demo script, see [`docs/DEMO_RUNBOOK.md`](docs/DEMO_RUNBOOK.md)

---

## 🛡️ Compliance Decision Matrix

### Mandatory Checks

| Check | Input | Pass Condition | Fail Condition |
|---|---|---|---|
| **KYC** | `recipientKycVerified` | Recipient is verified | Recipient not verified → `BLOCK` |
| **KYT** | `amount` | Amount ≤ $500,000 | Amount > $500,000 → `REVIEW` |
| **AML** | `recipient` name | No sanction match | Name contains "sanction"/"blocked" → `BLOCK` |
| **Travel Rule** | `amount` + `travelRuleReady` | Amount ≤ $250K OR metadata ready | Amount > $250K + incomplete → `REVIEW` |

### Decision Logic

| Condition | Decision | Action |
|---|---|---|
| All checks `pass` | ✅ **ALLOW** | Payment can be executed automatically |
| Any check `review` (no `fail`) | ⚠️ **REVIEW** | Manual approval required |
| Any check `fail` | 🚫 **BLOCK** | Execution denied until resolved |

### Scoring System

| Check Status | Points |
|---|---|
| `pass` | 25 |
| `review` | 15 |
| `fail` | 0 |

**Maximum score: 100** (all 4 checks pass)

---

## 🔒 Security & Guardrails

### Authentication & Authorization
- **Session-based auth** with UUID tokens stored in SQLite
- **RBAC enforcement** on all mutation endpoints (admin, operator, viewer)
- **Rate limiting** on login endpoint (20 requests/minute per IP)
- **SHA-256 password hashing** with configurable salt

### Compliance Guardrails
- **Policy engine is authoritative** — executions blocked unless `decision === 'allow'`
- **AI cannot bypass compliance** — recommendations are advisory only
- **Append-only audit log** — all actions recorded immutably

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

### MVP-Scope Limitations
- No private institutional keys embedded in code
- Solana execution uses ephemeral runtime keypairs for demo
- External compliance/custody provider integrations are connector-ready but not production-deployed

---

## 📱 Pages Overview

| # | Page | Route | Description |
|---|---|---|---|
| 1 | **Landing** | `/` | Public marketing page with hackathon pitch |
| 2 | **Login** | `/login` | Secure login with role-based session |
| 3 | **Dashboard** | `/dashboard` | KPI cards, volume charts, compliance metrics |
| 4 | **Payments** | `/payments` | Full payment lifecycle: create → comply → execute |
| 5 | **Compliance** | `/compliance` | Alert monitoring, resolution, and metrics |
| 6 | **AI Agent** | `/ai-agent` | Chat-based AI assistant + task automation |
| 7 | **Audit Trail** | `/audit-trail` | Filterable evidence log with timestamps |
| 8 | **Transactions** | `/transactions` | Tx history, explorer links, CSV export |
| 9 | **Wallets** | `/wallets` | Institutional wallet management + RPC refresh |
| 10 | **Settings** | `/settings` | Profile, KYC status, security, API keys |

---

## 📊 Roadmap & Status

### Overall Production Readiness: **86%**

| Phase | Weight | Progress | Description |
|---|---|---|---|
| Scope & Setup | 15% | 🟢 95% | Scope locked, fullstack runtime stable |
| Core Payment | 20% | 🟢 100% | API-backed, SPL execution path, and batch execution are implemented |
| Compliance Engine | 20% | 🟡 75% | Policy logic persistent, external provider connector ready |
| Audit Trail | 15% | 🟢 80% | Persisted and shown in filterable UI |
| AI Guardrails | 12% | 🟡 78% | Live LLM chat with policy constraint |
| UI/UX Polish | 10% | 🟢 90% | Strong presentation quality |
| Submission Assets | 8% | 🟡 74% | Core docs ready, final assets pending |

### Page-by-Page Status

| Page | Status | Notes |
|---|---|---|
| Landing `/` | 🟢 95% | Near-final visual delivery |
| Dashboard `/dashboard` | 🟡 78% | Persistent API state consumption |
| Payments `/payments` | 🟢 90% | Full API-backed lifecycle + multi-select batch execution |
| Compliance `/compliance` | 🟡 75% | Persistent alerts and resolution |
| AI Agent `/ai-agent` | 🟢 80% | Live Qwen chat integrated |
| Audit Trail `/audit-trail` | 🟡 78% | Append-only persistent logs |
| Transactions `/transactions` | 🟡 76% | Pagination and export available |
| Wallets `/wallets` | 🟡 65% | API-backed with RPC refresh |
| Settings `/settings` | 🟡 60% | Auth-aware, full persistence pending |

### Post-Hackathon Plan

| Phase | Goal |
|---|---|
| **Phase A** — Hardening | Integration tests, fault handling, RBAC expansion |
| **Phase B** — Pilot Readiness | Real compliance providers, custody workflows, audit export |
| **Phase C** — Demo Day | Performance optimization, pitch deck, judge Q&A prep |

---

## 📚 Documentation

| Document | Path | Description |
|---|---|---|
| Product Requirements | [`PRD.md`](PRD.md) | Full product specification and hackathon context |
| Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and data-flow details |
| Roadmap | [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phase-by-phase delivery tracker with progress |
| Demo Runbook | [`docs/DEMO_RUNBOOK.md`](docs/DEMO_RUNBOOK.md) | Step-by-step live demo script (3 minutes) |
| Submission Checklist | [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) | Pre-submit verification checklist |
| UI/UX Design | [`docs/UI_UX_DESIGN.md`](docs/UI_UX_DESIGN.md) | UI/UX design blueprint and screen specs |
| Audit Report | [`docs/PROJECT_AUDIT_REPORT.md`](docs/PROJECT_AUDIT_REPORT.md) | Comprehensive code audit findings |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Notes

- Run `npm run dev` to start both frontend and backend concurrently
- The SQLite database is auto-created on first run with seed data
- All compliance decisions are logged as audit events
- Frontend proxies `/api/*` requests to the backend via Vite config

---

## 📝 License

This project was built for **StableHacks 2026** hackathon submission.

---

## 🏆 Hackathon Context

| Detail | Value |
|---|---|
| **Event** | StableHacks 2026 |
| **Platform** | DoraHacks (fully online) |
| **Track** | Programmable Stablecoin Payments |
| **Period** | March 13 – March 22, 2026 |
| **Demo Day** | Zurich, May 28, 2026 (Top 10) |

### Required Submission Artifacts
- ✅ Public GitHub repository
- ✅ Project name, team members, country
- ⬜ Loom video (≤ 3 minutes)
- ⬜ Testnet demo link
- ⬜ Final submission on DoraHacks

---

<p align="center">
  <strong>Built with ❤️ for StableHacks 2026</strong>
  <br />
  <em>Programmable. Compliant. Auditable.</em>
</p>
