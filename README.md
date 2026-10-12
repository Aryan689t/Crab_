# CRAB — Creators Reaching Aligned Brands

CRAB is an AI-powered two-sided Creator–Brand Opportunity Engine. It uses contextual understanding, pgvector semantic embeddings, and explainable AI reasoning to connect creators and brands.

---

## 🏗️ Architecture Overview

- **Frontend**: Next.js 15 (App Router, Turbopack), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Recharts (Port `3000`)
- **Backend**: Node.js + Express.js (TypeScript), Prisma ORM (Port `5000`)
- **Database & Vectors**: Supabase PostgreSQL with `pgvector` extension
- **Authentication**: Supabase Auth (JWT Bearer Token with role authorization middleware) & Demo one-click bypass
- **AI Engine**: Google Gemini API + text embeddings

---

## 📋 Prerequisites

Before starting, ensure your laptop has:
- **Node.js**: v18.17+ or v20+ (`node -v`)
- **npm**: v9+ (`npm -v`)
- **Git**: Installed and configured (`git --version`)
- **PowerShell**: Windows PowerShell or PowerShell 7 (commands below use PowerShell syntax)

---

## 🚀 Teammate Setup Guide (Windows PowerShell)

Follow these steps to clone, configure, and run the project locally.

### 1. Clone the Repository

Open Windows PowerShell and clone the project:

```powershell
git clone https://github.com/Aryan689t/Crab_.git
Set-Location Crab_
```

---

### 2. Install Dependencies

CRAB is structured as an npm monorepo with `frontend` and `backend` workspaces. Installing from the root will install dependencies across all workspaces:

```powershell
npm install
```

*(Optional: If you ever need to install dependencies in a specific workspace individually:)*
```powershell
npm install --workspace=backend
npm install --workspace=frontend
```

---

### 3. Configure Local Environment Variables

Both the backend and frontend have `.env.example` templates with descriptive placeholders.

#### Step 3a: Create your local `.env` files

Run these PowerShell commands in the repository root:

```powershell
# Copy backend template to backend/.env
Copy-Item backend\.env.example backend\.env

# Copy frontend template to frontend/.env.local
Copy-Item frontend\.env.example frontend\.env.local
```

> **Security Note**: `backend/.env` and `frontend/.env.local` are explicitly ignored by Git in `.gitignore`. Never commit or push real credentials.

#### Step 3b: Obtain and configure credentials

Obtain the project credentials from your team lead via a secure channel (e.g., direct messaging, password manager, or team vault).

##### Backend Configuration (`backend\.env`)
Open `backend\.env` in your editor and fill in the values:

```env
PORT=5000
NODE_ENV=development

# Supabase PostgreSQL Connection Strings
# IMPORTANT: If your DB password contains special characters (e.g. '@', ':', '#'),
# they MUST be percent-encoded (e.g., '@' becomes '%40').
# Pooler Connection (Port 6543) - used by backend runtime:
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Direct Connection (Port 5432) - used by Prisma CLI for migrations:
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase Project API Credentials
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY]"
# Optional for local demo runs; required for administrative Supabase scripts:
SUPABASE_SERVICE_ROLE_KEY=""

# Application Secrets
JWT_SECRET="crab-dev-secret-change-in-production-12345"
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"

# AI Service (Optional for basic navigation & demo login)
GEMINI_API_KEY=""
```

##### Frontend Configuration (`frontend\.env.local`)
Open `frontend\.env.local` in your editor and fill in the values:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Supabase public credentials (matches backend project)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY]
```

---

### 4. Generate Prisma Client

Generate the Prisma Client so TypeScript and Express can query the database:

```powershell
npx prisma generate --schema=backend\prisma\schema.prisma
```

---

### 5. Database Schema & Seed Data (When Needed)

- **Using the Existing Shared Supabase Database**:
  If you are connecting to our team's existing shared database, the schema and demo seed data (AWS, Veloce AI, demo creators) are already present. **Do not run `prisma migrate reset` or push destructive migrations.**
- **Setting Up a Fresh/Personal Supabase Project**:
  If you created a new personal Supabase project from scratch:
  ```powershell
  # 1. Push schema to Supabase:
  npx prisma db push --schema=backend\prisma\schema.prisma

  # 2. Populate demo accounts and campaigns:
  npm run db:seed --workspace=backend
  ```

---

### 6. Start the Application

You can start both frontend and backend concurrently with a single command from the project root:

```powershell
npm run dev
```

#### Starting in Separate Terminals (Recommended for debugging)
If you prefer separate logs:

**Terminal 1 (Backend):**
```powershell
npm run dev:backend
```
*Backend runs at: [http://localhost:5000](http://localhost:5000)*

**Terminal 2 (Frontend):**
```powershell
npm run dev:frontend
```
*Frontend runs at: [http://localhost:3000](http://localhost:3000)*

---

### 7. Verify Application Functionality

1. **Verify Backend Health**:
   Open [http://localhost:5000/health](http://localhost:5000/health) in your browser.
   You should see: `{"status":"ok","timestamp":"...","environment":"development"}`.
2. **Verify Frontend**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.
3. **Verify Demo Logins**:
   - Navigate to [http://localhost:3000/login](http://localhost:3000/login).
   - Click **"Explore as Creator"** — should log in as *Tech Lead Alex* and open `/creator/dashboard`.
   - Log out, return to `/login`, and click **"Explore as Brand"** — should log in as *Sarah Chen (Veloce AI)* and open `/brand/dashboard`.

---

## 🔐 Credentials & Security Rules

| Credential | Scope | Safe to Share in Frontend? | Notes |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend & Backend | **Yes** | Public project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend & Backend | **Yes** | Client-safe key protected by Supabase RLS |
| `NEXT_PUBLIC_API_URL` | Frontend | **Yes** | Points to local backend (`http://localhost:5000`) |
| `DATABASE_URL` | Backend Only | **NO** | Pooler connection string with password |
| `DIRECT_URL` | Backend Only | **NO** | Direct DB connection string with password |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend Only | **NO** | Bypasses all Row Level Security. Never expose to client! |
| `JWT_SECRET` | Backend Only | **NO** | Used to sign backend session tokens |
| `GEMINI_API_KEY` | Backend Only | **NO** | Google AI API key |

---

## 🛠️ Common Troubleshooting

### 1. Port already in use (`EADDRINUSE: 3000` or `EADDRINUSE: 5000`)
If a server didn't close properly, find and kill the process in PowerShell:
```powershell
# For Port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# For Port 5000
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### 2. Database connection failure (`PrismaClientInitializationError` / `P1001`)
- Verify that your network allows connections to Supabase (check firewall/VPN).
- Check `backend/.env`. If your database password contains characters like `@`, `:`, `#`, or `/`, ensure they are percent-encoded (e.g. `p@ssword` becomes `p%40ssword`).
- Ensure `DATABASE_URL` uses port `6543` with `?pgbouncer=true&sslmode=require`.

### 3. Missing Environment Variable warnings on startup
The backend includes built-in environment variable validation on boot (`src/config/env.ts`). If any required variable is missing, a clear banner will be printed to your console with instructions.

---

## 📁 Repository Structure

```text
Crab_/
├── backend/                # Express REST API & Prisma workspace
│   ├── prisma/             # Schema definitions and migrations
│   ├── src/
│   │   ├── config/         # Environment variables & startup validation
│   │   ├── controllers/    # Route controllers (auth, campaigns, creators)
│   │   ├── lib/            # Prisma, Supabase, and Redis singletons
│   │   ├── middleware/     # Auth verification and error handlers
│   │   └── routes/         # Express API routes
│   ├── .env.example        # Backend environment template
│   └── package.json
├── frontend/               # Next.js App Router workspace
│   ├── app/                # Pages and layouts (creator & brand dashboards, login)
│   ├── components/         # Reusable UI components
│   ├── lib/                # API client, auth context, Supabase client
│   ├── .env.example        # Frontend environment template
│   └── package.json
├── design/                 # UI screens & design references
├── docs/                   # Product, SRD, Architecture & Roadmap docs
└── package.json            # Root workspace scripts
```
