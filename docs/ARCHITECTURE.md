PAG — SYSTEM ARCHITECTURE

Document: docs/ARCHITECTURE.md
Status: Phase 1 Architecture Baseline
Project: PAG

1. PURPOSE

This document defines the production architecture baseline for PAG.

PAG is a native mobile survey, profiling, ranking, reward, and controlled push-distribution platform.

The architecture must support:

Native iOS and Android clients
PAG Admin Web
Organization Customer Web
Firebase Authentication
Firestore
Firebase Cloud Messaging
Trusted backend operations
Profile Score
Ranking
Survey rewards
Voucher distribution
Controlled push campaigns
Multi-tenant organizations
Live reporting

This document must be used together with:

AGENTS.md
docs/DESIGN_SYSTEM.md
docs/DATA_MODEL.md

If implementation conflicts with AGENTS.md, AGENTS.md takes precedence unless an explicit later product decision overrides it.

2. MONOREPO

Repository root:

pagApp/

Expected structure:

pagApp/
├── apps/
│   ├── ios/
│   ├── android/
│   ├── admin-web/
│   └── customer-web/
├── backend/
│   ├── functions/
│   └── firebase/
├── packages/
│   ├── api-contracts/
│   ├── design-tokens/
│   └── shared-config/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   └── DESIGN_SYSTEM.md
├── AGENTS.md
└── README.md
3. PLATFORM STACK
iOS

Technology:

Swift
SwiftUI

Location:

apps/ios/

The iOS project is native.

Android

Technology:

Kotlin
Jetpack Compose

Location:

apps/android/

The Android application must not be implemented using a cross-platform mobile framework.

PAG Admin Web

Technology:

Next.js
TypeScript
React

Deployment:

Vercel

Location:

apps/admin-web/
Customer Web

Technology:

Next.js
TypeScript
React

Deployment:

Vercel

Location:

apps/customer-web/
4. HIGH-LEVEL ARCHITECTURE

Conceptual architecture:

                    ┌───────────────────┐
                    │     PAG Admin     │
                    │ Next.js / Vercel │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Trusted Web API   │
                    │ Next.js Server    │
                    │ Firebase Admin SDK│
                    └─────────┬─────────┘
                              │
                              │
┌──────────────┐              │              ┌──────────────┐
│  iOS Client  │──────────────┼──────────────│Android Client│
│Swift/SwiftUI │              │              │Kotlin/Compose│
└──────────────┘              │              └──────────────┘
                              ▼
                    ┌───────────────────┐
                    │ Firebase Backend  │
                    │                   │
                    │ Auth              │
                    │ Firestore         │
                    │ Functions         │
                    │ FCM               │
                    │ Storage if needed │
                    └─────────┬─────────┘
                              ▲
                              │
                    ┌─────────┴─────────┐
                    │ Customer Web      │
                    │ Next.js / Vercel │
                    └───────────────────┘

The exact network paths may differ by operation.

The fundamental rule is:

Clients are not authoritative for business-critical state.

5. TRUST BOUNDARIES

PAG has three primary trust levels.

Untrusted Clients

Treat as untrusted:

iOS application
Android application
Browser JavaScript
client-provided timestamps
client-calculated scores
client-calculated rewards
client-provided authorization assumptions

A legitimate PAG client can still be reverse engineered or manipulated.

Authenticated Clients

Firebase Authentication establishes identity.

Authentication does NOT automatically grant authority to modify business-critical data.

Authentication answers:

Who is making the request?

Authorization still answers:

Is this user allowed to perform this operation?

Trusted Backend

Trusted operations execute through approved server environments using Firebase Admin SDK or equivalent trusted Firebase backend facilities.

The backend is authoritative for:

Profile Score
reward assignment
reward balance
voucher allocation
survey completion ranking
campaign ranking
campaign execution
push eligibility
withdrawal state
organization authorization
administrative operations
6. WEB ACCESS MODEL

Privileged web access follows:

Browser
   ↓
Next.js Server/API
   ↓
Firebase Admin SDK
   ↓
Firebase

Firebase Admin SDK must never be bundled into browser JavaScript.

Service account credentials must never be exposed to clients.

Vercel server-side secrets/environment variables must be used for server credentials.

Customer and admin authorization must be validated server-side.

7. MOBILE ACCESS MODEL

Native clients may use Firebase client SDKs for approved operations such as:

authentication
permitted realtime/read operations
device registration

Critical state changes must pass through trusted backend operations.

Examples:

POST survey completion
POST withdrawal request
reward calculation
Profile Score award
voucher assignment

must not be implemented as arbitrary client-side Firestore writes.

8. DOMAIN BOUNDARIES

PAG is divided into explicit business domains.

Identity Domain

Responsible for:

authentication identity
account state
registration date
verification state
Profile Domain

Responsible for:

current profile attributes
editable profile-survey answers
segmentation attributes

Profile state represents current user information.

It must not be confused with immutable historical survey responses.

Device Domain

Responsible for:

active device
platform
FCM token
notification eligibility
token validity

User and Device are separate entities.

Organization Domain

Responsible for:

commercial customers
organization membership
tenant authorization
organization-owned surveys
customer dashboard access
Survey Domain

Responsible for:

survey definition
questions
answer options
survey availability
audience targeting
responses
completion
Profile Score Domain

Responsible for:

Profile Score ledger (`users/{userId}/profileScoreLedgers/{ledgerId}`)
Profile Score total (`users/{userId}.profileScore` materialized total)
score sources (`SURVEY`, `PROFILE`, `PHONE_VERIFIED`, `IBAN_VERIFIED`, `KYC_VERIFIED`, `BASIC_PROFILE`)
idempotent score awards (deterministic ledger IDs per user)
CollectionGroup query support (`profileScoreLedgers`) for global admin reporting

Profile Score is not money.

Ranking Domain

Responsible for:

campaign ordering
deterministic tie-breaking
ranking snapshots

Ranking order:

profileScore DESC
registeredAt ASC
userId ASC
Campaign Domain

Responsible for:

campaign creation
approval
scheduling
audience eligibility
ranking snapshot
batch execution
campaign progress
Push Delivery Domain

Responsible for:

FCM delivery
idempotency
delivery status
invalid-token handling

It does not determine survey reward ranking.

Reward Domain

Responsible for:

reward definitions
reward ranking
monetary reward allocation
reward ledger
reward balance
Voucher Domain

Responsible for:

voucher pools
voucher inventory
atomic assignment
voucher ownership
Withdrawal Domain

Responsible for:

minimum withdrawal threshold
withdrawal request
KYC requirement
future payout processing

PAGCoin is outside the current scope.

Reporting Domain

Responsible for:

survey aggregates
current profile statistics
campaign metrics
organization dashboard statistics
9. SURVEY ARCHITECTURE

PAG V1 surveys support:

maximum 3 questions
Single Select
startAt
endAt

Survey ownership:

PAG
ORGANIZATION

Survey behavior types:

PROFILE
PAG
ORGANIZATION
PROFILE

Responses may change.

Changing the answer changes:

current profile
segmentation
applicable live statistics

Previously awarded Profile Score is not recalculated merely because a profile answer changes.

PAG

Submitted survey response is immutable.

ORGANIZATION

Submitted survey response is immutable.

Partial survey resume is not supported.

10. SURVEY COMPLETION

Competitive survey completion must use backend-authoritative time.

Client device time must not determine:

reward position
monetary entitlement
voucher entitlement

Conceptually:

Client
   ↓
Submit answers
   ↓
Trusted backend
   ↓
Validate survey
Validate eligibility
Validate response
Record authoritative completion
   ↓
Determine score/reward consequences

Duplicate completion requests must be idempotent.

11. PROFILE SCORE ARCHITECTURE

Profile Score uses a ledger-based architecture.

Do not rely solely on:

user.profileScore += 50

Conceptually:

Activity
   ↓
Score Rule
   ↓
Profile Score Ledger Event
   ↓
Profile Score Summary

Example sources:

SURVEY_COMPLETED
PROFILE_SURVEY_COMPLETED
VIDEO_WATCHED
PHONE_VERIFIED
KYC_VERIFIED
PARTNER_VERIFIED

A materialized score summary is maintained for efficient ranking.

The ledger remains the auditable history.

Duplicate processing must not produce duplicate score.

12. CAMPAIGN ELIGIBILITY

Eligibility is evaluated independently from Profile Score.

A user may have high Profile Score but remain ineligible.

Eligibility may require:

active PAG account
active device
valid push token
notification permission
matching campaign target
survey not already completed
campaign not previously delivered where delivery is unique

Targeting may include:

everyone
profile attributes
demographics
location
organization-defined segment
13. CAMPAIGN RANKING SNAPSHOT

Scheduled ranked campaigns prepare a stable user ordering shortly before campaign execution.

Example:

Campaign starts: 10:30
Ranking preparation: approximately 10:29

The exact offset is configurable.

Ranking is based on:

profileScore DESC
registeredAt ASC
userId ASC

Once the campaign ranking is prepared:

Profile Score changes do not reorder that active campaign.

New Profile Score applies to future campaigns.

Conceptual flow:

Eligible users
     ↓
Current Profile Score
     ↓
Deterministic sort
     ↓
Campaign Member Snapshot
     ↓
Batch execution

This prevents:

skipped users
duplicate users
unstable pagination
ranking movement during execution
14. PUSH BATCH ARCHITECTURE

Push distribution is controlled.

Configuration includes:

pushBatchSize
pushBatchInterval

These are operational configuration values.

500 users / 60 seconds is not a permanent product rule.

The batch engine must not:

send
sleep
send
sleep

inside one long-running function.

Use restartable backend jobs/tasks (official Google/Firebase candidate to be evaluated during implementation).

Conceptual model:

Campaign
   ↓
Batch N becomes eligible
   ↓
Worker claims batch
   ↓
Deliver users
   ↓
Persist progress
   ↓
Schedule/allow next batch

Duplicate worker execution must not create duplicate user delivery.

15. PUSH RETRY

Automatic push retry is currently disabled by product decision.

Failed delivery:

records failure
may classify reason
may invalidate dead FCM token

but does not repeatedly push the same campaign automatically.

16. REWARD ARCHITECTURE

Profile Score and financial reward are separate.

A survey may provide:

Profile Score only
monetary reward
voucher
Profile Score + monetary reward
Profile Score + voucher

Reward rules are survey-specific.

Example:

1st      → 300 TL
2nd      → 200 TL
3rd      → 100 TL
4th–23rd → equal share of remaining pool

This is an example only.

Never hardcode this reward distribution globally.

17. REWARD RANKING

Reward position is determined by valid backend-accepted survey completion order.

It is NOT determined by push delivery order.

Example:

User A receives push first.
User B receives push later.

User B completes the survey first.

User B ranks ahead of User A for completion-based rewards.

Concurrent completions must be handled deterministically.

18. REWARD LEDGER

Financial reward changes use an auditable ledger.

Conceptually:

Survey Completion
       ↓
Reward Eligibility
       ↓
Reward Allocation
       ↓
Reward Ledger
       ↓
Reward Balance Summary

A duplicate completion or worker execution must not credit a reward twice.

Financial operations must be designed for exactly-once business effect.

19. VOUCHER ARCHITECTURE

Each applicable survey may reference a voucher pool.

Voucher allocation must be atomic.

Conceptual flow:

Eligible Completion
      ↓
Reward Rule
      ↓
Voucher Pool
      ↓
Atomic claim of AVAILABLE voucher
      ↓
ASSIGNED to user

Two users must never receive the same voucher.

Voucher codes must not appear unnecessarily in:

logs
broad queries
unrelated API responses
20. WITHDRAWAL FOUNDATION

Monetary rewards accumulate in PAG reward balance.

Conceptual flow:

Reward
   ↓
Reward Balance
   ↓
Minimum threshold reached
   ↓
User requests withdrawal
   ↓
KYC/eligibility validation
   ↓
Withdrawal processing

Possible future payout:

IBAN

PAGCoin is not currently part of implementation.

Reward storage must not be tightly coupled to a specific payout mechanism.

21. MULTI-TENANCY

Organizations are tenants.

Examples:

Ford
McDonald's

Organization-owned resources must carry explicit organization ownership.

Authorization must never depend only on:

hidden UI
URL structure
client filters

Backend authorization must verify organization membership.

Cross-tenant access is a critical security failure.

22. CUSTOMER DASHBOARD

Customer Dashboard may expose authorized aggregate information such as:

response count
answer distribution
campaign metrics
approved survey statistics

Customer users must only access organizations for which they have active membership.

The backend must derive authorized organization context.

Do not trust arbitrary browser-supplied organizationId.

23. REPORTING ARCHITECTURE

Do not calculate large dashboard statistics by repeatedly scanning all raw responses from browser clients.

Prefer:

Raw Events / Responses
        ↓
Backend aggregation
        ↓
Materialized aggregate
        ↓
Dashboard

Current profile statistics and historical survey responses are different concepts.

Profile answers may change.

Historical immutable survey responses do not.

24. CONFIGURATION

Central operational configuration should include values such as:

pushBatchSize
pushBatchInterval
rankingPreparationOffset
minimumWithdrawalAmount = TBD
dailyRewardedVideoLimit = TBD

Do not scatter these as magic numbers.

Numeric values not yet confirmed by product decisions MUST remain TBD rather than hardcoded defaults.

Admin-editable configuration is not mandatory in V1.

25. FAILURE AND IDEMPOTENCY

Operations requiring explicit idempotency include:

survey completion
Profile Score award
reward award
voucher allocation
push delivery
withdrawal creation where applicable

Use deterministic identifiers or explicit idempotency keys.

A network retry from a client must not duplicate a financial or scoring effect.

26. LOGGING

Structured backend logs should cover:

campaign lifecycle
batch execution
push failures
invalid FCM tokens
score awards
reward allocations
voucher allocation
withdrawal state changes
authorization failures

Never log:

passwords
auth tokens
service credentials
full KYC documents
unnecessary voucher codes
27. FIRESTORE COST STRATEGY

PAG must avoid:

unbounded production scans
client-side ranking of all users
repeated full-response scans for dashboards
polling-heavy statistics
unnecessary duplication of large campaign documents

Large campaign preparation should use predictable paginated/indexed operations.

Materialized summaries are permitted where they reduce repeated expensive queries.

Denormalization must always have an explicit consistency owner.

28. SCALE TARGETS

Architecture must be tested beyond small development datasets.

Push/ranking design must support at minimum scenarios around:

500
1,000
5,000
10,000
20,000+

eligible users.

Survey systems must also tolerate burst completion traffic caused by reward competition.

29. ARCHITECTURAL NON-GOALS

Current architecture does not require:

PAGCoin
blockchain
crypto wallet
external queue SaaS
external database
Kafka
end-user web application
arbitrary form builder
automatic push retry
complex campaign pause/resume engine

Do not implement these without explicit approval.

30. PHASE 1 EXIT CRITERIA

Architecture phase is complete when:

architecture is approved
Firestore data model is approved
domain ownership is clear
authority boundaries are clear
tenant isolation strategy is clear
Profile Score ledger design is clear
ranking snapshot strategy is clear
reward consistency strategy is clear
voucher allocation strategy is clear
push execution strategy is clear
required query/index strategy is understood

Only then should Firebase implementation become authoritative production code.