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

**NEXUS** is a high-performance, modular enterprise resource planning (ERP), CRM, and business intelligence platform designed for end-to-end commercial operations. It unifies order orchestration, multi-warehouse stock management, cryptographic invoice issuance, sales pipeline tracking, and predictive demand analytics within a unified operational workspace.

Repository: [https://github.com/aaddi1/NEXUS](https://github.com/aaddi1/NEXUS)

---

## Architecture Overview

NEXUS utilizes a decoupled micro-architecture where transaction-heavy operations are isolated from analytical and forecasting workloads.

```mermaid
flowchart TD
    subgraph Client ["Client Interface (Port :8001)"]
        UI["NEXUS Web Application (Vanilla JS / CSS Grid / Three.js)"]
        State["Client State & Live Hydration Engine"]
    end

    subgraph BackendGateway ["REST Gateway & Business Logic (Port :5000)"]
        Express["Express.js Core"]
        AuthMid["JWT Authentication Middleware"]
        PDFGen["PDFKit + QR Engine (HMAC-SHA256)"]
        Routes["Routes: Customers | Products | Inventory | Orders | Invoices | Deals"]
    end

    subgraph AnalyticsEngine ["Intelligence & Forecasting Engine (Port :8000)"]
        FastAPI["FastAPI Microservice"]
        Demand["Demand Analysis & Safety Buffer Matrix"]
        Forecast["OLS Trend & 30-Day Revenue Forecasting"]
    end

    subgraph DataPersistence ["Persistence Layer (Port :5432)"]
        Postgres[(PostgreSQL Relational Storage)]
    end

    UI -->|"Bearer Auth / REST API"| BackendGateway
    UI -->|"Analytics API"| AnalyticsEngine
    BackendGateway -->|"pg Connection Pool (ACID / Row Locks)"| Postgres
    AnalyticsEngine -->|"psycopg2 Read Queries"| Postgres
```

---

## Core Subsystems

### 1. High-Concurrency REST API Gateway (`Node.js / Express`)
- **Connection Pooling**: Backed by `pg.Pool` with parameterized query sanitization.
- **Concurrency & Locking**: Multi-warehouse stock transfers execute inside atomic PostgreSQL transactions utilizing `SELECT ... FOR UPDATE` row-level mutexes.
- **Authentication**: Stateless JSON Web Token (`jsonwebtoken`) bearer authentication with `bcrypt` (10 rounds) password hashing.

### 2. Cryptographic Invoicing & Verification Engine
- **Vector PDF Generation**: High-precision vector rendering using `PDFKit` and SVG conversion via `svg-to-pdfkit`.
- **Public Authenticity Signatures**: Invoices generate a deterministic HMAC-SHA256 signature calculated against the document sequence and runtime secret.
- **Embedded Dynamic QR Verification**: Each invoice contains an embedded High-ECC QR code leading to a tamper-evident public endpoint (`/api/invoices/public/:invoiceNumber/:signature.pdf`) with constant-time (`crypto.timingSafeEqual`) authentication.

### 3. Business Intelligence & Predictive Analytics (`Python / FastAPI`)
- **Linear Trend Extrapolation**: Computes ordinary least-squares (OLS) slope analysis over historical order volumes to model 30-day forward cash flow and revenue trajectory.
- **Stock Depletion & Run-Out Matrix**: Aggregates decoupled sales velocity and inventory tables into days-remaining metrics and categorizes stock risk (`critical`, `high`, `medium`, `low`).
- **Dynamic Reorder Recommender**: Computes stock replenish recommendations incorporating lead-time burn rate and a 20% safety buffer.

### 4. Interactive Zero-Dependency Client Layer
- **High-Performance DOM Engine**: Built without heavy framework overhead to maximize responsiveness and paint cycles.
- **3D Visualization**: Native WebGL viewport integration powered by `Three.js` (r128).
- **Client-Side Export Pipeline**: Integrated `SheetJS` (XLSX) streaming export and native printable document synthesizer.

---

## Database Schema & Relations

The PostgreSQL schema enforces strict relational integrity with cascade rules, custom sequences, and index constraints.

```mermaid
erDiagram
    USERS {
        serial id PK
        varchar name
        varchar email UK
        text password_hash
        varchar role
        timestamp created_at
    }

    CUSTOMERS {
        serial id PK
        varchar name
        varchar email
        varchar phone
        varchar company
        varchar city
        timestamp created_at
        timestamp deleted_at
    }

    CATEGORIES {
        serial id PK
        varchar name UK
        timestamp created_at
    }

    PRODUCTS {
        serial id PK
        varchar name
        varchar sku UK
        integer category_id FK
        numeric price
        timestamp created_at
    }

    INVENTORY {
        serial id PK
        integer product_id FK
        varchar warehouse
        integer quantity
        timestamp updated_at
    }

    ORDERS {
        serial id PK
        integer customer_id FK
        varchar status
        varchar payment_status
        numeric total
        timestamp created_at
    }

    ORDER_ITEMS {
        serial id PK
        integer order_id FK
        integer product_id FK
        integer quantity
        numeric unit_price
    }

    INVOICES {
        serial id PK
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

    INVOICE_ITEMS {
        serial id PK
        integer invoice_id FK
        integer product_id FK
        text description
        integer quantity
        numeric unit_price
    }

    PAYMENTS {
        serial id PK
        integer invoice_id FK
        numeric amount
        varchar payment_method
        varchar payment_status
        timestamp paid_at
    }

    DEALS {
        serial id PK
        integer customer_id FK
        varchar name
        varchar stage
        numeric value
        integer probability
        timestamp created_at
    }

    CUSTOMERS ||--o{ ORDERS : places
    CUSTOMERS ||--o{ INVOICES : billed_to
    CUSTOMERS ||--o{ DEALS : associates
    CATEGORIES ||--o{ PRODUCTS : categorizes
    PRODUCTS ||--o{ INVENTORY : stocked_in
    PRODUCTS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ INVOICE_ITEMS : references
    ORDERS ||--|{ ORDER_ITEMS : includes
    INVOICES ||--|{ INVOICE_ITEMS : includes
    INVOICES ||--o{ PAYMENTS : settles
```

---

## API Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user credentials and issue JWT | No |

### Customers & CRM
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/customers` | List all active customers with aggregated LTV | Bearer JWT |
| `GET` | `/api/customers/:id` | Fetch customer profile by ID | Bearer JWT |
| `POST` | `/api/customers` | Register a new customer record | Bearer JWT |
| `PUT` | `/api/customers/:id` | Update customer metadata | Bearer JWT |
| `DELETE` | `/api/customers/:id` | Soft-delete / archive customer | Bearer JWT |

### Products & Multi-Warehouse Inventory
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | Retrieve catalog with category associations | Bearer JWT |
| `POST` | `/api/products` | Insert new SKU into catalog | Bearer JWT |
| `PUT` | `/api/products/:id` | Update product SKU and pricing | Bearer JWT |
| `DELETE` | `/api/products/:id` | Delete product (with constraint protection) | Bearer JWT |
| `GET` | `/api/inventory` | List warehouse stock allocations | Bearer JWT |
| `PATCH` | `/api/inventory/:id` | Adjust absolute stock count | Bearer JWT |
| `POST` | `/api/inventory/transfer` | Atomic multi-warehouse stock transfer | Bearer JWT |

### Orders & Invoicing
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/orders` | List order ledger with payment & fulfillment state | Bearer JWT |
| `POST` | `/api/orders` | Create transaction order and line items | Bearer JWT |
| `PATCH` | `/api/orders/:id/status` | Mutate order and payment status | Bearer JWT |
| `GET` | `/api/invoices` | List invoices with discount & tax calculations | Bearer JWT |
| `POST` | `/api/invoices` | Generate invoice and line-item records | Bearer JWT |
| `PATCH` | `/api/invoices/:id/status` | Update invoice status (`draft`, `due`, `paid`, etc.) | Bearer JWT |
| `GET` | `/api/invoices/:id/pdf` | Generate vector invoice PDF on-the-fly | Bearer JWT |
| `GET` | `/api/invoices/public/:num/:sig.pdf` | Public cryptographic invoice PDF endpoint | No (HMAC guarded) |

### Sales Pipeline (Deals)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/deals` | Fetch active pipeline opportunities | Bearer JWT |
| `POST` | `/api/deals` | Create opportunity with stage & probability | Bearer JWT |
| `PUT` | `/api/deals/:id` | Update deal terms | Bearer JWT |
| `PATCH` | `/api/deals/:id/stage` | Transition sales stage | Bearer JWT |
| `DELETE` | `/api/deals/:id` | Purge deal from pipeline | Bearer JWT |

### Analytics & Intelligence Microservice (`Port :8000`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Verify analytics engine & database connectivity |
| `GET` | `/analytics/overview` | Core revenue, orders, AOV, and aggregate unit metrics |
| `GET` | `/analytics/forecast` | Linear regression OLS revenue trend & 30-day projection |
| `GET` | `/analytics/product-demand` | Stock run-out projection and risk categorization |
| `GET` | `/analytics/reorder` | Replenishment recommendations with 20% safety margin |

---

## Directory Structure

```text
NEXUS/
├── analytics/                  # Python Intelligence Engine
│   ├── .venv/                  # Dedicated Python virtual environment
│   ├── main.py                 # FastAPI application & mathematical models
│   └── .env                    # Analytics database configuration
├── backend/                    # Node.js REST API Gateway
│   ├── assets/fonts/           # Typography assets for vector PDF generation
│   ├── src/
│   │   ├── db/                 # PostgreSQL pool initialization
│   │   ├── routes/             # Express route controllers
│   │   │   ├── auth.js         # JWT auth & bcrypt verification
│   │   │   ├── customers.js    # CRM operations & LTV tracking
│   │   │   ├── deals.js        # Sales pipeline management
│   │   │   ├── inventory.js    # Multi-location inventory & atomic transfer
│   │   │   ├── invoices.js     # PDF generation & HMAC verification
│   │   │   ├── orders.js       # Transactional order orchestration
│   │   │   └── products.js     # SKU catalog management
│   │   ├── middleware.js       # Bearer token validation
│   │   └── server.js           # Server bootstrap & CORS configuration
│   ├── package.json            # Node.js dependencies
│   └── .env                    # Node.js runtime configuration
├── database/                   # PostgreSQL DDL and DML scripts
│   ├── schema.sql              # Table definitions, constraints, and sequences
│   └── seed.sql                # Initial seed data and test accounts
├── docs/                       # Architectural and technical documentation
├── frontend/                   # Client-side web application
│   ├── favicon.svg             # Vector brand mark
│   ├── index.html              # Main application markup, views & styles
│   └── js/                     # Modular client-side controllers
│       ├── api.js              # Centralized API bridge
│       ├── auth.js             # Session state & JWT handling
│       ├── live-data.js        # Global workspace hydration
│       ├── live-deals.js       # Pipeline view sync
│       ├── live-inventory.js   # Warehouse view sync
│       ├── live-invoices.js    # Invoice ledger & PDF viewer
│       ├── live-orders.js      # Order tracking controller
│       └── live-products.js    # Catalog & live stock controller
├── package.json                # Root orchestration package configuration
└── README.md                   # System documentation
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **PostgreSQL**: `v14.0` or higher
- **Python**: `v3.11` or higher
- **Package Manager**: `npm` / `pip`

---

### 1. Database Initialization

Create a PostgreSQL database and execute the schema and seed scripts:

```bash
# Create PostgreSQL database
createdb nexus

# Execute schema definition
psql -d nexus -f database/schema.sql

# Populate initial seed data
psql -d nexus -f database/seed.sql
```

---

### 2. Backend Gateway Configuration & Startup

Configure the environment variables in `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://localhost:5432/nexus
JWT_SECRET=your-production-secret-key
PUBLIC_BASE_URL=http://localhost:5000
```

Install dependencies and start the backend:

```bash
cd backend
npm install
node src/server.js
```

The REST API will be available at `http://localhost:5000`.

---

### 3. Analytics Engine Startup

Configure the environment variables in `analytics/.env`:

```env
DATABASE_URL=postgresql://localhost:5432/nexus
```

Activate the Python virtual environment and run Uvicorn:

```bash
cd analytics
source .venv/bin/activate
pip install fastapi uvicorn psycopg2-binary python-dotenv numpy
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The Intelligence API will be available at `http://localhost:8000`.

---

### 4. Client Application

Host the frontend using any static file server:

```bash
cd frontend
python3 -m http.server 8001
```

Access the application in your browser at `http://localhost:8001`.

#### Default Seeded Credentials:
- **Super Admin (Aryan Sharma)**: `aryan@nexus.com` / `admin123` (or `admin123@nexus.com` / `admin123`)
- **Enterprise Company Owner**: `reliance@nexus.com` / `admin123`
- **Retail Shop Owner**: `shopowner@nexus.com` / `admin123`

---

## Portals & Role Breakdown

### 1. Aryan Sharma Super Admin Control Center (`#screen-superadmin`)
- **Direct Password Resets**: Provision new accounts and directly reset/overwrite forgotten credentials for any client, company owner, or employee.
- **Support & Complaints Dispatch Center**: Live inbox of all submitted complaints and inquiries with direct "Reply & Resolve" capabilities.
- **System Diagnostics HUD**: Real-time monitoring of CPU cores, RAM allocation, PostgreSQL ACID connection pool health, and FastAPI AI engine uptime.
- **Bug Tracker & Error Log**: Triage component exceptions, log resolutions, and manage runtime status.

### 2. Enterprise Company & Shop Owner Portal
- **Operational Suite**: Live KPI cards, Sales Pipeline (Deals CRM), Product Catalog, Multi-Warehouse Stock Tracking, Dual-Mode Discount Orders (`₹` / `%`), and Vector PDF Invoices with HMAC-SHA256 QR Authenticity.
- **Universal Help & Complaint Beacon**: Floating help button available across all screens allowing clients, store managers, and admins to report technical glitches, billing questions, or stock desyncs directly to Aryan Sharma.

---

## Security Model

1. **Parameter Sanitization**: All database interactions use parameterized bind variables (`$1`, `$2`, etc.) to prevent SQL injection vulnerabilities.
2. **Cryptographic Signatures**: Public invoice documents require an HMAC-SHA256 digest matching the document identifier.
3. **Constant-Time Verification**: Signature evaluations utilize `crypto.timingSafeEqual` with buffer length validation to protect against side-channel timing attacks.
4. **Isolated Token Storage**: Client tokens are managed with standard Bearer authorization schemes.

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
