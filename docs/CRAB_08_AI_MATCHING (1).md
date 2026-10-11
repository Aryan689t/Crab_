# 08 — AI Matching & Intelligence Architecture

**Project:** CRAB  
**Document:** AI Matching & Intelligence Architecture  
**Status:** MVP Technical Design  
**Version:** 1.0

---

## 1. Purpose

This document defines the AI system behind CRAB.

CRAB is a creator-brand collaboration platform. Its AI layer is responsible for understanding creators, campaigns, content, audience signals, compatibility, opportunities, and deal context.

The MVP does **not** train a proprietary AI model. Instead, it combines:

- Authorized social-platform APIs
- Existing LLMs
- Embedding models
- Deterministic backend calculations
- Rule-based business logic
- PostgreSQL data storage

The central principle is:

> **AI recommends and interprets; the backend enforces rules and executes application logic.**

This keeps the system practical, explainable, and implementable by a small student team.

---

# 2. AI Architecture

## 2.1 High-Level Architecture

```text
                  ┌─────────────────────┐
                  │  Instagram / YouTube│
                  └──────────┬──────────┘
                             │
                       Authorized APIs
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Data Collection   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Data Normalization  │
                  └──────────┬──────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌─────────────────┐          ┌─────────────────┐
     │ Creator Data    │          │ Campaign Data   │
     └────────┬────────┘          └────────┬────────┘
              │                            │
              └──────────────┬─────────────┘
                             ▼
                  ┌─────────────────────┐
                  │   AI Intelligence   │
                  │       Layer         │
                  ├─────────────────────┤
                  │ LLM Analysis        │
                  │ Embeddings          │
                  │ Classification      │
                  │ Extraction          │
                  │ Explanation         │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Structured Profiles │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Matching / Ranking  │
                  │      Engine         │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ CRAB Backend / API  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │       UI            │
                  └─────────────────────┘
```

---

# 3. AI Responsibilities

The AI system has six major responsibilities:

1. **Creator Intelligence**
2. **Campaign Intelligence**
3. **Content Analysis**
4. **Audience Intelligence**
5. **Compatibility & Opportunity Matching**
6. **Deal Intelligence**

These are supported by two technical capabilities:

- Semantic embeddings
- Natural-language generation / explanation

---

# 4. Creator Intelligence

## 4.1 Objective

When a creator connects an authorized social account, CRAB should construct a structured understanding of that creator.

The objective is not simply to store:

- followers
- views
- likes

Instead, CRAB should understand:

> **What kind of creator is this, what content do they produce, who is their audience, what performs well for them, and what types of campaigns are likely to fit them?**

---

## 4.2 Creator Data Pipeline

```text
Social Account
      ↓
Authorized API
      ↓
Raw Creator Data
      ↓
Normalization
      ↓
Content / Metrics
      ↓
AI Analysis
      ↓
Creator Intelligence Profile
```

---

## 4.3 Creator Intelligence Profile

A simplified representation:

```json
{
  "primary_niches": [
    "technology",
    "programming",
    "AI"
  ],
  "secondary_niches": [
    "gaming",
    "student_lifestyle"
  ],
  "content_style": [
    "educational",
    "informal",
    "short_form"
  ],
  "audience": {
    "country": "India",
    "age_group": "18-24"
  },
  "performance": {
    "average_views": 42000,
    "engagement_rate": 6.8
  },
  "brand_categories": [
    "developer_tools",
    "consumer_technology",
    "education",
    "gaming"
  ]
}
```

The exact schema will evolve during implementation.

---

# 5. Data Classification

CRAB must distinguish between what it **knows** and what AI **infers**.

Every important data point should be classified into one of four categories.

## 5.1 Direct Data

Information obtained directly from an authorized platform API or from the user.

Examples:

- follower/subscriber count
- video views
- likes
- comments
- available audience geography
- content metadata
- channel information

These should be treated as source data.

---

## 5.2 Derived Data

Information calculated by CRAB.

Examples:

- engagement rate
- average views
- growth rate
- average performance by category
- campaign completion rate
- historical acceptance rate

Example:

```text
Engagement Rate =
(likes + comments + shares) / reach
```

Where the exact formula depends on the available platform metrics.

---

## 5.3 AI-Inferred Data

Information inferred from available data using AI.

Examples:

- creator niche
- content tone
- content themes
- likely interests
- campaign relevance
- semantic similarity
- content quality observations
- recommended brand categories

These must not be represented as guaranteed facts.

---

## 5.4 Unavailable Data

Information that CRAB cannot reliably obtain should not be fabricated.

For example:

- private audience information unavailable through the API
- demographics not exposed by the platform
- private messages without authorization
- information that requires access CRAB does not possess

The product should explicitly distinguish missing data from negative data.

---

# 6. Content Analysis

## 6.1 Objective

AI analyzes available creator content and converts unstructured content into structured signals.

Example input:

> "5 VS Code extensions that completely changed my workflow."

Possible AI output:

```json
{
  "topic": "developer productivity",
  "category": "technology",
  "subcategory": "programming",
  "intent": "educational",
  "tone": "informal",
  "format": "listicle",
  "products_mentioned": [
    "VS Code"
  ],
  "target_audience": [
    "developers",
    "students"
  ]
}
```

---

## 6.2 What the AI Can Analyze

Depending on available source data:

- title
- description
- caption
- hashtags
- transcript
- textual metadata
- available content context
- performance metrics

The exact content accessible depends on the platform and authorization scope.

---

# 7. Performance Intelligence

Performance calculations should primarily remain outside the LLM.

For example:

```text
Raw metrics
     ↓
Backend calculations
     ↓
Performance statistics
     ↓
AI interpretation
```

The backend calculates:

- average views
- engagement rate
- growth
- best-performing content
- performance by category
- performance by format
- historical campaign performance

AI can then interpret those statistics.

Example:

> "Technology tutorials have generated approximately 37% higher average engagement than general lifestyle content over the analyzed period."

The number should come from backend calculations; AI should not invent it.

---

# 8. Audience Intelligence

Audience information must be treated carefully.

## 8.1 Direct Audience Data

Where an authorized API provides it, CRAB may use:

- geography
- age ranges
- gender distribution
- other available demographic metrics

## 8.2 Derived Audience Data

CRAB can calculate:

- dominant country
- dominant age group
- demographic overlap
- campaign-target overlap

## 8.3 AI-Inferred Audience Data

AI may infer likely interests or audience characteristics from available content and performance.

Example:

> "The audience appears strongly aligned with programming and developer-tool content."

This must be marked as an inference rather than an observed demographic fact.

---

# 9. Campaign Intelligence

## 9.1 Objective

A brand should be able to describe a campaign naturally.

Example:

```text
Product:
Gaming laptop

Budget:
₹1,00,000

Platform:
Instagram

Deliverables:
2 Reels + 3 Stories

Target:
Indian gamers aged 18–25

Goal:
Product awareness

Deadline:
30 days
```

AI converts this into a structured campaign representation.

---

## 9.2 Campaign Intelligence Profile

```json
{
  "category": "gaming",
  "product_category": "consumer_electronics",
  "platform": "instagram",
  "target_country": "India",
  "target_age": "18-25",
  "campaign_goal": "awareness",
  "required_content": [
    "short_form_video",
    "story"
  ],
  "deadline_days": 30
}
```

This structured representation allows CRAB to compare campaigns against creator profiles.

---

# 10. Embeddings

## 10.1 Why Embeddings?

Keyword matching is insufficient.

A creator may describe themselves as:

> "Tech creator making content for programmers."

A campaign may say:

> "Looking for developers and AI enthusiasts to promote our coding assistant."

There may be few exact keyword matches, but the concepts are highly related.

Embeddings represent the semantic meaning of text as vectors.

```text
Creator description
        ↓
Embedding model
        ↓
Vector

Campaign description
        ↓
Embedding model
        ↓
Vector

        ↓

Semantic similarity
```

This allows CRAB to compare meaning rather than just exact words.

---

## 10.2 Where Embeddings Are Used

Potential embedding targets:

- creator profile
- creator content summaries
- campaign descriptions
- brand/product descriptions
- creator niche descriptions

Embeddings can support candidate retrieval before detailed scoring.

---

# 11. Compatibility Engine

Embeddings alone should **not** determine the final match.

CRAB should combine semantic similarity with deterministic signals.

```text
                    MATCHING ENGINE

        ┌──────────────┬──────────────┬──────────────┐
        │              │              │              │
        ▼              ▼              ▼              ▼
 Semantic Match   Audience Match  Performance   Requirements
        │              │              │              │
        └──────────────┴──────────────┴──────────────┘
                               │
                               ▼
                       Business Rules
                               │
                               ▼
                       Final Match Score
```

---

# 12. Compatibility Score

An initial MVP weighting could be:

| Signal | Weight |
|---|---:|
| Content / semantic relevance | 30% |
| Audience overlap | 25% |
| Performance | 15% |
| Platform compatibility | 10% |
| Campaign requirements | 10% |
| Brand compatibility | 5% |
| Historical campaign performance | 5% |

Total:

**100%**

These weights are starting assumptions, not scientifically validated constants.

They should eventually be tuned using real platform outcomes.

---

# 13. Example Match

Creator:

```text
Technology + Programming
India
18–24 audience
Strong short-form performance
```

Campaign:

```text
AI coding assistant
India
18–25
Instagram Reels
Awareness
```

Possible result:

> **91% Match — Excellent Fit**

Reasons:

- Strong technology-content overlap
- Strong programming relevance
- Audience geography aligns
- Audience age aligns
- Required content format matches creator strengths
- No detected competing-brand conflict

Potential warning:

> Campaign requires multiple Stories, while this creator historically performs better with Reels.

---

# 14. Explainability

The system must not only provide a score.

It should answer:

> **Why is this a good match?**

The explanation should be generated from structured evidence.

Example:

```text
91% Match

✓ Strong technology-content overlap
✓ Audience geography aligns
✓ Target age overlaps strongly
✓ Creator performs well with short-form video
✓ Previous related campaigns performed well

⚠ Campaign requests 3 Stories
  Creator's historical performance is stronger
  for Reels.
```

The LLM can turn the evidence into natural language, but the underlying evidence should come from CRAB's data and scoring engine.

---

# 15. Opportunity Discovery

## 15.1 MVP

The MVP should primarily match creators against campaigns already present in CRAB.

```text
Campaign Database
       ↓
Candidate Filtering
       ↓
Compatibility Engine
       ↓
Ranking
       ↓
Top Opportunities
```

Example:

```text
Recommended for you

AI Coding Tool
₹35,000
Instagram

94% Match

Why:
• Technology niche
• Developer audience
• Strong India overlap
• Similar content performs well
```

---

## 15.2 Future

Future versions may discover opportunities outside the CRAB marketplace where legally and technically feasible.

This is not required for the MVP.

---

# 16. Brand Conflict Detection

CRAB should maintain creator-brand partnership history.

Example:

```text
Creator
 │
 ├── Previous partnerships
 │     ├── NVIDIA
 │     └── ASUS
 │
 └── New campaign
       └── AMD
```

CRAB can flag:

> ⚠ Potential competitor conflict

The initial implementation should be rule-based.

Example:

```text
if new_brand.category == existing_brand.category
AND conflict_policy applies
→ flag for review
```

AI can later improve relationship detection between brands and products.

---

# 17. Deal Intelligence

## 17.1 Objective

AI should assist creators when evaluating and negotiating brand offers.

Input:

```text
Offer:
₹8,000

Deliverables:
2 Reels

Usage rights:
3 months

Creator:
50k followers

Historical performance:
...
```

Output:

```text
Suggested range:
₹12,000–₹16,000

Suggested counter:
₹15,000
```

---

## 17.2 Important Limitation

The pricing engine should not claim to know the "true market price."

It should provide an **estimated recommendation** based on available signals.

Possible inputs:

- audience size
- engagement
- historical performance
- deliverables
- usage rights
- exclusivity
- campaign duration
- platform
- creator's historical deals

---

# 18. Negotiation Assistant

MVP behavior:

```text
Brand offer
     ↓
AI analyzes
     ↓
Suggested range
     ↓
Negotiation recommendation
     ↓
Generated response
     ↓
Creator approves
     ↓
Creator sends
```

Example:

> "Thanks for reaching out! I'd be happy to collaborate. Considering the two-reel deliverable and three-month usage rights, my rate for this campaign would be ₹15,000. Happy to discuss the scope further."

The creator remains in control.

CRAB should **not autonomously negotiate financial agreements in the MVP.**

---

# 19. AI vs Backend Responsibilities

| Responsibility | Backend | AI |
|---|:---:|:---:|
| Authentication | ✓ | |
| Authorization | ✓ | |
| User management | ✓ | |
| Creator CRUD | ✓ | |
| Campaign CRUD | ✓ | |
| Payments | ✓ | |
| Social API integration | ✓ | |
| Store metrics | ✓ | |
| Calculate engagement | ✓ | |
| Calculate performance | ✓ | |
| Content understanding | | ✓ |
| Topic extraction | | ✓ |
| Campaign understanding | | ✓ |
| Embeddings | | ✓ |
| Semantic similarity | | ✓ |
| Recommendations | ✓ | ✓ |
| Match explanation | | ✓ |
| Negotiation assistance | | ✓ |
| Final business rules | ✓ | |
| Payment execution | ✓ | |
| Security decisions | ✓ | |

The AI must not become the source of truth for security, authorization, payments, or critical business rules.

---

# 20. Data Pipeline

The complete pipeline is:

```text
                 SOCIAL PLATFORMS
                  /           \
                 /             \
          Instagram           YouTube
                \               /
                 \             /
                  API CONNECTORS
                        ↓
                 DATA NORMALIZER
                        ↓
             ┌──────────────────────┐
             │ Creator Raw Data     │
             │ Content Data         │
             │ Performance Metrics  │
             └──────────┬───────────┘
                        ↓
                 AI PROCESSING
              ┌─────────┼─────────┐
              ↓         ↓         ↓
             LLM    Embeddings   Rules
              │         │         │
              └─────────┼─────────┘
                        ↓
              CREATOR INTELLIGENCE
                        ↓
                 MATCHING ENGINE
                        ↑
                        │
                CAMPAIGN INTELLIGENCE
                        ↑
                        │
                   BRAND INPUT
```

---

# 21. AI Processing Strategy

CRAB should avoid sending unnecessary raw data to an LLM.

Instead:

```text
Raw API Data
     ↓
Normalize
     ↓
Filter / Aggregate
     ↓
AI only receives relevant context
     ↓
Structured JSON
     ↓
Validate
     ↓
Store
```

This reduces:

- cost
- latency
- token usage
- inconsistent outputs

---

# 22. Structured AI Output

AI outputs should be structured rather than free-form whenever possible.

Example:

```json
{
  "primary_niches": [
    "technology",
    "programming"
  ],
  "content_style": [
    "educational",
    "informal"
  ],
  "confidence": {
    "primary_niches": 0.91,
    "content_style": 0.84
  }
}
```

The backend validates the response before storing it.

AI output should never be blindly trusted.

---

# 23. Confidence

AI-inferred fields should ideally include confidence.

For example:

```text
Technology       0.94
Programming      0.89
Gaming           0.61
Finance          0.18
```

This allows CRAB to distinguish:

> "Very likely a technology creator"

from:

> "Possibly interested in gaming."

Confidence values are model outputs and should not be treated as statistically calibrated probabilities unless validated.

---

# 24. AI Evaluation

The system needs measurable evaluation.

## Creator Classification

Measure:

- niche classification accuracy
- category precision
- consistency between runs

## Matching

Measure:

- creator acceptance rate
- campaign acceptance rate
- completed collaboration rate
- campaign performance
- user feedback

## Recommendations

Measure:

- click-through rate
- application rate
- acceptance rate
- conversion to completed deals

## Deal Assistance

Measure:

- creator acceptance of recommendations
- counter-offer success
- final negotiated amount
- user satisfaction

---

# 25. Human Feedback Loop

The best future source of training/evaluation data is actual CRAB usage.

Example:

```text
AI recommends Creator A
        ↓
Brand accepts
        ↓
Campaign completed
        ↓
Performance measured
        ↓
Outcome stored
```

Over time CRAB obtains:

```text
Creator
Campaign
Match score
Recommendation
User decision
Deal
Campaign outcome
```

This becomes valuable proprietary data.

---

# 26. Future ML Possibilities

Only after CRAB has enough real-world data should the team consider training proprietary models.

Potential future systems:

### Proprietary Match Ranking Model

```text
Historical matches
       ↓
Successful campaigns
       ↓
Training data
       ↓
CRAB ranking model
```

### Deal Prediction

Predict:

- probability of creator accepting
- expected negotiation range
- probability of campaign success

### Recommendation Learning

The system can learn:

> "Creators similar to this creator tend to perform well with these campaigns."

This could eventually outperform manually chosen weights.

---

# 27. MVP Scope

The MVP should implement:

### Creator Intelligence

- authorized social connection
- available creator metrics
- content metadata
- AI niche extraction
- AI content categorization
- creator profile generation

### Campaign Intelligence

- structured campaign creation
- AI campaign categorization
- target audience extraction
- campaign embedding

### Matching

- creator embedding
- campaign embedding
- semantic similarity
- deterministic compatibility scoring
- ranked recommendations
- explainable match reasons

### Deal Intelligence

- offer analysis
- estimated pricing range
- counter-offer suggestion
- AI-generated negotiation response

### Safety / Reliability

- AI output validation
- confidence where appropriate
- clear distinction between observed and inferred data
- backend authority over critical operations

---

# 28. Explicit MVP Non-Goals

The MVP will not:

- train a proprietary foundation model
- scrape private social data
- fabricate unavailable audience information
- guarantee campaign success
- guarantee a "correct" creator price
- autonomously negotiate financial agreements
- autonomously execute payments
- make security or authorization decisions using an LLM

---

# 29. Recommended MVP Technology Architecture

```text
Frontend
React / Next.js
        │
        ▼
Backend API
Node.js + Express
        │
        ├───────────────┐
        │               │
        ▼               ▼
PostgreSQL          Social APIs
        │
        │
        ▼
AI Service Layer
        │
        ├── LLM
        │
        ├── Embedding Model
        │
        └── AI Prompt / Schema Layer
        │
        ▼
Matching Engine
        │
        ▼
Recommendations
```

The AI service can initially live inside the Node backend as a separate service/module. A dedicated Python ML service is **not required** for the MVP.

---

# 30. Core Design Principles

### Principle 1 — AI is an intelligence layer

AI enhances the platform; it does not replace the backend.

### Principle 2 — Never fabricate unavailable data

If a platform does not expose a metric, CRAB should not pretend it has it.

### Principle 3 — Separate facts from inference

Every important signal should be traceable to:

- API data
- user input
- backend calculation
- AI inference

### Principle 4 — Explain recommendations

Users should understand why a creator and campaign were matched.

### Principle 5 — Keep humans in control

Creators approve negotiations, deals, and important actions.

### Principle 6 — Start with existing models

CRAB should not train custom models before it has meaningful proprietary data.

### Principle 7 — Collect outcomes

Every completed campaign can improve future ranking and evaluation.

---

# 31. Final AI Architecture

The CRAB AI system can therefore be summarized as:

```text
             RAW PLATFORM DATA
                     │
                     ▼
              DATA PROCESSING
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   CREATOR INTELLIGENCE   CAMPAIGN INTELLIGENCE
          │                     │
          └──────────┬──────────┘
                     ▼
                EMBEDDINGS
                     │
                     ▼
              MATCHING ENGINE
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     MATCH SCORE          EXPLANATION
          │                     │
          └──────────┬──────────┘
                     ▼
             OPPORTUNITY ENGINE
                     │
                     ▼
              DEAL INTELLIGENCE
                     │
                     ▼
             CREATOR / BRAND UI
```

The long-term vision is:

> **CRAB becomes a creator-brand intelligence platform that understands both sides of a collaboration and uses that understanding to recommend better matches, better opportunities, and better deals.**

---

# 32. Next Implementation Order

The AI system should be implemented in this order:

1. **Get social API data into CRAB**
2. **Normalize creator data**
3. **Build creator intelligence extraction**
4. **Build campaign intelligence extraction**
5. **Generate embeddings**
6. **Implement basic semantic matching**
7. **Add deterministic compatibility scoring**
8. **Generate explainable recommendations**
9. **Build opportunity ranking**
10. **Add deal/pricing assistance**
11. **Collect real outcomes**
12. **Evaluate and improve the system**

This order intentionally avoids jumping into custom ML before CRAB has usable data.
