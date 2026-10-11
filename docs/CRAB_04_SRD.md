# 04 — System Requirements Document

**Project:** CRAB — Creators Reaching Aligned Brands  
**Document:** System Requirements Document  
**Status:** MVP System Requirements  
**Version:** 1.0

---

# 1. Purpose

This document defines the functional and non-functional requirements for the CRAB MVP.

CRAB is a two-sided creator-brand collaboration platform in which AI helps understand creators, understand campaigns, identify relevant matches, explain recommendations, and assist with collaboration and deal decisions.

This document defines **what the system must do**.

Implementation choices such as specific frameworks, database implementation details, AI providers, and infrastructure belong in the architecture and implementation documents.

---

# 2. System Objective

The CRAB MVP shall provide a complete creator-brand collaboration workflow:

```text
User
 ↓
Authentication
 ↓
Creator / Brand Profile
 ↓
Social / Campaign Data
 ↓
AI Understanding
 ↓
Matching
 ↓
Recommendation
 ↓
Communication
 ↓
Negotiation
 ↓
Agreement
 ↓
Payment
 ↓
Collaboration History
```

The system must support both sides equally:

```text
Creator → discovers relevant opportunities
Brand   → discovers relevant creators
```

---

# 3. System Actors

## 3.1 Creator

A creator is a user who:

- connects supported social accounts
- maintains a creator profile
- receives campaign recommendations
- searches campaigns
- applies to campaigns
- communicates with brands
- negotiates offers
- accepts/rejects deals
- participates in collaborations

---

## 3.2 Brand

A brand is a user who:

- maintains a brand profile
- creates campaigns
- searches for creators
- receives AI-ranked creator recommendations
- communicates with creators
- makes offers
- negotiates deals
- pays creators
- manages collaborations

---

## 3.3 External Systems

The MVP may interact with:

- YouTube APIs
- Instagram APIs where the required permissions/data are available
- AI/LLM services
- Embedding services
- Payment provider
- Authentication provider where applicable

The exact vendors are implementation decisions.

---

# 4. Functional Requirements

Requirement identifiers use the following format:

```text
FR-[MODULE]-[NUMBER]
```

---

# 5. Authentication Requirements

## FR-AUTH-01

The system SHALL allow a new user to create an account.

## FR-AUTH-02

The system SHALL allow an existing user to log in.

## FR-AUTH-03

The system SHALL allow authenticated users to log out.

## FR-AUTH-04

The system SHALL allow users to select a role:

- Creator
- Brand

## FR-AUTH-05

The system SHALL enforce role-based access to protected functionality.

## FR-AUTH-06

Unauthenticated users SHALL NOT be able to access protected creator or brand resources.

## FR-AUTH-07

The backend SHALL be the authority for authentication and authorization decisions.

## FR-AUTH-08

The AI layer SHALL NOT make authentication or authorization decisions.

---

# 6. Creator Profile Requirements

## FR-CREATOR-01

The system SHALL allow creators to create a creator profile.

## FR-CREATOR-02

A creator profile SHALL support:

- name
- profile image
- bio
- location
- niches/categories
- preferred platforms
- appropriate contact information

## FR-CREATOR-03

Creators SHALL be able to update their profile.

## FR-CREATOR-04

Creators SHALL be able to view their own profile.

## FR-CREATOR-05

Authorized brands SHALL be able to view creator profiles relevant to campaigns.

---

# 7. Brand Profile Requirements

## FR-BRAND-01

The system SHALL allow brands to create a brand profile.

## FR-BRAND-02

A brand profile SHALL support:

- brand name
- logo
- category
- description
- target market
- appropriate website/contact information

## FR-BRAND-03

Brands SHALL be able to update their profile.

## FR-BRAND-04

Creators SHALL be able to view relevant brand information.

---

# 8. Social Account Requirements

## FR-SOCIAL-01

The system SHALL allow creators to connect supported social accounts.

## FR-SOCIAL-02

The initial supported platforms SHALL be:

- YouTube
- Instagram, where the required API permissions and data are available

## FR-SOCIAL-03

The system SHALL obtain social data only through authorized access or approved fallback input.

## FR-SOCIAL-04

The system SHALL store supported social account information associated with the correct creator.

## FR-SOCIAL-05

The system SHALL retrieve available creator metrics where supported.

## FR-SOCIAL-06

The system SHALL retrieve available content metadata where supported.

## FR-SOCIAL-07

The system SHALL distinguish unavailable platform data from zero-valued data.

## FR-SOCIAL-08

The system SHALL provide a manual/demo-data fallback where live API data cannot be used for the MVP demonstration.

## FR-SOCIAL-09

Manual/demo data SHALL NOT be represented internally as verified live platform data.

---

# 9. Creator Metrics Requirements

## FR-METRICS-01

The system SHALL store available creator metrics.

Examples include:

- followers/subscribers
- views
- likes
- comments
- available audience metrics

## FR-METRICS-02

The system SHOULD preserve timestamped metric snapshots.

## FR-METRICS-03

The system SHALL support calculation of derived metrics where sufficient source data exists.

Examples:

- average views
- engagement rate
- growth
- performance trends

## FR-METRICS-04

Derived metrics SHALL be calculated from stored source data rather than invented by an LLM.

## FR-METRICS-05

The system SHALL associate metrics with the correct creator and social account.

---

# 10. Content Requirements

## FR-CONTENT-01

The system SHALL store available creator content metadata.

## FR-CONTENT-02

Where available, content analysis may use:

- titles
- descriptions
- captions
- hashtags
- transcripts
- content metadata
- performance metrics

## FR-CONTENT-03

The system SHALL associate content with its originating creator and social account.

## FR-CONTENT-04

The system SHOULD preserve enough content history to support creator intelligence and performance analysis.

---

# 11. Creator AI Intelligence Requirements

## FR-AICREATOR-01

The system SHALL analyze available creator information using the AI intelligence layer.

## FR-AICREATOR-02

The AI layer SHALL be capable of extracting creator signals such as:

- primary niches
- secondary niches
- topics
- content style
- likely commercial categories
- content relevance

## FR-AICREATOR-03

AI-generated creator attributes SHALL be distinguishable from directly observed data.

## FR-AICREATOR-04

AI-generated fields SHOULD include confidence information where appropriate.

## FR-AICREATOR-05

AI outputs SHALL be validated before being persisted as structured application data.

## FR-AICREATOR-06

The system SHALL allow the creator intelligence profile to be regenerated when sufficiently new data becomes available.

---

# 12. Creator Intelligence Profile Requirements

## FR-PROFILEAI-01

The system SHALL generate a structured creator intelligence profile.

## FR-PROFILEAI-02

The profile SHALL be capable of representing:

- niches
- content style
- major topics
- commercial categories
- audience signals
- performance interpretation

## FR-PROFILEAI-03

The UI SHALL clearly distinguish observed metrics from AI-inferred information.

---

# 13. Campaign Requirements

## FR-CAMPAIGN-01

The system SHALL allow brands to create campaigns.

## FR-CAMPAIGN-02

A campaign SHALL support:

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

## FR-CAMPAIGN-03

A campaign MAY support:

- minimum followers/reach
- minimum average views
- preferred content style
- exclusivity
- usage rights
- additional requirements

## FR-CAMPAIGN-04

Brands SHALL be able to edit campaigns before relevant collaboration stages.

## FR-CAMPAIGN-05

Brands SHALL be able to publish campaigns for creator discovery.

## FR-CAMPAIGN-06

The system SHALL maintain campaign status.

Possible states include:

```text
DRAFT
PUBLISHED
PAUSED
CLOSED
```

---

# 14. Campaign AI Requirements

## FR-AICAMPAIGN-01

The system SHALL analyze campaign information using the AI intelligence layer.

## FR-AICAMPAIGN-02

The AI layer SHALL be capable of extracting:

- category
- product category
- target audience
- target location
- campaign goal
- platform
- content format
- creator requirements

## FR-AICAMPAIGN-03

The structured campaign interpretation SHALL be validated before persistence.

## FR-AICAMPAIGN-04

Brands SHOULD be able to review the AI-generated campaign interpretation before publishing.

---

# 15. Creator and Campaign Embedding Requirements

## FR-EMBED-01

The system SHALL support generation of semantic embeddings for creator representations.

## FR-EMBED-02

The system SHALL support generation of semantic embeddings for campaign representations.

## FR-EMBED-03

The system SHALL support semantic similarity comparison between creators and campaigns.

## FR-EMBED-04

Embeddings SHALL support candidate retrieval and/or ranking.

## FR-EMBED-05

Semantic similarity SHALL NOT be the sole source of final matching decisions.

---

# 16. Candidate Filtering Requirements

## FR-FILTER-01

The system SHALL be able to filter candidates using deterministic campaign requirements.

Potential filters include:

- platform
- budget
- location
- minimum reach
- minimum followers
- content type

## FR-FILTER-02

The system SHOULD eliminate clearly incompatible candidates before deeper matching where possible.

## FR-FILTER-03

Filtering SHALL use backend/application rules rather than LLM decisions.

---

# 17. Matching Requirements

## FR-MATCH-01

The system SHALL match creators with relevant campaigns.

## FR-MATCH-02

The system SHALL support the reverse workflow of matching brands with relevant creators.

## FR-MATCH-03

Matching SHALL combine semantic and deterministic signals.

Potential signals include:

- content/semantic relevance
- audience compatibility
- performance
- platform compatibility
- campaign requirements
- brand compatibility
- historical campaign performance

## FR-MATCH-04

The system SHALL rank eligible matches.

## FR-MATCH-05

The system SHALL store match results where persistence is required.

## FR-MATCH-06

The matching system SHALL support a configurable scoring model.

## FR-MATCH-07

Initial scoring weights SHALL be treated as starting assumptions and SHALL NOT be represented as scientifically validated probabilities.

---

# 18. Recommendation Requirements

## FR-REC-01

Creators SHALL receive campaign recommendations.

## FR-REC-02

Brands SHALL receive creator recommendations.

## FR-REC-03

Recommendations SHALL be rankable by compatibility.

## FR-REC-04

Creators SHALL be able to search/filter campaigns.

## FR-REC-05

Brands SHALL be able to search/filter creators.

## FR-REC-06

Search/filter functionality SHALL coexist with AI recommendations.

## FR-REC-07

The system SHALL display relevant match information with recommendations.

---

# 19. Explainability Requirements

## FR-EXPLAIN-01

The system SHALL provide reasons for significant creator-campaign recommendations.

## FR-EXPLAIN-02

Match explanations SHALL be based on structured evidence available to CRAB.

## FR-EXPLAIN-03

The system SHOULD show positive matching signals.

## FR-EXPLAIN-04

The system SHOULD show relevant concerns or mismatches.

## FR-EXPLAIN-05

The AI SHALL NOT invent numerical evidence used in an explanation.

## FR-EXPLAIN-06

The UI SHALL distinguish factual evidence from AI interpretation where appropriate.

---

# 20. Collaboration History Requirements

## FR-HISTORY-01

The system SHALL store collaboration records.

## FR-HISTORY-02

A collaboration record SHOULD include:

- creator
- brand
- campaign
- date
- platform
- deliverables
- deal value where appropriate
- status

## FR-HISTORY-03

Creators SHALL be able to view their relevant collaboration history.

## FR-HISTORY-04

Brands SHALL be able to view relevant creator collaboration history.

---

# 21. Conflict Detection Requirements

## FR-CONFLICT-01

The system SHALL be able to identify relevant previous brand collaborations.

## FR-CONFLICT-02

The system SHOULD detect potential competitor/category conflicts.

## FR-CONFLICT-03

The initial conflict detection implementation MAY use deterministic rules.

## FR-CONFLICT-04

A detected conflict SHALL generate a warning rather than automatically rejecting a creator unless a future explicit business rule requires rejection.

## FR-CONFLICT-05

Users SHALL retain decision-making authority over potential conflicts.

---

# 22. Messaging Requirements

## FR-MSG-01

Creators and brands SHALL be able to communicate through in-app text messaging.

## FR-MSG-02

The system SHALL associate conversations with the relevant users.

## FR-MSG-03

Where applicable, conversations SHALL be associated with a campaign or collaboration.

## FR-MSG-04

Messages SHALL be persisted.

## FR-MSG-05

Users SHALL be able to view conversation history.

## FR-MSG-06

The MVP SHALL NOT require audio or video calling.

---

# 23. Offer Requirements

## FR-OFFER-01

Authorized brands SHALL be able to create collaboration offers.

## FR-OFFER-02

Offers SHALL support:

- amount
- deliverables
- timeline
- platform
- usage rights where applicable
- additional relevant terms

## FR-OFFER-03

Creators SHALL be able to accept or reject offers.

## FR-OFFER-04

Creators SHALL be able to submit counteroffers.

## FR-OFFER-05

Brands SHALL be able to respond to counteroffers.

## FR-OFFER-06

The system SHALL preserve offer/negotiation state.

## FR-OFFER-07

The system SHALL prevent unauthorized users from modifying another user's offers.

---

# 24. AI Deal Assistance Requirements

## FR-AIDEAL-01

The system SHOULD provide AI-assisted analysis of creator-brand offers.

## FR-AIDEAL-02

The AI MAY suggest an estimated pricing range using available signals.

## FR-AIDEAL-03

The AI MAY suggest a counteroffer.

## FR-AIDEAL-04

The AI MAY generate a suggested negotiation message.

## FR-AIDEAL-05

AI pricing SHALL be represented as an estimate, not guaranteed market value.

## FR-AIDEAL-06

Users SHALL review and approve AI-generated negotiation messages before sending.

## FR-AIDEAL-07

The AI SHALL NOT autonomously accept, reject, or send financial agreements in the MVP.

---

# 25. Payment Requirements

## FR-PAY-01

The MVP SHALL support a payment flow from brand to creator.

## FR-PAY-02

The payment system SHALL support test/sandbox transactions.

## FR-PAY-03

The system SHALL record payment status.

Possible states include:

```text
PENDING
SUCCESS
FAILED
```

## FR-PAY-04

The system SHALL store the relevant transaction/reference identifier where provided by the payment provider.

## FR-PAY-05

The backend SHALL be the source of truth for payment state.

## FR-PAY-06

The MVP SHALL NOT require a production-grade escrow system.

## FR-PAY-07

The AI SHALL NOT execute or authorize payments.

---

# 26. Collaboration Requirements

## FR-COLLAB-01

An accepted offer SHALL be capable of becoming a collaboration record.

## FR-COLLAB-02

A collaboration SHALL have a status.

Example:

```text
PENDING
ACTIVE
COMPLETED
CANCELLED
```

## FR-COLLAB-03

The system SHALL preserve the relationship between:

```text
Creator
Brand
Campaign
Offer
Payment
Collaboration
```

## FR-COLLAB-04

Completed collaborations SHOULD contribute to future history and matching signals where appropriate.

---

# 27. Notification Requirements

The MVP SHOULD support notifications for important events.

Examples:

- new message
- new offer
- counteroffer
- accepted offer
- rejected offer
- payment status
- campaign recommendation
- collaboration status change

The exact notification implementation is an architecture decision.

---

# 28. AI System Requirements

## FR-AI-01

The AI system SHALL support structured analysis of creator information.

## FR-AI-02

The AI system SHALL support structured analysis of campaigns.

## FR-AI-03

The AI system SHALL support content analysis where relevant data is available.

## FR-AI-04

The AI system SHALL support embeddings.

## FR-AI-05

The AI system SHALL support recommendation explanations.

## FR-AI-06

The AI system MAY support deal/negotiation assistance.

## FR-AI-07

AI responses SHOULD be structured rather than free-form whenever the output is consumed by application logic.

## FR-AI-08

AI outputs SHALL be validated before being stored or used by critical application logic.

## FR-AI-09

The AI system SHALL NOT be the source of truth for:

- authentication
- authorization
- payments
- security decisions
- critical business rules

## FR-AI-10

The system SHALL distinguish:

- direct data
- derived data
- AI-inferred data
- unavailable data

---

# 29. Data Integrity Requirements

## FR-DATA-01

Creator data SHALL be associated with the correct authenticated user.

## FR-DATA-02

Brand data SHALL be associated with the correct authenticated user.

## FR-DATA-03

Users SHALL NOT be able to access another user's private application data without authorization.

## FR-DATA-04

AI-generated data SHALL retain its relationship to the source data from which it was derived.

## FR-DATA-05

The system SHALL avoid representing unavailable information as factual information.

## FR-DATA-06

Critical records SHALL maintain consistent relationships between users, campaigns, offers, payments, and collaborations.

---

# 30. Security Requirements

## FR-SEC-01

Protected endpoints SHALL require authentication.

## FR-SEC-02

Authorization SHALL be enforced on the backend.

## FR-SEC-03

Users SHALL only access resources they are authorized to access.

## FR-SEC-04

Sensitive credentials and API secrets SHALL NOT be exposed to the client.

## FR-SEC-05

Social authorization tokens SHALL be handled securely.

## FR-SEC-06

Payment credentials SHALL be handled by the payment provider's supported mechanisms rather than stored unnecessarily by CRAB.

## FR-SEC-07

The AI system SHALL NOT be trusted with security-critical authorization decisions.

---

# 31. Privacy Requirements

## FR-PRIV-01

CRAB SHALL only process social information that the user has authorized or that is provided through an approved fallback mechanism.

## FR-PRIV-02

The system SHALL avoid collecting unnecessary private social information.

## FR-PRIV-03

The system SHALL distinguish publicly available information from authorized private/platform-specific information.

## FR-PRIV-04

The product SHALL not claim access to data that the connected platform does not provide.

---

# 32. Error Handling Requirements

## FR-ERR-01

The system SHALL provide a meaningful error state when social API access fails.

## FR-ERR-02

The system SHALL provide a meaningful error state when AI processing fails.

## FR-ERR-03

The system SHALL allow retry of recoverable AI/API operations.

## FR-ERR-04

The system SHALL provide a meaningful error state when payment fails.

## FR-ERR-05

The system SHALL not fabricate data or AI results after a failed data/AI operation.

## FR-ERR-06

The system SHALL preserve valid previously stored data when a later synchronization or AI operation fails.

---

# 33. Performance Requirements

## NFR-PERF-01

Normal CRUD operations SHOULD provide responsive user interaction under expected MVP load.

## NFR-PERF-02

Long-running AI and social-data operations SHALL provide visible processing states.

## NFR-PERF-03

The system SHOULD avoid sending unnecessary raw social data to AI services.

## NFR-PERF-04

The system SHOULD reuse stored AI analyses and embeddings when the underlying source data has not meaningfully changed.

## NFR-PERF-05

Candidate filtering SHOULD occur before expensive matching operations where practical.

---

# 34. Scalability Requirements

## NFR-SCALE-01

The system SHOULD separate creator, campaign, matching, messaging, and payment responsibilities into logically independent modules.

## NFR-SCALE-02

The AI service SHOULD be replaceable without redesigning the entire application.

## NFR-SCALE-03

The social integration layer SHOULD allow additional platforms to be added later.

## NFR-SCALE-04

The matching system SHOULD support configurable scoring signals.

## NFR-SCALE-05

The MVP architecture SHOULD allow future proprietary ML ranking without requiring a complete product rewrite.

---

# 35. Reliability Requirements

## NFR-REL-01

Critical application data SHALL be persisted in the database.

## NFR-REL-02

Payment state SHALL not depend on the current UI state.

## NFR-REL-03

AI failures SHALL not corrupt existing creator/campaign records.

## NFR-REL-04

External API failures SHALL not cause unrelated application features to fail unnecessarily.

## NFR-REL-05

The system SHOULD preserve historical collaboration and transaction records.

---

# 36. Observability Requirements

The system SHOULD log important technical events, including:

- authentication failures
- social API failures
- AI processing failures
- payment failures
- matching failures
- important state transitions

Logs SHALL avoid unnecessarily exposing sensitive user data or credentials.

---

# 37. AI Reliability Requirements

## NFR-AI-01

AI output SHALL be treated as untrusted input.

## NFR-AI-02

Structured AI responses SHALL be validated before use.

## NFR-AI-03

The system SHOULD record the source/context used to generate important AI-inferred fields.

## NFR-AI-04

AI-generated confidence values SHALL NOT be represented as statistically calibrated probabilities unless independently validated.

## NFR-AI-05

AI-generated recommendations SHALL be explainable using available structured evidence.

## NFR-AI-06

The system SHALL not claim that an AI recommendation guarantees collaboration success.

---

# 38. External Integration Requirements

## 38.1 YouTube

The system SHALL support integration with YouTube data available through authorized APIs.

## 38.2 Instagram

The system SHALL support Instagram data where the required API permissions and supported account/data conditions are available.

## 38.3 AI Provider

The system SHALL interact with an AI service capable of supporting:

- structured text analysis
- embeddings
- natural-language generation

The specific AI provider SHALL be selected during architecture/implementation.

## 38.4 Payment Provider

The system SHALL support a payment provider capable of providing a test/sandbox environment.

Razorpay is the intended MVP candidate.

---

# 39. No Admin Role in MVP

The MVP SHALL NOT require a dedicated admin user interface.

Basic backend controls, logging, database management, or development tools may exist internally, but they are not part of the public MVP user experience.

---

# 40. Out of Scope

The following are outside the MVP requirements:

- audio calling
- video calling
- screen sharing
- group calls
- call recording
- autonomous financial negotiation
- autonomous payment execution
- production escrow
- proprietary foundation-model training
- advanced predictive ML
- complete social-network functionality
- support for every social platform
- scraping private social information
- guaranteed campaign success
- guaranteed market-accurate creator pricing
- full external internet-wide opportunity discovery

---

# 41. MVP Acceptance Criteria

The system shall be considered functionally complete when the following end-to-end scenarios work.

## AC-01 — Creator Onboarding

A new creator can:

1. create an account
2. choose the creator role
3. create a profile
4. connect a supported social account or use approved demo/fallback data
5. see imported/entered data

---

## AC-02 — Creator Intelligence

CRAB can:

1. obtain available creator data
2. analyze relevant content
3. generate structured creator intelligence
4. validate the output
5. display creator insights

---

## AC-03 — Brand Campaign

A brand can:

1. create an account
2. create a brand profile
3. create a campaign
4. submit campaign requirements
5. receive AI-generated structured campaign understanding
6. review/publish the campaign

---

## AC-04 — Matching

CRAB can:

1. identify eligible creators
2. generate/obtain relevant semantic representations
3. calculate compatibility
4. rank creators
5. provide match reasons

The reverse creator → campaign recommendation flow must also work.

---

## AC-05 — Collaboration

A creator and brand can:

1. discover each other
2. start a conversation
3. make an offer
4. counter the offer
5. accept/reject the deal
6. create a collaboration record

---

## AC-06 — Payment

A brand can:

1. initiate the supported test payment
2. receive a payment result
3. have the payment state stored correctly

---

## AC-07 — Reliability

The system handles:

- unavailable social data
- API failure
- AI failure
- payment failure

without fabricating results or corrupting existing data.

---

# 42. Requirement Priority

Requirements should be classified during implementation as:

```text
MUST
SHOULD
MAY
```

For the MVP:

- **MUST** = required for the hackathon's core end-to-end demonstration
- **SHOULD** = important but can be reduced if time is constrained
- **MAY** = optional enhancement

The team should protect the core intelligence and marketplace loop before optional features.

---

# 43. Final System Requirement Principle

The CRAB system must satisfy one central product promise:

> **CRAB understands both sides of a creator-brand collaboration and uses that understanding to connect the right creators with the right opportunities.**

The system should therefore prioritize:

```text
Reliable Data
     ↓
Meaningful AI Understanding
     ↓
Relevant Matching
     ↓
Explainable Recommendations
     ↓
Human-Controlled Collaboration
```

The MVP succeeds when this loop works reliably from beginning to end.
