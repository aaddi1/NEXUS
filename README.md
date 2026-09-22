# NEXUS — Enterprise Operations & Intelligence Platform

<p align="center">
  <img src="docs/assets/toad-seal.svg" alt="NEXUS Official Toad Seal" width="130" height="130" />
</p>

<p align="center">
  <a href="https://github.com/aaddi1"><img src="https://img.shields.io/badge/GitHub-aaddi1-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://www.linkedin.com/in/aryan-sharma11/"><img src="https://img.shields.io/badge/LinkedIn-aryan--sharma11-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://www.instagram.com/aryansharma.dev/"><img src="https://img.shields.io/badge/Instagram-aryansharma.dev-E4405F?style=flat-square&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="https://x.com/aaddi1"><img src="https://img.shields.io/badge/X-Follow-000000?style=flat-square&logo=x&logoColor=white" alt="X" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-r128-black?style=flat-square&logo=three.js&logoColor=white" alt="Three.js" /></a>
</p>

**NEXUS** is an enterprise-grade commercial operating system, ERP, CRM, and predictive intelligence platform designed for end-to-end multi-warehouse commercial operations. It unifies order orchestration, multi-location stock management, cryptographic invoice issuance, sales opportunity tracking, and predictive demand analytics within a zero-latency operational workspace.

Repository: [https://github.com/aaddi1/NEXUS](https://github.com/aaddi1/NEXUS)

---

## Architecture Overview

NEXUS utilizes a decoupled micro-architecture where transaction-heavy operations are isolated from analytical and forecasting workloads.

```mermaid
flowchart TD
    subgraph Client ["Client Interface (Port :8001)"]
        UI["NEXUS Web Application (Vanilla JS / CSS Grid / Three.js)"]
        SuperAdminUI["Aryan Sharma Super Admin Command Center"]
        EmpUI["Employee Self-Service Workspace"]
        HelpBeacon["Universal Help & Complaints Beacon"]
    end

    subgraph BackendGateway ["REST Gateway & Business Logic (Port :5000)"]
        Express["Express.js Core"]
        AuthMid["Server RBAC & OAuth Identity Middleware"]
        PDFGen["PDFKit + QR Engine (HMAC-SHA256)"]
        Routes["Routes: Admin | Complaints | Orders | Invoices | Inventory | Products | Customers | Deals | Employees | Financials"]
    end

    subgraph AnalyticsEngine ["Intelligence & Forecasting Engine (Port :8000)"]
        FastAPI["FastAPI Microservice"]
        Demand["Demand Analysis & Safety Buffer Matrix"]
        Forecast["OLS Trend & 30-Day Revenue Forecasting"]
    end

    subgraph NativeCpp ["Native C++ Computational Engine"]
        CppEngine["nexus_cpp_engine (Pricing / EOQ / HMAC Checksums)"]
    end

    subgraph DataPersistence ["Persistence Layer (Port :5432)"]
        Postgres[(PostgreSQL Multi-Tenant Relational Storage)]
    end

    UI -->|"Bearer Auth / REST API"| BackendGateway
    SuperAdminUI -->|"Admin & Management API"| BackendGateway
    EmpUI -->|"Employee Workspace API"| BackendGateway
    HelpBeacon -->|"Complaints API"| BackendGateway
    UI -->|"Analytics API"| AnalyticsEngine
    BackendGateway -->|"pg Connection Pool (ACID / Row Locks)"| Postgres
    AnalyticsEngine -->|"psycopg2 Read Queries"| Postgres
    BackendGateway -.->|"Algorithmic Parity"| NativeCpp
```

---

## Default Seeded Credentials

NEXUS includes seeded accounts configured with unique passwords per user:

| Role | Name | Email | Default Password | Workspace Type |
|---|---|---|---|---|
| **Super Admin & Owner** | Aryan Sharma | `aryan@nexus.com` | `aryan123` | System Command (`system`) |
| **Super Admin (Alias)** | Aryan Sharma | `admin123@nexus.com` | `admin123` | Enterprise Command (`enterprise`) |
| **Enterprise Owner** | Reliance Enterprise | `reliance@nexus.com` | `reliance123` | Enterprise ERP (`enterprise`) |
| **Retail Shop Owner** | Retail Store Manager | `shopowner@nexus.com` | `shopowner123` | Retail Shop POS (`shop_owner`) |
| **Sales Lead** | Riya Mehta | `riya@nexus.com` | `riya123` | Enterprise Employee (`enterprise`) |
| **Inventory Manager** | Rahul Kapoor | `rahul@nexus.com` | `rahul123` | Enterprise Employee (`enterprise`) |
| **Finance Lead** | Arjun Verma | `arjun@nexus.com` | `arjun123` | Enterprise Employee (`enterprise`) |
| **Sales Executive** | Priya Nair | `priya@nexus.com` | `priya123` | Enterprise Employee (`enterprise`) |

---

## Core Portals & Workspaces

### 1. 🛡️ Aryan Sharma Super Admin Control Center (`#screen-superadmin`)
- **System Command HUD**: Real-time monitoring of active PostgreSQL ACID pool connections, FastAPI engine status, CPU allocation, RAM utilization, and total platform transaction volumes.
- **Support & Complaints Dispatch Inbox**: Live inbox receiving all incoming tickets from clients, enterprise company owners, and retail shop owners with priority tags (`Critical`, `High`, `Normal`) and direct **Reply & Resolve** administrative logging.
- **Account Suspension & Direct Password Resets (`/api/admin/users/reset-password`)**: Platform-wide user registry with last-accessed timestamps, order histories, account deactivation/suspension toggles, and direct password resets.
- **System Diagnostics & Bug Tracker (`/api/admin/bugs`)**: Real-time error log capturing server exceptions, latency spikes, and runtime component diagnostic events.
- **Login Audit Trail (`/api/admin/logins`)**: Captured audit trail logging IP addresses, User-Agents, authentication providers (Google, GitHub, Microsoft, Password), and status.

---

### 2. 🏢 Enterprise Company & Retail Shop Owner Workspace
- **Executive Dashboard (`#screen-dashboard`)**: Live KPI cards (Revenue, Orders, Customers, Inventory Valuation), monthly revenue trend curves, top-selling SKU rankings, and chronological operational feeds.
- **Customer CRM (`#screen-customers`)**: Account registry tracking customer lifetime value (LTV), total orders placed, segment classifications (`VIP`, `Standard`, `New`), and automated professional portrait generation.
- **Catalog Management (`#screen-products`)**: SKU registry with automatic commercial packshot photo matching, category filters, Cost of Goods Sold (COGS), and live multi-warehouse stock sync.
- **Multi-Location Inventory (`#screen-inventory`)**: Warehouse management across **Mumbai WH-1**, **Delhi WH-2**, and **Bengaluru WH-3** with atomic stock adjustments and transfer workflows protected by PostgreSQL `FOR UPDATE` locks.
- **Permanent Inventory Movements Ledger (`inventory_movements`)**: Audit ledger recording every stock increment, sale, transfer, and restock.
- **Enterprise Order Creation Suite (`#screen-orders`)**:
  - **Inline Customer Registration**: Register and auto-select new customers directly inside the order creation flow.
  - **Multi-Item Line Ledger**: Select products with live pricing, step counter quantity adjusters, and line subtotal calculations.
  - **Dual-Mode Discount Selector**: Specify discounts either as a flat rupee reduction (`₹ Flat`) or as a percentage (`% Percent`).
  - **GST & Tax Computation**: Select GST rates (`0%`, `5%`, `12%`, `18% Standard`, `28% GST`) with live automated tax calculations.
  - **Payment & Dispatch**: Select payment method (UPI, Net Banking, Card, NEFT, Cash) and dispatch warehouse depot.
  - **Instant Invoice Generation**: Auto-generate sequential tax invoices with cryptographic HMAC-SHA256 QR signatures upon order completion.
- **Invoice Billing & Cryptographic QR Verification (`#screen-invoices`)**:
  - Issue vector PDF invoices with high-ECC dynamic QR codes.
  - Public tamper-evident verification endpoint guarded by `crypto.timingSafeEqual`.
  - In-browser printable PDF viewer.
- **Sales Pipeline / Deals CRM (`#screen-sales`)**: Track deal stages (`Discovery 25%`, `Proposal 50%`, `Negotiation 75%`, `Closed won 100%`), contract values, and weighted revenue pipelines.
- **AI Business Intelligence & Demand Intelligence (`#screen-analytics`)**:
  - Revenue by Category bar charts and Sales Channel donut graphs (Online, Direct, Wholesale).
  - 14-day revenue velocity charts and 30-day OLS machine learning cash flow projections.
  - Product demand run-out matrix categorizing stock risk (`Critical`, `High`, `Medium`, `Low`).

---

### 3. 💼 Employee Self-Service Workspace (`#screen-emp-dashboard`)
- **My Sales (`#screen-emp-sales`)**: Personal sales attributed to the employee with customer info, fulfillment state, and date.
- **My Items (`#screen-emp-items`)**: Traceable record of sample products and inventory items issued to or held by the employee with return status.
- **My Salary (`#screen-emp-salary`)**: Compensation breakdown, disbursement dates, and sequential salary invoices (`SAL-2026-08-01`).
- **My Issues (`#screen-emp-issues`)**: Track support tickets submitted to the Founder/Admin with real-time resolution notes.

---

### 4. 📲 PWA Desktop & Mobile Application Architecture
- **Web App Manifest (`frontend/manifest.json`)**: Configured for standalone window execution with app shortcuts and theme branding.
- **Service Worker (`frontend/sw.js`)**: Offline shell caching with background sync.
- **Desktop Install Button (`frontend/js/pwa.js`)**: Dynamic "Install App" button in the topbar for one-click installation on macOS, Windows, and mobile devices.

---

## Database Schema & Multi-Tenant Model

```mermaid
erDiagram
    ORGANIZATIONS {
        serial id PK
        varchar name
        varchar slug UK
        varchar plan
        integer owner_id
        timestamp created_at
    }

    USERS {
        serial id PK
        integer organization_id FK
        varchar name
        varchar email UK
        text password_hash
        varchar role
        varchar workspace_type
        boolean is_active
        timestamp last_accessed
        timestamp created_at
    }

    AUTH_IDENTITIES {
        serial id PK
        integer user_id FK
        varchar provider
        varchar provider_user_id
        varchar email
        jsonb profile_data
        timestamp created_at
    }

    CUSTOMERS {
        serial id PK
        integer organization_id FK
        varchar name
        varchar email
        varchar phone
        varchar company
        varchar city
        timestamp created_at
        timestamp deleted_at
    }

    PRODUCTS {
        serial id PK
        integer organization_id FK
        varchar name
        varchar sku UK
        integer category_id FK
        numeric price
        numeric unit_cost
        timestamp created_at
    }

    INVENTORY {
        serial id PK
        integer organization_id FK
        integer product_id FK
        varchar warehouse
        integer quantity
        timestamp updated_at
    }

    INVENTORY_MOVEMENTS {
        serial id PK
        integer organization_id FK
        integer product_id FK
        varchar warehouse
        integer quantity_change
        varchar movement_type
        varchar reference_type
        integer reference_id
        integer actor_id FK
        text notes
        timestamp created_at
    }

    ORDERS {
        serial id PK
        integer organization_id FK
        integer customer_id FK
        integer employee_id FK
        varchar status
        varchar payment_status
        varchar payment_method
        varchar warehouse
        numeric subtotal
        numeric discount
        numeric tax_rate
        numeric tax_amount
        numeric total
        text notes
        timestamp created_at
    }

    ORDER_ITEMS {
        serial id PK
        integer order_id FK
        integer product_id FK
        integer quantity
        numeric unit_price
        numeric unit_cost
    }

    INVOICES {
        serial id PK
        integer organization_id FK
        integer customer_id FK
        varchar invoice_number UK
        varchar status
        date issue_date
        date due_date
        numeric total
        numeric tax_rate
        numeric discount
        varchar payment_method
        timestamp created_at
    }

    EMPLOYEE_SALARIES {
        serial id PK
        integer organization_id FK
        integer employee_id FK
        numeric amount
        date payment_date
        varchar salary_month
        varchar payment_status
        varchar salary_invoice_number UK
        text notes
        timestamp created_at
    }

    COMPLAINTS {
        serial id PK
        integer organization_id FK
        integer user_id FK
        varchar user_name
        varchar user_email
        varchar company
        varchar type
        varchar subject
        text message
        varchar priority
        varchar status
        text admin_reply
        timestamp created_at
        timestamp resolved_at
    }

    ORGANIZATIONS ||--o{ USERS : owns
    ORGANIZATIONS ||--o{ CUSTOMERS : contains
    ORGANIZATIONS ||--o{ PRODUCTS : catalogs
    ORGANIZATIONS ||--o{ ORDERS : executes
    ORGANIZATIONS ||--o{ INVOICES : bills
    USERS ||--o{ AUTH_IDENTITIES : maps
    USERS ||--o{ COMPLAINTS : submits
    USERS ||--o{ EMPLOYEE_SALARIES : receives
```

---

## Native C++ Computational Engine (`cpp/`)

NEXUS includes a high-performance native C++ engine compiled with CMake and Clang++ 17:

- **`cpp/include/pricing_engine.hpp`**: High-speed GST tax computation (CGST, SGST, IGST), dual-mode discounts (`₹ Flat` vs `% Percent`), and currency conversion table (INR, USD, EUR, GBP, AED, JPY).
- **`cpp/include/inventory_optimizer.hpp`**: Multi-warehouse reorder point evaluation, Economic Order Quantity (EOQ) formula, safety stock calculations, and warehouse transfer validation.
- **`cpp/include/crypto_engine.hpp`**: Constant-time HMAC-SHA256 vector invoice checksum verification.
- **`cpp/src/main.cpp`**: Standalone benchmarking executable (`nexus_cpp_engine`).

### Building the C++ Engine:
```bash
mkdir -p cpp/build && cd cpp/build
cmake .. && make
./nexus_cpp_engine
```

---

## Automated Test Suite (15/15 Integration Tests)

Run the integration test suite:
```bash
npm test
```

### Quality Gate Matrix:
- `✓ PASS: Backend Health Check (/api/health)`
- `✓ PASS: Super Admin Authentication (aryan@nexus.com)`
- `✓ PASS: Employee Authentication (riya@nexus.com)`
- `✓ PASS: Registration Role Escalation Prevention (role=superadmin blocked)`
- `✓ PASS: RBAC: Employee cannot access /api/admin/stats (HTTP 403)`
- `✓ PASS: RBAC: Super Admin can access /api/admin/stats (HTTP 200)`
- `✓ PASS: Password Reset Request (/api/auth/forgot-password)`
- `✓ PASS: Commerce: Create Order with Atomic Stock Decrement`
- `✓ PASS: Commerce: Reject Order when Stock is Insufficient (HTTP 400)`
- `✓ PASS: Employee Workspace: Scoped Personal Stats & Sales (/api/employees/me/workspace)`
- `✓ PASS: Financial Intelligence Overview (/api/financials/overview)`
- `✓ PASS: Complaints System: Submit Ticket -> Super Admin Resolve`
- `✓ PASS: SSO: OAuth Identity Linking & Audit Log (/api/auth/sso)`
- `✓ PASS: Inventory: Atomic Stock Transfer with ACID Locking (/api/inventory/transfer)`
- `✓ PASS: Invoice: Vector PDF Stream & Cryptographic Verification`

---

## Quickstart & Local Setup

### 1. Database Initialization
```bash
createdb nexus
psql -d nexus -f database/schema.sql
psql -d nexus -f database/seed.sql
```

### 2. Backend Gateway Startup (Port 5000)
```bash
cd backend
npm install
node src/server.js
```

### 3. Analytics Engine Startup (Port 8000)
```bash
cd analytics
source .venv/bin/activate
pip install fastapi uvicorn psycopg2-binary python-dotenv numpy
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Client Application (Port 8001)
```bash
cd frontend
python3 -m http.server 8001
```
Access in browser: `http://localhost:8001`.

---

## Author & Connect

**Aryan Sharma**

- **GitHub**: [@aaddi1](https://github.com/aaddi1)
- **LinkedIn**: [Aryan Sharma](https://www.linkedin.com/in/aryan-sharma11/)
- **Instagram**: [@aryansharma.dev](https://www.instagram.com/aryansharma.dev/)
- **X (Twitter)**: [@aaddi1](https://x.com/aaddi1)
- **Email**: [aryan@nexus.com](mailto:aryan@nexus.com)

---

## License

Proprietary Software. Copyright © 2026 NEXUS. All Rights Reserved. Unauthorized duplication, modification, or commercial distribution is strictly prohibited.
