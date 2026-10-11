# CRAB — AI Instructions

## 1. Purpose

This document defines how AI coding agents and AI assistants working on CRAB should understand, design, implement, modify, test, and explain the project.

It is primarily intended for tools such as **Antigravity or other AI coding agents** that will receive the CRAB documentation and help implement the application.

The goal is to prevent an AI agent from making isolated technical decisions that contradict the product, architecture, MVP scope, database design, API contract, or AI strategy.

---

# 2. What CRAB Is

CRAB stands for:

> **Creators Reaching Aligned Brands**

CRAB is an AI-powered two-sided Creator–Brand Opportunity Engine.

Its purpose is to understand:

- Creator content
- Creator audience signals
- Creator performance
- Brand campaign intent
- Compatibility between creators and brands

and use that understanding to discover, explain, and optimize high-potential creator–brand partnerships.

The central product principle is:

> **CRAB discovers meaningful creator–brand opportunities through contextual understanding and explainable AI reasoning, not simply through popularity-based search or an arbitrary match score.**

---

# 3. Documentation Hierarchy

When implementing CRAB, treat the project documentation as a coordinated system.

The documents are:

```text
01_PRD.md
02_MVP.md
03_USER_FLOWS.md
04_SRD.md
05_ARCHITECTURE.md
06_DATABASE.md
07_API_SPEC.md
08_AI_MATCHING.md
09_UI_UX.md
10_ROADMAP.md
11_AI_INSTRUCTIONS.md
```

Use them according to their purpose.

### PRD

Defines:

> What CRAB is and why it exists.

### MVP

Defines:

> What must be included in the first usable version.

### User Flows

Defines:

> How users move through the product.

### SRD

Defines:

> System requirements and acceptance expectations.

### Architecture

Defines:

> How the system is structured technically.

### Database

Defines:

> How CRAB's persistent data is modeled.

### API Spec

Defines:

> How frontend, backend, AI and integrations communicate.

### AI Matching

Defines:

> How CRAB's intelligence, embeddings, matching and explanations should work.

### UI/UX

Defines:

> How the product should look and behave.

### Roadmap

Defines:

> In what practical order the team should build the system.

### AI Instructions

Defines:

> How an AI agent should work inside this project.

Do not casually replace decisions from one document with assumptions from another.

If documents appear inconsistent, identify the conflict instead of silently inventing a solution.

---

# 4. Core AI Development Principle

The most important rule for CRAB's AI system is:

> **AI recommends and interprets; the backend enforces rules and executes application logic.**

AI should help CRAB understand information.

Backend code should remain responsible for deterministic application behavior.

### AI should handle

- Content interpretation
- Semantic understanding
- Creator intelligence
- Campaign intelligence
- Audience interpretation where justified
- Semantic similarity
- Opportunity reasoning
- Recommendation explanations
- Deal assistance

### Backend should handle

- Authentication
- Authorization
- Validation
- Database writes
- Deterministic calculations
- Business rules
- Filtering
- Final scoring logic
- Payment state
- Offer state
- Collaboration state
- API behavior
- Security
- Data integrity

Never move critical business rules into an opaque LLM prompt when deterministic code can enforce them.

---

# 5. Never Fabricate Data

This is a critical CRAB rule.

AI must never invent:

- Followers
- Subscribers
- Views
- Engagement
- Audience demographics
- Brand history
- Collaboration history
- Campaign requirements
- Creator performance
- Social platform information
- Pricing evidence

If data is unavailable, classify it appropriately.

CRAB uses four important data classifications:

```text
DIRECT
DERIVED
AI-INFERRED
UNAVAILABLE
```

### DIRECT

Information directly supplied by an authorized source.

### DERIVED

Information calculated from valid source data.

Example:

```text
Engagement rate = engagement / relevant audience metric
```

### AI-INFERRED

Information inferred by AI from available evidence.

It must be clearly treated as an inference.

### UNAVAILABLE

Information that CRAB does not have enough evidence to determine.

Do not replace unavailable information with a plausible guess.

---

# 6. AI Output Must Be Structured

Do not rely on free-form AI responses for important application data.

Where AI output enters the application, prefer structured JSON with explicit fields.

Example:

```json
{
  "primary_niche": "fitness",
  "secondary_niches": ["nutrition", "wellness"],
  "content_style": ["educational", "short-form"],
  "audience_type": "fitness-focused young adults",
  "confidence": 0.84,
  "evidence": [
    "Repeated fitness education topics",
    "Consistent workout-related content"
  ]
}
```

The exact schema should follow the relevant project document.

The backend must validate AI output before storing or using it.

If an AI response is malformed:

1. Reject it.
2. Retry if appropriate.
3. Log the failure.
4. Do not silently store malformed data.

---

# 7. Gemini Usage

The MVP uses **Gemini API** for AI interpretation.

Gemini should not be treated as the entire CRAB matching engine.

The intended architecture is:

```text
Raw Data
   ↓
Normalization
   ↓
Backend Calculations
   ↓
AI Interpretation
   ↓
Structured AI Output
   ↓
Embeddings
   ↓
Deterministic Matching
   ↓
Explainable Recommendation
```

Use Gemini where semantic understanding is valuable.

Use ordinary application code where deterministic behavior is better.

---

# 8. Creator Intelligence

The creator intelligence pipeline should follow:

```text
Social Account
      ↓
Authorized API
      ↓
Raw Platform Data
      ↓
Normalization
      ↓
Content + Metrics
      ↓
AI Analysis
      ↓
Creator Intelligence Profile
```

AI may analyze available:

- Titles
- Descriptions
- Captions
- Hashtags
- Transcripts
- Textual content context
- Performance information

depending on the platform and available permissions.

Potential creator intelligence includes:

- Primary niche
- Secondary niches
- Content style
- Audience type
- Main topics
- Commercial categories
- Brand suitability
- Opportunity signals

Do not claim that the AI knows something merely because it produced a confident sentence.

---

# 9. Campaign Intelligence

A brand campaign can begin as structured form input.

The AI system should convert campaign information into a structured representation that is useful for matching.

Inputs can include:

- Product/service
- Objective
- Target audience
- Budget
- Required reach
- Minimum views/followers
- Platform
- Content type/style
- Creator niche
- Location
- Timeline
- Exclusivity
- Usage rights

The resulting campaign intelligence can include:

- Campaign category
- Target creator niches
- Audience requirements
- Content requirements
- Semantic representation
- Compatibility requirements

The AI should help the brand understand its own campaign requirements rather than merely rewrite the campaign text.

---

# 10. Embeddings

CRAB uses embeddings for semantic similarity.

Use embeddings to represent relevant creator and campaign meaning.

For MVP:

- Store vectors in PostgreSQL using pgvector.
- Do not introduce a separate vector database unless a future requirement justifies it.

Embeddings should help answer:

> How semantically relevant is this creator to this campaign?

But:

> **Embedding similarity must never be the only factor in the final match.**

---

# 11. Matching System

CRAB matching combines semantic and deterministic signals.

The intended high-level process is:

```text
Creator Data
      +
Campaign Data
      ↓
Candidate Filtering
      ↓
Semantic Similarity
      ↓
Deterministic Signals
      ↓
Compatibility Rules
      ↓
Final Ranking
      ↓
Evidence
      ↓
Explanation
```

Initial scoring assumptions are:

| Signal | Initial Weight |
|---|---:|
| Semantic relevance | 30% |
| Audience overlap | 25% |
| Performance | 15% |
| Platform fit | 10% |
| Campaign requirements | 10% |
| Brand compatibility | 5% |
| Historical performance | 5% |

These are **starting assumptions**, not validated permanent constants.

Do not hard-code the idea that these weights are scientifically optimal.

The system should be designed so they can be changed later.

---

# 12. Matching Must Not Become Popularity Ranking

Do not build:

```text
More followers = better match
```

Instead, CRAB should consider context.

For example:

A smaller creator with highly relevant content and audience alignment may be a better campaign match than a much larger creator whose audience is unrelated.

Popularity may be a signal.

It is not the definition of compatibility.

---

# 13. Explainability

Every important recommendation should be explainable.

The system should answer:

> **Why does CRAB think this is a good match?**

Good explanations should reference actual evidence.

For example:

```text
Strong match because:
- Creator consistently publishes fitness education content.
- Campaign targets fitness-focused audiences.
- Creator's content style aligns with the requested educational format.
- Recent content shows relevant performance.
```

Bad explanation:

```text
This creator has an 89% match score because the AI thinks they are perfect.
```

The explanation should describe meaningful contributing factors.

Do not fabricate evidence after calculating a score.

---

# 14. Evidence and Confidence

AI reasoning should distinguish between:

- Evidence
- Inference
- Confidence

Example:

```text
Evidence:
Creator has repeatedly published nutrition-related content.

Inference:
Creator is likely relevant to nutrition-focused campaigns.

Confidence:
High
```

Avoid presenting uncertain AI interpretations as facts.

---

# 15. Audience Intelligence

Audience intelligence must be handled carefully.

Prefer:

1. Direct platform-provided audience information.
2. Valid derived signals.
3. Clearly labeled AI inference.

Do not invent demographic percentages.

If CRAB cannot access a specific audience metric, do not generate a fake number.

For inferred audience interests, explain that they are inferred from available content/signals.

---

# 16. Social API Instructions

CRAB uses:

- YouTube API
- Instagram API

Use official authorized access.

Do not assume that every metric is available on every platform.

The application should be designed around the data actually returned by the API.

If a permission or platform limitation prevents a feature from working:

- preserve the real data boundary,
- mark unavailable information appropriately,
- use the documented manual/demo fallback where necessary.

Do not fake production API success.

---

# 17. AI Failure Handling

AI requests can fail.

Possible failures include:

- Timeout
- Rate limit
- Invalid response
- Provider outage
- Malformed JSON
- Missing fields
- Content too large
- Temporary network error

Handle failures explicitly.

Preferred behavior:

```text
Request
 ↓
AI provider
 ↓
Validate response
 ↓
Success → Store/use result

Failure
 ↓
Retry if appropriate
 ↓
Log failure
 ↓
Return safe application state
```

The UI should not freeze indefinitely while waiting for AI.

Use appropriate:

- Loading states
- Processing states
- Retry states
- Error states
- Partial-data states

---

# 18. AI Versioning

AI-generated information can change when:

- prompts change,
- models change,
- embeddings change,
- source data changes.

Where relevant, store:

- AI model/version
- Prompt/version identifier
- Embedding model/version
- Analysis timestamp

This helps CRAB understand how a result was produced.

Do not silently treat outputs generated by different AI versions as identical.

---

# 19. Prompt Engineering Rules

Prompts should be:

- Specific
- Structured
- Context-aware
- Evidence-based
- Consistent
- Easy to version

Avoid prompts such as:

> Analyze this creator and tell me everything.

Prefer task-specific instructions:

> Analyze the provided creator content metadata and identify the primary and secondary content niches. Use only the supplied evidence. Return structured JSON matching the provided schema. If the evidence is insufficient, return an unavailable/low-confidence result instead of guessing.

Prompts should clearly define:

1. Role
2. Input
3. Task
4. Constraints
5. Output schema
6. Uncertainty behavior

---

# 20. AI Should Not Make Authorization Decisions

Never ask the LLM:

> Is this user allowed to access this campaign?

Authorization belongs to backend code.

Similarly, do not use AI to decide:

- Whether a user owns a resource
- Whether a payment is valid
- Whether an offer belongs to a conversation
- Whether a user can modify another user's data
- Whether a webhook is authentic

These are deterministic security/business rules.

---

# 21. AI Should Not Control Payments

Payment state must come from trusted backend/payment-provider flows.

AI may assist with deal suggestions.

AI must not:

- Mark payments as successful
- Approve refunds
- Verify payment signatures
- Modify payment records
- Decide whether money was transferred

Razorpay/webhook verification and backend logic handle payment state.

---

# 22. AI Deal Assistance

AI may assist with:

- Suggested pricing range
- Counteroffer ideas
- Negotiation considerations
- Deal reasoning

It must not claim:

> This is the true market price.

Instead use language such as:

> Suggested range based on the available creator/campaign signals.

The user remains in control.

The AI does not autonomously finalize a deal in the MVP.

---

# 23. Conflict Detection

Conflict detection should primarily use deterministic backend rules.

Examples:

- Potential competitor relationship
- Exclusivity conflict
- Relevant existing collaboration

AI may assist with interpretation where appropriate, but the backend should enforce known rules.

A conflict warning should be treated as a signal for user review.

Do not automatically block a collaboration unless the product requirements explicitly require that behavior.

---

# 24. Database Instructions for AI Agents

When changing database behavior:

1. Read `06_DATABASE.md`.
2. Read the relevant API requirements.
3. Check existing Prisma models.
4. Identify affected relationships.
5. Preserve existing data integrity.
6. Create/update migrations properly.
7. Update affected API types/services.
8. Test the change.

Do not create duplicate entities because a concept is described differently in another file.

Do not casually rename existing database fields without checking all consumers.

---

# 25. API Instructions for AI Agents

When implementing an endpoint:

1. Check `07_API_SPEC.md`.
2. Check the corresponding user flow.
3. Check the database model.
4. Check authorization requirements.
5. Implement validation.
6. Implement business logic.
7. Return the documented response shape.
8. Handle errors.
9. Test success and failure paths.

Do not invent new endpoint behavior just because it is convenient for the frontend.

If the API contract genuinely needs to change, identify the required documentation change as well.

---

# 26. Frontend Instructions

When implementing a UI screen:

1. Check `09_UI_UX.md`.
2. Check the relevant Figma design.
3. Check `03_USER_FLOWS.md`.
4. Check the API contract.
5. Reuse existing components.
6. Implement loading states.
7. Implement empty states.
8. Implement error states.
9. Respect role boundaries.
10. Keep business logic out of presentation code where possible.

The frontend should not independently recreate backend matching or payment logic.

---

# 27. Figma Fidelity

When a Figma design is supplied:

- Treat it as the visual source of truth for that screen.
- Preserve layout hierarchy.
- Preserve component intent.
- Preserve interaction states.
- Preserve important spacing and typography relationships.
- Reuse the project's design system.

Do not blindly reproduce every visual detail if it creates accessibility, responsiveness, or maintainability problems.

When a design conflict exists with product requirements, flag the conflict instead of silently choosing one.

---

# 28. Antigravity / Coding-Agent Workflow

AI coding agents should work feature-by-feature.

Do not give an agent a vague instruction such as:

> Build the entire CRAB application.

Instead use a focused task.

Example:

> Implement creator onboarding according to the Figma design and `03_USER_FLOWS.md`. Use the existing creator profile API contract and database model. Add validation, loading states and error handling. Do not modify unrelated features.

The agent should:

1. Inspect the existing code.
2. Read relevant documentation.
3. Identify dependencies.
4. Plan the change.
5. Implement it.
6. Test it.
7. Report what changed.
8. Identify any unresolved issues.

---

# 29. Never Rewrite the Project Unnecessarily

AI coding agents frequently over-modify projects.

Avoid:

- Rebuilding existing components unnecessarily.
- Replacing the chosen stack.
- Introducing new frameworks without approval.
- Creating duplicate utility systems.
- Renaming large numbers of files for style reasons.
- Rewriting working code unrelated to the task.

Prefer the smallest clean change that satisfies the requirement.

---

# 30. Dependency Rules

The locked MVP stack is:

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- React Three Fiber / Three.js selectively

### Backend

- Node.js
- Express.js
- Prisma

### Database/Auth

- PostgreSQL
- pgvector
- Supabase Auth

### AI

- Gemini API
- Embeddings
- Backend deterministic matching/scoring

### External APIs

- YouTube API
- Instagram API
- Razorpay

Do not replace these technologies without an explicit project decision.

---

# 31. Supabase Auth Rule

Supabase Auth is used for authentication.

It does not replace the Express backend.

The intended architecture is:

```text
Next.js
   ↓
Express API
   ↓
Business Logic
   ↓
PostgreSQL / Prisma
```

Supabase Auth provides identity/authentication.

Express remains responsible for application behavior and authorization.

---

# 32. PostgreSQL + pgvector Rule

PostgreSQL remains the main database.

Use pgvector for embeddings.

Do not introduce a separate vector database for MVP unless a documented requirement appears.

Social data changes frequently, so use appropriate metric snapshots rather than continuously overwriting historical information that needs to remain meaningful.

---

# 33. Security Rules

Never expose secrets to the frontend.

Keep private credentials server-side.

Examples:

- Gemini API key
- Social API secrets
- Razorpay secret credentials
- Database credentials

Use environment variables.

Never commit secrets to Git.

Validate authenticated identity on the backend.

Do not trust:

- frontend role values,
- frontend ownership claims,
- frontend payment status,
- frontend match scores.

The backend is authoritative.

---

# 34. Privacy Rules

Social data should only be accessed through appropriate authorization.

Store only the data required for CRAB's functionality.

Do not expose private social information to unrelated users.

Creator and brand data should only be returned according to product permissions.

AI should receive only the relevant data required for the task.

---

# 35. Performance Rules

Do not call AI unnecessarily.

Avoid:

```text
Every page load → Gemini request
```

Prefer:

```text
Relevant source data changes
        ↓
Run analysis
        ↓
Store structured result
        ↓
Reuse result until refresh is needed
```

Similarly, do not repeatedly fetch external social APIs when stored data is sufficiently fresh.

Use background/asynchronous processing where appropriate.

---

# 36. Cost Awareness

AI and external API calls may have cost/rate implications.

AI agents should:

- Avoid duplicate AI requests.
- Reuse stored analysis where valid.
- Batch work where appropriate.
- Avoid analyzing unchanged content repeatedly.
- Avoid sending unnecessarily large prompts.
- Avoid expensive model calls for deterministic tasks.

Do not optimize prematurely, but do not create obviously wasteful request loops.

---

# 37. Testing Rules

Every major feature should test:

### Happy path

The expected successful flow.

### Invalid input

Bad or missing data.

### Authorization

Wrong user/role/resource access.

### External failure

API/provider unavailable.

### AI failure

Malformed or failed AI response.

### Empty state

No data available.

### Loading state

Data still processing.

### Edge cases

Boundary conditions relevant to the feature.

For matching, also test:

- No candidates
- Many candidates
- Missing signals
- Partial creator data
- Partial campaign data
- Potential conflicts

---

# 38. Definition of Done for AI-Implemented Features

An AI agent should not claim a feature is complete merely because code was written.

A feature is complete only when:

- Requirements were checked.
- Relevant documentation was followed.
- Frontend is implemented where required.
- Backend is implemented where required.
- Database changes are implemented where required.
- AI/integration logic is connected where required.
- Validation exists.
- Authorization exists.
- Loading/empty/error states exist.
- Tests or meaningful verification were performed.
- No known critical issue remains.

---

# 39. How AI Agents Should Report Work

After implementation, the agent should summarize:

### Changed

What files/features were changed.

### Implemented

What behavior now works.

### Tested

What was actually tested.

### Not Tested

Anything that could not be verified.

### Issues

Known problems or limitations.

### Next Step

The smallest logical next task.

Do not claim:

> Everything works.

unless it was actually verified.

---

# 40. Handling Ambiguity

If requirements are unclear:

1. Check the project documentation.
2. Check related user flows.
3. Check the architecture/database/API decisions.
4. Infer only when the intended behavior is strongly supported.
5. Otherwise flag the ambiguity.

Do not silently invent product behavior.

For small implementation details, choose a sensible implementation that preserves existing architecture.

For product/architecture decisions, ask for clarification or record the decision explicitly.

---

# 41. Handling Documentation Conflicts

If two documents conflict:

### Do not

- Silently pick one.
- Delete one requirement.
- Rewrite unrelated documentation.
- Invent a third behavior.

### Instead

Report:

```text
Conflict:
Document A says X.
Document B says Y.

Impact:
This affects Z.

Recommended resolution:
Choose X/Y because ...

Required documentation updates:
- File A
- File B
```

The team can then resolve the decision intentionally.

---

# 42. MVP Scope Protection

AI agents must protect the MVP.

Do not automatically implement attractive future ideas such as:

- Autonomous negotiation
- Production escrow
- Proprietary machine learning
- External opportunity discovery
- Deep cross-platform audience graphs
- Campaign execution automation
- Advanced fraud detection
- Predictive ML
- Audio/video calling
- Group calls
- Screen sharing
- Call recording

unless the project explicitly promotes them into MVP scope.

A smaller working product is better than a large unfinished product.

---

# 43. Demo Fallback Rule

External APIs may be unavailable during a hackathon demonstration.

CRAB may therefore use controlled demo/manual fallback data.

This is acceptable when:

- the API cannot provide required data,
- permissions are unavailable,
- rate limits interfere,
- the demo environment cannot authenticate reliably.

However:

> **Do not fake the core intelligence.**

The matching, ranking, explanations and product flow should remain genuine.

---

# 44. AI Matching Evaluation

As real CRAB outcomes accumulate, the team should eventually evaluate whether the initial matching assumptions are actually useful.

Useful future outcome signals include:

- Match accepted
- Creator contacted
- Brand contacted
- Application submitted
- Offer made
- Offer accepted
- Collaboration completed
- Campaign performance
- Repeat collaboration

These can eventually support better ranking models.

For MVP, do not train a proprietary model without enough quality data.

---

# 45. Future ML Principle

CRAB should first collect reliable product outcome data.

Then evaluate:

```text
Rules + Embeddings
        ↓
Real Outcomes
        ↓
Evaluation
        ↓
Improved Ranking
        ↓
Potential Proprietary ML
```

Do not train a model simply because the project is called an AI product.

Use machine learning when sufficient data and a measurable improvement justify it.

---

# 46. Recommended AI Implementation Order

The AI system should be built in this order:

```text
1. Social API data
        ↓
2. Data normalization
        ↓
3. Creator intelligence
        ↓
4. Campaign intelligence
        ↓
5. Embeddings
        ↓
6. Semantic matching
        ↓
7. Deterministic scoring
        ↓
8. Explainable reasoning
        ↓
9. Opportunity ranking
        ↓
10. Deal assistance
        ↓
11. Outcome collection
        ↓
12. Evaluation
        ↓
13. Future proprietary ranking/ML
```

Do not start with autonomous AI agents or advanced ML before the underlying data pipeline works.

---

# 47. Preferred AI Architecture

Use clear separation:

```text
                  ┌────────────────────┐
                  │   External Data    │
                  │ YouTube / Instagram│
                  └─────────┬──────────┘
                            ↓
                  ┌────────────────────┐
                  │    Normalization   │
                  └─────────┬──────────┘
                            ↓
               ┌─────────────────────────┐
               │      Backend Logic      │
               │ metrics / rules / data  │
               └────────────┬────────────┘
                            ↓
                  ┌────────────────────┐
                  │       Gemini       │
                  │ interpretation     │
                  └─────────┬──────────┘
                            ↓
                  ┌────────────────────┐
                  │ Structured AI Data │
                  └─────────┬──────────┘
                            ↓
                  ┌────────────────────┐
                  │     Embeddings     │
                  │      pgvector      │
                  └─────────┬──────────┘
                            ↓
                  ┌────────────────────┐
                  │ Matching + Ranking │
                  │   backend logic    │
                  └─────────┬──────────┘
                            ↓
                  ┌────────────────────┐
                  │ Recommendation +   │
                  │ Evidence/Reasoning │
                  └────────────────────┘
```

---

# 48. Final Instructions to Any AI Working on CRAB

Before changing CRAB, understand:

1. **What problem is being solved?**
2. **Which user is this feature for?**
3. **Which user flow does it belong to?**
4. **Is it MVP or future scope?**
5. **Which document defines the requirement?**
6. **Which database entities are involved?**
7. **Which API endpoints are involved?**
8. **Does AI actually need to be involved?**
9. **What should remain deterministic?**
10. **What evidence supports the AI output?**
11. **How will failure be handled?**
12. **How will the feature be tested?**

Then implement the smallest correct change.

---

# 49. The One Rule to Remember

If an AI agent remembers only one thing about CRAB, it should remember this:

> **Build CRAB as a real product, not as a collection of AI-generated demos.**

The AI should make CRAB smarter.

It should not make CRAB unpredictable.

The system should combine:

> **Real data + AI understanding + deterministic backend logic + explainable matching + good product design**

to create meaningful creator–brand opportunities.

That is what makes CRAB different.
