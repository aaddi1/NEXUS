# NEXUS

NEXUS is a full-stack business management platform for managing customers, products, inventory, orders, invoices, deals, analytics, and business intelligence.

## Architecture

- Frontend — HTML, CSS, JavaScript
- Backend — Node.js, Express
- Database — PostgreSQL
- Analytics — Python / FastAPI
- Optimization — C++

## Project Structure

```text
NEXUS/
├── frontend/       # NEXUS web application
├── backend/        # REST API and PostgreSQL integration
├── analytics/      # Analytics and forecasting engine
├── database/       # Database schema and seed data
├── cpp/            # C++ optimization components
├── python/         # Python dependencies/utilities
└── docs/           # Architecture, API and database documentation
```

## Local Development

### Frontend
python3 -m http.server 8001

### Backend
cd backend && node src/server.js

### Analytics
cd analytics && source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000

## Environment

Create the required environment variables locally. Never commit .env files or database credentials.

## Status

NEXUS is currently under active development.
