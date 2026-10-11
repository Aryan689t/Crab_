# CRAB — Database Architecture

**Document:** 06_DATABASE.md  
**Project:** CRAB — Creators Reaching Aligned Brands  
**Status:** MVP Database Design  
**Purpose:** Define the data model, entities, relationships, storage strategy, and database responsibilities for CRAB.

---

# 1. Purpose

This document defines how CRAB stores and relates its core application data.

The database must support:

- Creators
- Brands
- Social accounts
- Creator metrics and historical snapshots
- Creator content
- Creator AI intelligence
- Campaigns
- Campaign AI intelligence
- Semantic embeddings
- Matching and recommendations
- Collaboration history
- Messaging
- Offers and counteroffers
- Payments

The database is the persistent source of truth for application state.

AI outputs may be stored in the database, but AI is **not** the source of truth for authentication, authorization, payments, or critical business rules. This follows the architecture defined for CRAB's AI system. fileciteturn1file3L1-L12

---

# 2. Database Technology

## Primary database

**PostgreSQL**

PostgreSQL is used as CRAB's main relational database because the product has strongly related entities and requires reliable relationships, transactions, filtering, historical records, and structured querying.

## ORM

**Prisma**

The Node.js/Express backend uses Prisma for type-safe database access and schema management.

## Vector storage

**pgvector**

pgvector is used inside PostgreSQL for creator and campaign embeddings.

This avoids introducing a separate vector database during the MVP.

---

# 3. Database Principles

### Principle 1 — PostgreSQL is the source of truth

Core application state should be persisted in PostgreSQL.

### Principle 2 — Keep relationships explicit

Creator, Brand, Campaign, Collaboration, Conversation, Offer, and Payment relationships should be represented using relational foreign keys.

### Principle 3 — Preserve changing metrics

Social metrics change continuously. Where historical analysis is useful, CRAB stores metric snapshots instead of overwriting all historical information.

### Principle 4 — Separate observed data from AI inference

The database should distinguish:

- Direct/source data
- Derived data
- AI-inferred data
- Unavailable data

This is important because CRAB must not fabricate unavailable audience or platform information. fileciteturn1file0L1-L25

### Principle 5 — Store structured AI output

AI output should be validated and stored in structured fields rather than relying only on raw free-form text. fileciteturn1file0L25-L40

### Principle 6 — Keep provider-specific data isolated

YouTube and Instagram data should be normalized into CRAB's internal models rather than allowing the rest of the application to depend directly on provider-specific response formats.

### Principle 7 — Avoid premature databases

The MVP uses PostgreSQL + pgvector rather than introducing separate databases for every subsystem.

---

# 4. High-Level Entity Model

```text
                         ┌─────────────┐
                         │    User     │
                         └──────┬──────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
              ┌───────────┐           ┌───────────┐
              │  Creator  │           │   Brand   │
              └─────┬─────┘           └─────┬─────┘
                    │                       │
          ┌─────────┼─────────┐             │
          │         │         │             │
          ▼         ▼         ▼             ▼
   SocialAccount  Content  Metrics      Campaign
          │                   │             │
          │                   ▼             ▼
          │          CreatorAIProfile  CampaignAIProfile
          │                   │             │
          └──────────┐        │        ┌────┘
                     │        │        │
                     ▼        ▼        ▼
                       Match / Ranking
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
             Collaboration      Conversation
                                      │
                                      ▼
                                    Offer
                                      │
                                      ▼
                                   Payment
```

---

# 5. Core Entities

The MVP database contains these primary entities:

| Entity | Purpose |
|---|---|
| User | Application identity and role |
| Creator | Creator-specific profile |
| Brand | Brand-specific profile |
| SocialAccount | Connected YouTube/Instagram account |
| CreatorMetricSnapshot | Historical creator metrics |
| Content | Imported creator content |
| CreatorAIProfile | AI-generated creator intelligence |
| Campaign | Brand campaign |
| CampaignAIProfile | AI-generated campaign intelligence |
| Match | Creator-campaign compatibility result |
| Collaboration | Actual creator-brand partnership |
| Conversation | Messaging thread |
| Message | Individual message |
| Offer | Offer/counteroffer state |
| Payment | Payment transaction/state |

---

# 6. User

The `User` entity represents the authenticated application user.

Authentication itself is handled by Supabase Auth. The application database stores the CRAB-specific user record and role/profile relationships.

### Conceptual fields

```text
User
├── id
├── email
├── role
├── created_at
└── updated_at
```

### Role

MVP roles:

```text
CREATOR
BRAND
```

A user should normally have one primary product role for the MVP.

### Relationship

```text
User 1 ───── 0..1 Creator
User 1 ───── 0..1 Brand
```

The exact authentication-provider identifier should be mapped to the CRAB user record.

---

# 7. Creator

The `Creator` entity contains the creator's application-level profile.

It should not contain every social metric directly because metrics change over time.

### Conceptual fields

```text
Creator
├── id
├── user_id
├── display_name
├── bio
├── location
├── contact_information
├── created_at
└── updated_at
```

Potential profile information includes:

- Name
- Bio
- Location
- Contact information
- Primary/secondary creator information
- Profile image/reference
- Basic creator preferences

Social metrics belong to `CreatorMetricSnapshot`.

AI-derived information belongs to `CreatorAIProfile`.

---

# 8. Brand

The `Brand` entity contains the brand's application-level profile.

### Conceptual fields

```text
Brand
├── id
├── user_id
├── name
├── description
├── category
├── location / target markets
├── website
├── created_at
└── updated_at
```

Potential information includes:

- Brand name
- Brand description
- Category
- Target market
- Creator categories of interest
- Contact information
- Brand preferences

Past creator partnerships are represented through `Collaboration`.

---

# 9. SocialAccount

`SocialAccount` represents an external social account connected to a creator.

A creator can have multiple connected accounts.

```text
Creator
   │
   ├── YouTube account
   └── Instagram account
```

### Conceptual fields

```text
SocialAccount
├── id
├── creator_id
├── platform
├── platform_account_id
├── username / handle
├── authorization_reference
├── connected_at
├── last_synced_at
└── status
```

### Platform

MVP:

```text
YOUTUBE
INSTAGRAM
```

### Important security rule

Provider credentials/secrets must not be exposed to the frontend.

Sensitive authorization material should be securely stored and handled server-side.

---

# 10. CreatorMetricSnapshot

Creator metrics are time-dependent.

Instead of only storing:

```text
followers = 83000
```

CRAB should preserve snapshots:

```text
Oct 1 → 80,000
Oct 4 → 83,000
Oct 8 → 85,000
```

### Conceptual fields

```text
CreatorMetricSnapshot
├── id
├── creator_id
├── social_account_id
├── followers
├── following
├── total_views
├── average_views
├── engagement_rate
├── posting_frequency
├── recorded_at
└── source
```

Some fields may be unavailable depending on platform permissions.

The database should allow nullable values rather than inventing missing metrics.

---

# 11. Content

`Content` represents imported creator content from supported social platforms.

Examples:

- YouTube video
- Instagram post
- Instagram Reel

### Conceptual fields

```text
Content
├── id
├── creator_id
├── social_account_id
├── platform
├── platform_content_id
├── title
├── description
├── caption
├── permalink
├── content_type
├── published_at
├── views
├── likes
├── comments
├── shares
├── fetched_at
└── updated_at
```

Not every platform exposes every metric.

Therefore fields such as shares may be nullable.

The source platform remains associated with the record.

---

# 12. Content and AI Analysis

AI analysis of content can identify:

- Topics
- Niche
- Content style
- Sentiment where useful
- Commercial categories
- Other relevant contextual signals

A normalized design can either store these analyses directly or through a dedicated content-analysis table.

For MVP simplicity, a dedicated structured representation is recommended if the team expects analysis to evolve.

Conceptually:

```text
Content
   │
   ▼
ContentAIAnalysis
├── topics
├── niche
├── style
├── commercial_categories
├── confidence
└── analyzed_at
```

AI-inferred fields should be distinguishable from direct platform data.

---

# 13. CreatorAIProfile

`CreatorAIProfile` stores the current structured AI understanding of a creator.

### Conceptual fields

```text
CreatorAIProfile
├── id
├── creator_id
├── primary_niches
├── secondary_niches
├── content_style
├── audience_summary
├── audience_interests
├── commercial_categories
├── brand_suitability
├── opportunity_categories
├── confidence_data
├── embedding
├── model_version
├── generated_at
└── updated_at
```

Example:

```json
{
  "primary_niches": [
    "technology",
    "programming",
    "AI"
  ],
  "secondary_niches": [
    "gaming"
  ],
  "content_style": [
    "educational",
    "informal",
    "short_form"
  ],
  "commercial_categories": [
    "developer_tools",
    "consumer_technology",
    "education"
  ]
}
```

The exact fields can evolve during implementation.

The AI system explicitly recommends structured output and validation before storage. fileciteturn1file0L25-L40

---

# 14. Audience Data

Audience information requires special care.

CRAB should distinguish:

### Direct

Obtained directly from an authorized platform API.

### Derived

Calculated by CRAB from available information.

### Inferred

AI interpretation based on creator/content signals.

### Unavailable

Not exposed by the platform or not reliably available.

Example:

```text
Audience Geography
    ├── source: PLATFORM
    └── value: India

Audience Interest
    ├── source: AI_INFERRED
    └── value: Programming

Audience Age
    ├── source: UNAVAILABLE
    └── value: null
```

The system must never turn an unavailable metric into a fabricated fact.

---

# 15. Campaign

`Campaign` represents a brand's collaboration opportunity.

### Conceptual fields

```text
Campaign
├── id
├── brand_id
├── title
├── description
├── product_or_service
├── objective
├── target_audience
├── budget_min
├── budget_max
├── required_reach
├── platform
├── content_type
├── content_style
├── creator_niche
├── location
├── timeline
├── exclusivity
├── usage_rights
├── status
├── created_at
└── updated_at
```

The campaign stores explicit requirements supplied by the brand.

AI interpretation belongs in `CampaignAIProfile`.

---

# 16. CampaignAIProfile

`CampaignAIProfile` stores the structured interpretation of a campaign.

### Conceptual fields

```text
CampaignAIProfile
├── id
├── campaign_id
├── normalized_objective
├── target_audience_profile
├── inferred_niches
├── content_requirements
├── commercial_categories
├── semantic_summary
├── confidence_data
├── embedding
├── model_version
├── generated_at
└── updated_at
```

Pipeline:

```text
Brand Campaign Input
        │
        ▼
      Gemini
        │
        ▼
Structured Campaign Intelligence
        │
        ▼
Validated Output
        │
        ▼
CampaignAIProfile
        │
        ▼
Embedding
```

---

# 17. Embeddings

CRAB uses embeddings for semantic matching between creators and campaigns.

Conceptually:

```text
CreatorAIProfile
       │
       ▼
Creator Embedding
       │
       ▼
     pgvector
```

and:

```text
CampaignAIProfile
       │
       ▼
Campaign Embedding
       │
       ▼
     pgvector
```

The embedding should be associated with the entity/profile it represents.

### Important rule

Embeddings are **one input into matching**, not the complete match decision.

The matching architecture combines semantic relevance with structured compatibility, audience signals, performance, requirements, platform compatibility, brand compatibility, and historical performance. The initial weights are documented as starting assumptions rather than validated constants. fileciteturn1file6L1-L18

---

# 18. Match

`Match` represents a calculated relationship between a creator and a campaign.

### Conceptual fields

```text
Match
├── id
├── creator_id
├── campaign_id
├── semantic_score
├── audience_score
├── performance_score
├── platform_score
├── requirements_score
├── brand_compatibility_score
├── historical_score
├── final_score
├── explanation_evidence
├── explanation
├── conflict_flag
├── status
├── created_at
└── updated_at
```

The score components should be stored where useful for explainability and debugging.

Example:

```text
semantic_score = 0.91
audience_score = 0.88
performance_score = 0.79
platform_score = 1.00
final_score = 0.91
```

The final score should not be presented as a scientifically validated probability.

---

# 19. Match Explanation Evidence

A match should retain structured evidence that supports its explanation.

Example:

```json
{
  "positive": [
    "Strong technology-content overlap",
    "Audience geography aligns",
    "Required platform matches"
  ],
  "warnings": [
    "Creator historically performs better with Reels than Stories"
  ]
}
```

The preferred architecture is:

```text
Raw Data
   ↓
Backend Calculations
   ↓
Match Evidence
   ↓
AI Explanation
```

rather than:

```text
Raw Data
   ↓
LLM
   ↓
Invented explanation
```

The AI system explicitly requires explanations to be generated from structured evidence. fileciteturn1file2L1-L20

---

# 20. Collaboration

`Collaboration` represents an actual creator-brand partnership.

This is different from a `Match`.

A match means:

> "These two may be a good fit."

A collaboration means:

> "These two actually entered a partnership."

### Conceptual fields

```text
Collaboration
├── id
├── creator_id
├── brand_id
├── campaign_id
├── conversation_id
├── agreed_amount
├── deliverables
├── usage_rights
├── exclusivity
├── status
├── started_at
├── completed_at
└── created_at
```

Potential statuses:

```text
PROPOSED
NEGOTIATING
AGREED
IN_PROGRESS
COMPLETED
CANCELLED
```

The exact status set can be finalized during implementation.

---

# 21. Collaboration History

Collaboration history is important for:

- Creator trust/context.
- Brand trust/context.
- Competitor conflict detection.
- Historical campaign performance.
- Deal intelligence.

Example:

```text
Creator
 │
 ├── Collaboration → Brand A
 ├── Collaboration → Brand B
 └── Collaboration → Brand C
```

A new campaign can then be checked against historical partnerships.

The MVP conflict-detection approach is primarily rule-based. fileciteturn1file8L1-L18

---

# 22. Conversation

`Conversation` represents a messaging thread between a creator and brand.

### Conceptual fields

```text
Conversation
├── id
├── creator_id
├── brand_id
├── campaign_id
├── collaboration_id
├── created_at
└── updated_at
```

A conversation can be associated with a campaign or collaboration when applicable.

---

# 23. Message

`Message` represents an individual message.

### Conceptual fields

```text
Message
├── id
├── conversation_id
├── sender_user_id
├── message_text
├── created_at
└── read_at
```

MVP messaging is text-based.

The MVP does not include:

- Audio calls
- Video calls
- Screen sharing
- Group calls
- Call recording

---

# 24. Offer

`Offer` represents an offer or counteroffer during negotiation.

### Conceptual fields

```text
Offer
├── id
├── conversation_id
├── collaboration_id
├── sender_user_id
├── amount
├── currency
├── deliverables
├── usage_rights
├── exclusivity
├── status
├── parent_offer_id
├── created_at
└── responded_at
```

`parent_offer_id` allows the system to represent:

```text
Brand Offer
      ↓
Creator Counteroffer
      ↓
Brand Counteroffer
      ↓
Creator Acceptance
```

This keeps the negotiation history intact.

---

# 25. AI Deal Assistance Data

AI may provide:

- Estimated pricing range.
- Suggested counteroffer.
- Negotiation reasoning.
- Suggested response text.

These should be treated as recommendations.

Example:

```text
Offer
  │
  ▼
Deal Intelligence
  │
  ├── estimated_min
  ├── estimated_max
  ├── suggested_counter
  ├── reasoning
  └── generated_response
```

The system must not represent the recommendation as the "true market price." The AI design explicitly defines pricing as an estimate based on available signals. fileciteturn1file7L1-L28

The creator remains in control of the final offer and message.

---

# 26. Payment

`Payment` represents the application's payment state.

### Conceptual fields

```text
Payment
├── id
├── collaboration_id
├── payer_user_id
├── recipient_user_id
├── amount
├── currency
├── provider
├── provider_payment_id
├── status
├── created_at
├── paid_at
└── updated_at
```

MVP payment direction:

```text
Brand → Creator
```

Provider:

```text
RAZORPAY
```

The database records payment state, but the backend/provider confirmation remains authoritative for payment success.

---

# 27. Payment Status

A simple MVP state model can be:

```text
CREATED
PENDING
PAID
FAILED
REFUNDED
```

The exact state machine can be refined during implementation.

Important:

> The frontend must never be trusted to declare a payment successful.

The backend verifies the payment result and updates the database.

---

# 28. Relationship Summary

```text
User
│
├── Creator
│   │
│   ├── SocialAccount
│   ├── CreatorMetricSnapshot
│   ├── Content
│   └── CreatorAIProfile
│
└── Brand
    │
    └── Campaign
        │
        └── CampaignAIProfile


Creator ───────────── Campaign
    │                     │
    └─────── Match ───────┘


Creator ─────── Brand
    │               │
    └─ Collaboration┘
            │
            ▼
      Conversation
            │
            ▼
         Message
            │
            ▼
          Offer
            │
            ▼
         Payment
```

---

# 29. Cardinality

| Relationship | Cardinality |
|---|---|
| User → Creator | 1 : 0..1 |
| User → Brand | 1 : 0..1 |
| Creator → SocialAccount | 1 : many |
| Creator → MetricSnapshot | 1 : many |
| Creator → Content | 1 : many |
| Creator → CreatorAIProfile | 1 : 0..1/current profile |
| Brand → Campaign | 1 : many |
| Campaign → CampaignAIProfile | 1 : 0..1/current profile |
| Creator → Match | 1 : many |
| Campaign → Match | 1 : many |
| Creator → Collaboration | 1 : many |
| Brand → Collaboration | 1 : many |
| Conversation → Message | 1 : many |
| Conversation → Offer | 1 : many |
| Collaboration → Payment | 1 : many |

---

# 30. Data Lifecycle

## Creator

```text
User signup
   ↓
Creator profile
   ↓
Social account connected
   ↓
Social data imported
   ↓
Metrics/content stored
   ↓
AI profile generated
   ↓
Embedding generated
   ↓
Matches created
   ↓
Opportunities shown
```

## Campaign

```text
Brand signup
   ↓
Brand profile
   ↓
Campaign created
   ↓
Campaign AI profile generated
   ↓
Embedding generated
   ↓
Creators filtered
   ↓
Matches calculated
   ↓
Ranked creators shown
```

## Collaboration

```text
Match
  ↓
Application / outreach
  ↓
Conversation
  ↓
Offer
  ↓
Counteroffer
  ↓
Agreement
  ↓
Payment
  ↓
Collaboration
  ↓
Completed outcome
```

---

# 31. Historical Data Strategy

Some CRAB data should be treated as current state.

Examples:

- Current creator bio.
- Current brand description.
- Current campaign status.

Some data should be historical.

Examples:

- Creator metrics.
- Performance.
- Offers.
- Messages.
- Payments.
- Collaborations.
- Match results.

This distinction prevents the database from losing useful historical evidence.

---

# 32. Match History

A match should not necessarily be overwritten whenever the underlying data changes.

For meaningful recommendations, CRAB may need to know:

```text
Creator A
Campaign B
Match calculated on Oct 1
Score: 88

Creator A
Campaign B
Match recalculated on Oct 8
Score: 92
```

This becomes useful for:

- Recommendation debugging.
- Outcome evaluation.
- AI evaluation.
- Future ranking improvements.

The exact retention strategy can be simplified for MVP if storage becomes unnecessary.

---

# 33. AI Model Versioning

AI-generated profiles should record the model/version used where practical.

Example:

```text
CreatorAIProfile
├── model_provider
├── model_name
├── model_version
└── generated_at
```

This makes it possible to understand why an AI profile may change after a model update.

It also supports future evaluation.

---

# 34. Embedding Versioning

Embeddings may change when:

- The creator profile changes.
- The campaign changes.
- The embedding model changes.

Therefore embeddings should be associated with metadata such as:

```text
embedding_model
embedding_version
generated_at
```

If necessary, historical embeddings can be retained separately in the future.

For MVP, keeping the current embedding is sufficient unless evaluation requires history.

---

# 35. Indexing Strategy

Indexes should support the application's most common queries.

Likely indexes include:

### User

```text
email
```

### Creator

```text
user_id
```

### Brand

```text
user_id
```

### SocialAccount

```text
creator_id
platform
platform_account_id
```

### Content

```text
creator_id
published_at
platform_content_id
```

### MetricSnapshot

```text
creator_id
recorded_at
```

### Campaign

```text
brand_id
status
platform
```

### Match

```text
creator_id
campaign_id
final_score
```

### Conversation

```text
creator_id
brand_id
```

### Message

```text
conversation_id
created_at
```

### Offer

```text
conversation_id
collaboration_id
created_at
```

### Payment

```text
collaboration_id
status
```

Actual indexes should be added based on real query patterns rather than creating every possible index.

---

# 36. Constraints & Integrity

The database should enforce important invariants where practical.

Examples:

### Unique social account

A platform account should not be connected to multiple creator records unintentionally.

```text
UNIQUE(platform, platform_account_id)
```

### Creator ownership

A creator belongs to one application user.

### Brand ownership

A brand belongs to one application user.

### Campaign ownership

A campaign belongs to one brand.

### Match uniqueness

For the current matching state:

```text
UNIQUE(creator_id, campaign_id)
```

may be used if the system stores only the latest match.

If match history is stored, uniqueness must instead include version/time or a separate current-match concept.

### Referential integrity

Foreign keys should protect relationships between records.

---

# 37. Nullable Data

Not every social platform provides the same information.

Therefore CRAB should prefer:

```text
value = NULL
```

over:

```text
value = guessed_value
```

Example:

```text
audience_age = NULL
```

is better than inventing:

```text
audience_age = "18-24"
```

This directly supports the AI system's requirement that unavailable information must not be fabricated. fileciteturn1file4L1-L18

---

# 38. Database and AI Boundary

```text
             DATABASE
                 │
        ┌────────┴────────┐
        │                 │
   Source Data        Derived Data
        │                 │
        └────────┬────────┘
                 ▼
              AI Layer
                 │
                 ▼
         AI-Inferred Data
                 │
                 ▼
          Validated Output
                 │
                 ▼
             DATABASE
```

The AI system reads relevant structured context and returns validated structured information.

The database persists that output.

The backend decides whether the output is allowed to influence an application action.

---

# 39. Database vs AI Responsibilities

| Responsibility | Database | Backend | AI |
|---|:---:|:---:|:---:|
| Store user data | ✓ | ✓ | |
| Store creator data | ✓ | ✓ | |
| Store brand data | ✓ | ✓ | |
| Store social data | ✓ | ✓ | |
| Store metrics | ✓ | ✓ | |
| Calculate metrics | | ✓ | |
| Store content | ✓ | ✓ | |
| Analyze content | | | ✓ |
| Store AI profile | ✓ | ✓ | |
| Generate embedding | | ✓ | ✓ |
| Store embedding | ✓ | ✓ | |
| Filter candidates | | ✓ | |
| Calculate deterministic score | | ✓ | |
| Semantic similarity | | ✓ | ✓ |
| Store match | ✓ | ✓ | |
| Generate explanation | | ✓ | ✓ |
| Store messages | ✓ | ✓ | |
| Store offers | ✓ | ✓ | |
| Store payment state | ✓ | ✓ | |
| Verify payment | | ✓ | |
| Security decisions | | ✓ | |

---

# 40. MVP Database Scope

The MVP should prioritize these tables/models:

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

Additional supporting tables may be introduced for:

- Content AI analysis.
- Embedding history.
- Notifications.
- Sync jobs.
- AI processing jobs.

These should only be added when the implementation actually needs them.

---

# 41. Suggested Prisma Model Organization

The Prisma schema should mirror the database entities.

Conceptually:

```text
prisma/
└── schema.prisma
```

The schema should define:

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

The exact Prisma syntax should be finalized during implementation.

---

# 42. Example Relational Flow

### Creator intelligence

```text
User
  ↓
Creator
  ↓
SocialAccount
  ↓
Content + MetricSnapshot
  ↓
CreatorAIProfile
  ↓
Embedding
```

### Campaign intelligence

```text
User
  ↓
Brand
  ↓
Campaign
  ↓
CampaignAIProfile
  ↓
Embedding
```

### Matching

```text
CreatorAIProfile
       +
CampaignAIProfile
       ↓
   Match Engine
       ↓
     Match
```

### Deal

```text
Match
 ↓
Conversation
 ↓
Offer
 ↓
Collaboration
 ↓
Payment
```

---

# 43. Future Database Extensions

The MVP database should leave room for future features without implementing them prematurely.

Potential future entities:

```text
Notification
AuditLog
SyncJob
AIProcessingJob
CampaignPerformance
ContentPerformanceSnapshot
AudienceSnapshot
Review
Dispute
Payout
EscrowTransaction
OpportunitySource
RecommendationFeedback
```

Potential future data could support:

- Proprietary ranking models.
- Campaign outcome prediction.
- Creator reviews.
- Advanced payment/escrow.
- Fraud detection.
- External opportunity discovery.
- Recommendation feedback loops.

The AI architecture specifically recommends collecting real outcomes before considering proprietary ML. fileciteturn1file7L1-L25

---

# 44. Database Security

Database security responsibilities include:

- Strong database credentials.
- Environment variables for secrets.
- Server-side database access.
- Appropriate authorization checks.
- Least-privilege access where possible.
- Avoiding exposure of sensitive records to the client.
- Secure handling of social authorization references.
- Secure handling of payment identifiers.

The frontend should not connect directly to the database for sensitive application operations.

The normal path is:

```text
Frontend
   ↓
Backend
   ↓
Prisma
   ↓
PostgreSQL
```

Supabase Auth remains the authentication provider, while CRAB's backend remains responsible for application authorization and business logic.

---

# 45. Final Database Architecture

```text
                         ┌───────────────┐
                         │     User      │
                         └───────┬───────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
               ┌─────────┐               ┌─────────┐
               │ Creator │               │  Brand  │
               └────┬────┘               └────┬────┘
                    │                         │
        ┌───────────┼───────────┐             │
        ▼           ▼           ▼             ▼
   SocialAccount  Content   MetricSnapshot Campaign
        │           │                       │
        │           ▼                       ▼
        │     ContentAIAnalysis       CampaignAIProfile
        │           │                       │
        ▼           ▼                       ▼
             CreatorAIProfile
                    │
                    ▼
                 Embedding
                    │
                    └─────────────┐
                                  │
CampaignAIProfile                 │
      │                           │
      ▼                           ▼
  Embedding ──────────────── Matching Engine
                                  │
                                  ▼
                                Match
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             Collaboration                Conversation
                    │                           │
                    │                           ▼
                    │                         Message
                    │                           │
                    └──────────────┐            ▼
                                   │          Offer
                                   ▼            │
                                Payment ◄───────┘
```

The database therefore supports the full CRAB lifecycle:

> **User → Profile → Social/Campaign Data → AI Intelligence → Match → Conversation → Offer → Collaboration → Payment → Historical Outcome**

---

## Related Documents

- `01_PRD.md` — Product requirements
- `02_MVP.md` — MVP scope
- `03_USER_FLOWS.md` — User flows
- `04_SRD.md` — System requirements
- `05_ARCHITECTURE.md` — System and application architecture
- `07_API_SPEC.md` — Backend API specification
- `08_AI_MATCHING.md` — AI matching and intelligence architecture
- `09_UI_UX.md` — UI/UX design
- `10_ROADMAP.md` — Development roadmap
- `11_AI_INSTRUCTIONS.md` — AI implementation instructions
