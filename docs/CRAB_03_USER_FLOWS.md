# 03 — User Flows

**Project:** CRAB — Creators Reaching Aligned Brands  
**Document:** User Flows  
**Status:** MVP Product Flow Specification  
**Version:** 1.0

---

# 1. Purpose

This document defines how users move through the CRAB MVP.

The PRD defines what CRAB is.  
The MVP defines what CRAB must contain.  
This document defines **how users actually interact with those capabilities**.

CRAB has two equally important sides:

- Creator
- Brand

The product must support both directions of the marketplace:

```text
Creator → discovers relevant brands/campaigns
Brand   → discovers relevant creators
```

Neither side should feel like a secondary feature.

---

# 2. Core Product Flow

The complete CRAB marketplace loop is:

```text
                    ┌───────────────┐
                    │    CREATOR    │
                    └───────┬───────┘
                            │
                     Sign up / Login
                            │
                            ▼
                    Create basic profile
                            │
                            ▼
                    Connect social account
                            │
                            ▼
                    Import available data
                            │
                            ▼
                    AI understands creator
                            │
                            ▼
                 Creator Intelligence Profile
                            │
                            ▼
                  Search + AI Recommendations
                            │
                            │
                            ▼
                    Discover Campaign
                            │
                            ▼
                   Contact / Apply to Brand
                            │
                            │
                            ▼
                    Message / Negotiation
                            │
                            ▼
                         Deal
                            │
                            ▼
                        Payment
                            │
                            ▼
                     Collaboration
                            │
                            ▼
                    Collaboration History


                    ┌───────────────┐
                    │     BRAND     │
                    └───────┬───────┘
                            │
                     Sign up / Login
                            │
                            ▼
                    Create brand profile
                            │
                            ▼
                    Create campaign
                            │
                            ▼
                    AI understands campaign
                            │
                            ▼
                   Campaign Intelligence
                            │
                            ▼
                    Search + AI Ranking
                            │
                            ▼
                    Discover Creators
                            │
                            ▼
                   Contact / Invite Creator
                            │
                            │
                            ▼
                    Message / Negotiation
                            │
                            ▼
                         Deal
                            │
                            ▼
                        Payment
                            │
                            ▼
                     Collaboration
                            │
                            ▼
                    Collaboration History
```

---

# 3. Entry Flow

Both creators and brands begin with the same authentication entry point.

```text
Landing Page
    ↓
Sign Up / Login
    ↓
Choose Role
    ├── Creator
    └── Brand
```

The selected role determines the user's onboarding and dashboard experience.

The backend must enforce role-based authorization.

---

# 4. Creator Onboarding Flow

## 4.1 Basic Flow

```text
Creator
  ↓
Sign Up
  ↓
Choose "Creator"
  ↓
Basic Profile
  ↓
Connect Social Account
  ↓
Authorization
  ↓
Import Available Data
  ↓
AI Analysis
  ↓
Creator Intelligence Generated
  ↓
Creator Dashboard
```

---

## 4.2 Creator Profile Setup

The creator enters:

- name
- profile image
- bio
- location
- niches/categories
- preferred platforms
- contact information where appropriate

The creator should be able to edit this information later.

---

## 4.3 Social Connection

The creator selects a supported platform.

```text
Connect Social Account
       ↓
Select Platform
       ↓
Authorize CRAB
       ↓
Authorization successful?
       ├── No → Show error / retry
       └── Yes
             ↓
        Begin import
```

CRAB should only use information available through the authorized integration.

If a platform does not expose a requested metric, the UI should not pretend that the metric exists.

---

# 5. Creator AI Processing Flow

After successful social connection:

```text
Social Account
      ↓
Fetch available data
      ↓
Normalize data
      ↓
Store raw/structured data
      ↓
Select relevant content
      ↓
AI content analysis
      ↓
Aggregate creator insights
      ↓
Generate Creator Intelligence Profile
      ↓
Validate AI output
      ↓
Store AI profile
      ↓
Show creator insights
```

Example result:

```text
CRAB understands you as:

Primary:
Technology / Programming

Secondary:
AI / Student Lifestyle

Content style:
Educational / Informal

Potential brand categories:
Developer Tools
AI Products
Education
Consumer Technology
```

AI-inferred information should be distinguishable from directly observed metrics.

---

# 6. Creator Dashboard Flow

After onboarding:

```text
Creator Dashboard

├── Profile
├── Social Accounts
├── Creator Intelligence
├── Metrics
├── Opportunities
├── Messages
├── Offers
├── Collaborations
└── Payments
```

The dashboard should make two things immediately accessible:

1. What CRAB understands about the creator.
2. What opportunities CRAB recommends.

---

# 7. Creator Opportunity Discovery

Creators should have both:

- search/filter functionality
- AI recommendations

The flow is:

```text
Creator Dashboard
       ↓
Opportunities
       ↓
 ┌───────────────┐
 │ Search / Filter│
 └───────┬───────┘
         │
         ├───────────────┐
         │               │
         ▼               ▼
 Search Results     Recommended For You
                         │
                         ▼
                    AI Ranking
```

This means CRAB does not replace normal marketplace search.

Instead, AI adds contextual discovery on top of it.

---

# 8. Creator Campaign View

When the creator opens a campaign:

```text
Campaign
   ↓
Brand information
   ↓
Campaign requirements
   ↓
Budget
   ↓
Deliverables
   ↓
Deadline
   ↓
Match Score
   ↓
Why CRAB recommends this
   ↓
Potential concerns
   ↓
Previous collaboration/conflict information
   ↓
Apply / Contact Brand
```

The creator should be able to understand **why the opportunity is relevant** before deciding whether to proceed.

---

# 9. Creator → Brand Application

A creator can initiate a collaboration.

```text
Campaign
   ↓
Apply / Contact
   ↓
Optional introductory message
   ↓
Send
   ↓
Conversation created
   ↓
Brand receives application
```

The brand can then:

- accept interest
- reject
- continue conversation
- make an offer

---

# 10. Brand Onboarding Flow

```text
Brand
  ↓
Sign Up
  ↓
Choose "Brand"
  ↓
Create Brand Profile
  ↓
Brand Dashboard
```

Required information includes:

- brand name
- logo
- category
- description
- target market
- website/contact information where appropriate

---

# 11. Brand Campaign Creation

The brand starts from:

```text
Brand Dashboard
      ↓
Create Campaign
      ↓
Campaign Form
      ↓
Enter Requirements
      ↓
AI Understanding
      ↓
Review Structured Campaign
      ↓
Confirm
      ↓
Campaign Published
```

---

# 12. Brand Campaign Form

The campaign should capture:

### Core

- campaign name
- product/service
- campaign description
- campaign goal

### Audience

- target audience
- target location
- target age where relevant

### Creator requirements

- preferred niche
- platform
- content type
- content style
- minimum reach/followers where required

### Commercial

- budget
- deadline
- deliverables
- usage rights
- exclusivity where applicable

---

# 13. Campaign AI Understanding

After submission:

```text
Campaign Input
      ↓
Normalize
      ↓
AI Analysis
      ↓
Campaign Intelligence
      ↓
Validate
      ↓
Store
```

Example:

```text
Campaign:
AI Coding Assistant

AI understands:

Category:
Developer Tools

Audience:
Developers + College Students

Location:
India

Platform:
Instagram

Format:
Reels

Goal:
Awareness

Budget:
₹50,000
```

The brand should be able to review the interpretation before publishing.

---

# 14. Brand Creator Discovery

Brands should have both search/filtering and AI ranking.

```text
Brand Dashboard
      ↓
Select Campaign
      ↓
Find Creators
      ↓
 ┌─────────────────┐
 │ Search / Filters│
 └────────┬────────┘
          │
          ├────────────────┐
          │                │
          ▼                ▼
   Filtered Results    AI Ranked Results
                            │
                            ▼
                       Match Engine
```

Possible filters:

- platform
- niche
- location
- follower/reach range
- average views
- budget
- content type

---

# 15. Brand Creator Recommendation Flow

```text
Campaign
   ↓
Candidate Filtering
   ↓
Semantic Matching
   ↓
Compatibility Scoring
   ↓
Ranking
   ↓
Top Creator Recommendations
```

Example:

```text
Creator A — 94%
Creator B — 91%
Creator C — 87%
```

Each result should provide:

- profile summary
- relevant metrics
- match score
- reasons
- concerns
- collaboration history where available

---

# 16. Brand Creator Profile

When a brand opens a creator:

```text
Creator Profile
     ↓
Basic Information
     ↓
Social Metrics
     ↓
Creator Intelligence
     ↓
Content / Topics
     ↓
Performance
     ↓
Previous Collaborations
     ↓
Potential Conflicts
     ↓
Match Explanation
     ↓
Contact Creator
```

The brand should not need to manually infer relevance from follower count alone.

---

# 17. Brand → Creator Outreach

A brand can initiate contact:

```text
Creator Profile
     ↓
Contact Creator
     ↓
Write Message
     ↓
Send
     ↓
Conversation Created
     ↓
Creator Notified
```

The brand can then make an offer once the conversation reaches that stage.

---

# 18. Two-Way Collaboration Initiation

CRAB supports both directions.

```text
                 CRAB MARKETPLACE

          ┌─────────────────────────┐
          │                         │
          ▼                         ▼
       CREATOR                   BRAND
          │                         │
          │ Apply                   │ Invite
          │                         │
          └──────────┬──────────────┘
                     ▼
                Conversation
                     ↓
                   Offer
                     ↓
                Negotiation
                     ↓
                   Deal
```

This is important because CRAB is a two-sided opportunity engine.

---

# 19. Messaging Flow

The MVP messaging system is intentionally simple.

```text
Conversation
     ↓
Message
     ↓
Reply
     ↓
Offer
     ↓
Counteroffer
```

The system does not need to replicate a full messaging application.

Each conversation should be associated with the relevant:

- creator
- brand
- campaign
- collaboration/deal where applicable

---

# 20. Offer Flow

Either side may initiate an offer where permitted.

```text
Conversation
     ↓
Create Offer
     ↓
Amount
     ↓
Deliverables
     ↓
Timeline
     ↓
Usage Rights
     ↓
Submit
```

Offer states:

```text
PENDING
   ↓
COUNTERED
   ↓
ACCEPTED
   │
   └── REJECTED
```

A counteroffer creates a new negotiation state while preserving the history.

---

# 21. AI Negotiation Assistance

The creator can request AI assistance.

```text
Incoming Offer
      ↓
"Analyze Offer"
      ↓
AI evaluates available deal signals
      ↓
Suggested price range
      ↓
Suggested counteroffer
      ↓
Suggested response
      ↓
Creator reviews
      ↓
Creator edits/approves
      ↓
Send
```

The AI does not automatically send or accept financial offers.

---

# 22. Payment Flow

After agreement:

```text
Deal Accepted
     ↓
Payment Required
     ↓
Payment Provider
     ↓
Test/Sandbox Payment
     ↓
Payment Result
     ├── Failed → Retry
     └── Successful
              ↓
        Update Payment State
              ↓
        Update Collaboration
```

The backend is the source of truth for payment status.

---

# 23. Collaboration Flow

After the deal is accepted:

```text
Deal Accepted
      ↓
Collaboration Created
      ↓
Active
      ↓
Campaign Work
      ↓
Completion
      ↓
Completed
      ↓
Historical Collaboration
```

The collaboration can then contribute to future:

- history
- conflict detection
- performance analysis
- matching signals

---

# 24. Collaboration History

Users can view relevant previous collaborations.

### Creator

```text
My Collaborations

Brand
Campaign
Date
Deal
Status
```

### Brand

```text
Creator Collaborations

Creator
Campaign
Date
Deal
Status
```

This information can help with trust and future conflict detection.

---

# 25. Brand Conflict Flow

When a brand considers a creator:

```text
Campaign
   ↓
Creator Candidate
   ↓
Check Collaboration History
   ↓
Potential conflict detected?
   ├── No → Continue
   └── Yes
        ↓
   Show warning
        ↓
   User decides
```

Example:

```text
⚠ Potential competitor conflict

Creator previously collaborated with:
Swiggy

Current campaign:
Zomato

This is a warning, not an automatic rejection.
```

---

# 26. AI Processing State

AI operations may take time.

The UI should show clear states.

```text
Processing
    ↓
Analyzing content...
    ↓
Building creator profile...
    ↓
Generating recommendations...
    ↓
Complete
```

Possible states:

```text
IDLE
PROCESSING
COMPLETED
FAILED
```

If AI processing fails, the user should be able to retry.

---

# 27. Error Flows

## Social API failure

```text
Connect Account
      ↓
Authorization/API failure
      ↓
Explain issue
      ↓
Retry / Continue manually
```

## AI failure

```text
AI Request
   ↓
Failure
   ↓
Retry
   ↓
If repeated:
Show unavailable state
```

The system must not fabricate AI results when the AI service fails.

## Payment failure

```text
Payment
  ↓
Failed
  ↓
Show reason/status
  ↓
Retry
```

---

# 28. Role Authorization Flow

The backend must verify role access.

```text
Request
  ↓
Authenticate user
  ↓
Identify role
  ↓
Check authorization
  ├── Authorized → Continue
  └── Unauthorized → 403
```

Examples:

```text
Creator tries to edit another creator's data
→ Deny

Brand tries to access creator-only endpoint
→ Deny

Unauthenticated user accesses protected endpoint
→ 401
```

The AI layer must not make these decisions.

---

# 29. Data Flow Behind User Actions

A typical creator analysis flow:

```text
UI
 ↓
Backend API
 ↓
Social API
 ↓
Raw Data
 ↓
Normalization
 ↓
AI Service
 ↓
Structured AI Output
 ↓
Validation
 ↓
PostgreSQL
 ↓
Backend API
 ↓
UI
```

A typical campaign matching flow:

```text
Campaign
 ↓
Backend
 ↓
Candidate Filtering
 ↓
Embeddings
 ↓
Compatibility Scoring
 ↓
Ranking
 ↓
AI Explanation
 ↓
Match Stored
 ↓
UI
```

---

# 30. Creator-Side Complete Flow

```text
LANDING
   ↓
SIGN UP / LOGIN
   ↓
CHOOSE CREATOR
   ↓
PROFILE SETUP
   ↓
CONNECT SOCIAL ACCOUNT
   ↓
IMPORT DATA
   ↓
AI ANALYSIS
   ↓
CREATOR INTELLIGENCE
   ↓
DASHBOARD
   ↓
SEARCH / RECOMMENDATIONS
   ↓
CAMPAIGN
   ↓
MATCH EXPLANATION
   ↓
APPLY / CONTACT
   ↓
MESSAGE
   ↓
OFFER
   ↓
COUNTEROFFER
   ↓
ACCEPT
   ↓
PAYMENT
   ↓
COLLABORATION
   ↓
HISTORY
```

---

# 31. Brand-Side Complete Flow

```text
LANDING
   ↓
SIGN UP / LOGIN
   ↓
CHOOSE BRAND
   ↓
BRAND PROFILE
   ↓
DASHBOARD
   ↓
CREATE CAMPAIGN
   ↓
AI CAMPAIGN ANALYSIS
   ↓
REVIEW / PUBLISH
   ↓
SEARCH / AI RECOMMENDATIONS
   ↓
CREATOR PROFILE
   ↓
MATCH EXPLANATION
   ↓
CONFLICT CHECK
   ↓
CONTACT / INVITE
   ↓
MESSAGE
   ↓
OFFER
   ↓
COUNTEROFFER
   ↓
ACCEPT
   ↓
PAYMENT
   ↓
COLLABORATION
   ↓
HISTORY
```

---

# 32. MVP Screen Map

## Shared

```text
Landing
Login
Signup
Role Selection
```

## Creator

```text
Creator Onboarding
Creator Dashboard
Creator Profile
Social Accounts
Creator Intelligence
Metrics
Opportunities
Campaign Detail
Messages
Offers
Collaborations
Payments
```

## Brand

```text
Brand Onboarding
Brand Dashboard
Brand Profile
Campaign List
Create Campaign
Campaign Detail
Creator Discovery
Creator Profile
Messages
Offers
Collaborations
Payments
```

---

# 33. Primary Navigation

## Creator

```text
Dashboard
Opportunities
Messages
Collaborations
Profile
```

## Brand

```text
Dashboard
Campaigns
Find Creators
Messages
Collaborations
Profile
```

The navigation should keep the primary marketplace action easy to reach.

---

# 34. Critical User Experience Principle

At every important AI interaction, the user should be able to answer:

> **What does CRAB think?**

and:

> **Why does CRAB think that?**

For example:

```text
CRAB thinks:
This creator is strongly aligned with developer-tool campaigns.

Because:
✓ 34% of analyzed content relates to programming
✓ Developer-tool content performs above creator average
✓ Target audience overlaps with campaign
```

The exact numerical evidence must come from actual stored/derived data.

---

# 35. MVP Flow Priorities

Not every flow is equally important for implementation.

## Priority 1 — Core Intelligence Loop

```text
Creator Data
   ↓
AI Creator Understanding
   ↓
Campaign
   ↓
AI Campaign Understanding
   ↓
Matching
   ↓
Explanation
```

## Priority 2 — Marketplace Loop

```text
Recommendation
   ↓
Profile
   ↓
Contact
   ↓
Offer
   ↓
Negotiation
```

## Priority 3 — Transaction Loop

```text
Deal
   ↓
Payment
   ↓
Collaboration
   ↓
History
```

The first priority must be working before polishing the later flows.

---

# 36. Final User Flow Principle

CRAB is not simply:

```text
Search → Filter → Match
```

Its intended experience is:

```text
Understand
   ↓
Discover
   ↓
Explain
   ↓
Connect
   ↓
Negotiate
   ↓
Collaborate
   ↓
Learn
```

Both sides participate in this loop.

The creator gets **relevant opportunities**.

The brand gets **relevant creators**.

CRAB provides the intelligence connecting the two.
