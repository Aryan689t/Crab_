# CRAB --- Product Requirements Document (PRD)

**Product Name:** CRAB\
**Full Name:** Creators Reaching Aligned Brands\
**Document:** Product Requirements Document\
**Version:** 1.0\
**Status:** Initial Product Definition

------------------------------------------------------------------------

# 1. Product Overview

## 1.1 What is CRAB?

CRAB (Creators Reaching Aligned Brands) is an AI-powered two-sided
Creator--Brand Opportunity Engine.

CRAB helps:

1.  Creators discover brands and commercial opportunities that genuinely
    align with their content, audience, niche, and commercial potential.
2.  Brands discover creators who are relevant to their campaign beyond
    simple metrics such as follower count or popularity.

The central idea behind CRAB is:

> **Understand context, not just follower counts.**

Traditional creator discovery often relies heavily on follower count,
popularity, category filters, and manual searches. This can cause niche,
emerging, and highly relevant creators to be overlooked.

At the same time, creators may struggle to discover brands and campaign
categories that naturally fit their content and audience.

CRAB addresses both sides using AI-powered content understanding,
campaign understanding, compatibility reasoning, opportunity discovery,
and explainable recommendations.

------------------------------------------------------------------------

# 2. Problem Statement

The creator economy is growing rapidly, but finding the right
creator--brand partnership remains difficult.

Brands often depend on:

-   Follower count
-   Popularity
-   Basic engagement metrics
-   Category filters
-   Manual searches
-   Existing creator networks

This can cause newer, underrated, and niche creators with highly
relevant audiences and strong engagement to be overlooked.

At the same time, creators struggle to discover brands that genuinely
match:

-   Their content
-   Their audience
-   Their niche
-   Their content style
-   Their commercial potential

As a result, valuable creator--brand partnerships can remain
undiscovered.

------------------------------------------------------------------------

# 3. Product Vision

CRAB aims to become an intelligent opportunity discovery layer between
creators and brands.

Instead of asking:

> "Who has the most followers?"

CRAB asks:

> "Who is genuinely relevant to this campaign, and why?"

Instead of requiring creators to search manually for every possible
sponsorship category, CRAB asks:

> "Based on what this creator already does, what commercial
> opportunities might they be missing?"

The long-term vision is to create a system where creators and brands can
discover high-quality partnerships based on contextual alignment rather
than surface-level popularity.

------------------------------------------------------------------------

# 4. Product Objectives

## 4.1 Creator Objective

Help creators:

-   Understand their commercial identity.
-   Discover relevant brands and campaign opportunities.
-   Discover adjacent commercial categories they may not have
    considered.
-   Understand why an opportunity is relevant.
-   Identify their strengths and weaknesses from a commercial
    perspective.
-   Estimate whether a potential collaboration is commercially sensible.

## 4.2 Brand Objective

Help brands:

-   Define campaign requirements clearly.
-   Discover relevant creators.
-   Find emerging and niche creators who may be overlooked by
    traditional discovery methods.
-   Compare creators based on contextual relevance.
-   Understand why a creator is recommended.
-   Identify potential collaboration formats and content angles.

## 4.3 Platform Objective

CRAB should provide:

-   Explainable recommendations.
-   Context-aware matching.
-   Opportunity discovery.
-   A two-sided creator and brand experience.
-   A foundation for future creator--brand collaboration and deal
    management.

------------------------------------------------------------------------

# 5. Target Users

## 5.1 Creator

A creator is an individual who produces content on platforms such as
YouTube or Instagram and wants to monetize their influence through
relevant brand partnerships.

### Creator needs

Creators need to:

-   Understand their audience and content identity.
-   Find relevant sponsorship opportunities.
-   Discover brands they may not have considered.
-   Avoid irrelevant sponsorships.
-   Understand their commercial positioning.
-   Find opportunities even when they are not among the largest
    creators.

### Example

A creator produces:

-   Programming tutorials
-   College-related content
-   Coding projects
-   Developer tips

They may initially search for:

> Laptop brands

CRAB could additionally identify potential opportunities in:

-   Cloud platforms
-   Developer tools
-   AI coding tools
-   Productivity software
-   Online learning platforms
-   Coding courses

The creator did not explicitly search for these categories.

This is an example of **Opportunity Discovery**.

## 5.2 Brand

A brand is a company, organization, or marketing team looking to
collaborate with creators for a campaign.

### Brand needs

Brands need to:

-   Define campaign objectives.
-   Identify target audiences.
-   Find relevant creators.
-   Compare creators.
-   Discover emerging creators.
-   Understand creator--campaign compatibility.
-   Determine suitable collaboration approaches.

### Example

A laptop brand wants:

-   Indian engineering students
-   Awareness-focused campaign
-   Educational but relatable content
-   Technology-focused creators
-   Budget of ₹50,000

Instead of simply searching:

> "Tech creators with 50,000+ followers"

CRAB should identify creators whose actual content and audience align
strongly with the campaign.

------------------------------------------------------------------------

# 6. Core Value Proposition

## For Creators

> **CRAB helps you discover commercial opportunities that fit what you
> already create --- including opportunities you may not have thought to
> search for.**

## For Brands

> **CRAB helps you find creators who actually fit your campaign, not
> just creators with large follower counts.**

## Core Differentiator

CRAB focuses on:

**Context + Relevance + Explainability + Opportunity Discovery**

rather than:

**Popularity + Follower Count + Manual Search**

------------------------------------------------------------------------

# 7. Product Philosophy

## 7.1 Context Over Popularity

Follower count should not be treated as the primary indicator of
partnership suitability.

A smaller creator with a highly relevant audience may be more valuable
than a much larger but irrelevant creator.

## 7.2 Relevance Over Reach

Reach is important, but relevance determines whether a partnership
naturally makes sense.

## 7.3 Explainability

CRAB should not simply produce a recommendation.

It should explain:

> **Why was this recommendation made?**

## 7.4 Discovery Over Search

CRAB should not only respond to what users explicitly search for.

It should identify opportunities that users may not have considered.

## 7.5 AI as a Reasoning Layer

AI should not exist merely to generate a percentage.

AI should understand unstructured information, identify relationships,
reason about compatibility, discover opportunities, and explain
recommendations.

------------------------------------------------------------------------

# 8. How CRAB Works

The core CRAB workflow is:

``` text
Creator Data
      ↓
Creator Intelligence
      ↓
Creator Commercial Profile

Brand Campaign
      ↓
Campaign Intelligence
      ↓
Campaign Profile

Creator Profile + Campaign Profile
      ↓
AI Compatibility Analysis
      ↓
Compatibility Assessment
      ↓
Explanation + Evidence
      ↓
Opportunity Discovery
      ↓
Deal Optimization
```

The product should support both directions:

``` text
CREATOR → discovers BRANDS

BRAND → discovers CREATORS
```

------------------------------------------------------------------------

# 9. AI's Role in CRAB

AI is a central component of CRAB.

However, AI should not replace the backend's responsibility for
structured data, authentication, calculations, or transactional
operations.

CRAB separates responsibilities between deterministic software and AI
reasoning.

## 9.1 Creator Intelligence

CRAB should analyze creator information such as:

-   Content
-   Titles
-   Descriptions
-   Transcripts where available
-   Topics
-   Niche
-   Content style
-   Audience signals
-   Platform information
-   Performance metrics

AI should transform this information into a structured:

> **Creator Commercial Profile**

Example:

``` text
Niche:
Programming / Student Technology

Audience:
College students, engineering students, developers

Content Style:
Educational + relatable

Common Topics:
Programming, coding, college, developer tools

Potential Commercial Categories:
Laptops
Developer Tools
Cloud Platforms
AI Tools
Productivity Software
Online Learning
```

The exact structure of this profile will be defined in later technical
documents.

## 9.2 Campaign Intelligence

Brands should be able to provide campaign information using structured
fields and/or natural-language descriptions.

Example:

> "We want to promote our laptop to Indian engineering students through
> relatable educational content."

CRAB should understand the campaign intent and derive a structured
Campaign Profile.

Example:

``` text
Product:
Laptop

Target Audience:
Indian engineering students

Region:
India

Campaign Goal:
Awareness

Preferred Content Style:
Educational + Relatable

Budget:
₹50,000
```

AI should focus on understanding the meaning and intent of the campaign
rather than simply matching keywords.

## 9.3 AI Compatibility Analysis

CRAB should compare a Creator Commercial Profile with a Campaign
Profile.

The analysis should consider factors such as:

-   Content relevance
-   Audience alignment
-   Niche alignment
-   Content style
-   Campaign objective
-   Product relevance
-   Commercial suitability
-   Performance signals
-   Budget compatibility
-   Other relevant campaign constraints

The output should include:

1.  Overall compatibility assessment.
2.  Supporting factors.
3.  Potential mismatches.
4.  Explanation of the recommendation.
5.  Relevant evidence/signals.

## 9.4 Explainable Recommendations

CRAB must avoid making unexplained recommendations.

Instead of displaying only:

> 94% Match

CRAB should provide an explanation.

Example:

``` text
94% Compatibility

Audience — Strong
The creator's audience strongly overlaps with
Indian engineering students.

Content — Very Strong
The creator regularly produces programming,
technology and laptop-related content.

Style — Strong
The creator's educational and relatable format
matches the campaign's preferred style.

Commercial Fit — Strong
The product naturally fits the creator's existing
content ecosystem.
```

The exact scoring methodology is not defined in this PRD.

The technical scoring model, weights, AI outputs, and calculation
methodology will be defined later in the AI Matching Specification and
SRD.

## 9.5 Opportunity Discovery

Opportunity Discovery is one of CRAB's primary differentiating features.

CRAB should identify commercial categories and opportunities that a
creator may not have explicitly searched for.

Example:

``` text
Creator Content:
Programming + College + Coding Tutorials

       ↓

Potential Commercial Opportunities:

Cloud Platforms
Developer Tools
Laptops
AI Coding Tools
Productivity Software
Coding Courses
Online Learning Platforms
```

CRAB should explain why each opportunity is relevant.

Example:

> **Cloud Platforms --- High Potential**

> Your programming-focused content and developer audience make cloud
> infrastructure and developer platforms a potentially strong commercial
> category.

The system should avoid suggesting completely unrelated opportunities.

Opportunity Discovery should be based on evidence from the creator's
content, audience, niche, and commercial profile.

## 9.6 Deal Optimization

CRAB should eventually help users evaluate and optimize potential
collaborations.

Potential capabilities include:

-   Budget compatibility
-   Estimated deal range
-   Suggested collaboration format
-   Suggested content angle
-   Campaign fit
-   Creator suitability
-   Potential deal concerns
-   Collaboration status

Example:

``` text
Campaign:
Laptop Awareness Campaign

Recommended Format:
1 YouTube integration + 2 Instagram posts

Estimated Deal Range:
₹35,000 – ₹50,000

Suggested Content Angle:
"Best Laptop Setup for Engineering Students"

Reason:
The angle naturally connects the product to the
creator's existing programming and college content.
```

Exact pricing methodology will be defined later.

------------------------------------------------------------------------

# 10. What AI Does vs What the Backend Does

This distinction is a core product principle.

## Backend / deterministic systems

The backend should handle:

-   User accounts
-   Authentication
-   Authorization
-   Database operations
-   Followers
-   Views
-   Engagement metrics
-   Campaign budgets
-   Location
-   Platform information
-   Deal status
-   Payments
-   Validation
-   Business rules
-   Deterministic calculations

## AI

AI should handle:

-   Understanding creator content
-   Topic and niche understanding
-   Content style analysis
-   Audience-context interpretation
-   Campaign intent understanding
-   Semantic compatibility analysis
-   Recommendation reasoning
-   Explanation generation
-   Opportunity discovery
-   Suggested content angles
-   Commercial-context reasoning

AI should not be used merely because a task can technically be given to
an LLM. Deterministic operations should remain deterministic whenever
possible.

------------------------------------------------------------------------

# 11. Core Product Features

## Feature 1 --- Authentication

Users should be able to:

-   Register
-   Log in
-   Log out
-   Maintain an authenticated session
-   Access only their authorized resources

## Feature 2 --- Creator Profile

Creators should be able to:

-   Create their profile.
-   Define basic information.
-   Connect or provide social information.
-   View their creator intelligence.
-   View their commercial profile.

## Feature 3 --- Social Data Integration

CRAB should support creator data from platforms such as:

-   YouTube
-   Instagram

For the initial implementation:

-   YouTube may use the YouTube Data API.
-   Instagram may initially use manually entered/demo data where
    required.

The product should be architected so that additional platform
integrations can be added later.

## Feature 4 --- Creator Intelligence

CRAB should:

-   Analyze available creator content.
-   Identify niche/topics.
-   Identify content style.
-   Identify relevant commercial categories.
-   Combine semantic information with structured performance metrics.
-   Produce a Creator Commercial Profile.

## Feature 5 --- Brand Profile

Brands should be able to:

-   Create a brand profile.
-   Define their category.
-   Provide basic company information.
-   Define campaign requirements.

## Feature 6 --- Campaign Creation

Brands should be able to create campaigns containing information such
as:

-   Product/service
-   Campaign objective
-   Target audience
-   Location/region
-   Budget
-   Preferred platform
-   Preferred content style
-   Relevant category
-   Other campaign requirements

Natural-language campaign descriptions should also be supported where
appropriate.

## Feature 7 --- Campaign Intelligence

CRAB should interpret campaign information and produce a structured
Campaign Profile.

## Feature 8 --- Creator--Brand Matching

CRAB should recommend creators for campaigns and campaigns/opportunities
for creators.

Recommendations should consider both:

### Quantitative signals

Examples:

-   Followers
-   Views
-   Engagement
-   Budget
-   Location
-   Platform
-   Performance

### Semantic signals

Examples:

-   Content topics
-   Niche
-   Audience context
-   Content style
-   Product relevance
-   Campaign intent
-   Commercial fit

## Feature 9 --- Explainable Match Results

Each major recommendation should provide:

-   Compatibility score/assessment
-   Key strengths
-   Relevant evidence
-   Potential mismatches
-   Explanation of why the recommendation exists

## Feature 10 --- Opportunity Discovery

Creators should receive recommendations for:

-   Relevant brands
-   Relevant campaign categories
-   Adjacent commercial categories
-   Potential opportunities they did not explicitly search for

## Feature 11 --- Deal Optimization

CRAB should provide useful information for evaluating potential
collaborations, including:

-   Budget compatibility
-   Suggested collaboration format
-   Suggested content angle
-   Commercial fit
-   Potential concerns

## Feature 12 --- Deal Tracking

Users should be able to track the progress of relevant opportunities.

The exact scope of deal management will be determined during MVP
definition.

------------------------------------------------------------------------

# 12. User Experience Principles

CRAB should feel like a modern AI-powered professional platform rather
than a generic social media dashboard.

The experience should prioritize:

-   Clarity
-   Trust
-   Explainability
-   Fast discovery
-   Professionalism
-   Useful insights
-   Low cognitive load

Users should quickly understand:

1.  What CRAB recommends.
2.  Why CRAB recommends it.
3.  What they should do next.

------------------------------------------------------------------------

# 13. Creator User Journey

A typical creator journey should be:

``` text
Sign Up
   ↓
Create Creator Profile
   ↓
Connect / Provide Social Data
   ↓
CRAB Analyzes Creator
   ↓
Creator Commercial Profile
   ↓
View Recommended Opportunities
   ↓
Explore Match Explanation
   ↓
Discover New Categories
   ↓
Evaluate Opportunity
   ↓
Potentially Pursue Collaboration
```

------------------------------------------------------------------------

# 14. Brand User Journey

A typical brand journey should be:

``` text
Sign Up
   ↓
Create Brand Profile
   ↓
Create Campaign
   ↓
Define Campaign Requirements
   ↓
CRAB Analyzes Campaign
   ↓
Recommended Creators
   ↓
Compare Creator Matches
   ↓
View Match Explanation
   ↓
Select / Shortlist Creator
   ↓
Potential Collaboration
```

------------------------------------------------------------------------

# 15. Two-Sided Opportunity Loop

CRAB should create value from both sides.

``` text
                    CRAB
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
     CREATOR                    BRAND
        │                         │
        ▼                         ▼
Creator Intelligence       Campaign Intelligence
        │                         │
        └────────────┬────────────┘
                     ▼
             AI Reasoning Layer
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      Match      Discovery      Deal
                     │
                     ▼
             Better Opportunities
```

------------------------------------------------------------------------

# 16. Product Differentiation

## 16.1 Contextual Matching

The system considers what creators actually produce rather than relying
primarily on follower count.

## 16.2 Opportunity Discovery

CRAB proactively identifies opportunities that users may not have
searched for.

## 16.3 Explainability

CRAB explains recommendations rather than producing unexplained
rankings.

## 16.4 Two-Sided Intelligence

Both creators and brands receive intelligence.

## 16.5 Commercial Understanding

CRAB focuses on whether a creator--brand relationship makes commercial
sense, not simply whether the two belong to the same category.

------------------------------------------------------------------------

# 17. Success Metrics

## Product Metrics

-   Number of creators onboarded
-   Number of brands onboarded
-   Number of campaigns created
-   Number of creator--campaign matches
-   Number of opportunities discovered
-   Number of shortlisted creators
-   Number of collaboration opportunities pursued

## Recommendation Metrics

-   Match relevance
-   Recommendation acceptance rate
-   Creator satisfaction with recommendations
-   Brand satisfaction with recommendations
-   Percentage of recommendations considered useful

## Opportunity Discovery Metrics

-   Number of opportunities discovered outside explicit searches
-   User interaction with discovered opportunities
-   Opportunity acceptance rate

## Business Metrics

-   Collaboration conversion rate
-   Completed deals
-   Platform transaction value
-   Revenue generated through successful collaborations

The exact measurable targets will be defined later.

------------------------------------------------------------------------

# 18. Trust and Explainability Requirements

Because CRAB makes recommendations that can influence commercial
decisions, users should be able to understand the reasoning behind
important recommendations.

CRAB should:

-   Avoid presenting AI output as absolute truth.
-   Show supporting signals where appropriate.
-   Distinguish estimated information from verified information.
-   Avoid misleading certainty.
-   Explain major mismatches when relevant.

For example, CRAB should not simply say:

> "This creator is perfect."

It should communicate:

> "This creator appears highly compatible because of X, Y and Z, while
> the following potential mismatch exists."

------------------------------------------------------------------------

# 19. Security and Privacy Principles

CRAB will handle user, creator, brand, campaign, and potentially
social-platform data.

The product should therefore:

-   Protect authentication credentials.
-   Never expose secrets or API keys to clients.
-   Restrict users to resources they are authorized to access.
-   Protect creator and brand data.
-   Validate user input.
-   Secure API endpoints.
-   Avoid storing unnecessary sensitive data.
-   Follow platform API and data usage requirements.

Detailed security architecture will be defined in the SRD and
Architecture documentation.

------------------------------------------------------------------------

# 20. Initial Platform Integrations

## YouTube

Potential use:

-   Creator channel information
-   Video metadata
-   Titles
-   Descriptions
-   Views
-   Engagement-related metrics
-   Other permitted public API information

## Instagram

The initial MVP may use manually entered/demo information where
appropriate.

The architecture should allow a future production-grade Instagram
integration.

## Payments

Razorpay Test Mode may be used for demonstrating payment/deal flows.

Production payment requirements are outside the initial product scope
unless explicitly included in the MVP.

------------------------------------------------------------------------

# 21. Product Scope

## In Scope

The initial CRAB product direction includes:

-   Creator onboarding
-   Brand onboarding
-   Creator profiles
-   Brand profiles
-   Campaign creation
-   Social/creator data
-   Creator intelligence
-   Campaign intelligence
-   AI-powered compatibility analysis
-   Explainable recommendations
-   Opportunity discovery
-   Deal optimization
-   Basic opportunity/deal tracking
-   Demonstration payment flow where required

------------------------------------------------------------------------

# 22. Initial Non-Goals

The following should not automatically be included in the initial
product unless explicitly approved during MVP planning:

-   Full social media management
-   Social media post scheduling
-   Full-scale influencer CRM
-   Advanced enterprise billing
-   Complex contract management
-   Automated legal agreements
-   Full production-grade Instagram infrastructure
-   Complete automated payment settlement
-   Large-scale web scraping
-   Fully autonomous brand outreach
-   Fully autonomous negotiation
-   Large-scale recommendation infrastructure
-   Advanced predictive financial forecasting

These may become future roadmap items.

------------------------------------------------------------------------

# 23. MVP Philosophy

CRAB should prioritize a convincing end-to-end demonstration of its core
intelligence rather than attempting to implement every possible platform
feature.

The MVP should demonstrate the complete value chain:

``` text
Creator Data
      ↓
Creator Intelligence
      ↓
Brand Campaign
      ↓
Campaign Intelligence
      ↓
AI Compatibility
      ↓
Explainable Recommendation
      ↓
Opportunity Discovery
      ↓
Potential Deal Optimization
```

The MVP should be sufficiently functional to demonstrate that CRAB is
solving the stated problem rather than merely displaying static mockups.

The exact MVP feature boundary will be documented separately in:

`02_MVP.md`

------------------------------------------------------------------------

# 24. Future Vision

Future versions of CRAB may include:

-   More social platform integrations
-   Real-time creator discovery
-   Automated campaign recommendations
-   Advanced creator analytics
-   Predictive campaign performance
-   Automated outreach
-   Negotiation assistance
-   Contract management
-   Automated payment settlement
-   Advanced brand analytics
-   Creator growth recommendations
-   Personalized opportunity feeds
-   Campaign performance prediction
-   Enterprise brand dashboards
-   Large-scale creator discovery

These features are not part of the initial MVP unless explicitly
approved.

------------------------------------------------------------------------

# 25. Product Success Definition

CRAB will be considered successful at the MVP stage if a user can enter
the platform, provide relevant creator or campaign information, and
receive a recommendation that is:

1.  Relevant.
2.  Explainable.
3.  Context-aware.
4.  Commercially meaningful.
5.  More useful than a simple follower-count or keyword-based search.

The most important demonstration should therefore be:

> **"Here is the creator. Here is the campaign. Here is what CRAB
> understands about both. Here is why CRAB believes they fit. Here is
> what the creator or brand might be missing. And here is what they can
> do next."**

------------------------------------------------------------------------

# 26. Product Principle

Before implementation begins, no technical decision should override the
core product principle:

> **CRAB exists to discover meaningful creator--brand opportunities
> through contextual understanding and explainable AI reasoning, not
> simply through popularity-based search or an arbitrary match score.**

------------------------------------------------------------------------

# 27. Next Documents

This PRD is the product source of truth.

The next documents should be created in this order:

1.  `02_MVP.md`
    -   Exact MVP scope
    -   MVP features
    -   What will and will not be built
    -   Demo flow
2.  `03_USER_FLOWS.md`
    -   Detailed creator journey
    -   Detailed brand journey
    -   Screen-to-screen flows
3.  `04_SRD.md`
    -   Functional requirements
    -   Non-functional requirements
    -   System behavior
    -   Validation and security requirements
4.  `05_ARCHITECTURE.md`
    -   Frontend architecture
    -   Backend architecture
    -   AI architecture
    -   Database architecture
    -   External services
    -   Data flow
5.  `06_DATABASE.md`
    -   Tables
    -   Relationships
    -   Constraints
    -   Indexes
    -   Data ownership
6.  `07_API_SPEC.md`
    -   API endpoints
    -   Request/response structures
    -   Authentication
    -   Error handling
7.  `08_AI_MATCHING.md`
    -   Creator intelligence
    -   Campaign intelligence
    -   Semantic analysis
    -   Compatibility scoring
    -   Opportunity discovery
    -   Explainability
    -   AI vs deterministic logic
8.  `09_UI_UX.md`
    -   Design system
    -   Screens
    -   Components
    -   Responsive behavior
    -   User experience
9.  `10_ROADMAP.md`
    -   Development phases
    -   Priorities
    -   Milestones
10. `11_AI_INSTRUCTIONS.md`
    -   Rules for Antigravity
    -   Coding standards
    -   Architecture constraints
    -   Development workflow
    -   Testing requirements
