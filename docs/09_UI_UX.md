# CRAB — UI/UX Design Specification

**Document:** `09_UI_UX.md`  
**Project:** CRAB — Creator–Brand Opportunity Engine  
**Status:** Design direction defined; implementation-ready baseline  
**Purpose:** Single source of truth for the frontend visual system, navigation, page responsibilities, interaction patterns, and accessibility expectations.

---

## 1. Design goals

CRAB connects creators and brands through creator intelligence, campaign intelligence, explainable matching, and collaboration workflows. The interface must make these activities understandable without feeling like a generic analytics dashboard or a social-media feed.

### Core principles

1. **Workspace first.** CRAB is a workspace for discovering, evaluating, and managing partnerships—not a clone of Instagram, YouTube, or a generic admin template.
2. **Explain the match.** Never show a match percentage alone when a meaningful explanation can be provided. Show the relevant evidence, fit dimensions, and caveats.
3. **Useful density.** Display enough information to support decisions, but use hierarchy, spacing, and progressive disclosure to prevent overload.
4. **Creator potential over popularity.** Follower count is context, not a proxy for creator quality. Matching must consider audience relevance, content relevance, performance, growth, reliability, budget compatibility, and campaign requirements.
5. **Human decisions.** CRAB may analyze, recommend, summarize, and flag risks. Users make final decisions about shortlisting, invitations, offers, contracts, approvals, and payments.
6. **Evidence over decoration.** AI is a product capability, not a visual effect. Avoid gratuitous gradients, glowing elements, animated AI motifs, and unsupported claims.
7. **Consistent design, role-specific workflows.** Creator and Brand experiences share components and visual rules, but their navigation and priorities are different.
8. **Honest data states.** Clearly distinguish live API data, user-provided data, estimated values, AI-generated inferences, and demo/mock data.

## 2. Product and UX model

### Main user questions

- **Creator:** Which opportunities fit my content, audience, interests, and goals?
- **Brand:** Which creators fit this campaign, and why?
- **Campaign workspace:** What needs to happen next to deliver this partnership successfully?
- **Intelligence:** What has CRAB learned from available data, and what should I consider doing next?

### Three levels of intelligence

- **Find Creators / Discover:** individual matching and opportunity recommendations.
- **Campaign AI Insights:** status, performance, risks, and next steps for one campaign.
- **Brand Intelligence / Creator Intelligence:** broader understanding across the brand or creator profile and, where data exists, across multiple campaigns or collaborations.

Do not duplicate the same generic AI cards on every page. Each AI surface must answer a distinct question and use the correct scope of data.

## 3. Visual direction

### Reference style

Use the supplied LoopAI dashboard and inbox screenshots as the primary visual reference for composition and visual tone:

- Light, white workspace canvas.
- Very subtle lavender/periwinkle surfaces and accents.
- Thin neutral borders and soft shadows.
- Rounded cards and pill-shaped tabs/controls.
- Spacious layouts with clear typography and restrained decoration.
- Compact navigation and practical content density.
- Small contextual AI panel or assistant surface where useful.

CRAB can use its orange/coral brand accent for primary actions and selected states, but should not turn the entire interface orange. The final implementation should feel related to the reference, not copy its logo, branding, or exact layout.

### Avoid

- Generic purple-gradient “AI SaaS” templates.
- Large hero sections on internal workspace pages.
- Excessive glassmorphism, neon, glow, and decorative gradients.
- Using video thumbnails as the default way to display creators in search results.
- Overloading every page with charts, KPI cards, or AI summaries.
- Treating follower count, total views, or past sponsorship count as the primary ranking criterion.
- Fake precision: unsupported match percentages, demographic breakdowns, ROI, projections, or performance claims.
- Emoji as the main icon system. Use a consistent icon library.

## 4. Design tokens

These are starting tokens. Implement them as CSS variables/Tailwind theme values and refine only when needed for contrast or consistency.

### Colors

| Token | Suggested value | Use |
|---|---|---|
| `--background` | `#F8F9FC` | App background |
| `--surface` | `#FFFFFF` | Cards, dialogs, navigation surfaces |
| `--surface-subtle` | `#F3F3FC` | Soft lavender sections and selected surfaces |
| `--surface-muted` | `#F5F6FA` | Secondary areas and input backgrounds |
| `--text-primary` | `#17182B` | Main text and headings |
| `--text-secondary` | `#626782` | Supporting text |
| `--text-muted` | `#8B90A5` | Hints, metadata, disabled labels |
| `--border` | `#E7E8F0` | Borders and separators |
| `--brand-primary` | `#F4511E` | Main CTA and selected navigation accent |
| `--brand-primary-hover` | `#D94316` | Hover/pressed CTA |
| `--accent-lavender` | `#8580E8` | Secondary accent, charts, selected soft surfaces |
| `--success` | `#159B62` | Successful/completed states |
| `--warning` | `#C47A12` | Warnings and pending attention |
| `--danger` | `#D14343` | Destructive actions and critical states |
| `--info` | `#3478D4` | Informational states |

Color must not be the only way to communicate status; pair colors with labels and/or icons.

### Typography

- Use a clean sans-serif such as **Inter**, **Geist**, or the framework's equivalent.
- Page title: 28–32 px desktop, 24–28 px smaller screens.
- Section heading: 16–20 px.
- Body: 14–16 px.
- Metadata and table labels: 12–13 px, while maintaining legibility.
- Use regular/medium weights for most UI; reserve bold for hierarchy, not every card label.
- Keep line lengths readable and avoid tiny text copied from generated screenshots.

### Spacing and shape

Use a consistent 4 px base scale.

- Common spacing: 4, 8, 12, 16, 20, 24, 32 px.
- Card padding: 16–24 px depending on density.
- Card radius: 12–16 px.
- Inputs and buttons: 10–12 px radius; pill shape for tabs/chips where appropriate.
- Borders: 1 px neutral; use shadows sparingly.
- Prefer consistent alignment and whitespace over extra dividers.

### Layout

- Desktop app shell: compact left sidebar or top navigation, depending on the chosen shell. Keep one consistent pattern throughout the application.
- Use a responsive content container and grid. Avoid hard-coded screenshot-sized widths.
- At wide desktop widths, use a primary content column plus an optional utility/AI panel. On smaller widths, stack panels or make them collapsible.
- Tables may become stacked cards on mobile when columns cannot remain readable.
- Respect safe scrolling: navigation should remain accessible without trapping the whole page in nested scroll containers.

## 5. Shared application shell

### Shared components

- Brand mark and product name.
- Role-specific primary navigation.
- Global search, where supported.
- Notifications entry.
- Account/profile menu.
- Page title and optional breadcrumb.
- Primary action in the page header when relevant.
- Shared empty, loading, error, and permission states.

### Brand navigation

1. Overview
2. Campaigns
3. Find Creators
4. Applications
5. Collaborations
6. Inbox
7. Intelligence
8. Profile
9. Settings

### Creator navigation

1. Discover
2. Applications
3. Requests
4. Collaborations
5. Inbox
6. Intelligence
7. Profile
8. Settings

### Navigation definitions

- **Discover:** creator-initiated exploration of suitable campaigns and brands.
- **Applications:** opportunities the current user has applied to / creator applications received by a brand. The UI should use role-specific labels and filters to avoid ambiguity.
- **Requests:** inbound approaches received by creators from brands.
- **Campaigns:** brand-owned campaigns and their statuses.
- **Find Creators:** brand discovery and evaluation of creators.
- **Collaborations:** accepted partnerships, active work, completed work, and relevant contract/deliverable/payment status.
- **Inbox:** conversations, with campaign/collaboration context.
- **Intelligence:** broader, explainable profile or strategy understanding—not merely raw analytics.
- **Profile:** user-controlled profile details and connected accounts.

### Navigation behavior

- Clearly indicate the current location.
- Keep labels visible in the primary desktop navigation.
- Use counts only for actionable unread/new items; do not decorate every item with badges.
- On small screens, use a compact navigation pattern that preserves access to core destinations.
- Protect all role-specific routes in the application; navigation visibility alone is not authorization.

## 6. Page specifications

Generated screenshots are visual references, not pixel-perfect specifications. Build reusable layouts and components rather than recreating every detail from images.

### 6.1 Authentication

**Pages:** Login, signup, role selection, password recovery if in scope.

**Needs:**
- Clear CRAB identity and concise explanation of the platform.
- Separate Creator and Brand onboarding paths.
- Simple forms with visible labels, validation, password visibility where appropriate, and clear error messages.
- Role choice must persist through onboarding and be enforced by backend authorization.
- Do not imply social-account connection is required before the user understands why it is requested.

### 6.2 Brand Overview

**Purpose:** Give the brand a high-level view of campaign activity and actions that need attention.

**Content:**
- Welcome/header and Create Campaign action.
- Compact overview metrics (active campaigns, creators working with the brand, applications needing review, budget summary where data exists).
- Active/recruiting campaign summaries with progress and status.
- Recent applications or creator activity.
- Tasks requiring action: review applications, respond to counters, review deliverables, or check contract/payment states.
- A small creator recommendation section when relevant.
- Optional contextual Ask CRAB entry point.

**Do not:** turn Overview into a full analytics report; detailed metrics belong in Campaign Analytics or Brand Intelligence.

### 6.3 Campaigns list

**Purpose:** Let a brand see and manage all current, past, and draft campaigns.

**Content:**
- Page heading and Create Campaign CTA.
- Summary counts: total, active, recruiting, completed, drafts.
- Tabs or filters for All, Active, Recruiting, Completed, Drafts.
- Search, status filter, sort.
- Campaign rows/cards containing campaign name, objective/category, platforms, status, date range, budget/spend if available, creator/application counts, and progress.
- Clear actions: View Campaign, Continue Draft, View Report.
- Empty state for a first campaign, with a Create Campaign CTA.

### 6.4 Campaign workspace

Each campaign has a contextual sub-navigation. Keep the global Brand navigation separate from the campaign's local navigation.

**Campaign sections:**
1. Overview
2. Creators
3. Contracts
4. Deliverables
5. Approvals
6. Timeline
7. Analytics
8. Budget & Payments
9. AI Insights
10. Reports
11. Assets
12. Campaign Messages (can link to Inbox filtered to the campaign)

#### Campaign Overview
- Campaign name, status, dates, objective and quick actions.
- Budget, creator counts, application counts, deliverables, and progress where data exists.
- Upcoming deadlines and recent activity.
- Brief campaign-specific AI summary with evidence and limitations.

#### Create/Edit Campaign
Group fields into steps or clearly separated sections:
- Basic details: name, product/service, description, objective.
- Audience: target age range if appropriate, location, interests, audience type.
- Platforms and creator requirements: platform, niche, follower range, engagement range, language, creator type.
- Budget and timeline.
- Deliverables and quantities.
- Campaign brief: key messages, talking points, do/don'ts, brand guidelines, hashtags, mentions.
- Usage rights and exclusivity where relevant.
- Save draft and preview before publishing.
- Explain required fields and validate values; don't make the form one giant undifferentiated panel.
- Campaign intelligence may suggest structured requirements, but the brand must be able to review and edit them.

#### Creators
- Creator pipeline: Recommended, Shortlisted, Invited, Accepted, Active, Completed (adapt states to the actual backend model).
- Creator profile summary, match explanation, relevant metrics, proposed rate, deliverables, and conflict indicators.
- Actions such as View Profile, Shortlist, Invite, Message, and Manage.
- Do not imply a creator is contracted or confirmed merely because they were recommended or shortlisted.

#### Contracts
- Contract list with creator, campaign, value, created date, signing deadline, and status.
- Contract detail with deliverables, payment, deadlines, usage rights, exclusivity, revision limits, cancellation terms, signatures, and timestamps.
- MVP can use a clearly labeled simulated signature workflow if legally binding e-signature is not implemented.
- Never present a demo signature as a legally valid signature.

#### Deliverables
- Creator, deliverable type, deadline, status, and related contract/campaign.
- Status progression may include Not Started, Brief Sent, Concept Submitted, Draft Submitted, Revision Requested, Approved, Published; align to implemented states.
- Provide detail views and history for each deliverable.

#### Approvals
- Queue of content awaiting review, with creator, campaign, submission time, and deadline.
- Review view for submitted asset, caption, hashtags, mentions, comments, and revision history.
- Actions: Approve, Request Revision, Comment.
- If an AI content check exists, show each check result and the evidence. A check is advisory unless the business rules explicitly define an automatic gate.

#### Timeline
- Campaign dates, application/selection milestones, contract deadlines, submission/review deadlines, publishing dates, and overdue tasks.
- Offer list and calendar/timeline views only if they can be maintained accessibly and responsively.
- Clearly label overdue items and the responsible party.

#### Analytics
- Reach, impressions, views, engagement, clicks, conversions, and ROI only where data is available and definitions are documented.
- Platform and creator comparisons with time range and data source.
- Clearly distinguish actual, estimated, projected, and unavailable data.
- Avoid inventing analytics or implying access to private platform metrics that APIs do not expose.

#### Budget & Payments
- Total budget, allocated/committed amount, paid amount, and remaining amount with documented calculation rules.
- Creator-level agreed amount, due amount, payment status, and transaction/reference details as allowed.
- Separate financial tracking from actual payment execution.
- If using a payment sandbox, label it as test/demo mode and show its limitations.

#### AI Insights
- Campaign health summary, what is working, concerns/risks, creator performance observations, and suggested next actions.
- Tie insights to campaign data and identify when evidence is limited.
- Recommendations should be actionable and reversible.
- Do not let AI automatically change budgets, select/reject creators, approve content, or execute payments.

#### Reports
- Campaign summary, objectives, KPI results, creator/platform performance, budget, insights, and recommendations.
- PDF/export actions only when implemented; otherwise show a disabled or clearly marked future capability, not a fake download.

#### Assets
- Campaign brief, guidelines, product images, logos, reference material, contracts, and creator submissions.
- Show file type, owner/uploader, upload time, and related item where applicable.
- Respect file permissions and validate uploads.

### 6.5 Find Creators

**Purpose:** Help a brand evaluate creators using CRAB's structured understanding, not by imitating a social-media feed.

**Top controls:**
- Search by creator name, niche, topic, or keyword.
- Discovery modes: Best Match, Emerging Talent, Best Value, High Growth, Established.
- Filters: platform, niche, location, follower range, engagement, estimated rate/budget fit, creator size, language, audience characteristics, past collaborations, conflict status.
- Include Emerging Creators and show creators with limited brand-deal history as optional filters.
- Sort by relevance/match, growth, value, or other supported criteria.

**Creator result content:**
- Avatar, name, handle, creator type, location, platform links.
- Primary/secondary niches and a short content overview.
- Audience segments/interests only when supported by actual or clearly labeled inferred data.
- Key performance metrics with time range/source where relevant.
- Growth and posting consistency where data is available.
- Match score with breakdown such as Audience Fit, Content Fit, Niche Fit, Performance/Requirements Fit.
- Concise explanation of why the creator matches.
- Potential conflicts or data caveats.
- Estimated rate/range only when a defensible estimate exists; label it as estimated.
- Actions: View Full Profile, Shortlist, Invite to Campaign, Visit YouTube/Instagram.

**Do not show video thumbnails as the default result design.** Brands who want to inspect content should be able to open the creator's linked social profiles. A deeper CRAB profile may summarize content themes, format/style, and selected representative content if the data and rights permit.

**Fair discovery and recommendation policy:**
- Follower count is not a quality score.
- Apply budget as an affordability/eligibility constraint, not as a bonus for larger creators.
- Compare creator value relative to campaign goals and audience fit.
- Include qualified emerging and under-discovered creators in recommendation diversity without inflating their scores.
- A creator with few previous sponsorships must not be automatically penalized; limited history is not the same as poor reliability.
- Do not fabricate a match score or guarantee campaign outcomes.
- Explain why a creator is recommended and disclose material uncertainty.

### 6.6 Brand Applications

**Purpose:** Review creators who applied to brand campaigns.

**Content:**
- Summary counts by status.
- Search and filters by campaign, niche, match, date, and status.
- Table/list with creator, campaign, audience/niche summary, match explanation, estimated rate/proposal, applied date, and status.
- Detail panel with cover note, proposed deliverables, audience/content overview, relevant performance, match rationale, and potential conflicts.
- Actions: Review, Shortlist, Invite/Continue Conversation, Reject.
- Bulk actions only for safe, reversible operations and with clear confirmation.
- Rejection should be explicit; do not silently discard applicants.

### 6.7 Creator Discover

**Purpose:** Help creators find relevant campaigns and brands.

**Content:**
- Search, filters, recommended campaigns, and clear campaign cards.
- Show brand, campaign objective, platform, deliverables, budget/range if available, dates, requirements, match score and explanation.
- Explain fit using content, audience, niche, and eligibility—not just follower count.
- Actions: View Campaign, Save, Apply.
- Flag relevant conflicts or missing requirements before the creator applies.

### 6.8 Creator Applications and Requests

Keep these concepts distinct.

- **Applications:** campaigns/brands the creator has proactively applied to. Show campaign, brand, application date, status, last update, and next action.
- **Requests:** inbound approaches from brands. Show brand, campaign, proposed terms, deadline, status, and actions to review, discuss, accept, or decline.
- Do not combine inbound requests and outbound applications into one ambiguous list.
- Negotiation/offer history should be visible and changes should be attributable to a user and timestamp.

### 6.9 Collaborations

**Purpose:** Manage accepted partnerships from agreement through completion.

**Content:**
- Tabs/filters: All, Active, In Progress, Completed, Cancelled (match backend statuses).
- Creator/brand and campaign, agreed value, contract state, deliverable progress, timeline, and payment state.
- Link to contracts, deliverables, approvals, messages, and campaign context.
- Performance indicators only after content is published and data is available.
- Clear distinction between contract signing, work in progress, content approval, publication, completion, and payment.

### 6.10 Inbox

**Purpose:** Conversations tied to a creator, brand, campaign, application, or collaboration.

**Layout:**
- Conversation list with participant, last message, time, unread state, and campaign context.
- Message thread with clear sender/time grouping and composer.
- Useful filters/search; avoid showing sensitive details in notification previews.
- Optional contextual AI smart reply. It must be editable, clearly presented as a suggestion, and never send automatically.
- Link to the related campaign/application/collaboration.
- Handle loading, failed sending, retry, and empty states.

### 6.11 Creator Intelligence

**Purpose:** Explain what CRAB understands about the creator and how that affects opportunities.

**Sections:**
- Creator identity: primary/secondary niches, creator type, content style, topics.
- Audience intelligence: available audience composition/interests and data source.
- Content intelligence: themes and formats that appear to perform well.
- Performance interpretation: metrics with time range and comparison baseline.
- Brand suitability: categories and reasons for compatibility.
- Opportunity signals: categories where the creator may be a fit.
- Collaboration learnings where enough history exists.
- Actionable recommendations.
- Ask CRAB conversational panel grounded in the creator's available profile and data.

### 6.12 Brand Intelligence

**Purpose:** Explain what CRAB has learned about the brand's creator strategy across campaigns and partnerships.

**Sections:**
- Brand understanding and positioning.
- Audience intelligence and top audience interests/locations where data exists.
- Creator strategy: creator profiles/tiers/niches that perform well.
- Cross-campaign performance comparisons.
- Creator economics: rates and cost metrics with clear definitions.
- What CRAB has learned, areas to watch, and emerging opportunities.
- Strategic recommendations with rationale and confidence/limitations.
- Ask CRAB panel with suggested questions.

**Important distinction:** Brand Intelligence is cross-campaign strategy. Campaign AI Insights is the analysis of one campaign. Do not show cross-campaign conclusions if there is insufficient data; use a transparent “Not enough data yet” state and useful setup guidance.

### 6.13 Profile and settings

- Profile details, brand/creator information, preferences, connected social accounts, notification settings, and account/security controls.
- Explain permissions and what data will be imported when connecting an account.
- Show connection status, last sync, and sync failures.
- Allow correction of profile details and, where applicable, AI-inferred profile attributes.

## 7. Matching and fairness UX

CRAB's discovery UI must not make marketplace access depend solely on popularity.

### Separate concepts

- **Creator size:** follower/subscriber bands.
- **Creator quality signals:** content quality, audience relevance, authenticity signals, consistency, reliability, and available performance.
- **Campaign fit:** audience, content, niche, platform, deliverables, geography, goals, and constraints.
- **Budget fit:** estimated or negotiated rate versus campaign budget.
- **Growth potential:** supported growth trend and evidence.
- **Experience:** previous collaborations; absence of history is not automatically negative.

### Match explanation

For each recommended creator, show:
- Overall match score only if generated by a documented scoring method.
- Relevant fit dimensions and their rationale.
- Hard requirement failures separately from softer fit scores.
- Data recency/source and missing-data caveats where they materially affect the decision.
- Potential conflicts and why they matter.

### Discovery modes

- **Best Match:** highest campaign suitability under hard constraints.
- **Emerging Talent:** relevant creators with strong evidence of potential and comparatively low visibility/limited prior sponsorships.
- **Best Value:** suitable creators with strong expected value relative to cost; not simply the cheapest.
- **High Growth:** creators with a supported positive growth trend.
- **Established:** creators with strong evidence of sustained reach/experience; not automatically the default or “best” option.

Recommendation diversity may deliberately surface different qualified creator segments, but it must not manipulate scores or hide better matches. Let brands switch modes and understand the trade-offs.

## 8. Interaction patterns

### Forms
- Use clear labels, help text for unfamiliar terms, and inline validation.
- Group long forms into logical steps or sections.
- Preserve user input when validation fails.
- Confirm destructive or consequential actions.
- Show unsaved changes when navigation could discard work.

### Filters and lists
- Show active filters and provide Clear All.
- Keep filters in the URL when useful for navigation/shareability.
- Support sorting and pagination/“load more” for large result sets.
- Preserve search/filter state when returning from a detail view where practical.
- Provide explicit status labels, not color alone.

### Details and side panels
- Use side panels for quick review and contextual actions; use full pages for complex work.
- Avoid putting every field in the list row. Use progressive disclosure.
- Provide a clear way to open the full profile or campaign.

### Status changes
- Show current state and allowed next actions.
- Use confirmations for destructive/irreversible actions.
- Keep an audit/history trail for offers, contracts, approvals, and payments when supported.
- Do not imply an operation succeeded until the server confirms it.

### Notifications
- Distinguish unread, informational, and action-required notifications.
- Link each notification to the relevant record.
- Avoid unnecessary badge counts.

### AI interactions
- Label generated content as a suggestion or analysis.
- Explain the data basis for consequential recommendations.
- Provide “Ask CRAB” prompts relevant to the current page context.
- Let users edit/cancel AI drafts before sending or applying them.
- Never allow AI to autonomously send messages, negotiate terms, sign contracts, reject creators, approve content, or execute payments without explicit user action.

## 9. Data integrity and content rules

- Never invent real-looking metrics for production data.
- Seed demo records must be clearly treated as demo data in development/demo environments.
- Distinguish measured, user-entered, inferred, estimated, and projected information.
- Show timestamps/time ranges for volatile metrics.
- Define metric names consistently across pages.
- If a social platform API cannot supply a metric, mark it unavailable or use a documented estimate; do not imply it is verified.
- Avoid making unsupported claims about audience demographics, authenticity, ROI, conversion, or brand safety.
- Do not reveal private creator/brand data to users without authorization.
- Social profile links should open the correct external profile and should be visibly external where appropriate.

## 10. Responsive behavior

### Desktop
- Use the full navigation and optional secondary/AI panel.
- Keep tables where the columns remain readable.
- Allow a detail panel alongside a list for review-heavy workflows.

### Tablet
- Collapse secondary panels and reduce nonessential columns.
- Keep core actions visible.
- Convert wide tables to scrollable tables or cards deliberately.

### Mobile
- Use compact navigation and single-column content.
- Stack summary cards and filters.
- Use full-screen or bottom-sheet detail views when appropriate.
- Keep primary actions accessible without horizontal scrolling.
- Do not shrink desktop screenshots into unreadable mobile layouts.

## 11. Accessibility

Target WCAG 2.2 AA where practical.

- Use semantic headings and landmarks.
- Ensure keyboard navigation and visible focus states.
- Provide accessible names for icon-only buttons.
- Maintain adequate contrast for text, controls, status labels, and charts.
- Do not rely on color alone.
- Associate form labels, errors, and help text programmatically.
- Ensure dialogs and side panels manage focus correctly.
- Provide text summaries or accessible data alternatives for charts.
- Respect reduced-motion preferences.
- Make clickable targets sufficiently large, particularly on touch screens.

## 12. Shared component inventory

Build reusable components before implementing every page independently.

### Foundation
- `AppShell`
- `BrandSidebar` / `CreatorSidebar` (or a unified role-aware navigation)
- `TopBar`
- `PageHeader`
- `Breadcrumbs`
- `Button`
- `Input` / `SearchInput`
- `Select`
- `Tabs`
- `Badge` / `StatusBadge`
- `Avatar`
- `Card`
- `Tooltip`
- `DropdownMenu`
- `Dialog`
- `Drawer` / `DetailPanel`
- `Skeleton`
- `EmptyState`
- `ErrorState`
- `Pagination`
- `FilterBar`

### Product components
- `CreatorSummary`
- `CreatorIntelligenceSummary`
- `MatchScore`
- `MatchBreakdown`
- `AudienceBreakdown`
- `ContentOverview`
- `CampaignSummary`
- `CampaignStatus`
- `CampaignProgress`
- `ApplicationTable`
- `CollaborationRow`
- `DeliverableStatus`
- `ContractStatus`
- `PaymentStatus`
- `AIInsightCard`
- `AskCrabPanel`
- `SocialAccountLink`
- `MetricCard`
- `ActivityFeed`
- `DeadlineList`

Components should accept typed data and callbacks; avoid duplicating near-identical cards with different hard-coded content.

## 13. Implementation guidance

The UI/UX specification defines behavior and presentation, not the backend source of truth. Before implementing a page:
1. Check `02_MVP.md` for scope.
2. Check `03_USER_FLOWS.md` for the user's journey.
3. Check `05_ARCHITECTURE.md` for system boundaries.
4. Check `06_DATABASE.md` for entities and relationships.
5. Check `07_API_SPEC.md` for available operations and statuses.
6. Check `08_AI_MATCHING.md` for AI data and matching semantics.
7. Use this file for the page's layout, component hierarchy, states, and interaction rules.

Implementation rules:
- Use the project's chosen framework and conventions from `05_ARCHITECTURE.md`; do not introduce a second frontend architecture.
- Build the shared shell and design tokens first.
- Implement one end-to-end vertical slice using typed mock data if backend endpoints are not ready.
- Keep mock data in a clearly separated seed/mock layer so it can be replaced by API responses.
- Model loading, empty, error, success, and permission-denied states.
- Use actual backend status enums instead of inventing new labels in the frontend.
- Never put secrets, API keys, or privileged credentials in client code.
- Do not implement all screens as static screenshots; each control shown in the UI must have a real action or be clearly marked as nonfunctional prototype UI.
- Keep business logic out of purely presentational components where practical.

## 14. MVP implementation priorities

Prioritize a working product loop over completing every screen at once.

### Phase A — Foundation
- Design tokens and global typography.
- App shell, role-aware navigation, responsive behavior.
- Shared components and form/table patterns.
- Authentication screens and route protection.

### Phase B — Brand-to-creator vertical slice
1. Brand Overview
2. Create/Edit Campaign
3. Campaign list and campaign overview
4. Find Creators with fit explanations and discovery modes
5. Creator detail view
6. Shortlist/invite creator
7. Brand Applications and Inbox context

Use clearly labeled demo data until the APIs are connected.

### Phase C — Creator response loop
1. Creator profile/onboarding
2. Creator Discover
3. Apply to campaign
4. Creator Applications and inbound Requests
5. Brand/creator messaging and offer status

### Phase D — Collaboration workflow
1. Collaboration record
2. Contract status workflow
3. Deliverables and approvals
4. Payment tracking/test mode
5. Collaboration history

### Phase E — Data and intelligence
1. Social account connection and sync states
2. Creator Intelligence
3. Matching improvements and fairness/diversity evaluation
4. Campaign analytics
5. Campaign AI Insights
6. Cross-campaign Brand Intelligence
7. Reports and polish

Adjust this order to the existing `10_ROADMAP.md` and team capacity; do not treat every listed screen as a prerequisite for the first demo.

## 15. Definition of done for a page

A page is not complete merely because it resembles a reference image. It should have:
- Correct role and route protection.
- A clear primary user goal.
- Correct data source and types.
- Loading, empty, error, and success states as applicable.
- Functional primary actions.
- Responsive layout.
- Keyboard-accessible controls and visible focus.
- Consistent visual tokens and shared components.
- No fabricated production metrics or unsupported AI claims.
- Clear links to related records and workflows.
- Acceptance checks for the important user journey.

---

## Final design rule

**CRAB should help brands and creators make better partnership decisions—not merely display metrics or decorate a marketplace with AI labels.**

Every page should answer one clear question, explain the evidence when a recommendation is made, and give the user an understandable next action.
