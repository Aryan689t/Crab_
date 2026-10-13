<div align="center">

  <img src="./frontend/public/crab-logo.png" alt="CRAB Logo" width="120" style="border-radius: 24px;" />

  # 🦀 CRAB — Creator–Brand Alignment Bridge
  ### *The AI-Powered Opportunity Engine Connecting Creators & Brands Through Contextual Intelligence & Real Social Graph Analytics*

  <p align="center">
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" /></a>
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/Node.js%20%2F%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Express" /></a>
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /></a>
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/pgvector-Semantic%20Search-blue?style=for-the-badge&logo=postgresql&logoColor=white" alt="pgvector" /></a>
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/Google%20Gemini%202.5-8E75C4?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini" /></a>
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/Meta%20Instagram%20API-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
    <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/YouTube%20Data%20API-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /></a>
  </p>

  <p align="center">
    <b>CRAB</b> replaces superficial follower counts with <b>evidence-based contextual alignment</b>. By analyzing real video transcripts, post captions, publishing cadence, and brand briefs with Gemini 2.5 and <code>pgvector</code> embeddings, CRAB finds creators who genuinely match brand campaigns.
  </p>

  <p align="center">
    <a href="#-key-features"><b>Explore Features</b></a> •
    <a href="#-system-architecture"><b>Architecture</b></a> •
    <a href="#-quickstart-guide"><b>Quickstart Setup</b></a> •
    <a href="#-environment-variables"><b>Configuration</b></a> •
    <a href="#-api-endpoints"><b>API Docs</b></a>
  </p>

</div>

---

## 🌟 The Problem & The CRAB Solution

| Traditional Marketplace Problem | The CRAB AI Solution |
| :--- | :--- |
| **Vanity Metrics**: Brands hire based purely on inflated follower counts without audience relevance. | **Real Social Ingestion**: Direct integration with YouTube Data API v3 and Meta Instagram Graph API ingesting actual uploads, likes, and comment velocity. |
| **Keyword Guessing**: Search filters rely on rigid keyword tags that miss niche crossover audiences. | **pgvector Semantic Search**: High-dimensional embeddings match natural-language campaign briefs with deep creator content history. |
| **Hallucinated & Mock Data**: Dashboards full of hardcoded dummy metrics and fake AI summaries. | **Ground-Truth Gemini Intelligence**: Every niche tag, audience interest, and brand suitability recommendation is strictly backed by retrieved database content. |
| **Fragmented Deliverables**: Collaborations managed across endless email chains and spreadsheets. | **Integrated Collaboration Engine**: Deliverable submission directly verified against ingested YouTube and Instagram media with milestone status tracking. |

---

## ✨ Key Features

### 🧠 1. Creator Intelligence Pipeline (Google Gemini 2.5)
* **Evidence-Grounded Reasoning**: Analyzes up to 30 recent real creator videos and Instagram posts.
* **Semantic Content Profiling**: Automatically extracts primary and secondary content niches, communication style, audience interests, and commercial suitability.
* **Brand Compatibility Signals**: Recommends campaign types that naturally fit the creator's voice, highlighting sensitive verticals to avoid.
* **Honest Confidence Scoring**: Distinguishes measured facts from AI inferences. If content is sparse, displays honest insufficient-data states rather than inventing statistics.

### 🔴 2. YouTube Data API v3 Integration (Real Data Only)
* **Channel Ingestion**: Instant synchronization of channel subscriber counts, lifetime views, and total uploads.
* **Upload Ingestion**: Automatically crawls the uploads playlist to fetch published video titles, descriptions, publication timestamps, and view counts.
* **Dual Connection Support**: Full Google OAuth 2.0 authorization or direct handle/channel resolution (`@handle`).

### 🟣 3. Meta Instagram Graph API Integration (Official OAuth)
* **Secure Meta OAuth 2.0**: Single-use cryptographic CSRF state validation with 15-minute expiration and replay attack prevention.
* **Long-Lived Token Exchange**: Short-lived tokens are upgraded on the server to 60-day refreshable long-lived access tokens via `graph.instagram.com`.
* **Media & Post Tracking**: Retrieves real captions, permalinks, post timestamps, like counts, comment counts, and media formats (Reels, Carousels, Images).
* **Strict Server-Side Isolation**: Meta client secrets and access tokens are encrypted and never exposed to the frontend.

### 🎨 4. Dual Workspace Architecture
* **Creator Portal** (`/creator`):
  * **Overview KPI Cards**: Audience size, verified average interactions, engagement rate, and weekly posting cadence.
  * **Platform Breakdown**: Live status badges and follower distributions across YouTube and Instagram.
  * **Intelligence Dashboard**: Gemini-generated brand suitability profile and content style badges.
  * **Collaborations Workspace**: Deliverable fulfillment with single-click YouTube video or Instagram Reel submission.
* **Brand Portal** (`/brand`):
  * **Campaign Studio**: Structured campaign creator with target niches, deliverable requirements, timeline, and budget ranges.
  * **Creator Discovery & Matching**: Real-time semantic similarity match scores calculated from pgvector embeddings.
  * **Applications & Offers**: Review creator applications, send custom collaboration offers, and track contract milestones.
  * **Brand Inbox**: Direct real-time messaging thread between creators and brands.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (Next.js 15 App Router)"]
        UI_Creator["Creator Portal\n(/creator/*)"]
        UI_Brand["Brand Portal\n(/brand/*)"]
        UI_Auth["Supabase Auth Context\n& Demo Bypass"]
    end

    subgraph Server["Backend (Node.js & Express TypeScript)"]
        API_Auth["Auth Middleware\n(JWT & Role Guard)"]
        API_Social["Social API Handlers\n(OAuth & Webhooks)"]
        API_Intel["Intelligence Controller"]
        API_Collab["Collaborations Controller"]
    end

    subgraph Data["Database & Vector Storage (Supabase)"]
        DB_PG[("PostgreSQL")]
        DB_VEC[("pgvector\nEmbeddings")]
        Prisma["Prisma ORM Client"]
    end

    subgraph External["External Providers & APIs"]
        MetaAPI["Meta Instagram Graph API\n(OAuth & Media Nodes)"]
        YouTubeAPI["Google YouTube Data API v3\n(Channels & Playlists)"]
        GeminiAPI["Google Gemini 2.5 Flash\n(Structured Analysis)"]
    end

    UI_Creator -->|HTTP / JSON| API_Auth
    UI_Brand -->|HTTP / JSON| API_Auth
    API_Auth --> API_Social
    API_Auth --> API_Intel
    API_Auth --> API_Collab

    API_Social -->|OAuth & Token Exchange| MetaAPI
    API_Social -->|Channel & Video Lookup| YouTubeAPI
    API_Intel -->|Evidence-Based Prompting| GeminiAPI

    API_Social --> Prisma
    API_Intel --> Prisma
    API_Collab --> Prisma

    Prisma --> DB_PG
    Prisma --> DB_VEC
```

---

## 🚀 Quickstart Guide

### Prerequisites
* **Node.js**: v18.18+ or v20+ (`node -v`)
* **npm**: v9+ or v10+ (`npm -v`)
* **Git**: Installed and configured (`git --version`)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Aryan689t/Crab_.git
cd Crab_
```

---

### Step 2: Install All Dependencies

CRAB uses npm workspaces. Installing from the root installs dependencies across the root, `backend`, and `frontend`:

```bash
npm install
```

---

### Step 3: Configure Environment Variables

Generate local `.env` files from the provided templates:

**Windows PowerShell:**
```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

**macOS / Linux:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

#### Backend Settings (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"

# Supabase PostgreSQL (Transaction Pooler port 6543)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase Auth
SUPABASE_URL="https://[REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
JWT_SECRET="your-development-jwt-secret"

# AI Integration
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Meta Instagram Graph API
INSTAGRAM_APP_ID="your-meta-app-id"
INSTAGRAM_APP_SECRET="your-meta-app-secret"
INSTAGRAM_REDIRECT_URI="http://localhost:5000/api/social/instagram/callback"

# YouTube Data API
YOUTUBE_API_KEY="your-youtube-api-key"
```

#### Frontend Settings (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### Step 4: Generate Prisma Client

```bash
npx prisma generate --schema=backend/prisma/schema.prisma
```

---

### Step 5: Launch Development Servers

Run both the frontend and backend simultaneously using the root monorepo script:

```bash
npm run dev
```

* 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
* ⚙️ **Backend**: [http://localhost:5000](http://localhost:5000)
* 🩺 **Backend Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🔐 Credentials & Security Matrix

| Variable | Target | Client-Safe? | Description |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend & Backend | **YES** | Public Supabase project API host |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend & Backend | **YES** | Public Supabase anonymous key (protected by RLS) |
| `NEXT_PUBLIC_API_URL` | Frontend | **YES** | Base URL of CRAB Express API |
| `DATABASE_URL` | Backend Only | ❌ **NO** | Supabase connection string (pooler port 6543) |
| `DIRECT_URL` | Backend Only | ❌ **NO** | Direct connection string for Prisma migrations |
| `GEMINI_API_KEY` | Backend Only | ❌ **NO** | Google AI API key (never expose to Vercel/frontend) |
| `INSTAGRAM_APP_SECRET` | Backend Only | ❌ **NO** | Meta OAuth application client secret |
| `JWT_SECRET` | Backend Only | ❌ **NO** | Secret key for signing internal CRAB session tokens |

---

## 📡 Core API Blueprint

| Domain | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Email/password or session login |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile & role |
| **Creators** | `GET` | `/api/creators/me` | Authenticated creator profile & niches |
| **Creators** | `PATCH` | `/api/creators/me` | Update bio, location, baseline pricing, and niches |
| **Intelligence** | `GET` | `/api/creators/me/intelligence` | Retrieve stored Gemini AI analysis |
| **Intelligence** | `POST` | `/api/creators/me/intelligence/analyze` | Refresh live social data & trigger Gemini re-analysis |
| **Social** | `GET` | `/api/social/accounts` | List connected YouTube & Instagram accounts |
| **YouTube** | `GET` | `/api/social/youtube/videos` | Fetch stored YouTube uploaded video records |
| **YouTube** | `POST` | `/api/social/youtube/sync` | Re-sync YouTube channel statistics & recent uploads |
| **Instagram** | `GET` | `/api/social/instagram/auth-url` | Generate Meta Instagram OAuth authorization URL |
| **Instagram** | `GET` | `/api/social/instagram/callback` | Handle Meta OAuth callback & exchange long-lived tokens |
| **Instagram** | `GET` | `/api/social/instagram/media` | Fetch stored Instagram posts & reels |
| **Instagram** | `POST` | `/api/social/instagram/sync` | Re-sync Instagram account metadata & media |
| **Campaigns** | `GET` | `/api/campaigns` | List active brand campaigns |
| **Campaigns** | `POST` | `/api/campaigns` | Create a new brand campaign brief |
| **Collabs** | `POST` | `/api/collaborations/:id/submit-video` | Submit YouTube or Instagram media deliverable proof |

---

## 🧪 Verification & Testing

CRAB includes built-in test scripts for verifying data ingestion and security flows:

```bash
# Run Instagram integration & OAuth CSRF verification suite:
npx tsx backend/src/scripts/verifyInstagram.ts

# Run frontend production build check:
npm run build --workspace=frontend
```

---

## 📁 Repository Structure

```text
Crab_/
├── backend/                        # Node.js + Express TypeScript API
│   ├── prisma/                     # Prisma schema, migrations & seed scripts
│   │   └── schema.prisma           # Complete relational & vector schema
│   ├── src/
│   │   ├── config/                 # Environment validation & setup
│   │   ├── controllers/            # Route controllers (social, creators, campaigns)
│   │   ├── integrations/
│   │   │   ├── gemini/             # Google Gemini 2.5 Flash analysis & prompts
│   │   │   ├── instagram/          # Meta Instagram Graph API engine & OAuth
│   │   │   └── youtube/            # Google YouTube Data API v3 engine
│   │   ├── middleware/             # Supabase JWT authentication & role guards
│   │   ├── routes/                 # Express REST route definitions
│   │   └── scripts/                # Automated verification suites
│   └── package.json
├── frontend/                       # Next.js 15 App Router Frontend
│   ├── app/                        # Pages & routing
│   │   ├── brand/                  # Brand portal (dashboard, campaigns, discovery)
│   │   ├── creator/                # Creator portal (dashboard, intel, collabs)
│   │   └── login/                  # Authentication & one-click demo login
│   ├── components/                 # Reusable UI components & navigation
│   ├── lib/                        # API client, auth context & helpers
│   ├── public/                     # Brand logos, icons & static assets
│   └── package.json
└── package.json                    # Monorepo orchestration scripts
```

---

## 👥 Contributors

Built with ❤️ by the **CRAB Team** as the next-generation Creator–Brand Opportunity Engine.

<p align="center">
  <b>CRAB</b> — <i>Turning creator content into clear brand opportunity.</i>
</p>
