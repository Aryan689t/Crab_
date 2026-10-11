# 02 — MVP Specification

**Project:** CRAB — Creators Reaching Aligned Brands  
**Document:** MVP Specification  
**Status:** MVP Product & Implementation Specification  
**Version:** 1.0

---

# 1. Purpose

This document defines the minimum viable product (MVP) that will be built for CRAB.

The MVP must demonstrate the core CRAB idea:

> **CRAB uses contextual understanding and AI to connect creators with relevant brand opportunities, rather than relying only on follower count or basic keyword matching.**

The MVP should be small enough for a student team to implement reliably, while being complete enough to demonstrate the full creator → AI understanding → matching → collaboration workflow.

The MVP is not intended to contain every feature described in the long-term product vision.

---

# 2. MVP Goal

The MVP must prove five things:

1. A creator can create an account and connect a social profile.
2. CRAB can build an AI-assisted understanding of the creator.
3. A brand can create a campaign and CRAB can understand its requirements.
4. CRAB can recommend relevant creator-brand opportunities and explain why they match.
5. A creator and brand can move from recommendation to a basic collaboration/deal flow.

The demo should therefore feel like a functioning marketplace rather than a collection of disconnected AI features.

---

# 3. MVP Product Loop

```text
CREATOR
   ↓
Sign Up
   ↓
Connect Social Account
   ↓
Import Available Data
   ↓
AI Understands Creator
   ↓
Creator Intelligence Profile
   ↓
        ┌──────────────────────┐
        │    CRAB MATCHING     │
        │       ENGINE         │
        └──────────────────────┘
                 ↑
                 │
CAMPAIGN
   ↓
Brand Sign Up
   ↓
Create Campaign
   ↓
AI Understands Campaign
   ↓
Campaign Intelligence Profile
   ↓
Matching + Ranking
   ↓
Recommendation
   ↓
Brand / Creator Review
   ↓
Message
   ↓
Offer / Counteroffer
   ↓
Agreement
   ↓
Payment
```

---

# 4. User Types

## 4.1 Creator

A creator can:

- register/login
- create a creator profile
- connect an authorized social account
- view imported metrics
- view AI-generated creator insights
- discover recommended campaigns
- inspect match explanations
- review brand information
- view previous collaborations
- receive campaign offers
- negotiate an offer
- accept/reject a deal
- initiate/complete the supported payment flow

## 4.2 Brand

A brand can:

- register/login
- create a brand profile
- create campaigns
- describe campaign requirements
- receive creator recommendations
- inspect creator profiles
- inspect creator performance
- see relevant previous collaborations
- receive potential conflict warnings
- message creators
- make offers
- negotiate
- pay creators through the supported payment flow

---

# 5. MVP Feature Priority

## P0 — Required

These must work for the MVP demo.

- Authentication
- Creator profile
- Brand profile
- Social account connection/data import
- Creator metrics storage
- Creator AI analysis
- Campaign creation
- Campaign AI analysis
- Embeddings
- Matching engine
- Ranked recommendations
- Explainable match reasons
- Basic creator-brand messaging
- Offer/counteroffer flow
- Basic payment integration/test flow

## P1 — Important

Implement if time permits.

- Historical metric snapshots
- Previous collaboration history
- Competitor/brand conflict detection
- AI-assisted negotiation suggestions
- Creator opportunity dashboard
- Brand creator-search dashboard
- Better filtering and sorting
- Campaign performance summaries

## P2 — Future

Explicitly outside the core MVP.

- Proprietary ML ranking model
- Fully autonomous negotiation
- Advanced escrow
- External opportunity discovery
- Deep cross-platform audience intelligence
- Automatic campaign execution
- Advanced fraud detection
- Predictive campaign success models

---

# 6. Authentication

CRAB requires account authentication.

Users must be able to:

- sign up
- log in
- log out
- select their role: Creator or Brand
- access only the features belonging to their role

The backend must enforce authorization.

The AI layer must never be responsible for authentication or authorization.

---

# 7. Creator Onboarding

After registration, the creator should complete a basic profile.

Required information:

- name
- profile image
- bio
- location
- niches/categories
- preferred platforms
- contact information where appropriate

The creator can then connect a supported social account.

---

# 8. Social Account Integration

The MVP should support social-platform data through authorized APIs where feasible.

The first implementation should prioritize:

- YouTube
- Instagram where the required API permissions and account types permit the required data

The system must not pretend that unavailable platform data exists.

### Data categories

**Direct data**

- followers/subscribers
- views
- likes
- comments
- available audience information
- content metadata
- account information

**Derived data**

- average views
- engagement rate
- growth
- content performance
- performance by category

**AI-inferred data**

- niche
- content style
- topics
- likely commercial categories
- content relevance

**Unavailable data**

If a platform does not expose a metric, CRAB should display it as unavailable rather than fabricate it.

---

# 9. Creator Metrics History

Creator metrics change over time. The system should therefore preserve timestamped snapshots where practical.

```text
Creator
   │
   └── Social Account
          │
          ├── Metrics Snapshot — Oct 7
          ├── Metrics Snapshot — Oct 14
          ├── Metrics Snapshot — Oct 21
          └── ...
```

This allows CRAB to calculate:

- growth
- recent performance
- historical trends

---

# 10. Creator Content Analysis

CRAB should analyze available creator content.

Potential inputs:

- title
- description
- caption
- hashtags
- transcript where available
- content metadata
- performance metrics

The AI should convert this into structured signals.

Example:

```json
{
  "primary_niches": ["technology", "programming"],
  "secondary_niches": ["AI", "student_lifestyle"],
  "content_style": ["educational", "informal"],
  "topics": ["developer tools", "coding", "AI"],
  "commercial_categories": [
    "developer_tools",
    "consumer_technology",
    "education"
  ]
}
```

These fields are AI-derived and should not be presented as guaranteed facts.

---

# 11. Creator Intelligence Profile

The creator dashboard should expose a useful summary of what CRAB understands about the creator.

Example:

```text
Creator Intelligence

Primary Niche
Technology / Programming

Content Style
Educational / Informal / Short-form

Strong Topics
AI
Developer Tools
Coding

Potential Brand Categories
Developer Tools
Laptops
AI Products
Education Platforms

Performance
42K average views
6.8% engagement
```

Numerical metrics must come from stored/derived platform data. AI should explain qualitative insights.

---

# 12. Brand Onboarding

A brand must create a profile.

Required information:

- brand name
- logo
- category
- description
- target market
- website/contact information where appropriate

The brand can then create campaigns.

---

# 13. Campaign Creation

A campaign should contain enough structured information for the matching engine to work.

Required campaign fields:

- campaign name
- product/service
- campaign description
- campaign goal
- target audience
- target location
- platform
- content type
- required deliverables
- budget
- deadline
- preferred creator niche

Optional fields:

- minimum followers/reach
- minimum average views
- preferred content style
- exclusivity
- usage rights
- additional requirements

---

# 14. Campaign Intelligence

The brand may provide campaign information naturally, but CRAB should convert it into structured information.

Example:

```text
Campaign:
Promote an AI coding assistant to Indian college students and developers.
We want short-form Instagram content.
Budget: ₹50,000.
```

AI output:

```json
{
  "category": "technology",
  "product_category": "developer_tools",
  "target_country": "India",
  "target_audience": [
    "college_students",
    "developers"
  ],
  "campaign_goal": "awareness",
  "platform": "instagram",
  "content_format": ["reels"],
  "budget": 50000
}
```

The backend validates and stores this structured representation.

---

# 15. Matching Engine

The matching engine is the heart of CRAB.

It should combine:

1. Semantic relevance
2. Audience compatibility
3. Performance
4. Platform compatibility
5. Campaign requirements
6. Brand compatibility
7. Historical campaign performance where available

A starting scoring model can use the weighting defined in `08_AI_MATCHING.md`.

These weights are starting assumptions and must not be presented as scientifically validated.

---

# 16. Candidate Filtering

Before expensive AI reasoning, CRAB should filter obvious mismatches.

Examples:

```text
Platform mismatch
        ↓
Remove candidate

Budget impossible
        ↓
Remove candidate

Location requirement impossible
        ↓
Remove candidate

Minimum reach requirement not met
        ↓
Remove candidate
```

Remaining candidates are sent through deeper compatibility scoring.

---

# 17. Semantic Matching

Creator and campaign representations should be converted into embeddings.

```text
Creator Profile
      ↓
Embedding
      ↓
Vector

Campaign
      ↓
Embedding
      ↓
Vector

      ↓

Semantic Similarity
```

Embeddings help CRAB understand conceptual similarity.

Example:

```text
Creator:
"Programming tutorials and developer productivity"

Campaign:
"AI-powered coding assistant"
```

These can be considered related even if the exact words do not match.

---

# 18. Recommendation Results

Creators should receive campaign recommendations.

Example:

```text
Recommended Opportunity

AI Coding Assistant

₹35,000
Instagram
2 Reels

94% Match

Why CRAB recommends this:

✓ Strong programming relevance
✓ Indian audience alignment
✓ Strong short-form performance
✓ Similar content has performed well

⚠ Campaign requests Stories
Creator historically performs better with Reels.
```

The recommendation must contain evidence-based reasons.

---

# 19. Brand-Side Creator Recommendations

Brands should see a ranked creator list.

Example:

```text
Top Creator Matches

1. Creator A
92% Match

Technology
85K followers
Strong developer audience

2. Creator B
89% Match

Technology / AI
52K followers
Excellent short-form performance

3. Creator C
84% Match

Programming
41K followers
High audience relevance
```

The brand can open a creator profile to inspect the reasoning.

---

# 20. Explainability

A match score alone is insufficient.

Every recommendation should provide:

- positive reasons
- potential concerns
- relevant performance evidence
- audience alignment
- requirement alignment
- detected conflicts

The LLM may generate the natural-language explanation, but the underlying facts must come from CRAB's structured data.

---

# 21. Brand Conflict Detection

CRAB should maintain collaboration history.

Example:

```text
Creator A

Previous collaborations:
- NVIDIA
- ASUS

New campaign:
- AMD
```

CRAB may display:

> ⚠ Potential competitor conflict

The warning should not automatically reject the creator. The brand or creator decides whether the collaboration is acceptable.

For the MVP, conflict detection can initially use deterministic category/brand rules.

---

# 22. Collaboration History

A collaboration record should contain:

- creator
- brand
- campaign
- date
- platform
- deliverables
- deal value where appropriate
- status

The MVP does not need a complex public social graph.

The goal is to provide enough history to support trust and conflict decisions.

---

# 23. Messaging

The MVP requires basic creator-brand communication.

It does not need to reproduce WhatsApp/Discord.

Minimum functionality:

```text
Conversation
   ↓
Message
   ↓
Offer
   ↓
Counteroffer
   ↓
Accept / Reject
```

Messages should be stored in the database.

---

# 24. Offer and Negotiation Flow

Example:

```text
Brand
₹40,000 offer
      ↓
Creator
₹50,000 counteroffer
      ↓
Brand
₹45,000 counteroffer
      ↓
Creator
Accept
```

The final deal should have:

- agreed amount
- deliverables
- platform
- timeline
- usage rights where applicable
- status

---

# 25. AI Negotiation Assistance

The creator can ask CRAB for assistance.

Example:

```text
Brand Offer:
₹40,000

Deliverables:
2 Reels

Usage:
3 months
```

CRAB may respond:

```text
Suggested range:
₹45,000–₹55,000

Suggested counter:
₹50,000

Reason:
The campaign includes two video deliverables
and three months of usage rights.
```

The user must approve the generated response before sending it.

CRAB must not autonomously negotiate financial agreements in the MVP.

---

# 26. Payment

The MVP should demonstrate a payment flow.

A provider such as Razorpay can be integrated in test/sandbox mode.

The payment system should handle:

- payment initiation
- payment status
- transaction reference
- successful/failed state

The backend remains the source of truth for payment state.

The MVP does not require a full production escrow system.

---

# 27. Dashboards

## Creator Dashboard

```text
Profile
Social Accounts
Creator Intelligence
Metrics
Recommended Opportunities
Incoming Offers
Messages
Collaborations
Payments
```

The most important screen is **Recommended Opportunities**.

## Brand Dashboard

```text
Brand Profile
Campaigns
Recommended Creators
Creator Search
Messages
Offers
Collaborations
Payments
```

The most important screen is **Recommended Creators**.

---

# 28. Database Requirements

The exact schema will be defined in `06_DATABASE.md`, but the MVP requires entities approximately corresponding to:

```text
User
Creator
Brand
SocialAccount
CreatorMetricSnapshot
Content
CreatorAIProfile
Campaign
CampaignAIProfile
Match
Collaboration
Conversation
Message
Offer
Payment
```

The exact schema should be normalized during database design.

---

# 29. Backend Requirements

The backend is responsible for:

- authentication
- authorization
- user management
- creator/brand CRUD
- social API integration
- storing metrics
- calculating derived metrics
- campaign CRUD
- candidate filtering
- deterministic scoring
- storing AI outputs
- storing matches
- messaging
- offers
- payment state
- security

The AI service should not directly control database permissions or payment execution.

---

# 30. AI Service Requirements

The AI layer should provide modules for:

```text
creatorAnalysis()
campaignAnalysis()
contentAnalysis()
generateEmbedding()
calculateSemanticSimilarity()
generateMatchExplanation()
analyzeOffer()
generateNegotiationSuggestion()
```

The AI layer should return structured outputs whenever possible.

The backend validates these outputs before persistence.

---

# 31. What Is Real vs Mocked

## Should be real

- authentication
- database
- creator/brand profiles
- campaign creation
- AI analysis
- embeddings
- matching
- recommendation explanations
- messaging
- offer/counteroffer state
- payment test/sandbox flow

## May be mocked or seeded

- some initial campaigns
- some creator accounts
- collaboration history
- historical performance
- unavailable Instagram data
- certain audience metrics
- external marketplace opportunities

Mock data must be clearly labeled internally and must not be presented as real platform data.

---

# 32. MVP End-to-End Demo

The preferred hackathon demonstration should follow one complete story.

### Step 1 — Creator

Creator signs up and creates a technology/programming profile.

### Step 2 — Connect Account

Creator connects YouTube or another supported platform. CRAB imports available data.

### Step 3 — AI Analysis

CRAB analyzes content and generates creator intelligence.

### Step 4 — Brand

An AI coding-assistant company signs up.

### Step 5 — Campaign

The brand creates an India-focused Instagram campaign for college students/developers.

### Step 6 — AI Campaign Understanding

CRAB converts the campaign into structured requirements.

### Step 7 — Matching

CRAB evaluates available creators and ranks them.

### Step 8 — Explanation

CRAB explains the strongest matches with evidence.

### Step 9 — Conflict Check

CRAB detects a previous collaboration if relevant and displays a warning.

### Step 10 — Contact

Brand sends a message.

### Step 11 — Negotiation

Brand and creator exchange offers/counteroffers.

### Step 12 — Payment

The demo completes the supported test payment flow.

### Step 13 — Collaboration

The collaboration becomes an active/completed record.

This closes the full CRAB loop.

---

# 33. MVP Success Criteria

The MVP is successful if a judge can observe:

### Creator

- account creation
- social data connection
- meaningful AI-generated creator understanding
- relevant opportunities

### Brand

- campaign creation
- AI-understood campaign requirements
- relevant creator recommendations
- understandable recommendation reasoning

### Collaboration

- communication
- negotiation
- deal acceptance
- payment test flow

### AI

- content understanding
- campaign understanding
- semantic matching
- explainable recommendations
- conflict awareness
- basic deal assistance

---

# 34. MVP Non-Goals

The MVP will NOT attempt to:

- train a proprietary foundation model
- scrape private social data
- fabricate unavailable metrics
- guarantee campaign success
- guarantee market-accurate creator pricing
- autonomously negotiate
- autonomously make financial decisions
- build a production escrow system
- discover every brand opportunity on the internet
- build advanced predictive ML
- build a complete social network
- reproduce full messaging applications
- support every social platform

---

# 35. Implementation Order

## Phase 1 — Foundation

1. Project setup
2. Database
3. Authentication
4. Role-based authorization
5. Creator and brand profiles

## Phase 2 — Creator Intelligence

6. Social API integration
7. Data normalization
8. Metric storage
9. Content storage
10. AI creator analysis
11. Creator intelligence profile

## Phase 3 — Campaign Intelligence

12. Campaign CRUD
13. Campaign AI analysis
14. Campaign structured representation

## Phase 4 — Matching

15. Embeddings
16. Candidate filtering
17. Semantic similarity
18. Compatibility scoring
19. Match ranking
20. Explanation generation

## Phase 5 — Collaboration

21. Messaging
22. Offers
23. Counteroffers
24. Deal acceptance
25. Collaboration history

## Phase 6 — Payments

26. Payment provider sandbox
27. Payment initiation
28. Payment verification/state

## Phase 7 — Polish

29. Dashboards
30. Loading/error states
31. AI confidence indicators
32. Demo data
33. Security checks
34. End-to-end testing

---

# 36. Definition of Done

The CRAB MVP is complete when:

- a creator can register
- a brand can register
- both roles have protected dashboards
- creator social data can enter the system
- creator metrics can be stored
- creator content can be analyzed by AI
- a creator intelligence profile can be generated
- a brand can create a campaign
- campaign requirements can be analyzed by AI
- creator and campaign embeddings can be generated
- candidates can be filtered
- matches can be ranked
- match explanations can be displayed
- conflict warnings can be generated
- creators and brands can communicate
- offers can be created and countered
- a deal can be accepted
- a payment sandbox flow can be demonstrated
- the complete creator → campaign → match → deal flow works end-to-end

---

# 37. Final MVP Principle

CRAB should not win by having the largest number of features.

It should win by demonstrating one thing extremely clearly:

> **CRAB understands the creator, understands the campaign, and can explain why the two belong together.**

Everything else in the MVP exists to make that core loop usable and believable.
