# CRAB — Development Roadmap

## 1. Purpose

This roadmap defines the practical build order for CRAB — Creators Reaching Aligned Brands.

It connects the existing product/system documentation to the actual implementation workflow:

**Documentation → Figma → Frontend → Backend/API → Database/AI → Integration → Testing → Demo**

The roadmap is intentionally implementation-oriented. Each phase should produce something concrete that can be designed in Figma, implemented, tested, and demonstrated.

---

## 2. How the Team Should Use This Roadmap

CRAB should **not** be built as:

> Finish all UI → finish all backend → finish all AI → connect everything at the end.

Instead, use **vertical slices**.

For each major feature:

1. Define/confirm the requirements from the existing docs.
2. Design the flow and screens in Figma.
3. Implement the frontend.
4. Implement the required API/backend logic.
5. Implement the required database changes.
6. Add AI/integrations where required.
7. Connect the complete flow.
8. Test it.
9. Mark the feature complete.
10. Convert the next roadmap item into GitHub Issues.

This reduces integration risk and lets the team continuously have a working product.

---

# 3. Roadmap Overview

| Phase | Area | Main Outcome | Priority |
|---|---|---|---|
| 0 | Documentation Lock | Product and technical foundation ready | P0 |
| 1 | Figma + Design System | Complete product design foundation | P0 |
| 2 | Project Foundation | Repositories and application skeleton ready | P0 |
| 3 | Authentication + Roles | Creator/Brand accounts work | P0 |
| 4 | Creator Vertical Slice | Creator can onboard and view profile | P0 |
| 5 | Social Integration | YouTube/Instagram data can enter CRAB | P0 |
| 6 | Creator Intelligence | CRAB understands creator content/profile | P0 |
| 7 | Brand + Campaign System | Brand can create AI-understood campaigns | P0 |
| 8 | Matching + Discovery | Both sides receive explainable matches | P0 |
| 9 | Collaboration | Messaging, offers and negotiation work | P0 |
| 10 | Payments | Razorpay test payment flow works | P0 |
| 11 | History + Analytics | Collaboration history and useful metrics | P1 |
| 12 | Integration + Reliability | Full system works together reliably | P0 |
| 13 | Polish + Demo | Hackathon-ready final product | P0 |

---

# 4. Phase 0 — Documentation Lock

## Goal

Make sure the team has one consistent understanding of the product before implementation begins.

## Existing documents

- `01_PRD.md`
- `02_MVP.md`
- `03_USER_FLOWS.md`
- `04_SRD.md`
- `05_ARCHITECTURE.md`
- `06_DATABASE.md`
- `07_API_SPEC.md`
- `08_AI_MATCHING.md`
- `09_UI_UX.md`
- `10_ROADMAP.md`
- `11_AI_INSTRUCTIONS.md`

## Tasks

- Review the MVP scope.
- Confirm creator and brand flows.
- Confirm locked technology stack.
- Confirm database model.
- Confirm API boundaries.
- Confirm AI responsibilities.
- Confirm what is real vs mocked/demo fallback.
- Confirm no out-of-scope features accidentally enter MVP.

## Definition of Done

- Team agrees on MVP scope.
- No major architecture decision is unresolved.
- Figma and implementation can begin.

---

# 5. Phase 1 — Figma + Design System

## Goal

Create the visual/product design that will guide implementation.

This phase happens before major frontend implementation.

## Design system

Create:

- Color system
- Typography
- Spacing
- Border radius
- Shadows
- Buttons
- Inputs
- Selects
- Cards
- Badges
- Tabs
- Modals
- Dropdowns
- Toasts
- Loading states
- Empty states
- Error states
- Navigation
- Charts
- Match/recommendation components

## Public/Shared Screens

Design:

- Landing page
- Login
- Signup
- Role selection
- Basic error states

## Creator Screens

Design:

- Creator onboarding
- Creator profile
- Social account connection
- Social connection status
- AI analysis/loading state
- Creator dashboard
- Creator intelligence
- Opportunity feed
- Opportunity detail
- Match explanation
- Campaign/application flow
- Conversations
- Offers
- Counteroffers
- Payment status
- Collaboration history

## Brand Screens

Design:

- Brand onboarding
- Brand profile
- Brand dashboard
- Campaign creation
- Campaign AI understanding/review
- Campaign details
- Creator discovery
- Creator profile
- Match explanation
- Outreach
- Conversations
- Offers
- Payment
- Collaboration history

## Definition of Done

- Main creator flow is designed.
- Main brand flow is designed.
- Shared components are defined.
- Desktop layouts are ready.
- Important loading, empty and error states are included.
- Figma designs are clear enough to implement without guessing.

---

# 6. Phase 2 — Project Foundation

## Goal

Create the actual engineering foundation.

## Frontend

Set up:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- React Three Fiber / Three.js only where useful

## Backend

Set up:

- Node.js
- Express.js
- TypeScript
- Prisma
- API structure
- Environment configuration
- Error handling
- Logging

## Database

Set up:

- PostgreSQL
- Supabase
- pgvector
- Prisma connection

## Authentication

Prepare:

- Supabase Auth
- Bearer-token flow
- Backend authentication middleware

## Repository

Prepare:

- GitHub repository
- frontend/backend structure
- environment templates
- README
- basic CI/checks if time permits

## Definition of Done

- Frontend starts.
- Backend starts.
- Database connects.
- Prisma works.
- Auth foundation exists.
- Team members can run the project locally.

---

# 7. Phase 3 — Authentication + Roles

## Goal

Allow users to enter CRAB as either a Creator or Brand.

## Creator Flow

Signup → role selection → creator profile setup → creator dashboard.

## Brand Flow

Signup → role selection → brand profile setup → brand dashboard.

## Backend

Implement:

- Auth verification
- User creation/profile mapping
- Role authorization
- Creator/Brand profile APIs
- Protected routes

## Frontend

Implement:

- Login
- Signup
- Role selection
- Profile setup
- Protected layouts
- Logout
- Unauthorized/error states

## Definition of Done

A new creator and a new brand can independently:

- Sign up.
- Log in.
- Create their profile.
- Reach the correct dashboard.
- Access only authorized resources.

---

# 8. Phase 4 — Creator Vertical Slice

## Goal

Build the first complete creator-side product slice.

## Flow

Creator signup  
→ profile setup  
→ dashboard  
→ connect social account  
→ imported data  
→ AI analysis  
→ creator intelligence  
→ opportunities

## Creator Profile

Implement:

- Name
- Bio
- Location
- Niches
- Platforms
- Contact information

## Dashboard

Show:

- Followers/subscribers
- Average views
- Engagement
- Growth
- Posting frequency
- Content overview
- AI insights

## Definition of Done

A creator can enter CRAB and see a meaningful profile/dashboard even before the complete matching system exists.

---

# 9. Phase 5 — Social Integration

## Goal

Bring authorized creator data into CRAB.

## Platforms

- YouTube
- Instagram

Use official APIs where available and permitted.

## Social Account Flow

Connect → authorize → callback → store account → fetch data → normalize data → save → display.

## Backend

Implement platform integration modules:

```text
integrations/
├── youtube/
└── instagram/
```

## Data

Import where available:

- Followers/subscribers
- Views
- Engagement signals
- Posting frequency
- Content metadata
- Content performance
- Historical metric snapshots where appropriate

## Important Rule

CRAB must never invent unavailable social data.

If an API does not provide something:

- mark it unavailable, or
- derive it only when derivation is valid, or
- use AI inference only when clearly labeled as inference.

## Fallback

If API permissions/data access are unavailable during the demo:

- provide a controlled manual/demo data path.

## Definition of Done

At least one social integration works end-to-end, and the system has a reliable fallback for the demo.

---

# 10. Phase 6 — Creator Intelligence

## Goal

Turn imported creator data into a useful AI-understood creator profile.

## Pipeline

Social data  
→ normalization  
→ content/metrics  
→ AI analysis  
→ structured creator intelligence  
→ database  
→ creator UI

## AI Outputs

Possible outputs include:

- Primary niche
- Secondary niches
- Content style
- Audience type
- Main topics
- Commercial categories
- Brand suitability
- Content themes
- Opportunity signals

## Content Analysis

Use available:

- Titles
- Descriptions
- Captions
- Hashtags
- Transcripts/textual context
- Performance metrics

depending on platform availability.

## AI Architecture

Gemini is used for interpretation.

Backend remains responsible for:

- validation
- calculations
- business rules
- persistence
- authorization

## Definition of Done

CRAB can take real or demo social data and produce a structured creator intelligence profile that is visible in the UI.

---

# 11. Phase 7 — Brand + Campaign System

## Goal

Build the second major vertical slice.

## Brand Flow

Brand signup  
→ brand profile  
→ create campaign  
→ AI understands campaign  
→ review campaign  
→ publish campaign  
→ receive creator matches

## Campaign Fields

Support:

- Product/service
- Objective
- Target audience
- Budget
- Required reach
- Minimum views/followers where applicable
- Platform
- Content type/style
- Creator niche
- Location
- Timeline
- Exclusivity
- Usage rights

## Campaign Intelligence

AI converts campaign information into a structured campaign profile.

Possible outputs:

- Campaign category
- Target creator niches
- Audience requirements
- Content requirements
- Semantic campaign representation
- Compatibility requirements

## Definition of Done

A brand can create a campaign and receive a structured AI interpretation before matching begins.

---

# 12. Phase 8 — Matching + Discovery

## Goal

Make CRAB's core value proposition work.

## Core Principle

CRAB should not simply rank people by popularity.

It should combine:

- Semantic relevance
- Audience overlap
- Performance
- Platform fit
- Campaign requirements
- Brand compatibility
- Historical performance

## Matching Architecture

Creator/campaign data  
→ embeddings  
→ candidate filtering  
→ semantic similarity  
→ deterministic scoring  
→ final ranking  
→ explanation  
→ recommendation UI

## Embeddings

Use pgvector for:

- Creator representations
- Campaign representations
- Semantic similarity

## Scoring

Initial scoring assumptions from the AI design:

- Semantic relevance — 30%
- Audience overlap — 25%
- Performance — 15%
- Platform — 10%
- Campaign requirements — 10%
- Brand compatibility — 5%
- Historical performance — 5%

These are starting assumptions, not permanent truths.

## Creator Side

Show:

- Recommended campaigns
- Match score
- Why it matches
- Evidence
- Requirements
- Potential conflicts

## Brand Side

Show:

- Recommended creators
- Match score
- Why they match
- Relevant creator strengths
- Potential conflicts
- Historical collaboration information

## Explainability

Every important AI recommendation should answer:

> Why does CRAB think this is a good match?

And preferably:

> What evidence supports that conclusion?

## Definition of Done

Both sides can discover relevant opportunities and understand why CRAB recommended them.

---

# 13. Phase 9 — Collaboration

## Goal

Allow creators and brands to move from discovery to actual collaboration.

## Messaging

MVP supports:

- In-app text conversation
- Conversation history
- Basic message sending
- Conversation participants

No:

- Audio calls
- Video calls
- Screen sharing
- Group calls
- Call recording

## Offers

Implement:

- Initial offer
- Counteroffer
- Accept
- Reject
- Offer history
- Parent/counteroffer relationship

## AI Deal Assistance

AI may suggest:

- Estimated pricing range
- Counteroffer guidance
- Negotiation considerations

But:

> AI assists. The user remains in control.

AI must not claim that an estimated price is the true market price.

## Definition of Done

A creator and brand can:

1. Discover each other.
2. Start a conversation.
3. Send an offer.
4. Counteroffer.
5. Accept or reject the deal.

---

# 14. Phase 10 — Payments

## Goal

Complete the basic commercial loop.

## Payment Provider

Razorpay Test Mode.

## Flow

Agreement  
→ payment creation  
→ checkout  
→ payment result  
→ webhook verification  
→ payment status  
→ collaboration/payment record

## Important

MVP payment is a test/sandbox implementation.

Do not attempt to build a full production escrow system during the MVP.

## Definition of Done

A demo brand can make a test payment and CRAB can correctly reflect the resulting payment state.

---

# 15. Phase 11 — History + Analytics

## Goal

Give both sides useful historical context.

## Creator

Show:

- Previous collaborations
- Past brands
- Campaign history
- Performance summaries
- Relevant collaboration outcomes

## Brand

Show:

- Previous creator collaborations
- Campaign history
- Performance summaries
- Relevant creator history

## Conflict Detection

Flag potential:

- Competitor conflicts
- Exclusivity conflicts
- Other relevant collaboration conflicts

The MVP can use deterministic rules.

## Metric Snapshots

Use historical snapshots where appropriate so changing social data does not overwrite the past.

## Definition of Done

Users can understand relevant collaboration history and CRAB can surface meaningful conflict warnings.

---

# 16. Phase 12 — Integration + Reliability

## Goal

Connect all major features and remove fragile demo-only behavior.

## Full Creator Flow

Signup  
→ profile  
→ social connection  
→ data ingestion  
→ AI intelligence  
→ dashboard  
→ opportunities  
→ campaign/application  
→ messaging  
→ offer  
→ agreement  
→ payment  
→ collaboration history

## Full Brand Flow

Signup  
→ profile  
→ campaign  
→ campaign intelligence  
→ publish  
→ creator discovery  
→ creator profile  
→ outreach  
→ messaging  
→ offer  
→ agreement  
→ payment  
→ collaboration history

## Reliability Tasks

Test:

- Authentication failures
- API failures
- Social API failures
- AI failures
- Invalid input
- Unauthorized access
- Duplicate requests
- Payment webhook handling
- Missing data
- Empty states
- Loading states
- Error states

## AI Reliability

Validate AI outputs before persistence.

Use structured outputs and reject malformed responses.

## Definition of Done

The main demo journey works from beginning to end without manual developer intervention except documented demo fallback steps.

---

# 17. Phase 13 — Polish + Demo

## Goal

Turn the working MVP into a strong hackathon demonstration.

## UI Polish

Focus on:

- Visual consistency
- Responsive layouts
- Loading states
- Empty states
- Error handling
- Micro-interactions
- Clear AI explanations
- Clear match evidence
- Dashboard readability

## Performance

Check:

- API response times
- unnecessary frontend requests
- database queries
- large content payloads
- AI request latency

## Demo Data

Prepare realistic:

- creators
- brands
- campaigns
- content
- matches
- conversations
- offers
- collaboration history

## Demo Script

The demo should clearly show:

1. Creator enters CRAB.
2. Social data is analyzed.
3. CRAB understands the creator.
4. Brand creates a campaign.
5. CRAB understands the campaign.
6. CRAB finds suitable creators.
7. CRAB explains the match.
8. Creator/brand communicate.
9. They negotiate.
10. Test payment completes.
11. Collaboration appears in history.

## Definition of Done

The complete demo can be run reliably by a team member without needing to explain internal implementation details.

---

# 18. Recommended Implementation Order

The practical implementation order is:

```text
Documentation Lock
        ↓
Figma + Design System
        ↓
Project Foundation
        ↓
Authentication
        ↓
Creator Profile + Dashboard
        ↓
Social Integration
        ↓
Creator Intelligence
        ↓
Brand Profile + Campaigns
        ↓
Campaign Intelligence
        ↓
Embeddings
        ↓
Matching Engine
        ↓
Explainable Recommendations
        ↓
Messaging
        ↓
Offers + Counteroffers
        ↓
Payments
        ↓
History + Conflict Detection
        ↓
Integration Testing
        ↓
UI Polish
        ↓
Demo Preparation
```

This order should be treated as the default dependency order, not an absolute rule. If a feature can be developed safely in parallel without creating integration problems, the team can parallelize it.

---

# 19. Figma → GitHub → Antigravity Workflow

This is the recommended workflow for the team.

## Step 1 — Choose a Feature

Example:

> Creator onboarding

## Step 2 — Design It in Figma

Create:

- Desktop screen
- States
- Components
- User flow

## Step 3 — Create GitHub Issues

Example:

- Design creator onboarding
- Implement creator onboarding UI
- Create creator profile API
- Add creator profile database model
- Add validation
- Connect frontend to API
- Test creator onboarding

## Step 4 — Give Antigravity the Context

Provide:

- Relevant documentation
- Figma design/code/screenshots
- GitHub issue
- Existing project structure
- Acceptance criteria

## Step 5 — Implement the Vertical Slice

Frontend  
→ API  
→ database  
→ AI/integration if needed  
→ testing

## Step 6 — Review

Compare implementation against:

- Figma
- User flow
- SRD
- API spec
- Database design
- AI requirements

## Step 7 — Close the Issues

Only close an issue when its Definition of Done is satisfied.

---

# 20. GitHub Milestones

The roadmap maps cleanly to GitHub Milestones.

## Milestone 1 — Foundation

- Documentation lock
- Figma system
- Repository
- Frontend setup
- Backend setup
- Database
- Authentication

## Milestone 2 — Creator System

- Creator onboarding
- Creator profile
- Social connection
- Social ingestion
- Creator metrics
- Creator intelligence
- Creator dashboard

## Milestone 3 — Brand + Campaign System

- Brand onboarding
- Brand profile
- Campaign creation
- Campaign intelligence
- Campaign dashboard

## Milestone 4 — AI + Matching

- Embeddings
- Candidate filtering
- Matching
- Scoring
- Explainability
- Creator opportunities
- Brand creator discovery
- Conflict warnings

## Milestone 5 — Collaboration

- Messaging
- Offers
- Counteroffers
- AI deal assistance
- Collaboration records

## Milestone 6 — Payments

- Razorpay integration
- Payment creation
- Checkout
- Webhooks
- Payment status

## Milestone 7 — Polish + Demo

- Integration testing
- Error handling
- UI polish
- Performance
- Demo data
- Demo script
- Final deployment

---

# 21. Parallelization Strategy for the Team

The team can work in parallel once the foundation is stable.

### Track A — Frontend

Responsible for:

- Figma implementation
- Components
- Creator UI
- Brand UI
- Dashboards
- Matching UI
- Messaging UI

### Track B — Backend

Responsible for:

- Express APIs
- Authentication middleware
- Business logic
- Database integration
- Authorization

### Track C — AI

Responsible for:

- Gemini integration
- Prompt design
- Structured outputs
- Creator intelligence
- Campaign intelligence
- Embeddings
- Matching explanation
- Deal assistance

### Track D — Integrations/Data

Responsible for:

- YouTube
- Instagram
- Data normalization
- Metric snapshots
- Razorpay
- Demo fallback data

The team should still integrate frequently rather than developing four disconnected systems until the end.

---

# 22. MVP Priority Rules

When time becomes limited, use this priority order.

## Must Work

1. Authentication
2. Creator profile
3. Brand profile
4. Social/demo data
5. Creator AI intelligence
6. Campaign creation
7. Campaign AI intelligence
8. Matching
9. Explainable recommendations
10. Messaging
11. Offers/counteroffers
12. Test payment
13. End-to-end demo

## Can Be Simplified

- Advanced analytics
- Historical dashboards
- Deep audience analysis
- Advanced negotiation AI
- Complex filtering
- Extensive notification system

## Can Be Deferred

- Proprietary ML
- Autonomous negotiation
- Production escrow
- External opportunity discovery
- Deep cross-platform audience graphs
- Campaign execution automation
- Advanced fraud detection
- Predictive ML

---

# 23. Critical Project Rules

### Rule 1 — Do Not Build Features Without a User Flow

Every major feature should have a clear flow before implementation.

### Rule 2 — Do Not Let AI Become the Business Logic

AI interprets and recommends.

Backend validates, calculates, authorizes and executes.

### Rule 3 — Do Not Fabricate Data

Unavailable social information must remain unavailable or clearly labeled as inferred/derived.

### Rule 4 — Do Not Build the Entire Product in One Prompt

Use focused implementation tasks and GitHub Issues.

### Rule 5 — Integrate Early

A feature is not complete when its frontend works alone.

It is complete when the relevant frontend, API, database and AI/integration pieces work together.

### Rule 6 — Protect the MVP

Do not allow attractive future features to consume time needed for the core creator-brand matching loop.

### Rule 7 — Build for the Demo, But Do Not Fake the Core

Demo fallback data is acceptable when external API access is unavailable.

The actual matching/recommendation logic should still be real.

---

# 24. Roadmap Definition of Done

CRAB is considered MVP-complete when:

- Creator signup works.
- Brand signup works.
- Creator profiles work.
- Brand profiles work.
- Social data can be connected or reliably demonstrated through fallback data.
- Creator intelligence is generated.
- Brands can create campaigns.
- Campaign intelligence is generated.
- Creator/campaign matching works.
- Recommendations are ranked.
- Recommendations have evidence-based explanations.
- Creator and brand can discover each other.
- Messaging works.
- Offers/counteroffers work.
- Test payment works.
- Collaboration history works at the required MVP level.
- Conflict warnings work at the required MVP level.
- The complete demo flow works reliably.
- The UI matches the approved Figma design closely enough for the final demo.

---

# 25. Final Build Philosophy

CRAB should be developed as a sequence of **working vertical slices**, not isolated technical layers.

The target is:

> **Design → Build → Connect → Test → Demonstrate → Repeat**

The most important loop to protect is:

> **Creator/Brand Data → AI Understanding → Contextual Matching → Explainable Opportunity → Collaboration**

Everything in the MVP should support proving that loop.
