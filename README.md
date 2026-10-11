# CRAB — Creators Reaching Aligned Brands

CRAB is an AI-powered two-sided Creator–Brand Opportunity Engine. It uses contextual understanding, pgvector semantic embeddings, and explainable AI reasoning to connect creators and brands.

---

## 🏗️ Architecture Overview

* **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Recharts
* **Backend**: Node.js + Express.js (TypeScript), Prisma ORM
* **Database & Vectors**: Supabase PostgreSQL with `pgvector` extension
* **Authentication**: Supabase Auth (JWT Bearer Token with role authorization middleware)
* **AI Engine**: Google Gemini API + text embeddings

---

## 🚀 Quick Start

### 1. Install Dependencies

Install root workspace dependencies as well as frontend and backend packages:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configure Environment Variables

Copy the environment templates and update with your Supabase credentials:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env.local
```

### 3. Generate Prisma Client

```bash
cd backend
npx prisma generate
cd ..
```

### 4. Run Development Servers

Run both backend and frontend concurrently:

```bash
npm run dev
```

* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 📁 Repository Structure

```text
Hackering prac/
├── backend/                # Express REST API & Prisma schema
│   ├── prisma/             # Database models with pgvector support
│   ├── src/
│   │   ├── config/         # Environment variables
│   │   ├── lib/            # Prisma and Supabase singletons
│   │   ├── middleware/     # Auth & error handling
│   │   └── routes/         # Health & API route controllers
│   └── package.json
├── frontend/               # Next.js App Router workspace
│   ├── app/                # Layouts, pages, design system tokens
│   ├── lib/                # API and Supabase clients
│   └── package.json
├── design/                 # UI screens & design references
├── docs/                   # Product, SRD, Architecture & Roadmap docs
└── package.json            # Root workspace scripts
```
