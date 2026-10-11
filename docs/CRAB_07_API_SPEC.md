# CRAB — API Specification

**Document:** 07_API_SPEC.md  
**Project:** CRAB — Creators Reaching Aligned Brands  
**Status:** MVP API Contract  
**Purpose:** Define the HTTP API contract between the CRAB frontend, backend, AI services, database, and external integrations.

---

# 1. Purpose

This document defines the API contract for the CRAB MVP.

It answers:

> **How does the frontend communicate with the CRAB backend?**

The API specification is based on the system requirements, user flows, architecture, database model, and AI matching design already defined for CRAB.

The API is designed around these principles:

1. The frontend communicates with CRAB through the backend API.
2. Authentication is handled through Supabase Auth.
3. Authorization is enforced by the backend.
4. Business logic remains on the backend.
5. AI operations are orchestrated by the backend.
6. Database access remains server-side through Prisma.
7. External API credentials remain server-side.
8. API responses should be predictable and structured.
9. Errors should use consistent response formats.
10. The API should support both Creator and Brand workflows.

---

# 2. API Architecture

```text
┌──────────────────────┐
│      Next.js         │
│      Frontend        │
└──────────┬───────────┘
           │
           │ HTTPS / JSON
           ▼
┌──────────────────────┐
│    Express API       │
│      Backend         │
└──────────┬───────────┘
           │
     ┌─────┼─────┬──────────────┐
     │     │     │              │
     ▼     ▼     ▼              ▼
  Prisma  AI   Integrations   Auth
     │     │     │              │
     ▼     ▼     ▼              ▼
 PostgreSQL Gemini YouTube/    Supabase
 + pgvector       Instagram/
                  Razorpay
```

---

# 3. Base URL

Development:

```text
http://localhost:4000/api
```

Production:

```text
https://<backend-domain>/api
```

The actual production backend domain is intentionally not fixed in this document.

---

# 4. API Conventions

## 4.1 Protocol

Use:

```text
HTTPS
```

in production.

## 4.2 Data format

Requests and responses use:

```text
application/json
```

unless explicitly stated otherwise.

## 4.3 Naming

Use REST-style resource naming.

Examples:

```text
/api/creators
/api/brands
/api/campaigns
/api/conversations
/api/offers
/api/payments
```

IDs should normally be represented as opaque strings/UUIDs.

---

# 5. Authentication

CRAB uses Supabase Auth for authentication.

The frontend obtains the authenticated session/token through Supabase Auth.

The token is then presented to the backend.

```http
Authorization: Bearer <access_token>
```

Flow:

```text
User
 │
 ▼
Next.js
 │
 ▼
Supabase Auth
 │
 ▼
Access Token
 │
 ▼
Express API
 │
 ▼
Verify token
 │
 ▼
Identify CRAB user
 │
 ▼
Authorize operation
```

Authentication answers:

> Who is the user?

Authorization answers:

> Is the user allowed to perform this action?

The backend must enforce authorization even if the frontend hides a UI action.

---

# 6. Roles

MVP roles:

```text
CREATOR
BRAND
```

A user's role determines which role-specific operations they can perform.

Examples:

```text
Creator
→ manage creator profile
→ connect social accounts
→ view opportunities
→ apply to campaigns
→ message brands
→ negotiate offers

Brand
→ manage brand profile
→ create campaigns
→ discover creators
→ message creators
→ negotiate offers
→ initiate payments
```

---

# 7. Standard Response Format

Successful responses should return structured JSON.

Example:

```json
{
  "data": {
    "id": "creator_123"
  }
}
```

Collection response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

For simple action endpoints, the response can contain:

```json
{
  "data": {
    "success": true
  }
}
```

---

# 8. Standard Error Format

Errors should follow a consistent structure.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campaign budget is invalid.",
    "details": {
      "field": "budget_max"
    }
  }
}
```

Suggested error codes:

```text
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
CONFLICT
RATE_LIMITED
EXTERNAL_API_ERROR
AI_ERROR
DATABASE_ERROR
PAYMENT_ERROR
INTERNAL_ERROR
```

---

# 9. HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful request with no response body |
| 400 | Invalid request |
| 401 | Authentication required/invalid |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Resource/state conflict |
| 422 | Validation/business-rule failure |
| 429 | Rate limited |
| 500 | Internal server error |
| 502 | External service failure |

---

# 10. Pagination

Collection endpoints should support pagination where necessary.

Example:

```http
GET /api/campaigns?page=1&limit=20
```

Response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

For MVP, simple page/limit pagination is sufficient.

Cursor pagination can be introduced later if required.

---

# 11. Authentication API

## GET `/api/auth/me`

Return the currently authenticated CRAB user and role.

### Authentication

Required.

### Response

```json
{
  "data": {
    "id": "user_123",
    "email": "creator@example.com",
    "role": "CREATOR",
    "creatorId": "creator_123",
    "brandId": null
  }
}
```

---

# 12. Creator Profile API

## GET `/api/creators/me`

Return the authenticated creator's profile.

### Authentication

Required.

### Role

CREATOR.

### Response

```json
{
  "data": {
    "id": "creator_123",
    "displayName": "Creator Name",
    "bio": "Technology creator",
    "location": "Delhi",
    "contactInformation": {},
    "createdAt": "2026-10-08T00:00:00Z",
    "updatedAt": "2026-10-08T00:00:00Z"
  }
}
```

---

## PATCH `/api/creators/me`

Update the authenticated creator profile.

### Authentication

Required.

### Role

CREATOR.

### Request

```json
{
  "displayName": "Creator Name",
  "bio": "Technology and AI creator",
  "location": "Delhi",
  "contactInformation": {
    "email": "creator@example.com"
  }
}
```

### Response

```json
{
  "data": {
    "id": "creator_123",
    "displayName": "Creator Name",
    "bio": "Technology and AI creator",
    "location": "Delhi"
  }
}
```

---

## GET `/api/creators/:creatorId`

Return a creator's public/profile-level information.

### Authentication

Required.

### Response

```json
{
  "data": {
    "id": "creator_123",
    "displayName": "Creator Name",
    "bio": "Technology creator",
    "location": "Delhi",
    "platforms": [
      "YOUTUBE",
      "INSTAGRAM"
    ]
  }
}
```

Private information should not be returned unless the requester is authorized.

---

# 13. Creator Metrics API

## GET `/api/creators/me/metrics`

Return current creator metrics.

### Query parameters

```text
platform
```

Optional.

### Response

```json
{
  "data": {
    "followers": 83000,
    "averageViews": 31000,
    "engagementRate": 4.8,
    "postingFrequency": 3.2,
    "recordedAt": "2026-10-08T00:00:00Z"
  }
}
```

---

## GET `/api/creators/me/metrics/history`

Return historical metric snapshots.

### Query parameters

```text
platform
from
to
page
limit
```

### Response

```json
{
  "data": [
    {
      "followers": 80000,
      "averageViews": 29000,
      "engagementRate": 4.5,
      "recordedAt": "2026-10-01T00:00:00Z"
    },
    {
      "followers": 83000,
      "averageViews": 31000,
      "engagementRate": 4.8,
      "recordedAt": "2026-10-08T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2
  }
}
```

---

# 14. Social Account API

## GET `/api/social/accounts`

Return connected social accounts for the authenticated creator.

### Role

CREATOR.

### Response

```json
{
  "data": [
    {
      "id": "social_123",
      "platform": "YOUTUBE",
      "handle": "@creator",
      "status": "ACTIVE",
      "connectedAt": "2026-10-08T00:00:00Z",
      "lastSyncedAt": "2026-10-08T00:30:00Z"
    }
  ]
}
```

---

## POST `/api/social/:platform/connect`

Start/connect a social account.

Supported platforms:

```text
YOUTUBE
INSTAGRAM
```

### Request

```json
{
  "redirectUri": "https://app.example.com/settings/social"
}
```

### Response

```json
{
  "data": {
    "authorizationUrl": "https://provider.example/authorize/..."
  }
}
```

The backend constructs the provider-specific authorization flow.

---

## POST `/api/social/:platform/callback`

Handle the provider authorization callback.

The exact implementation depends on the provider's OAuth requirements.

### Response

```json
{
  "data": {
    "socialAccountId": "social_123",
    "status": "CONNECTED"
  }
}
```

---

## DELETE `/api/social/accounts/:socialAccountId`

Disconnect a social account.

### Role

CREATOR.

### Response

```json
{
  "data": {
    "success": true
  }
}
```

---

## POST `/api/social/accounts/:socialAccountId/sync`

Trigger a social data synchronization.

### Role

CREATOR.

### Response

```json
{
  "data": {
    "socialAccountId": "social_123",
    "status": "SYNC_STARTED"
  }
}
```

The sync may perform:

```text
Social API
    ↓
Normalize
    ↓
Store content/metrics
    ↓
AI processing
    ↓
Update creator intelligence
```

If processing becomes asynchronous, the API should return a processing status rather than blocking until every AI operation completes.

---

# 15. Content API

## GET `/api/creators/me/content`

Return imported creator content.

### Query parameters

```text
platform
contentType
from
to
page
limit
```

### Response

```json
{
  "data": [
    {
      "id": "content_123",
      "platform": "YOUTUBE",
      "contentType": "VIDEO",
      "title": "Example Video",
      "description": "Example description",
      "publishedAt": "2026-10-01T00:00:00Z",
      "views": 31000,
      "likes": 2200,
      "comments": 140
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

---

## GET `/api/creators/me/content/:contentId`

Return one content item and available AI analysis.

### Response

```json
{
  "data": {
    "id": "content_123",
    "title": "Example Video",
    "platform": "YOUTUBE",
    "metrics": {
      "views": 31000,
      "likes": 2200,
      "comments": 140
    },
    "aiAnalysis": {
      "topics": [
        "AI",
        "programming"
      ],
      "niche": "technology",
      "style": [
        "educational"
      ],
      "commercialCategories": [
        "developer_tools"
      ]
    }
  }
}
```

---

# 16. Creator AI Intelligence API

## GET `/api/creators/me/intelligence`

Return the current CreatorAIProfile.

### Role

CREATOR.

### Response

```json
{
  "data": {
    "primaryNiches": [
      "technology",
      "AI"
    ],
    "secondaryNiches": [
      "programming"
    ],
    "contentStyle": [
      "educational",
      "informal"
    ],
    "audienceSummary": "Technology-focused audience interested in AI and programming.",
    "audienceInterests": [
      "AI",
      "programming",
      "developer tools"
    ],
    "commercialCategories": [
      "technology",
      "developer_tools"
    ],
    "brandSuitability": [
      "software",
      "consumer_technology"
    ],
    "generatedAt": "2026-10-08T00:30:00Z"
  }
}
```

AI-inferred information must be represented as inference and must not be presented as direct platform facts when it is not directly available.

---

## POST `/api/creators/me/intelligence/analyze`

Request an updated creator AI analysis.

### Role

CREATOR.

### Response

```json
{
  "data": {
    "status": "PROCESSING"
  }
}
```

The backend should gather the relevant stored data before sending context to Gemini.

---

# 17. Brand Profile API

## GET `/api/brands/me`

Return the authenticated brand profile.

### Role

BRAND.

### Response

```json
{
  "data": {
    "id": "brand_123",
    "name": "Example Brand",
    "description": "Consumer technology company",
    "category": "TECHNOLOGY",
    "website": "https://example.com",
    "targetMarkets": [
      "India"
    ]
  }
}
```

---

## PATCH `/api/brands/me`

Update the brand profile.

### Request

```json
{
  "name": "Example Brand",
  "description": "Consumer technology company",
  "category": "TECHNOLOGY",
  "website": "https://example.com",
  "targetMarkets": [
    "India"
  ]
}
```

---

# 18. Campaign API

## POST `/api/campaigns`

Create a campaign.

### Role

BRAND.

### Request

```json
{
  "title": "Launch Campaign",
  "description": "Promote our new AI productivity product.",
  "productOrService": "AI productivity app",
  "objective": "PRODUCT_AWARENESS",
  "targetAudience": {
    "location": [
      "India"
    ],
    "interests": [
      "technology",
      "productivity"
    ]
  },
  "budgetMin": 10000,
  "budgetMax": 30000,
  "requiredReach": 50000,
  "platform": "YOUTUBE",
  "contentType": "VIDEO",
  "contentStyle": [
    "educational"
  ],
  "creatorNiche": [
    "technology"
  ],
  "location": "India",
  "timeline": {
    "start": "2026-11-01",
    "end": "2026-11-30"
  },
  "exclusivity": false,
  "usageRights": {
    "paidAdvertising": false
  }
}
```

### Response

```json
{
  "data": {
    "id": "campaign_123",
    "status": "DRAFT",
    "createdAt": "2026-10-08T00:00:00Z"
  }
}
```

---

## GET `/api/campaigns`

Return campaigns accessible to the authenticated user.

### Brand

Returns the brand's campaigns.

### Optional filters

```text
status
platform
page
limit
```

---

## GET `/api/campaigns/:campaignId`

Return campaign details.

Authorization determines which fields are visible.

---

## PATCH `/api/campaigns/:campaignId`

Update a campaign.

### Role

BRAND owner.

Only editable fields should be accepted after a campaign reaches states where modification remains allowed.

---

## DELETE `/api/campaigns/:campaignId`

Delete/archive a campaign when allowed.

### Role

BRAND owner.

---

# 19. Campaign AI Intelligence API

## GET `/api/campaigns/:campaignId/intelligence`

Return the structured campaign AI profile.

### Role

Authorized brand user.

### Response

```json
{
  "data": {
    "normalizedObjective": "PRODUCT_AWARENESS",
    "targetAudienceProfile": {
      "location": [
        "India"
      ],
      "interests": [
        "technology",
        "productivity"
      ]
    },
    "inferredNiches": [
      "technology",
      "productivity"
    ],
    "contentRequirements": [
      "educational video"
    ],
    "commercialCategories": [
      "software",
      "productivity"
    ],
    "confidence": {
      "overall": 0.88
    }
  }
}
```

---

## POST `/api/campaigns/:campaignId/intelligence/analyze`

Generate/update campaign intelligence.

### Response

```json
{
  "data": {
    "status": "PROCESSING"
  }
}
```

AI output must be validated before being persisted.

---

# 20. Brand Creator Discovery API

## GET `/api/brands/me/creators`

Search/filter available creators.

### Query parameters

```text
platform
niche
location
minFollowers
maxFollowers
minAverageViews
minEngagementRate
page
limit
```

Example:

```http
GET /api/brands/me/creators?platform=YOUTUBE&niche=technology&minFollowers=50000
```

### Response

```json
{
  "data": [
    {
      "creatorId": "creator_123",
      "displayName": "Creator Name",
      "followers": 83000,
      "averageViews": 31000,
      "engagementRate": 4.8,
      "primaryNiches": [
        "technology"
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

---

# 21. Campaign Match API

## GET `/api/campaigns/:campaignId/matches`

Return ranked creators for a campaign.

### Role

BRAND owner.

### Query parameters

```text
page
limit
minScore
```

### Response

```json
{
  "data": [
    {
      "matchId": "match_123",
      "creator": {
        "id": "creator_123",
        "displayName": "Creator Name"
      },
      "score": 91,
      "reasons": [
        "Strong technology-content relevance",
        "Audience aligns with campaign target",
        "Average views satisfy the campaign requirement"
      ],
      "warnings": [
        "Previous collaboration with a competing category"
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 10
  }
}
```

---

# 22. Creator Opportunity API

## GET `/api/creators/me/opportunities`

Return campaigns recommended to the authenticated creator.

### Query parameters

```text
platform
niche
minScore
page
limit
```

### Response

```json
{
  "data": [
    {
      "matchId": "match_123",
      "campaign": {
        "id": "campaign_123",
        "title": "AI Productivity Launch",
        "brandName": "Example Brand"
      },
      "score": 91,
      "reasons": [
        "Strong overlap with your technology content",
        "Required audience location matches",
        "Your recent average views meet the campaign requirement"
      ],
      "warnings": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

# 23. Match Detail API

## GET `/api/matches/:matchId`

Return a detailed match.

### Response

```json
{
  "data": {
    "id": "match_123",
    "creatorId": "creator_123",
    "campaignId": "campaign_123",
    "score": 91,
    "scoreBreakdown": {
      "semanticRelevance": 94,
      "audienceOverlap": 88,
      "performance": 82,
      "platformFit": 100,
      "campaignRequirements": 92,
      "brandCompatibility": 90,
      "historicalPerformance": 80
    },
    "evidence": {
      "positive": [
        "Technology niche overlap",
        "Required platform available",
        "Required reach achieved"
      ],
      "warnings": []
    },
    "explanation": "CRAB recommends this creator because..."
  }
}
```

The API should expose enough structured information for the frontend to explain recommendations without exposing internal/private data unnecessarily.

---

# 24. Application API

Creators can apply to suitable campaigns.

## POST `/api/campaigns/:campaignId/applications`

### Role

CREATOR.

### Request

```json
{
  "message": "I would be interested in collaborating on this campaign.",
  "proposedRate": 25000
}
```

### Response

```json
{
  "data": {
    "id": "application_123",
    "campaignId": "campaign_123",
    "creatorId": "creator_123",
    "status": "PENDING",
    "proposedRate": 25000
  }
}
```

---

## GET `/api/creators/me/applications`

Return the authenticated creator's applications.

---

## GET `/api/campaigns/:campaignId/applications`

Return applications for a brand-owned campaign.

### Role

BRAND owner.

---

## PATCH `/api/applications/:applicationId`

Update an application state where allowed.

Example:

```json
{
  "status": "ACCEPTED"
}
```

The backend must validate that the brand/creator is authorized to perform the transition.

---

# 25. Collaboration API

## GET `/api/creators/me/collaborations`

Return creator collaboration history.

---

## GET `/api/brands/me/collaborations`

Return brand collaboration history.

---

## GET `/api/collaborations/:collaborationId`

Return collaboration details to authorized participants.

### Response

```json
{
  "data": {
    "id": "collab_123",
    "campaignId": "campaign_123",
    "creatorId": "creator_123",
    "brandId": "brand_123",
    "status": "AGREED",
    "agreedAmount": 25000,
    "deliverables": [
      "1 YouTube video"
    ],
    "usageRights": {},
    "exclusivity": false
  }
}
```

---

# 26. Conflict Detection API

## GET `/api/creators/:creatorId/conflicts`

Return relevant collaboration/conflict information.

### Authorization

Only return information that the requester is permitted to see.

### Example response

```json
{
  "data": {
    "hasPotentialConflict": true,
    "warnings": [
      {
        "type": "COMPETITOR_COLLABORATION",
        "message": "Creator has previously collaborated with a competing brand category."
      }
    ]
  }
}
```

The MVP conflict check is primarily deterministic/rule-based.

The final collaboration decision remains with the user.

---

# 27. Conversation API

## GET `/api/conversations`

Return conversations for the authenticated user.

### Query parameters

```text
page
limit
```

---

## POST `/api/conversations`

Create or open a conversation.

### Request

```json
{
  "recipientUserId": "user_456",
  "campaignId": "campaign_123"
}
```

### Response

```json
{
  "data": {
    "id": "conversation_123",
    "campaignId": "campaign_123",
    "createdAt": "2026-10-08T00:00:00Z"
  }
}
```

---

## GET `/api/conversations/:conversationId`

Return conversation metadata.

Only participants may access it.

---

# 28. Message API

## GET `/api/conversations/:conversationId/messages`

Return messages.

### Query parameters

```text
page
limit
```

### Response

```json
{
  "data": [
    {
      "id": "message_123",
      "senderUserId": "user_123",
      "content": "Would you be interested in this campaign?",
      "createdAt": "2026-10-08T00:00:00Z",
      "readAt": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1
  }
}
```

---

## POST `/api/conversations/:conversationId/messages`

Send a message.

### Request

```json
{
  "content": "I would be interested. Could we discuss the rate?"
}
```

### Response

```json
{
  "data": {
    "id": "message_124",
    "conversationId": "conversation_123",
    "content": "I would be interested. Could we discuss the rate?",
    "createdAt": "2026-10-08T00:00:00Z"
  }
}
```

---

# 29. Offer API

## GET `/api/conversations/:conversationId/offers`

Return offer history for the conversation.

---

## POST `/api/conversations/:conversationId/offers`

Create an offer.

### Request

```json
{
  "amount": 25000,
  "currency": "INR",
  "deliverables": [
    "1 YouTube video"
  ],
  "usageRights": {
    "paidAdvertising": false
  },
  "exclusivity": false
}
```

### Response

```json
{
  "data": {
    "id": "offer_123",
    "amount": 25000,
    "currency": "INR",
    "status": "PENDING"
  }
}
```

---

## POST `/api/offers/:offerId/counter`

Create a counteroffer.

### Request

```json
{
  "amount": 30000,
  "currency": "INR",
  "deliverables": [
    "1 YouTube video"
  ]
}
```

### Response

```json
{
  "data": {
    "id": "offer_124",
    "parentOfferId": "offer_123",
    "amount": 30000,
    "status": "PENDING"
  }
}
```

---

## POST `/api/offers/:offerId/accept`

Accept an offer.

### Response

```json
{
  "data": {
    "offerId": "offer_124",
    "status": "ACCEPTED",
    "collaborationId": "collab_123"
  }
}
```

The backend creates/updates the collaboration as appropriate.

---

## POST `/api/offers/:offerId/reject`

Reject an offer.

### Response

```json
{
  "data": {
    "offerId": "offer_124",
    "status": "REJECTED"
  }
}
```

---

# 30. AI Deal Assistance API

## POST `/api/offers/deal-assistance`

Request AI-assisted negotiation guidance.

### Request

```json
{
  "campaignId": "campaign_123",
  "creatorId": "creator_123",
  "currentOffer": {
    "amount": 20000,
    "currency": "INR"
  }
}
```

### Response

```json
{
  "data": {
    "estimatedRange": {
      "min": 22000,
      "max": 30000
    },
    "suggestedCounter": 28000,
    "reasoning": [
      "Creator's recent performance",
      "Campaign requirements",
      "Available creator profile signals"
    ],
    "suggestedResponse": "Based on the campaign scope, I would be comfortable at..."
  }
}
```

AI-generated prices are estimates, not guaranteed market prices.

The user must explicitly choose whether to use the suggestion.

---

# 31. Payment API

## POST `/api/payments`

Create a payment request for an agreed collaboration.

### Role

BRAND.

### Request

```json
{
  "collaborationId": "collab_123",
  "amount": 25000,
  "currency": "INR"
}
```

### Response

```json
{
  "data": {
    "paymentId": "payment_123",
    "provider": "RAZORPAY",
    "status": "PENDING",
    "checkout": {
      "orderId": "order_123"
    }
  }
}
```

---

## GET `/api/payments/:paymentId`

Return payment state to an authorized participant.

### Response

```json
{
  "data": {
    "id": "payment_123",
    "collaborationId": "collab_123",
    "amount": 25000,
    "currency": "INR",
    "status": "PAID",
    "paidAt": "2026-10-08T01:00:00Z"
  }
}
```

---

## POST `/api/payments/webhook`

Receive Razorpay provider notifications.

### Authentication

Provider webhook verification.

This endpoint must verify the provider signature according to Razorpay's server-side webhook requirements before changing payment state.

### Response

```json
{
  "data": {
    "received": true
  }
}
```

The frontend must not call this endpoint to declare payment success.

---

# 32. Analytics API

Analytics endpoints can be exposed for dashboard graphs.

## GET `/api/creators/me/analytics`

Return summarized creator analytics.

### Query parameters

```text
from
to
platform
```

### Response

```json
{
  "data": {
    "followers": {
      "current": 83000,
      "change": 3000,
      "changePercentage": 3.75
    },
    "averageViews": {
      "current": 31000,
      "change": 2000,
      "changePercentage": 6.9
    },
    "engagementRate": {
      "current": 4.8,
      "change": 0.3
    },
    "history": [
      {
        "date": "2026-10-01",
        "followers": 80000,
        "averageViews": 29000
      },
      {
        "date": "2026-10-08",
        "followers": 83000,
        "averageViews": 31000
      }
    ]
  }
}
```

These values should be calculated from stored data.

---

# 33. Notifications

Notifications are useful but are not a required standalone subsystem for the first MVP.

If implemented, the API can follow:

```text
GET /api/notifications
PATCH /api/notifications/:notificationId/read
```

This can remain a later MVP/P1 addition unless required by the frontend flow.

---

# 34. API Authentication Matrix

| Endpoint Area | Creator | Brand |
|---|:---:|:---:|
| Auth/me | ✓ | ✓ |
| Own creator profile | ✓ | |
| Own brand profile | | ✓ |
| Social accounts | ✓ | |
| Creator metrics | ✓ | |
| Creator content | ✓ | |
| Creator intelligence | ✓ | |
| Create campaigns | | ✓ |
| Manage own campaigns | | ✓ |
| Campaign intelligence | | ✓ |
| Discover creators | | ✓ |
| Creator opportunities | ✓ | |
| Apply to campaign | ✓ | |
| View campaign applications | | ✓ |
| Messaging | ✓ | ✓ |
| Offers | ✓ | ✓ |
| Deal assistance | ✓ | ✓ |
| Initiate payment | | ✓ |
| View authorized payment | ✓ | ✓ |
| Collaboration history | ✓ | ✓ |

Actual authorization should be checked against resource ownership/participation, not role alone.

---

# 35. API → Database Mapping

| API Area | Primary Database Entities |
|---|---|
| Auth | User |
| Creator profile | Creator |
| Brand profile | Brand |
| Social | SocialAccount |
| Metrics | CreatorMetricSnapshot |
| Content | Content |
| Creator intelligence | CreatorAIProfile |
| Campaigns | Campaign |
| Campaign intelligence | CampaignAIProfile |
| Matching | Match |
| Applications | CampaignApplication |
| Collaboration | Collaboration |
| Messaging | Conversation, Message |
| Offers | Offer |
| Payments | Payment |
| Analytics | MetricSnapshot + Content |

If an entity is introduced in implementation that is not yet represented in `06_DATABASE.md`, the database document should be updated to keep documentation consistent.

---

# 36. AI API Boundary

The frontend should not directly call Gemini for CRAB product operations.

Preferred flow:

```text
Next.js
   │
   ▼
CRAB Backend
   │
   ├── Gather relevant database context
   ├── Validate input
   ├── Call Gemini
   ├── Validate structured output
   └── Store/use result
          │
          ▼
       Frontend
```

This protects API credentials and keeps AI behavior under backend control.

---

# 37. External API Boundary

The frontend should not directly perform privileged YouTube, Instagram, or Razorpay operations.

Preferred flow:

```text
Next.js
   │
   ▼
CRAB Backend
   │
   ▼
External Provider
   │
   ▼
Normalized CRAB Data
   │
   ▼
PostgreSQL
```

Provider-specific response formats should be converted into CRAB's internal data structures.

---

# 38. Idempotency

Operations that can be retried should be designed to avoid accidental duplication.

Important candidates:

- Social synchronization.
- Payment creation.
- Payment webhooks.
- Offer acceptance.
- Campaign application.
- AI processing requests.

For payment creation, an idempotency key should be considered.

Example:

```http
Idempotency-Key: <unique-request-id>
```

The backend should ensure a retry does not accidentally create multiple financial transactions.

---

# 39. Validation

Request validation should happen before business logic.

Example campaign validation:

```text
budget_min >= 0
budget_max >= budget_min
required_reach >= 0
platform is supported
timeline is valid
```

Example offer validation:

```text
amount > 0
currency supported
conversation participant
offer state allows counteroffer
```

Example messaging validation:

```text
conversation exists
user is participant
content is non-empty
content length is within allowed limit
```

---

# 40. Authorization Rules

The API should enforce ownership and participation.

Examples:

### Creator

A creator can:

```text
READ own profile
UPDATE own profile
READ own metrics
READ own content
READ own intelligence
READ own opportunities
APPLY to campaigns
SEND messages in authorized conversations
RESPOND to offers
```

A creator cannot:

```text
UPDATE another creator's profile
MODIFY another brand's campaign
ACCESS unrelated conversations
DECLARE a payment successful
```

### Brand

A brand can:

```text
READ/UPDATE own profile
CREATE campaigns
UPDATE own campaigns
VIEW applications to own campaigns
DISCOVER creators
MESSAGE creators
CREATE offers
INITIATE payments
```

A brand cannot:

```text
MODIFY another brand's campaign
ACCESS unrelated private conversations
DECLARE a payment successful
```

---

# 41. Match Calculation Endpoint

## POST `/api/matches/calculate`

This endpoint can be used internally or by authorized product flows to calculate/recalculate matching.

### Request

```json
{
  "campaignId": "campaign_123"
}
```

### Response

```json
{
  "data": {
    "status": "PROCESSING"
  }
}
```

The backend then:

```text
Load campaign
   ↓
Load CampaignAIProfile
   ↓
Find eligible creators
   ↓
Load CreatorAIProfiles
   ↓
Calculate semantic similarity
   ↓
Calculate deterministic signals
   ↓
Check conflicts
   ↓
Rank
   ↓
Store/update Match records
   ↓
Prepare evidence
```

This endpoint should not expose internal matching controls to ordinary users unless required.

---

# 42. Sync and Processing Status

Long-running operations should return a status.

Suggested states:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

Examples:

```text
Social sync
AI analysis
Embedding generation
Match recalculation
```

Example:

```json
{
  "data": {
    "status": "PROCESSING",
    "jobId": "job_123"
  }
}
```

If the MVP does not introduce a formal job system, the backend can still use a processing-status field without exposing a full queue architecture.

---

# 43. Rate Limiting

Rate limiting should protect:

- Authentication-sensitive endpoints.
- AI endpoints.
- Social synchronization.
- Messaging.
- Payment creation.
- Public discovery/search endpoints.

The exact limits can be tuned after implementation.

Particularly expensive endpoints such as:

```text
POST /api/creators/me/intelligence/analyze
POST /api/campaigns/:id/intelligence/analyze
POST /api/matches/calculate
POST /api/offers/deal-assistance
```

should not be callable without reasonable throttling.

---

# 44. Logging and Observability

Backend logs should include:

- Request identifier.
- Endpoint.
- User identifier where appropriate.
- Operation.
- Success/failure.
- External provider failures.
- AI processing failures.
- Payment processing events.

Sensitive information must not be logged.

Do not log:

- Access tokens.
- API secrets.
- Payment secrets.
- Full sensitive user data.

---

# 45. API Versioning

For MVP, the API can use:

```text
/api/...
```

If breaking changes become necessary, versioning can be introduced:

```text
/api/v2/...
```

The team should avoid breaking existing frontend contracts unnecessarily during MVP development.

---

# 46. MVP Endpoint Summary

## Authentication

```text
GET    /api/auth/me
```

## Creator

```text
GET    /api/creators/me
PATCH  /api/creators/me
GET    /api/creators/:creatorId
GET    /api/creators/me/metrics
GET    /api/creators/me/metrics/history
GET    /api/creators/me/content
GET    /api/creators/me/content/:contentId
GET    /api/creators/me/intelligence
POST   /api/creators/me/intelligence/analyze
GET    /api/creators/me/opportunities
GET    /api/creators/me/applications
GET    /api/creators/me/collaborations
GET    /api/creators/:creatorId/conflicts
```

## Social

```text
GET    /api/social/accounts
POST   /api/social/:platform/connect
POST   /api/social/:platform/callback
DELETE /api/social/accounts/:socialAccountId
POST   /api/social/accounts/:socialAccountId/sync
```

## Brand

```text
GET    /api/brands/me
PATCH  /api/brands/me
GET    /api/brands/me/creators
GET    /api/brands/me/collaborations
```

## Campaign

```text
POST   /api/campaigns
GET    /api/campaigns
GET    /api/campaigns/:campaignId
PATCH  /api/campaigns/:campaignId
DELETE /api/campaigns/:campaignId
GET    /api/campaigns/:campaignId/intelligence
POST   /api/campaigns/:campaignId/intelligence/analyze
GET    /api/campaigns/:campaignId/matches
GET    /api/campaigns/:campaignId/applications
POST   /api/campaigns/:campaignId/applications
```

## Matching

```text
GET    /api/matches/:matchId
POST   /api/matches/calculate
```

## Collaboration

```text
GET    /api/collaborations/:collaborationId
GET    /api/creators/me/collaborations
GET    /api/brands/me/collaborations
```

## Messaging

```text
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/:conversationId
GET    /api/conversations/:conversationId/messages
POST   /api/conversations/:conversationId/messages
```

## Offers

```text
GET    /api/conversations/:conversationId/offers
POST   /api/conversations/:conversationId/offers
POST   /api/offers/:offerId/counter
POST   /api/offers/:offerId/accept
POST   /api/offers/:offerId/reject
POST   /api/offers/deal-assistance
```

## Payments

```text
POST   /api/payments
GET    /api/payments/:paymentId
POST   /api/payments/webhook
```

## Analytics

```text
GET    /api/creators/me/analytics
```

---

# 47. API Development Order

The recommended implementation order is:

```text
1. Auth
   ↓
2. Creator / Brand profiles
   ↓
3. Social accounts
   ↓
4. Social synchronization
   ↓
5. Metrics + content
   ↓
6. Creator AI intelligence
   ↓
7. Campaign creation
   ↓
8. Campaign AI intelligence
   ↓
9. Embeddings
   ↓
10. Matching
   ↓
11. Opportunities / creator discovery
   ↓
12. Applications
   ↓
13. Messaging
   ↓
14. Offers / counteroffers
   ↓
15. Collaboration
   ↓
16. Payments
   ↓
17. Analytics / history
```

This follows the product and AI implementation sequence already established for CRAB.

---

# 48. Definition of API Contract Completion

The API specification is considered complete for the MVP when:

- Every P0 frontend flow has a backend endpoint or explicitly documented external action.
- Every endpoint has an owner/role requirement.
- Request and response shapes are defined.
- Error behavior is defined.
- Database entities used by the endpoint are known.
- AI-dependent operations are clearly identified.
- External integrations are clearly identified.
- Sensitive operations remain server-side.
- Frontend and backend teams can implement independently against the same contract.

---

# 49. Final API Architecture

```text
                         CRAB FRONTEND
                              │
                              │ HTTPS + JSON
                              ▼
                    ┌───────────────────┐
                    │   EXPRESS API     │
                    │                   │
                    │ Auth              │
                    │ Profiles          │
                    │ Campaigns         │
                    │ Matching          │
                    │ Messaging         │
                    │ Offers            │
                    │ Payments          │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────────┐
        │ Prisma   │    │ AI Layer │    │ Integrations │
        └────┬─────┘    └────┬─────┘    └──────┬───────┘
             │               │                  │
             ▼               ▼                  ▼
      PostgreSQL          Gemini          YouTube
      + pgvector          Embeddings      Instagram
                                           Razorpay
```

The API is therefore the contract that connects CRAB's visual frontend to its business logic, database, AI system, and external services.

> **Frontend asks. Backend validates and decides. Database persists. AI interprets. External APIs provide external data/services.**
