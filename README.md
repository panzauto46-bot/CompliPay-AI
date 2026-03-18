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

<h1 align="center">ðŸ¦ CompliPay AI</h1>

<p align="center">
  <strong>Institutional-Grade Programmable Stablecoin Payment Infrastructure with Built-in Compliance & AI</strong>
</p>

<p align="center">
  Built for <strong>StableHacks 2026</strong> â€” <em>Programmable Stablecoin Payments</em> Track
</p>

---

## ðŸ“‹ Table of Contents

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

## ðŸŒŸ Overview

**CompliPay AI** is a Solana-based institutional payment system that enables **programmable stablecoin payments** with a built-in compliance layer and full auditability. It is designed for regulated institutions that need fast settlement, policy enforcement, and transparent controls.

### Problem

Institutions handling cross-border value transfer face:
- âŒ Slow and expensive traditional rails
- âŒ Fragmented compliance processes
- âŒ Manual risk operations
- âŒ Weak real-time transparency for auditors and regulators

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
| ðŸ’¼ **Treasury Manager** | Fast execution, low cost, FX efficiency |
| ðŸ›¡ï¸ **Compliance Officer** | KYC/KYT/AML validation, regulator-ready audit trail |
| ðŸ“Š **Ops Analyst** | Payment status monitoring, incident handling |
| ðŸ›ï¸ **Regulator/Auditor** | Tamper-proof transaction evidence, Travel Rule traceability |

---

## ðŸš€ Key Features

### Core Payment Engine
- âœ… Create programmable payment contracts (Escrow / Milestone / Subscription / Automated)
- âœ… Define execution conditions and trigger rules
- âœ… Schedule payments with fallback actions
- âœ… Full payment lifecycle management (draft â†’ active â†’ completed)
- âœ… Batch execution for selected payments (`/api/payments/batch-execute`)

### Compliance Engine
- âœ… **KYC (Know Your Customer)** â€” Identity/business verification gate
- âœ… **KYT (Know Your Transaction)** â€” Transaction behavior/risk scoring
- âœ… **AML (Anti-Money Laundering)** â€” Sanctions and illicit finance screening
- âœ… **Travel Rule** â€” Sender/receiver metadata compliance for threshold transfers
- âœ… Deterministic policy decision matrix: `ALLOW` / `REVIEW` / `BLOCK`
- âœ… External compliance provider connector support

### AI Assistant
- âœ… Live Qwen LLM integration via DashScope API
- âœ… Execution recommendations constrained by policy outcomes
- âœ… Chat interface for operational guidance
- âœ… AI cannot bypass compliance policy engine (guardrail enforced)

### Blockchain Execution
- âœ… Real transaction submission on Solana testnet
- âœ… Automatic fallback to devnet
- âœ… Explicit simulation fallback with clear labeling
- âœ… Explorer deep links for every transaction
- âœ… SPL token transfer flow (USDC/USDT-style mint + transfer on-chain)
- âœ… On-chain policy memo instruction (Memo Program) attached to execution tx

### Security & Auth
- âœ… Session-based authentication with opaque Bearer session tokens
- âœ… Role-Based Access Control (Admin / Operator / Viewer)
- âœ… Rate limiting on sensitive endpoints
- âœ… PBKDF2 password hashing (legacy SHA-256 migration supported)
- âœ… Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

### Data Persistence
- âœ… SQLite database with WAL mode for concurrent access
- âœ… Append-only audit event storage
- âœ… Automatic seed data on first run
- âœ… CSV export for transaction evidence

---

## ðŸ—ï¸ System Architecture

<p align="center">
  <img src="docs/assets/architecture_diagram.png" alt="CompliPay AI - System Architecture" width="780" />
</p>

CompliPay AI follows a **4-layer architecture** designed for security, auditability, and institutional-grade operations:

### Layer 1: Presentation Layer (React + TypeScript)
The frontend is built with **React 19** and **TypeScript**, providing 9 distinct pages for institutional operations. All pages share a consistent sidebar navigation with role-aware access control.

### Layer 2: Application Layer (State & Business Logic)
Two React contexts manage all client-side state:
- **`AuthContext`** â€” Authentication, session management, and role enforcement
- **`AppDataContext`** â€” Payment lifecycle orchestration, compliance flow, and data synchronization with the backend API

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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    PRESENTATION LAYER                           â”‚
â”‚  Landing â”‚ Dashboard â”‚ Payments â”‚ Compliance â”‚ AI Agent â”‚ ...   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                    APPLICATION LAYER                             â”‚
â”‚  AuthContext (Auth)  â”‚  AppDataContext (State Orchestration)     â”‚
â”‚  CompliancePolicy    â”‚  AI Client (Qwen LLM)                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                    BACKEND API LAYER                             â”‚
â”‚  Auth API â”‚ Payment API â”‚ Compliance API â”‚ AI Proxy â”‚ Audit API â”‚
â”‚                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                              â”‚
â”‚                    â”‚   SQLite DB  â”‚                              â”‚
â”‚                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                    BLOCKCHAIN LAYER                              â”‚
â”‚  Solana Testnet â”€â”€â†’ Devnet Fallback â”€â”€â†’ Simulation Fallback     â”‚
â”‚                    Solana Explorer Deep Links                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ”„ Payment Flow

<p align="center">
  <img src="docs/assets/payment_flow_diagram.png" alt="CompliPay AI - Payment Flow" width="680" />
</p>

### End-to-End Payment Execution Flow

```
User creates payment contract
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   COMPLIANCE SCREENING   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”        â”‚
â”‚  â”‚ KYC â”‚ â”‚ KYT â”‚        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚ AML â”‚ â”‚Travel Rule â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â”‚
     â”Œâ”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
     â–¼     â–¼          â–¼
  ALLOW  REVIEW     BLOCK
     â”‚     â”‚          â”‚
     â–¼     â–¼          â–¼
  AI Rec  Manual   Denied
     â”‚   Approval     â”‚
     â–¼                â”‚
  Execute             â”‚
  on Solana           â”‚
     â”‚                â”‚
     â–¼                â–¼
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚    AUDIT TRAIL       â”‚
  â”‚  (All actions logged â”‚
  â”‚   with evidence)     â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Decision Flow Details

1. **Create Payment Contract** â€” User defines payer, beneficiary, token, amount, and conditions
2. **Run Compliance Screening** â€” All 4 mandatory checks execute in sequence
3. **Policy Decision** â€” Engine returns `ALLOW`, `REVIEW`, or `BLOCK` based on check results
4. **AI Recommendation** (optional) â€” LLM suggests optimal execution strategy
5. **Execute on Solana** â€” Only `ALLOW` decisions can trigger on-chain execution
6. **Audit Trail** â€” Every step is recorded with timestamp, actor, and transaction reference

---

## ðŸ› ï¸ Tech Stack

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
| Solana Testnet/Devnet | â€” | Transaction submission networks |

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

## ðŸ“ Project Structure

```
CompliPay AI/
â”‚
â”œâ”€â”€ ðŸ“„ index.html                    # HTML entry point
â”œâ”€â”€ ðŸ“„ package.json                  # Dependencies and scripts
â”œâ”€â”€ ðŸ“„ vite.config.ts                # Vite + React + Tailwind config
â”œâ”€â”€ ðŸ“„ vercel.json                   # SPA rewrite config for Vercel
â”œâ”€â”€ ðŸ“„ tsconfig.json                 # TypeScript configuration
â”œâ”€â”€ ðŸ“„ .env.example                  # Environment variable template
â”œâ”€â”€ ðŸ“„ .gitignore                    # Git ignore rules
â”œâ”€â”€ ðŸ“„ PRD.md                        # Product Requirements Document
â”‚
â”œâ”€â”€ ðŸ“‚ src/                          # Frontend source code
â”‚   â”œâ”€â”€ ðŸ“„ main.tsx                  # React app entry point
â”‚   â”œâ”€â”€ ðŸ“„ App.tsx                   # Router and protected layout
â”‚   â”œâ”€â”€ ðŸ“„ index.css                 # Global styles and Tailwind imports
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ pages/                    # Route-level page components
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ LandingPage.tsx       # Public marketing/pitch landing page
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ LandingPage.css       # Landing page custom styles
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ Login.tsx             # Authentication login form
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ Dashboard.tsx         # Operational KPI dashboard with charts
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ Payments.tsx          # Programmable payment workflow UI
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ Compliance.tsx        # Compliance monitoring & alert handling
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ AIAgent.tsx           # AI assistant chat & automation tasks
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ AuditTrail.tsx        # Filterable operational audit events
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ Transactions.tsx      # Transaction evidence & export
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ Wallets.tsx           # Institutional wallet management
â”‚   â”‚   â””â”€â”€ ðŸ“„ Settings.tsx          # Profile, KYC, security, API settings
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ components/               # Shared UI components
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ Layout.tsx            # Sidebar navigation + header layout
â”‚   â”‚   â””â”€â”€ ðŸ“„ StatCard.tsx          # Reusable KPI stat card
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ context/                  # React context providers
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ AuthContext.tsx       # Authentication state & session
â”‚   â”‚   â””â”€â”€ ðŸ“„ AppDataContext.tsx    # App-wide data orchestration
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ lib/                      # Core business logic
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ api.ts               # HTTP client with auth token mgmt
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ aiClient.ts          # AI chat API client
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ compliancePolicy.ts  # Deterministic compliance engine
â”‚   â”‚   â””â”€â”€ ðŸ“„ solanaExecutor.ts    # Solana blockchain executor
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ types/                    # TypeScript type definitions
â”‚   â”‚   â””â”€â”€ ðŸ“„ index.ts             # All shared interfaces
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ data/                     # Mock/seed data
â”‚   â”‚   â””â”€â”€ ðŸ“„ mockData.ts          # Demo scenario seed data
â”‚   â”‚
â”‚   â””â”€â”€ ðŸ“‚ utils/                    # Utility functions
â”‚       â””â”€â”€ ðŸ“„ cn.ts                # clsx + tailwind-merge helper
â”‚
â”œâ”€â”€ ðŸ“‚ server/                       # Backend API server
â”‚   â”œâ”€â”€ ðŸ“„ server.js                 # Express server (1100+ lines)
â”‚   â”‚                                # - Auth (login/logout/session)
â”‚   â”‚                                # - Payment CRUD & lifecycle
â”‚   â”‚                                # - Compliance evaluation
â”‚   â”‚                                # - AI chat proxy
â”‚   â”‚                                # - Solana execution
â”‚   â”‚                                # - Audit event logging
â”‚   â”‚                                # - Wallet management
â”‚   â”‚                                # - Rate limiting & RBAC
â”‚   â”‚
â”‚   â””â”€â”€ ðŸ“‚ data/                     # Database storage
â”‚       â””â”€â”€ ðŸ“„ complipay.db          # SQLite database (auto-created)
â”‚
â”œâ”€â”€ ðŸ“‚ design-system/                # Design tokens
â”‚   â””â”€â”€ ðŸ“„ tokens.css                # CSS custom properties & base styles
â”‚
â”œâ”€â”€ ðŸ“‚ prototype/                    # Interactive one-page prototype
â”‚   â”œâ”€â”€ ðŸ“„ index.html                # Prototype HTML structure
â”‚   â”œâ”€â”€ ðŸ“„ styles.css                # Prototype CSS styling
â”‚   â””â”€â”€ ðŸ“„ app.js                    # Prototype interaction simulation
â”‚
â”œâ”€â”€ ðŸ“‚ docs/                         # Project documentation
â”‚   â”œâ”€â”€ ðŸ“„ ARCHITECTURE.md           # Architecture & data-flow details
â”‚   â”œâ”€â”€ ðŸ“„ ROADMAP.md                # Phase-by-phase delivery tracker
â”‚   â”œâ”€â”€ ðŸ“„ DEMO_RUNBOOK.md           # Live demo script (3 minutes)
â”‚   â”œâ”€â”€ ðŸ“„ SUBMISSION_CHECKLIST.md   # Pre-submit checklist
â”‚   â”œâ”€â”€ ðŸ“„ UI_UX_DESIGN.md           # UI/UX design blueprint
â”‚   â”œâ”€â”€ ðŸ“„ PROJECT_AUDIT_REPORT.md   # Code audit report
â”‚   â””â”€â”€ ðŸ“‚ assets/                   # Architecture diagrams & images
â”‚       â”œâ”€â”€ ðŸ“„ architecture_diagram.png
â”‚       â”œâ”€â”€ ðŸ“„ payment_flow_diagram.png
â”‚       â””â”€â”€ ðŸ“„ tech_stack_diagram.png
â”‚
â””â”€â”€ ðŸ“‚ dist/                         # Production build output
```

---

## âš¡ Getting Started

### Prerequisites

- **Node.js** â‰¥ 22.0 (required for native `node:sqlite` module)
- **npm** â‰¥ 9.0

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

## ðŸ” Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# â”€â”€â”€ Frontend Configuration (for separate frontend/backend domains) â”€â”€â”€â”€â”€â”€
VITE_API_BASE_URL=                      # Example: https://your-backend.example.com

# â”€â”€â”€ Server Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
SERVER_PORT=8787                         # API server port
DATABASE_URL=                           # Optional: Supabase Postgres URI (stores persistent SQLite snapshot on Vercel)
SESSION_TTL_HOURS=24                     # Session duration
AUTH_PASSWORD_SALT=change-this-salt      # Legacy fallback salt for old hashes
AUTH_PBKDF2_ITERATIONS=210000            # PBKDF2 iteration count
SESSION_TOKEN_PEPPER=change-this-session-pepper  # Pepper used to hash session tokens at rest
TRUST_PROXY=false                        # Explicit proxy trust control
CORS_ORIGIN=*                            # Comma-separated origins for browser API calls

# â”€â”€â”€ AI Configuration (Required for AI features) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DASHSCOPE_API_KEY=your_key_here          # Alibaba DashScope API key
# MODEL_STUDIO_API_KEY=                  # Alternative key name
AI_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen-plus                       # LLM model name
AI_SYSTEM_PROMPT=...                     # Custom system prompt (optional)

# â”€â”€â”€ Compliance Provider (Optional) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
COMPLIANCE_PROVIDER_URL=                 # External compliance API endpoint
COMPLIANCE_PROVIDER_KEY=                 # External compliance API key

# â”€â”€â”€ Solana Configuration (Optional) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
SOLANA_WALLET_CLUSTER=devnet             # Wallet balance query cluster
SOLANA_RPC_ENDPOINT=                     # Custom RPC endpoint override
USDC_TOKEN_MINT=                         # Optional mint for USDC SPL balance refresh
USDT_TOKEN_MINT=                         # Optional mint for USDT SPL balance refresh

# â”€â”€â”€ SPL Execution Tuning (Optional) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
SPL_DEFAULT_DECIMALS=6                   # Decimals used for demo SPL mint
MEMO_PROGRAM_ID=MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
```

> **Note:**  
> - The AI chat feature requires a valid `DASHSCOPE_API_KEY`.  
> - If frontend and backend are deployed on different domains (for example Vercel frontend + external API), set:
>   - `VITE_API_BASE_URL` on the frontend deployment.
>   - `CORS_ORIGIN` on the backend deployment (set to the frontend URL).

---

## ðŸ“¡ API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | âŒ | Login with email/password â†’ returns Bearer session token |
| `GET` | `/api/auth/me` | âœ… | Get current authenticated user |
| `POST` | `/api/auth/logout` | âœ… | Invalidate current session |

### Payments

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/payments` | âœ… | admin, operator | Create new payment contract |
| `POST` | `/api/payments/:id/compliance` | âœ… | admin, operator | Run compliance checks |
| `POST` | `/api/payments/:id/ai-recommendation` | âœ… | admin, operator | Request AI execution recommendation |
| `POST` | `/api/payments/:id/execute` | âœ… | admin, operator | Execute payment on Solana |
| `POST` | `/api/payments/batch-execute` | âœ… | admin, operator | Execute multiple policy-allowed payments in one batch |

### Compliance

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/compliance/alerts/:id/resolve` | âœ… | admin, operator | Resolve a compliance alert |

### Wallets

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/wallets/refresh` | âœ… | admin, operator | Refresh wallet balances from RPC |

### AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | âœ… | Send message to AI assistant |

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | âŒ | Health check and configuration status |
| `GET` | `/api/bootstrap` | âœ… | Load all initial app data in one request |

---

## ðŸ—„ï¸ Database Schema

CompliPay AI uses **SQLite** with **WAL (Write-Ahead Logging)** mode for optimal concurrent read performance.

```sql
-- Core tables
users              -- Institutional user accounts with roles
sessions           -- Opaque session token hashes with TTL
payments           -- Programmable payment contracts
transactions       -- Executed transaction records
compliance_alerts  -- Compliance check alerts
ai_tasks           -- AI agent task registry
wallets            -- Institutional wallet addresses
audit_events       -- Append-only audit event log
```

### Entity Relationship

```
users â”€â”€1:Nâ”€â”€â†’ sessions
payments â”€â”€1:1â”€â”€â†’ compliance_result (JSON)
payments â”€â”€1:Nâ”€â”€â†’ compliance_alerts
payments â”€â”€1:Nâ”€â”€â†’ transactions
transactions â”€â”€â†’ audit_events (referenced by ID)
payments â”€â”€â†’ audit_events (referenced by ID)
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

## ðŸ”‘ Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@complipay.ai` | `Admin123!` | Full access (create, execute, manage) |
| **Operator** | `ops@complipay.ai` | `Ops123!` | Operational access (create, execute) |
| **Viewer** | `viewer@complipay.ai` | `View123!` | Read-only dashboard access |

---

## ðŸŽ¬ Core Demo Flow (3 Minutes)

```
Step 1 â”€â†’ Open Landing Page and click "Launch Dashboard"
Step 2 â”€â†’ Login with admin@complipay.ai / Admin123!
Step 3 â”€â†’ View Dashboard KPIs and operational metrics
Step 4 â”€â†’ Navigate to "Payments" and create a new programmable payment
Step 5 â”€â†’ Run Compliance Checks (see ALLOW / REVIEW / BLOCK decision)
Step 6 â”€â†’ Request AI Recommendation for the payment
Step 7 â”€â†’ Execute payment (click "Execute Now" or "Execute With AI")
Step 8 â”€â†’ Navigate to "Transactions" â€” verify tx hash and explorer link
Step 9 â”€â†’ Navigate to "Audit Trail" â€” review all logged events
Step 10 â”€â†’ Show Compliance Center alerts and resolution workflow
```

> ðŸ“– For the full demo script, see [`docs/DEMO_RUNBOOK.md`](docs/DEMO_RUNBOOK.md)

---

## ðŸ›¡ï¸ Compliance Decision Matrix

### Mandatory Checks

| Check | Input | Pass Condition | Fail Condition |
|---|---|---|---|
| **KYC** | `recipientKycVerified` | Recipient is verified | Recipient not verified â†’ `BLOCK` |
| **KYT** | `amount` | Amount â‰¤ $500,000 | Amount > $500,000 â†’ `REVIEW` |
| **AML** | `recipient` name | No sanction match | Name contains "sanction"/"blocked" â†’ `BLOCK` |
| **Travel Rule** | `amount` + `travelRuleReady` | Amount â‰¤ $250K OR metadata ready | Amount > $250K + incomplete â†’ `REVIEW` |

### Decision Logic

| Condition | Decision | Action |
|---|---|---|
| All checks `pass` | âœ… **ALLOW** | Payment can be executed automatically |
| Any check `review` (no `fail`) | âš ï¸ **REVIEW** | Manual approval required |
| Any check `fail` | ðŸš« **BLOCK** | Execution denied until resolved |

### Scoring System

| Check Status | Points |
|---|---|
| `pass` | 25 |
| `review` | 15 |
| `fail` | 0 |

**Maximum score: 100** (all 4 checks pass)

---

## ðŸ”’ Security & Guardrails

### Authentication & Authorization
- **Session-based auth** with hashed session tokens in SQLite (raw token never stored)
- **RBAC enforcement** on mutation endpoints (admin/operator); viewer is read-only in UI
- **Rate limiting** on sensitive endpoints (IP-based login, user+IP for authenticated AI chat)
- **PBKDF2 password hashing** with auto-migration support from legacy SHA-256 hashes
- **Explicit proxy trust configuration** via `TRUST_PROXY` for safer IP-based controls

### Compliance Guardrails
- **Policy engine is authoritative** â€” executions blocked unless `decision === 'allow'`
- **AI cannot bypass compliance** â€” recommendations are advisory only
- **Append-only audit log** â€” all actions recorded immutably

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

## ðŸ“± Pages Overview

| # | Page | Route | Description |
|---|---|---|---|
| 1 | **Landing** | `/` | Public marketing page with hackathon pitch |
| 2 | **Login** | `/login` | Secure login with role-based session |
| 3 | **Dashboard** | `/dashboard` | KPI cards, volume charts, compliance metrics |
| 4 | **Payments** | `/payments` | Full payment lifecycle: create â†’ comply â†’ execute |
| 5 | **Compliance** | `/compliance` | Alert monitoring, resolution, and metrics |
| 6 | **AI Agent** | `/ai-agent` | Chat-based AI assistant + task automation |
| 7 | **Audit Trail** | `/audit-trail` | Filterable evidence log with timestamps |
| 8 | **Transactions** | `/transactions` | Tx history, explorer links, CSV export |
| 9 | **Wallets** | `/wallets` | Institutional wallet management + RPC refresh |
| 10 | **Settings** | `/settings` | Profile, KYC status, security, API keys |

---

## ðŸ“Š Roadmap & Status

### Overall Production Readiness: **86%**

| Phase | Weight | Progress | Description |
|---|---|---|---|
| Scope & Setup | 15% | ðŸŸ¢ 100% | Scope locked, fullstack runtime stable |
| Core Payment | 20% | ðŸŸ¢ 100% | API-backed, SPL execution path, and batch execution are implemented |
| Compliance Engine | 20% | ðŸŸ¡ 80% | Policy logic persistent, external provider connector ready |
| Audit Trail | 15% | ðŸŸ¢ 82% | Persisted and shown in filterable UI |
| AI Guardrails | 12% | ðŸŸ¡ 80% | Live LLM chat with policy constraint |
| UI/UX Polish | 10% | ðŸŸ¢ 90% | Strong presentation quality |
| Submission Assets | 8% | ðŸŸ¡ 76% | Core docs ready, final assets pending |

### Page-by-Page Status

| Page | Status | Notes |
|---|---|---|
| Landing `/` | ðŸŸ¢ 95% | Near-final visual delivery |
| Dashboard `/dashboard` | ðŸŸ¡ 80% | Persistent API state consumption |
| Payments `/payments` | ðŸŸ¢ 92% | Full API-backed lifecycle + multi-select batch execution |
| Compliance `/compliance` | ðŸŸ¡ 80% | Persistent alerts and resolution |
| AI Agent `/ai-agent` | ðŸŸ¢ 82% | Live Qwen chat integrated |
| Audit Trail `/audit-trail` | ðŸŸ¡ 80% | Append-only persistent logs |
| Transactions `/transactions` | ðŸŸ¡ 78% | Pagination and export available |
| Wallets `/wallets` | ðŸŸ¡ 70% | API-backed with RPC refresh |
| Settings `/settings` | ðŸŸ¡ 60% | Auth-aware, full persistence pending |

### Post-Hackathon Plan

| Phase | Goal |
|---|---|
| **Phase A** â€” Hardening | Integration tests, fault handling, RBAC expansion |
| **Phase B** â€” Pilot Readiness | Real compliance providers, custody workflows, audit export |
| **Phase C** â€” Demo Day | Performance optimization, pitch deck, judge Q&A prep |

---

## ðŸ“š Documentation

| Document | Path | Description |
|---|---|---|
| Product Requirements | [`PRD.md`](PRD.md) | Full product specification and hackathon context |
| Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and data-flow details |
| Roadmap | [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phase-by-phase delivery tracker with progress |
| Demo Runbook | [`docs/DEMO_RUNBOOK.md`](docs/DEMO_RUNBOOK.md) | Step-by-step live demo script (3 minutes) |
| Security Rollout Runbook | [`docs/SECURITY_ROLLOUT_RUNBOOK.md`](docs/SECURITY_ROLLOUT_RUNBOOK.md) | Production rollout, migration, and rollback guidance for auth/security hardening |
| Submission Checklist | [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) | Pre-submit verification checklist |
| UI/UX Design | [`docs/UI_UX_DESIGN.md`](docs/UI_UX_DESIGN.md) | UI/UX design blueprint and screen specs |
| Audit Report | [`docs/PROJECT_AUDIT_REPORT.md`](docs/PROJECT_AUDIT_REPORT.md) | Comprehensive code audit findings |
| Completion Audit | [`docs/PROJECT_COMPLETION_AUDIT.md`](docs/PROJECT_COMPLETION_AUDIT.md) | Weighted production-readiness completion audit |

---

## ðŸ¤ Contributing

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

## ðŸ“ License

This project was built for **StableHacks 2026** hackathon submission.

---

## ðŸ† Hackathon Context

| Detail | Value |
|---|---|
| **Event** | StableHacks 2026 |
| **Platform** | DoraHacks (fully online) |
| **Track** | Programmable Stablecoin Payments |
| **Period** | March 13 â€“ March 22, 2026 |
| **Demo Day** | Zurich, May 28, 2026 (Top 10) |

### Required Submission Artifacts
- âœ… Public GitHub repository
- âœ… Project name, team members, country
- â¬œ Loom video (â‰¤ 3 minutes)
- â¬œ Testnet demo link
- â¬œ Final submission on DoraHacks

---

<p align="center">
  <strong>Built with â¤ï¸ for StableHacks 2026</strong>
  <br />
  <em>Programmable. Compliant. Auditable.</em>
</p>

