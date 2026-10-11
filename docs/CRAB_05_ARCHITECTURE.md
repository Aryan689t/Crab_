# CRAB — System & Application Architecture

**Document:** 05_ARCHITECTURE.md  
**Project:** CRAB — Creators Reaching Aligned Brands  
**Status:** MVP Architecture

## 1. Purpose

This document defines how CRAB's chosen technologies communicate, where application responsibilities live, how data moves through the system, and how the codebase is organized.

### Core principle

> **AI recommends and interprets; the backend enforces rules and executes application logic.**

The architecture supports both Creator and Brand workflows while keeping the MVP simple enough for the team to build and debug.

---

## 2. High-Level Architecture

```text
                         Creators + Brands
                                |
                                v
                 +-------------------------------+
                 |       Next.js Frontend        |
                 | TypeScript / Tailwind / UI    |
                 | Motion / R3F / Recharts       |
                 +---------------+---------------+
                                 |
                            HTTPS / REST
                                 |
                                 v
                 +-------------------------------+
                 |       Node + Express API      |
                 | Auth / Business Logic         |
                 | Matching / Messaging          |
                 | AI orchestration / Payments   |
                 +-------+-----------+------------+
                         |           |
              +----------+           +-----------+
              v                                  v
   +---------------------+             +--------------------+
   | PostgreSQL +        |             | AI Layer           |
   | pgvector + Prisma   |             | Gemini + embeddings |
   +----------+----------+             +--------------------+
              |
              +-------------------+
                                  |
                 +----------------+----------------+
                 |                                 |
                 v                                 v
        YouTube / Instagram                    Razorpay
             APIs                              Payments
```

The frontend presents the product. The Express backend is the trusted application/business layer. PostgreSQL is the main source of truth. AI services provide interpretation and semantic understanding. External APIs provide social and payment capabilities.

---

## 3. Technology Responsibilities

| Technology | Responsibility |
|---|---|
| Next.js | Web application, routing, rendering |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Reusable UI components |
| Framer Motion | UI animation |
| React Three Fiber / Three.js | Selective 3D/visual experiences |
| Recharts | Analytics and graphs |
| Node.js | Backend runtime |
| Express.js | REST API/business boundary |
| Prisma | Database ORM |
| Supabase Auth | Authentication |
| PostgreSQL | Primary application database |
| pgvector | Embedding storage/search |
| Gemini API | LLM-based analysis and reasoning |
| Embedding API/model | Semantic representation |
| YouTube API | Authorized YouTube data |
| Instagram API | Authorized Instagram data |
| Razorpay | MVP payment processing |
| Vercel | Frontend deployment |
| Separate backend host | Express deployment |

---

## 4. Frontend Architecture

Next.js is responsible for presentation and user interaction, including:

- Creator onboarding and dashboard
- Brand onboarding and dashboard
- Profiles
- Campaign creation
- Creator discovery
- Opportunity discovery
- Analytics and graphs
- Match explanations
- Messaging
- Offers/counteroffers
- Payment UI
- Loading, empty, and error states

The frontend must not be the authority for authorization, payment success, matching rules, or protected API credentials.

### Proposed structure

```text
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── creator/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── opportunities/
│   │   ├── applications/
│   │   ├── messages/
│   │   └── collaborations/
│   └── brand/
│       ├── dashboard/
│       ├── profile/
│       ├── campaigns/
│       ├── creators/
│       ├── messages/
│       └── collaborations/
├── components/
│   ├── ui/
│   ├── charts/
│   ├── layout/
│   └── shared/
├── features/
│   ├── creator/
│   ├── brand/
│   ├── campaigns/
│   ├── matching/
│   ├── messaging/
│   ├── offers/
│   ├── payments/
│   └── analytics/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── validation/
│   └── utils/
├── hooks/
├── types/
└── public/
```

This is a proposed implementation structure and may evolve as features are built.

---

## 5. Backend Architecture

The Express backend owns application/business logic:

- Authentication verification and authorization
- Creator/brand/campaign operations
- Social API integration
- Data normalization
- Metric calculations
- AI orchestration
- Embeddings
- Matching/ranking
- Conflict detection
- Messaging
- Offers/counteroffers
- Payment creation/verification
- Collaboration state
- External API error handling

### Request flow

```text
HTTP Request
    |
    v
Routes
    |
    v
Middleware
(auth / authorization / validation / errors)
    |
    v
Controllers
    |
    v
Services
    |
    +---- Database
    +---- AI
    +---- Integrations
```

### Proposed structure

```text
backend/
└── src/
    ├── routes/
    ├── controllers/
    ├── services/
    ├── ai/
    │   ├── gemini.client.ts
    │   ├── prompts/
    │   ├── creator-intelligence/
    │   ├── campaign-intelligence/
    │   ├── content-analysis/
    │   ├── embeddings/
    │   └── validation/
    ├── integrations/
    │   ├── youtube/
    │   ├── instagram/
    │   └── razorpay/
    ├── middleware/
    ├── db/
    ├── types/
    ├── utils/
    ├── config/
    └── server.ts
```

Routes define endpoints, controllers translate HTTP requests, services contain business logic, integrations isolate provider-specific APIs, and the AI layer isolates Gemini/embedding logic.

---

## 6. Authentication & Authorization

Supabase Auth handles authentication. The CRAB backend still enforces authorization.

```text
User -> Next.js -> Supabase Auth
                    |
                    v
             Authenticated session
                    |
                    v
               CRAB Backend
                    |
          verify + authorize action
```

Authentication answers **who the user is**. Authorization answers **what the user is allowed to do**.

Examples:

- A creator cannot edit another creator's profile.
- A brand cannot modify another brand's campaign.
- A user cannot read another user's private messages.
- Payment operations are validated server-side.

---

## 7. Database Architecture

PostgreSQL is the primary source of truth. Prisma provides application access to it, and pgvector stores embeddings.

Changing social metrics do **not** require a second primary database. Historical metric snapshots preserve changes over time.

```text
creator_metric_snapshots
---------------------------------------------
creator_id | followers | avg_views | recorded_at
C001       | 82000      | 31000     | Oct 01
C001       | 83100      | 32700     | Oct 04
```

This supports growth graphs, historical analysis, and evidence-backed explanations.

Core relationship model:

```text
User
├── Creator
│   ├── SocialAccount
│   ├── CreatorMetricSnapshot
│   ├── Content
│   └── CreatorAIProfile
└── Brand
    └── Campaign
        └── CampaignAIProfile

Creator <---- Match ----> Campaign
Creator <---- Collaboration ----> Brand
Conversation -> Messages -> Offers -> Payments
```

The detailed schema belongs in `06_DATABASE.md`.

---

## 8. Social API Architecture

CRAB uses authorized YouTube and Instagram APIs where the required permissions/data are available.

```text
Creator
  |
  v
Connect account / authorization
  |
  v
CRAB Backend
  |
  +---- YouTube API
  +---- Instagram API
          |
          v
      Raw provider data
          |
          v
      Normalization
          |
          v
      PostgreSQL
          |
          v
      AI pipeline
```

Provider-specific response formats are normalized before entering core CRAB logic. This keeps the matching system independent of a particular social API's response shape.

Where APIs cannot provide a required field, CRAB must mark it unavailable rather than fabricate it. Manual/demo fallback is permitted where already defined by the MVP.

---

## 9. Creator Intelligence Pipeline

```text
Social API data
      |
      v
Normalized creator data
      |
      +-- profile
      +-- metrics
      +-- content
      +-- history
      |
      v
Backend metric calculations
      |
      v
Gemini content analysis
      |
      +-- topics / niches
      +-- style
      +-- audience interpretation
      +-- commercial categories
      +-- brand suitability
      |
      v
CreatorAIProfile
      |
      v
Embedding -> pgvector
```

CRAB distinguishes between direct, derived, AI-inferred, and unavailable data. AI interprets data; it should not invent unavailable facts.

---

## 10. Campaign Intelligence Pipeline

```text
Brand campaign input
        |
        v
Backend validation/storage
        |
        v
Gemini
        |
        v
Structured CampaignAIProfile
        |
        +-- objective
        +-- audience
        +-- budget
        +-- platform
        +-- content type/style
        +-- creator niche
        +-- location
        +-- timeline
        +-- exclusivity
        +-- usage rights
        |
        v
Embedding -> pgvector
```

AI output must be validated before it becomes application data.

---

## 11. Embedding & Matching Architecture

Embeddings provide semantic similarity but do not determine the final match by themselves.

```text
Creator representation ----> Embedding --+
                                         |
Campaign representation -> Embedding ----+-> Candidate filtering
                                             |
                                             v
                                      Hybrid scoring
                                             |
                           +-----------------+----------------+
                           |                 |                |
                      semantic         audience         requirements
                      relevance         overlap             fit
                           |                 |                |
                           +-----------------+----------------+
                                             |
                                             v
                                        Final ranking
                                             |
                                             v
                                      Evidence collection
                                             |
                                             v
                                       Explanation
```

Initial scoring assumptions from `08_AI_MATCHING.md`:

| Signal | Initial Weight |
|---|---:|
| Semantic relevance | 30% |
| Audience overlap | 25% |
| Performance | 15% |
| Platform fit | 10% |
| Campaign requirements | 10% |
| Brand compatibility | 5% |
| Historical performance | 5% |

These are starting assumptions, not validated constants. They can change after real CRAB outcome data is collected.

### Candidate filtering

Hard requirements should be checked before ranking where appropriate, such as platform, reach, budget, location, and campaign restrictions.

### Explainability

A recommendation should be backed by actual evidence, for example:

```text
Strong fitness-content relevance
Audience aligns with campaign target
Recent average views meet requirement
Strong recent engagement
Potential competitor conflict detected
```

The AI may turn evidence into readable language, but it must not invent evidence.

---

## 12. Opportunity Discovery

For the MVP, creator opportunity discovery primarily matches creators against campaigns already present in CRAB.

```text
Creator -> Creator Intelligence -> Matching Engine
        -> Available Campaigns -> Ranked Opportunities
```

The reverse direction is equally important:

```text
Brand -> Campaign Intelligence -> Matching Engine
      -> Eligible Creators -> Ranked Creator List
```

External opportunity discovery is a future capability.

---

## 13. Conflict Detection

Conflict detection can initially be deterministic.

```text
Creator collaboration history
          |
          v
Previous brands/categories
          |
          v
Compare with current campaign/brand
          |
          v
Potential conflict warning
```

Example: if a creator previously worked with Swiggy and a current campaign is for Zomato, CRAB can flag a potential competitor conflict. The user/brand makes the final decision.

---

## 14. Messaging & Negotiation

MVP messaging is basic in-app text.

```text
Creator <-> Conversation <-> Brand
                    |
                    v
                  Offers
                    |
              accept/reject/counter
```

Supported MVP negotiation:

- Initial offer
- Counteroffer
- Acceptance/rejection
- Negotiation history

AI may suggest pricing ranges or counteroffers, but must not claim that a suggested number is the true market price. The creator remains in control.

Audio/video calling is outside the MVP.

---

## 15. Payment Architecture

MVP payment direction is **Brand -> Creator**, using Razorpay test/sandbox mode.

```text
Brand
  |
  v
Agreed collaboration
  |
  v
CRAB Backend
  |
  v
Razorpay
  |
  v
Payment result / webhook
  |
  v
CRAB Backend
  |
  v
Payment status -> PostgreSQL
```

The frontend must not be treated as authoritative for payment success. Production escrow and advanced financial workflows are outside the MVP.

---

## 16. Data Freshness & Processing

Social metrics change continuously. CRAB should preserve useful history through snapshots rather than treating every update as a replacement of the past.

Potentially expensive operations include:

- Social content ingestion
- AI analysis of many content items
- Creator intelligence generation
- Embedding generation
- Metric refreshes

Conceptually:

```text
User action
   |
   v
Backend saves state
   |
   v
Processing pipeline
   |
   +-- social APIs
   +-- calculations
   +-- Gemini
   +-- embeddings
   |
   v
Database updated
   |
   v
Dashboard reflects state
```

The MVP can begin with simple processing. A dedicated queue/worker system should be introduced only if actual processing volume requires it.

---

## 17. Error Handling & AI Reliability

The system must expect external services to fail or return incomplete information.

### Frontend

Provide loading, empty, retry, and human-readable error states.

### Backend

Handle validation, authorization, database, AI, social API, and payment failures.

### AI

If Gemini fails, CRAB should not fabricate an answer. Structured AI output should be validated before storage/use. AI unavailability should be distinguishable from a legitimate conclusion that information is unavailable.

---

## 18. Security Boundaries

Secrets and sensitive operations stay server-side.

Examples:

- Gemini API key -> backend only
- YouTube/Instagram secrets -> backend only
- Razorpay secret -> backend only
- Database credentials -> backend/server environment

The frontend may request an operation, but the backend decides whether the authenticated user is authorized and whether the operation is valid.

---

## 19. Deployment Architecture

```text
                     Internet
                        |
             +----------+----------+
             |                     |
             v                     v
      Vercel / Next.js       Backend Host
        Frontend             Node + Express
                                   |
              +--------------------+--------------------+
              |                    |                    |
              v                    v                    v
        Supabase DB/Auth         Gemini          External APIs
        PostgreSQL               API             YouTube
        pgvector                 Embeddings      Instagram
                                                  Razorpay
```

The exact Express hosting provider is not a core application dependency and can be selected separately.

---

## 20. Environment Configuration

Secrets should be stored in environment variables and never committed to source control.

Typical values include:

```text
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
YOUTUBE_CLIENT_ID
YOUTUBE_CLIENT_SECRET
INSTAGRAM_CLIENT_ID
INSTAGRAM_CLIENT_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Actual secret values are never placed in the repository.

---

## 21. End-to-End Creator Flow

```text
Signup
  -> Supabase Auth
  -> Basic profile
  -> Connect YouTube/Instagram
  -> Backend
  -> Social API
  -> Normalize data
  -> Store metrics/content
  -> Calculate metrics
  -> Gemini analysis
  -> CreatorAIProfile
  -> Generate embedding
  -> pgvector
  -> Match campaigns
  -> Rank opportunities
  -> Generate evidence-backed explanation
  -> Creator dashboard
```

## 22. End-to-End Brand Flow

```text
Signup
  -> Supabase Auth
  -> Brand profile
  -> Create campaign
  -> Backend validation/storage
  -> Gemini campaign intelligence
  -> CampaignAIProfile
  -> Generate embedding
  -> pgvector
  -> Find eligible creators
  -> Hybrid matching
  -> Rank creators
  -> Explain recommendations
  -> Outreach / messaging
  -> Offer / counteroffer
  -> Agreement
  -> Payment
  -> Collaboration
```

---

## 23. Responsibility Matrix

| Responsibility | Frontend | Backend | AI | Database | External API |
|---|---:|---:|---:|---:|---:|
| Render UI | Yes | | | | |
| Authentication UI | Yes | Yes | | | |
| Authorization | | Yes | | | |
| Profile/campaign operations | Yes | Yes | | Yes | |
| Social ingestion | | Yes | | Yes | Yes |
| Metric calculation | | Yes | | Yes | |
| Content interpretation | | Yes | Yes | | |
| Embeddings | | Yes | Yes | Yes | |
| Candidate filtering | | Yes | | Yes | |
| Match scoring | | Yes | | Yes | |
| Match explanation | Yes | Yes | Yes | Yes | |
| Messaging | Yes | Yes | | Yes | |
| Offers | Yes | Yes | | Yes | |
| Payment | Yes | Yes | | Yes | Yes |
| Payment verification | | Yes | | Yes | Yes |

---

## 24. MVP vs Future Architecture

### MVP

```text
Next.js
   |
Express
   |
PostgreSQL + pgvector
   |
Gemini
   |
YouTube + Instagram
   |
Razorpay
```

### Future possibilities

Only add these when scale or real product data justifies them:

- Dedicated job queues/workers
- Redis/caching
- More event-driven processing
- Proprietary ranking/ML models
- Fraud detection
- Deeper cross-platform audience analysis
- External opportunity discovery
- Production escrow
- Campaign execution infrastructure
- Outcome-based recommendation learning

---

## 25. Architecture Principles

1. **Keep the MVP simple.** Do not introduce infrastructure without a clear requirement.
2. **Separate AI from business rules.** Gemini interprets and recommends; the backend enforces application rules.
3. **Preserve evidence.** Recommendations should be explainable using real data.
4. **Normalize external data.** Core CRAB logic should not depend on provider-specific response formats.
5. **Treat changing metrics as historical data.** Use snapshots where useful.
6. **Protect sensitive operations.** Secrets, authorization, and payment verification remain server-side.
7. **Design for both sides.** Creator and Brand workflows are first-class.
8. **Build for evolution, not premature scale.** Keep clean boundaries without building future infrastructure early.

---

## 26. Final Architecture Summary

CRAB combines a visually rich Next.js frontend with a Node/Express application backend, PostgreSQL/pgvector data layer, Gemini-based AI services, authorized YouTube and Instagram integrations, and Razorpay payments.

The architecture is centered on one idea:

> **CRAB turns creator and campaign information into explainable, evidence-backed opportunities through contextual AI understanding combined with deterministic backend logic.**

---

## Related Documents

- `01_PRD.md` — Product requirements
- `02_MVP.md` — MVP scope
- `03_USER_FLOWS.md` — User journeys
- `04_SRD.md` — System requirements
- `06_DATABASE.md` — Detailed database schema
- `07_API_SPEC.md` — Backend API specification
- `08_AI_MATCHING.md` — AI and matching design
- `09_UI_UX.md` — Interface and experience design
- `10_ROADMAP.md` — Development roadmap
- `11_AI_INSTRUCTIONS.md` — AI implementation instructions
