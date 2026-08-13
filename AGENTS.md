# AGENTS.md — PAG

## RULE 0 — UNRESOLVED QUESTIONS BLOCK EXECUTION

If there are any unanswered questions, unresolved decisions, missing requirements, or pending clarifications in the current plan or task, DO NOT begin implementation under any circumstances.

Even if the user says "Proceed", "Continue", "Start", or gives any similar execution command, you MUST NOT proceed while unanswered questions remain.

Instead, stop and respond:

**"I am waiting for answers to the pending questions before proceeding."**

Do not guess, assume, invent product rules, choose defaults, or make decisions on the user's behalf.

Implementation may begin ONLY after all pending questions have been explicitly answered or resolved by the user.

This rule has higher priority than all subsequent execution rules.


## 1. DOCUMENT PURPOSE

This file defines the mandatory development, architecture, security, testing, and product rules for the PAG project.

Every AI agent, developer, automation tool, or code-generation system working on PAG MUST read and follow this file before making architectural or implementation changes.

This document is authoritative for PAG unless a newer explicit product decision overrides it.

If a requirement is unclear:

* Do not invent product behavior.
* Do not silently make irreversible architectural decisions.
* Prefer the simplest architecture that preserves future extensibility.
* Ask for approval before introducing a new external service, database, queue provider, analytics system, notification provider, or major dependency.

---

# 2. PROJECT

Project name:

PAG

Project type:

Survey, user profiling, reward, ranking, and controlled push notification platform.

Primary product loop:

User provides information or completes approved activities
→ earns Profile Score
→ gains priority for future campaigns
→ receives important survey notifications earlier
→ completes surveys quickly
→ may earn rewards and additional Profile Score
→ gains an advantage in later campaigns.

PAG is not merely a survey application.

Core product domains are:

* User
* Profile
* Device
* Organization
* Survey
* Survey Response
* Profile Score
* Ranking
* Eligibility
* Reward
* Voucher
* Push Campaign
* Push Delivery
* Reporting
* Admin
* Customer Dashboard

---

# 3. CURRENT PLATFORM SCOPE

End-user applications:

* Native iOS application
* Native Android application

There is no end-user web application in the current scope.

Web applications:

* PAG Admin Panel
* Organization / Customer Dashboard

Customer Dashboard users may only access data belonging to organizations they are authorized to view.

Cross-organization data leakage is considered a critical security failure.

---

# 4. BACKEND PLATFORM

Firebase is the primary backend platform.

Initially expected Firebase services:

* Firebase Authentication
* Cloud Firestore
* Firebase Cloud Messaging
* Cloud Functions
* Firebase Storage where required

Official Firebase / Google services and SDKs are preferred.

Do not add another database, backend platform, queue SaaS, notification provider, analytics platform, authentication provider, or similar infrastructure without explicit approval.

---

# 5. ARCHITECTURAL PRINCIPLES

The system MUST be designed with the following principles:

1. Backend authority
2. Idempotency
3. Deterministic behavior
4. Auditability
5. Tenant isolation
6. Atomic reward operations
7. Controlled push delivery
8. Minimal trust in client applications
9. Configurable operational limits
10. Clear separation of business domains

Do not place critical business authority in iOS, Android, or web clients.

The backend is authoritative for:

* Profile Score
* Survey completion time
* Reward eligibility
* Reward ranking
* Reward assignment
* Push eligibility
* Campaign ranking
* Voucher assignment
* Withdrawal state
* KYC-related privileges

---

# 6. DOMAIN SEPARATION

The following concepts MUST NOT be merged into a single field or abstraction:

ProfileScore
Ranking
Eligibility
PushPriority
RewardBalance
SurveyReward
Voucher
Withdrawal

Example:

A user may have a high Profile Score but still be ineligible for a campaign because:

* notification permission is disabled,
* the active device is unavailable,
* the user does not match the target audience,
* the user already received that campaign,
* the user already completed the survey.

Similarly:

Profile Score is NOT money.

Reward Balance is NOT Profile Score.

Survey completion ranking is NOT push ranking.

These concepts must remain independent.

---

# 7. USER ACCOUNT

A user has one PAG account.

Authentication may include:

* Phone
* Email
* Additional approved authentication methods later

The account and device must be treated as separate concepts.

The architecture must support an active-device model.

Do not assume that:

user == device

A user account may contain information such as:

* identity
* contact information
* registration date
* verification state
* profile attributes
* Profile Score
* reward balance summary
* active device reference

Sensitive identity and KYC information must not be mixed casually into ordinary public profile documents.

---

# 8. KYC

KYC is not required merely to participate in ordinary PAG activities.

KYC may become required when the user wants to withdraw monetary rewards.

KYC status must therefore be modeled separately from:

* normal account status
* Profile Score
* survey eligibility

Possible conceptual states may include:

* NOT_REQUIRED
* NOT_STARTED
* PENDING
* VERIFIED
* REJECTED

Exact production states must be finalized before implementation.

PAGCoin is NOT part of the current implementation scope.

Do not add blockchain, token, wallet, or PAGCoin infrastructure unless explicitly requested in a future phase.

---

# 9. SURVEY MODEL

A survey supports a maximum of:

3 questions.

Initial question type:

Single Select

Do not build unnecessary complexity for unsupported question types in the first release.

However, avoid an implementation that makes additional question types impossible in the future.

Each survey may have:

* start time
* end time
* owner
* target audience
* Profile Score reward rules
* monetary reward rules
* voucher reward rules
* campaign association
* reporting configuration

A user who exits a partially completed survey does NOT resume from the last question.

If the user leaves after question 2 of 3 and returns later, the survey starts again from question 1.

Do not persist a resumable partial-completion state unless the product requirement changes.

---

# 10. SURVEY OWNERSHIP

At minimum, surveys may be owned by:

PAG
or
ORGANIZATION

Conceptually:

surveyOwnerType = PAG | ORGANIZATION

PAG surveys:

PAG generally asks broad questions intended to learn about users, preferences, behavior, demographics, or general interests.

PAG surveys are not primarily intended to promote a specific commercial product.

Organization surveys:

Organizations such as McDonald's, Ford, or other customers may create surveys concerning:

* their products
* services
* promotions
* customer preferences
* market research
* campaign effectiveness
* product awareness

Organizations may provide monetary or voucher rewards.

Do not create two completely separate survey engines for PAG and organization surveys.

Use one common survey domain with ownership and configuration differences.

---

# 11. SURVEY RESPONSE MUTABILITY

There are different response rules by survey category.

## Profile Surveys

Profile survey answers MAY change later.

Examples:

* favorite football team
* interests
* preference information
* other profile attributes

If the answer changes:

* current profile data changes,
* segmentation changes,
* live reporting changes,
* previously earned Profile Score is NOT recalculated merely because the answer changed.

Example:

A user originally selects Team A and later changes to Team B.

The user should thereafter belong to Team B targeting and statistics.

Historical Profile Score previously earned does not automatically change.

## PAG Surveys

Submitted answers are immutable.

## Organization Surveys

Submitted answers are immutable.

Do not provide edit behavior for immutable survey responses.

---

# 12. PROFILE SCORE

The user-facing scoring concept is called:

Profile Score

Do not casually rename it to generic "score" in product-facing code or UI where the distinction matters.

Profile Score may be earned from several sources.

Current planned sources include:

* Survey completion
* Profile survey participation
* Advertisement / video viewing
* Phone verification
* Identity / KYC verification
* Future partner organization verification
* Future approved engagement activities

Example future activity:

A user may watch up to a configured number of rewarded advertising videos per day.

The exact scoring formula is NOT globally fixed.

Different surveys or activities may award different Profile Score values.

There is currently:

* no negative Profile Score
* no maximum Profile Score

---

# 13. PROFILE SCORE LEDGER

Do NOT implement Profile Score solely as:

user.profileScore += value

without an auditable source history.

Use a ledger/event-oriented model.

Conceptual examples:

SURVEY_COMPLETED
PROFILE_SURVEY_COMPLETED
VIDEO_WATCHED
PHONE_VERIFIED
KYC_VERIFIED
PARTNER_VERIFIED

Each Profile Score change should have traceable metadata such as:

* userId
* sourceType
* sourceId
* scoreDelta
* createdAt
* idempotencyKey
* metadata where required

A cached or materialized Profile Score total may be stored for efficient ranking.

However, the authoritative history must remain traceable.

Duplicate processing must not award Profile Score twice.

---

# 14. PROFILE SCORE TIMING

Profile Score should be reflected as quickly as reasonably possible.

This is an important product requirement because Profile Score determines priority in future push campaigns.

However:

Correctness is more important than UI immediacy.

If eventual processing is temporarily necessary, the architecture must still guarantee that awarded score is eventually reflected correctly and exactly once.

---

# 15. RANKING

Primary campaign ranking:

Profile Score descending.

Tie-breaker:

Earlier PAG account registration time wins.

Recommended deterministic final tie-breaker:

userId ascending.

Conceptual ordering:

profileScore DESC
registeredAt ASC
userId ASC

This ordering must be deterministic.

Never use unstable/random tie-breaking for campaign delivery ranking.

---

# 16. CAMPAIGN RANKING SNAPSHOT

For scheduled ranked campaigns, the effective campaign order must be determined shortly before campaign start.

Example:

Campaign start:

10:30

The backend may prepare the ranking near:

10:29

Exact preparation offset must be configurable and implementation-dependent.

The key product rule is:

Once the campaign delivery order has been established, Profile Score changes during that campaign must NOT reorder users inside that active campaign.

New Profile Score earned during the campaign applies to future campaign rankings.

This prevents:

* duplicate processing
* skipped users
* unstable ordering
* moving targets during batch processing

The implementation may use a snapshot, deterministic campaign membership records, or an equivalent reliable approach.

Do not repeatedly query a changing global ranking in a way that can reorder already active campaign users.

---

# 17. ELIGIBILITY

A user may enter a push campaign only if the user satisfies the campaign eligibility criteria.

Current minimum concepts:

* PAG application is installed / active device exists
* Notification permission is available
* User matches campaign audience
* User has not already received the same campaign where duplicate delivery is prohibited

Audience may be:

* all eligible users
* demographic segment
* profile segment
* geographic segment
* organization-defined target segment

Example:

A survey targeting only women must not be pushed to users outside that target audience.

Targeting rules must be enforced by backend campaign logic.

Do not rely only on hiding content in the mobile UI.

---

# 18. LIVE PROFILE SEGMENTATION

Profile answers may change.

Current profile values should drive current segmentation.

Example:

A user changes a football-team answer.

Future campaigns should use the new answer.

Reports that are intended to represent current profile distribution should also reflect the new answer.

Historical immutable survey responses must remain historical.

Do not overwrite immutable historical survey data merely to make profile statistics easier.

---

# 19. PUSH CAMPAIGNS

Push notifications are not limited to surveys.

Supported conceptual campaign categories may include:

* SURVEY
* ANNOUNCEMENT
* PROMOTION
* INFORMATIONAL

Example announcement:

"Tomorrow a 10,000 TL reward survey will start."

A user may belong to multiple campaigns.

However, PAG should not overwhelm users with excessive survey or push frequency.

Future frequency-control rules should be implementable.

Do not hardcode an assumption that only one active campaign can exist per user.

---

# 20. SCHEDULED PUSH START

Campaigns may require approval.

After final approval, a campaign can be scheduled for a specific date and time.

The backend must start processing based on the scheduled campaign time.

Campaign execution must NOT depend on:

* an admin browser remaining open
* a mobile client remaining open
* a web client executing timers

Scheduling and campaign execution belong on the backend.

---

# 21. PUSH BATCHING

Push distribution is intentionally controlled and may be delivered in batches.

Initial conceptual values such as:

500 users
60 seconds

are NOT permanent product constants.

Actual values must be determined based on:

* Firebase / FCM behavior
* APNs behavior
* operational limits
* infrastructure capacity
* cost
* load testing
* desired user experience

Values such as:

pushBatchSize
pushBatchInterval

must exist in one centralized configuration location.

Do not spread magic numbers across the source code.

An admin UI for these values is NOT required unless later requested.

Central configuration is sufficient.

---

# 22. PUSH DELIVERY FLOW

PAG does NOT wait for users in a previous batch to answer before sending the next configured batch.

Conceptual flow:

Batch 1 sends
→ configured interval
→ Batch 2 sends
→ configured interval
→ Batch 3 sends

Users in earlier batches may or may not have completed the survey.

There is currently:

* no survey slot reservation
* no click reservation
* no waiting for batch responses
* no requirement to fill one batch before the next batch starts

The competitive advantage is receiving access earlier.

---

# 23. PUSH DELIVERY DOES NOT DETERMINE REWARD RANK

This rule is critical.

Push order determines ACCESS PRIORITY.

Push order does NOT directly determine survey reward ranking.

Reward ranking is determined by valid survey completion order as accepted by the backend.

Example:

User A receives the push earlier.

User B receives the push in a later batch but completes the survey before User A.

User B may rank higher in the survey reward ordering.

---

# 24. SERVER-AUTHORITATIVE COMPLETION TIME

Never trust a client-provided timestamp for competitive survey completion ranking.

The backend must determine or validate the authoritative completion time.

Client values such as:

"completedAt": "10:30:01"

cannot by themselves decide financial reward ranking.

This rule prevents:

* timestamp manipulation
* device clock manipulation
* forged ranking
* reward fraud

The implementation must also handle near-simultaneous completions deterministically.

---

# 25. PUSH IDEMPOTENCY

Every push campaign must have a unique campaign identifier.

A user must not accidentally receive the same campaign multiple times due to:

* duplicate worker execution
* Cloud Function re-entry
* concurrency
* task duplication
* process restart

Use deterministic/idempotent delivery records.

Conceptual identifier:

campaignId + userId

or an equivalent deterministic key.

Before sending a delivery that must be unique, backend logic must ensure that another worker has not already claimed or processed it.

---

# 26. PUSH RETRY POLICY

Current PAG product decision:

Do NOT automatically retry failed push notifications.

If a push delivery fails:

* record the failure
* classify the error where useful
* handle invalid/dead tokens appropriately
* do not automatically keep sending repeated push attempts

Invalid or unregistered FCM tokens may be disabled or removed from active-device eligibility.

Do not implement automatic push retry behavior unless explicitly approved later.

---

# 27. PUSH CAMPAIGN STATE

Campaigns should have explicit backend state.

Conceptual states may include:

DRAFT
APPROVED
SCHEDULED
QUEUED
RUNNING
COMPLETED
FAILED
CANCELLED

PAUSED / RESUMED support is NOT currently a mandatory product requirement.

Do not build unnecessary pause/resume complexity unless requested.

Cancellation may be supported if technically reasonable.

Exact production states must be finalized during architecture design.

---

# 28. PUSH JOB EXECUTION

Never implement a long-running Cloud Function that does:

send batch
sleep 60 seconds
send batch
sleep 60 seconds
repeat for hours

This architecture is prohibited.

Use restartable, backend-managed job/batch execution.

The design must tolerate:

* process restarts
* duplicate function execution
* concurrent workers
* partial batch completion

If official Google/Firebase scheduling or task mechanisms are required, evaluate those first.

Do not introduce an external queue SaaS without approval.

---

# 29. REWARD SYSTEM

Rewards and Profile Score are separate domains.

A survey may award:

* Profile Score
* Monetary reward
* Voucher / gift code
* both Profile Score and reward

A user who completes an eligible survey within its valid period may receive the configured Profile Score.

Users who qualify under the survey reward ranking may additionally receive money or a voucher.

Not every survey participant must receive a monetary reward.

Reward rules are survey-specific.

---

# 30. RANKED MONETARY REWARDS

Surveys may define ranked reward distributions.

Example:

Total monetary reward pool:

1,000 TL

Example distribution:

1st place → 300 TL
2nd place → 200 TL
3rd place → 100 TL

Remaining:

400 TL

may be distributed equally among the next 20 eligible users.

This is only an example.

Do not hardcode this exact distribution.

Reward rules must be survey-configurable.

---

# 31. REWARD ENGINE

Reward calculation must be authoritative on the backend.

The client must never decide:

* reward amount
* reward rank
* voucher entitlement
* cash entitlement
* final balance

Reward processing must be idempotent.

The same valid survey completion must not create the same reward twice.

Every financial reward event must be auditable.

Conceptual reward ledger fields may include:

* rewardEventId
* userId
* surveyId
* rewardType
* amount
* currency
* voucherId where applicable
* source
* status
* createdAt
* idempotencyKey

Exact production schema will be determined during architecture phase.

---

# 32. REWARD BALANCE

Monetary rewards accumulate in a user reward balance.

Money is not necessarily paid immediately to an external bank account.

Expected flow:

User earns reward
→ reward appears in PAG balance
→ balance reaches minimum withdrawal threshold
→ user requests withdrawal
→ withdrawal is processed

Minimum withdrawal threshold will exist.

Exact amount is not yet defined.

Do not invent a withdrawal amount.

---

# 33. WITHDRAWALS

Withdrawals are user-requested after the configured minimum threshold is reached.

Possible future payout destination:

IBAN

IBAN payout is not yet fully specified.

PAGCoin is not part of early phases.

The architecture should avoid unnecessarily coupling the reward ledger to a specific payout method.

Conceptually separate:

Reward Balance
Withdrawal Request
Payout Method
Payout Processing

KYC may be required before monetary withdrawal is allowed.

---

# 34. VOUCHER / GIFT CODE POOLS

Each applicable survey may have its own voucher/code pool.

Codes must be assigned safely.

A voucher code must never be allocated to two different users.

Voucher claiming/allocation must use transactional or otherwise atomic backend behavior.

Conceptual voucher states may include:

AVAILABLE
RESERVED
ASSIGNED
REDEEMED
DISABLED

Exact states must be determined during implementation.

A voucher should be traceable to:

* organization
* survey
* assigned user
* assignment time
* status

Voucher codes must not be exposed unnecessarily in admin APIs, logs, or client payloads.

---

# 35. ORGANIZATIONS

Commercial customers are modeled as organizations.

Examples:

* Ford
* McDonald's
* other PAG customers

An organization may have:

* users
* surveys
* reward pools
* voucher pools
* reports
* campaigns
* dashboard access

Every organization-owned resource must carry reliable tenant ownership information.

Do not infer tenant ownership from UI routes alone.

---

# 36. CUSTOMER DASHBOARD

Organizations may receive access to a web dashboard containing statistics for their authorized surveys.

Dashboard data may include:

* response counts
* live survey statistics
* answer distributions
* campaign metrics
* other approved aggregate information

Customer dashboards must be read-authorized at backend/security-rule level.

A user from Organization A must never be able to access Organization B's data by manipulating:

* URL
* document id
* request body
* API parameter
* Firestore query

Tenant isolation is mandatory.

---

# 37. PAG ADMIN PANEL

PAG will have a web admin panel.

Expected future responsibilities may include:

* organization management
* survey creation
* campaign preparation
* campaign approval
* campaign scheduling
* reward configuration
* voucher pool management
* reporting
* operational monitoring
* user support operations

Admin operations that affect money, vouchers, ranking, or campaign execution should be auditable.

Do not expose privileged admin capabilities directly through an untrusted client without backend authorization.

---

# 38. FIRESTORE DATA MODEL

Do not prematurely freeze collection names before the architecture/data-model phase.

Expected conceptual domains include:

Users
Devices
Organizations
Surveys
SurveyResponses
ProfileScoreLedger
ProfileScoreSummary
Campaigns
CampaignMembers / RankingSnapshot
PushDeliveries
RewardLedger
RewardBalance
VoucherPools
Vouchers
WithdrawalRequests

This is conceptual.

The production schema must be optimized for:

* Firestore query patterns
* index requirements
* atomicity
* cost
* high-volume campaign reads
* customer isolation
* reporting needs

Do not blindly normalize Firestore as if it were a relational database.

Do not blindly denormalize without an update-consistency plan.

---

# 39. FIRESTORE COST AWARENESS

Every architecture decision involving large user populations must consider Firestore read/write cost.

Especially review:

* ranking preparation
* campaign member creation
* live dashboards
* repeated profile-score reads
* survey aggregates
* push delivery tracking

Do not implement polling-heavy dashboards when backend aggregation or subscriptions can solve the requirement more efficiently.

Do not run unbounded collection scans in production flows.

---

# 40. FIREBASE SECURITY RULES

Security Rules are mandatory.

Rules must follow least privilege.

Clients must not be able to directly modify authoritative fields such as:

* Profile Score
* reward balance
* reward rank
* voucher assignment
* withdrawal approval
* campaign execution state
* organization ownership
* admin roles

Sensitive writes must flow through trusted backend logic where appropriate.

Rules must be tested.

Do not treat security rules as a final deployment step.

They are part of architecture.

---

# 41. CLIENT TRUST MODEL

Never trust a client simply because the application is distributed through an official app store.

Assume client requests may be:

* replayed
* modified
* scripted
* reverse engineered
* sent outside the official application

The backend must validate important actions.

Examples:

Do not trust:

"I watched the video."
"I completed the survey at this timestamp."
"I earned 300 TL."
"My Profile Score is 1,500."
"I am eligible for this voucher."

Backend rules must verify or derive authoritative state.

---

# 42. CONCURRENCY

Concurrency must be considered from the beginning.

Multiple backend executions may attempt to:

* process the same survey completion
* allocate the same voucher
* award the same reward
* update the same Profile Score
* send the same push
* process the same campaign batch

Use transactions, atomic operations, idempotency keys, deterministic document IDs, claims, or equivalent mechanisms.

"Cloud Functions probably won't run twice" is not an acceptable assumption.

---

# 43. FINANCIAL CONSISTENCY

Reward-related code is financial logic.

Any operation that changes:

* reward balance
* reward ledger
* voucher ownership
* withdrawal state

must be designed for failure between steps.

Avoid flows such as:

1. increase balance
2. write reward event

when failure between those operations can produce inconsistency.

Prefer atomic/transactional patterns whenever technically possible.

Do not silently repair reward balances in client code.

---

# 44. REPORTING

Reporting requirements include live/changing data.

Profile survey answers may change and dashboard statistics should reflect current answers where the report represents current user profile state.

Immutable survey responses remain historical.

Where high-volume aggregates are needed, do not repeatedly scan every response from the client.

Plan backend aggregation/materialization where justified.

Reporting architecture must distinguish:

* current profile statistics
* historical survey responses
* campaign statistics
* reward statistics

---

# 45. LOGGING

Critical backend operations should produce structured logs.

Important events include:

* campaign start
* campaign batch execution
* campaign completion
* push failures
* invalid device tokens
* Profile Score award
* reward calculation
* voucher allocation
* withdrawal state changes
* authorization failures
* unexpected duplicate processing

Logs must not expose:

* passwords
* auth tokens
* full identity documents
* sensitive voucher codes
* unnecessary KYC data
* private secrets

---

# 46. PRIVACY

PAG may process profile, demographic, location, identity, and reward data.

Collect only data required by approved product functionality.

Do not add tracking fields "just in case."

Location-based targeting does not automatically justify continuous precise location tracking.

Use the least sensitive data model capable of satisfying the approved product requirement.

Sensitive data access must be role-controlled.

---

# 47. DEPENDENCY POLICY

Prefer:

* official Firebase SDKs
* official Google SDKs
* native platform SDKs
* established framework components already approved for the project

Before introducing a new third-party dependency, determine:

* why it is required
* whether existing platform capabilities can solve it
* security implications
* maintenance status
* licensing
* size/performance impact

New infrastructure-level dependencies require explicit approval.

An agent may NOT independently introduce:

* external database
* queue SaaS
* external notification provider
* external authentication provider
* analytics SaaS
* new backend platform

---

# 48. SECRET MANAGEMENT

Never commit secrets.

This includes:

* Firebase service account credentials
* API keys that must remain server-side
* private certificates
* APNs secrets
* signing credentials
* KYC provider secrets
* payout credentials

Use platform-approved secret/environment mechanisms.

Do not place production secrets in:

* source control
* sample code
* screenshots
* logs
* AGENTS.md

---

# 49. BUILD DISCIPLINE

An agent must not claim a task is complete merely because code was generated.

Before declaring a code task complete, perform the applicable checks:

* build
* type check
* lint
* unit tests
* relevant integration tests

If a check cannot be executed, state clearly:

* which check was not run
* why
* what remains unverified

Never say:

"Everything works"

without evidence.

---

# 50. TESTING STANDARD

Unit tests alone are insufficient for critical PAG backend systems.

Tests must especially cover boundary and concurrency conditions.

Push engine scenarios should include:

* 499 eligible users
* 500 eligible users
* 501 eligible users
* 1,000 eligible users
* 10,000 eligible users
* duplicate worker execution
* duplicate campaign delivery attempt
* invalid FCM token
* ranking ties
* Profile Score change during active campaign
* campaign cancellation
* batch boundary behavior

The actual configured batch size may differ from 500; boundary testing must also use:

batchSize - 1
batchSize
batchSize + 1

---

# 51. SURVEY TESTING

Survey tests should include:

* 1-question survey
* 2-question survey
* 3-question survey
* attempt to create more than 3 questions
* immutable PAG response
* immutable organization response
* editable profile response
* exit after question 2 and restart behavior
* survey before start time
* survey after end time
* duplicate completion submission
* simultaneous completion requests
* audience mismatch

---

# 52. PROFILE SCORE TESTING

Tests should include:

* Profile Score awarded once
* duplicate event execution
* multiple score sources
* profile answer changed after score earned
* tie on Profile Score
* tie on registration timestamp
* campaign snapshot before score change
* score earned during active campaign
* score applied to next campaign

---

# 53. REWARD TESTING

Reward engine tests are mandatory.

Include:

* first-place reward
* second-place reward
* third-place reward
* equal-distribution ranges
* no reward outside qualifying rank
* duplicate completion
* simultaneous completion
* reward event duplicate execution
* balance update exactly once
* survey reward pool exhaustion
* invalid reward configuration

Financial correctness has higher priority than cosmetic features.

---

# 54. VOUCHER TESTING

Voucher tests must include:

* single voucher assignment
* simultaneous allocation attempts
* pool exhaustion
* disabled voucher
* already assigned voucher
* duplicate survey completion
* exactly one code per entitlement
* no cross-survey pool leakage
* no cross-organization voucher leakage

---

# 55. AUTHORIZATION TESTING

Tenant isolation must be explicitly tested.

Examples:

Organization A attempts to read Organization B survey.

Organization A attempts to request Organization B statistics.

Organization user attempts PAG admin operation.

Normal user attempts to alter Profile Score.

Normal user attempts to alter reward balance.

Normal user attempts to assign a voucher.

All such actions must fail.

---

# 56. PERFORMANCE AND LOAD TESTING

Before production launch, test realistic volumes for:

* eligible user ranking
* campaign snapshot creation
* push delivery batches
* survey response bursts
* reward assignment bursts
* live report aggregation

Reward surveys may cause many users to respond within seconds.

Design for burst traffic.

Do not only test average traffic.

---

# 57. TIME HANDLING

All backend business timestamps must use a consistent server-side standard.

Store timestamps in a canonical backend format.

User-visible local times may be formatted on clients.

Critical campaign and reward logic must not depend on device clock.

This applies especially to:

* campaign starts
* survey starts
* survey expiration
* completion ranking
* reward eligibility
* withdrawal state

---

# 58. CONFIGURATION

Operational values must be centralized.

Examples:

* push batch size
* push batch interval
* campaign snapshot preparation offset
* minimum withdrawal threshold
* rewarded-video daily limits
* future rate-control limits

Do not scatter these values as magic numbers.

Some configuration may initially remain backend code/config rather than admin-editable.

That is acceptable.

The important requirement is centralized ownership.

---

# 59. FEATURE FLAGS / FUTURE FEATURES

Do not prematurely implement unapproved future features.

Known future possibilities include:

* PAGCoin
* additional payout methods
* additional survey question types
* partner institution integrations
* more complex campaign controls
* additional Profile Score sources

Architecture should avoid blocking reasonable future additions.

However:

"May exist later" is not permission to build it now.

---

# 60. NO PREMATURE ABSTRACTION

Do not build a generic enterprise platform before PAG's actual requirements need it.

Examples:

Current survey limit is 3 questions and Single Select.

Do not create a massive dynamic form-builder system merely because it might be useful someday.

Current payout flow is basic reward balance + withdrawal request.

Do not build a cryptocurrency treasury system.

Current push workflow is controlled batch delivery.

Do not introduce Kafka or an external queue SaaS without demonstrated need and approval.

Prefer simple, observable, replaceable architecture.

---

# 61. COMPLETION HONESTY

Agents must describe implementation status truthfully.

Use distinctions such as:

* designed
* implemented
* locally tested
* integration tested
* load tested
* deployed
* production verified

Do not collapse these into "done."

A feature is not production-ready merely because:

* code compiles
* one manual test passes
* mocked data works
* UI appears complete

---

# 62. REQUIRED DEVELOPMENT ORDER

Do not begin product implementation out of sequence without a reason.

Current development phases:

## PHASE 0 — Product Requirements

Define and approve:

* product rules
* terminology
* survey behavior
* Profile Score behavior
* reward behavior
* push behavior
* user roles
* targeting
* payout concepts

Status:

Substantially defined.

## PHASE 1 — Architecture & Firebase Data Model

Create:

* system architecture
* domain boundaries
* Firestore schema
* index plan
* security model
* tenant model
* transactional boundaries
* campaign execution design
* reward execution design

No broad feature coding before architecture approval.

## PHASE 2 — Firebase Project & Security

Configure:

* Firebase project
* Authentication
* Firestore
* Cloud Functions
* FCM
* Security Rules
* environment separation
* secret handling

## PHASE 3 — User / Profile / Device

Implement:

* authentication
* account
* profile
* active device
* notification eligibility
* verification foundations

## PHASE 4 — Survey Engine

Implement:

* PAG surveys
* organization surveys
* profile surveys
* max 3 questions
* Single Select
* immutable/mutable response rules
* schedule
* audience rules

## PHASE 5 — Profile Score & Ranking Engine

Implement:

* Profile Score ledger
* score summary
* ranking
* deterministic tie-breaking
* campaign ranking preparation
* snapshot behavior

## PHASE 6 — Reward Engine

Implement:

* survey reward configurations
* reward ranking
* monetary rewards
* reward ledger
* reward balance
* voucher pools
* voucher allocation
* withdrawal request foundation

## PHASE 7 — Push Campaign Engine

Implement:

* campaign creation
* approval state
* scheduling
* eligibility
* ranking-based campaign membership
* controlled batch processing
* push delivery idempotency
* FCM token management

## PHASE 8 — PAG Admin & Customer Dashboard

Implement:

* PAG admin operations
* organization access
* survey management
* campaign management
* reports
* live statistics
* reward/voucher operational views

## PHASE 9 — Native Mobile Applications

Implement:

* iOS
* Android
* authentication
* surveys
* Profile Score
* rewards
* notifications
* profile
* withdrawal-request flow where applicable

## PHASE 10 — Reliability / Regression / Load Testing

Validate:

* concurrency
* idempotency
* security
* tenant isolation
* push batching
* survey bursts
* financial consistency
* voucher allocation
* ranking correctness
* production-scale behavior

---

# 63. VISUAL DESIGN

PAG visual identity is NOT yet defined.

Currently there is:

* no approved logo
* no approved color palette
* no approved typography
* no approved icon language
* no approved UI theme

Agents MUST NOT invent a permanent PAG brand identity.

Do not treat temporary development colors, logos, icons, or fonts as approved brand assets.

Visual identity rules will be defined separately after this AGENTS.md.

Until visual rules are approved:

* keep UI styling neutral
* isolate theme tokens
* do not hardcode branding colors throughout components
* use replaceable design tokens
* avoid creating permanent visual assets

Expected future design tokens should support concepts such as:

* primary
* secondary
* background
* surface
* textPrimary
* textSecondary
* success
* warning
* error
* border
* accent

But actual values must not be finalized without design approval.

---

# 64. AGENT FINAL CHECKLIST

Before completing any PAG implementation task, verify:

* Does this follow PAG product rules?
* Is backend authority preserved?
* Is the operation idempotent where necessary?
* Can duplicate execution cause money, score, voucher, or push duplication?
* Is tenant isolation preserved?
* Are clients prevented from changing authoritative data?
* Are configuration values centralized?
* Are new dependencies approved?
* Are secrets protected?
* Are failure states handled?
* Have relevant tests been run?
* Is the claimed completion status accurate?
* Did the implementation accidentally add an unapproved future feature?
* Did the implementation introduce branding assumptions before visual identity approval?

If any answer is uncertain, do not silently assume success.

Document the uncertainty or resolve it before declaring completion.

---

# 65. CURRENT PRODUCT TERMINOLOGY

Use these terms consistently:

PAG
Profile Score
Survey
Profile Survey
PAG Survey
Organization Survey
Organization
Campaign
Eligibility
Ranking
Ranking Snapshot
Reward
Reward Balance
Reward Ledger
Voucher Pool
Withdrawal Request
Active Device

Avoid creating alternative names for the same domain concept without a specific reason.

---

# 66. CURRENT NON-GOALS

Unless explicitly approved later, the following are NOT current implementation requirements:

* PAGCoin
* blockchain infrastructure
* crypto wallet
* end-user web application
* arbitrary survey form builder
* automatic push retry system
* external queue SaaS
* external database
* external notification provider
* complex pause/resume campaign orchestration
* unsupported question types


# PAG — PLATFORM & MONOREPO ADDENDUM

## MONOREPO STRUCTURE

PAG is developed as a single monorepo.

Repository root:

`pagApp/`

Expected top-level structure:

```text
pagApp/
├── apps/
│   ├── ios/
│   ├── android/
│   ├── admin-web/
│   └── customer-web/
├── packages/
│   ├── api-contracts/
│   ├── design-tokens/
│   └── shared-config/
├── backend/
│   ├── functions/
│   └── firebase/
├── docs/
│   ├── DESIGN_SYSTEM.md
│   └── ARCHITECTURE.md
├── AGENTS.md
└── README.md
```

Do not create separate repositories for iOS, Android, admin web, customer web, or backend unless explicitly approved later.

---

# NATIVE MOBILE TECHNOLOGY

PAG mobile applications are native.

## iOS

Technology:

* Swift
* SwiftUI

The iOS project will be created manually using Xcode.

Agents must NOT generate a replacement Xcode project or recreate the project structure unless explicitly requested.

Expected project location:

`pagApp/apps/ios/`

The Xcode project should live directly under this location.

Avoid accidental nested structures such as:

`apps/ios/ios/...`

The preferred structure is conceptually:

```text
apps/
└── ios/
    ├── PAG.xcodeproj
    └── PAG/
```

Exact Xcode-generated support files may differ.

---

## Android

Technology:

* Kotlin
* Jetpack Compose

Expected Android project location:

`pagApp/apps/android/`

Do not introduce Flutter, React Native, Xamarin, Capacitor, or another cross-platform mobile framework unless explicitly approved.

---

# MOBILE DEVELOPMENT STRATEGY

iOS and Android development will proceed in parallel.

The first physical test device is an iPhone.

This means:

* early device validation may happen on iOS first,
* this does NOT make PAG an iOS-first product architecture,
* Android must not be treated as a later rewrite,
* shared API contracts must support both platforms from the beginning.

Feature behavior should remain functionally consistent across both platforms unless a platform-specific UX rule is intentionally approved.

Do not force identical visual implementation where Apple and Android platform conventions differ.

Use:

* SwiftUI-native patterns on iOS
* Jetpack Compose-native patterns on Android

while preserving the same PAG business behavior.

---

# WEB TECHNOLOGY

PAG web applications will run on Vercel.

Approved web stack:

* Next.js
* TypeScript
* React
* Vercel

Applications:

* PAG Admin Web
* PAG Customer Web

Expected locations:

`apps/admin-web/`

`apps/customer-web/`

---

# WEB BACKEND ACCESS

Privileged web operations must use a server-side API layer.

Preferred flow:

```text
Browser
→ Next.js Server / API
→ Firebase Admin SDK
→ Firebase services
```

Firebase Admin SDK must run only in trusted server-side environments.

Never expose Firebase Admin credentials or service-account material to the browser.

Do not import `firebase-admin` into client-side React components.

Privileged operations such as:

* Profile Score modification
* Reward modification
* Voucher allocation
* Withdrawal processing
* Campaign execution
* Organization administration
* privileged reporting

must be handled through trusted server-side code.

---

# API CONTRACTS

iOS, Android, Admin Web, and Customer Web must not independently invent different backend payload structures for the same operation.

Shared API contracts must be documented centrally.

Where technically practical, web/backend TypeScript types may be shared through:

`packages/api-contracts/`

Native applications must implement compatible models based on the same documented API contract.

Backend API evolution must consider all active clients.

Breaking contract changes require explicit consideration of:

* iOS compatibility
* Android compatibility
* Admin Web compatibility
* Customer Web compatibility

---

# DESIGN TOKENS

PAG visual identity is now partially approved.

Approved visual direction:

* dark navy / midnight foundation
* electric lime / green primary brand accent
* visual language should communicate trust, progress, priority, and reward

Primary approved app-icon direction:

* dark navy rounded-square background
* lime PAG / P pulse symbol
* modern, minimal, premium appearance

The green accent may suggest:

* reward
* progress
* gain
* priority

The dark navy foundation may suggest:

* trust
* stability
* security

Exact production token values will be maintained in:

`docs/DESIGN_SYSTEM.md`

Where feasible, shared semantic token definitions should also exist under:

`packages/design-tokens/`

Do not copy raw hex values throughout application components.

Use semantic tokens such as:

* brandPrimary
* brandAccent
* backgroundPrimary
* surfacePrimary
* textPrimary
* textSecondary
* reward
* success
* warning
* error
* border

The PAG lime brand color must NOT automatically be reused as the generic success-state color.

Brand accent and semantic success are separate concepts.

---

# BRAND ASSETS

Do not redraw, reinterpret, or replace the approved PAG icon direction without approval.

Once final production logo assets are approved, maintain:

* master logo
* app icon
* monochrome variant
* dark-background variant
* light-background variant

as controlled brand assets.

Temporary generated previews are references until final export assets are approved.

---

# PLATFORM-SPECIFIC UI RULE

PAG should share one brand identity, but native applications should respect platform conventions.

For example:

iOS may use:

* NavigationStack
* native sheets
* native haptics
* SwiftUI controls where appropriate

Android may use:

* Compose Navigation
* Material-compatible interaction patterns
* Android-native system behavior

Do not make Android look like an iPhone application.

Do not make iOS look like an Android Material clone.

Shared branding does not mean identical platform chrome.

---

# DEVELOPMENT PRIORITY

Because the first physical test device is an iPhone, initial end-to-end device testing may occur on iOS.

However:

Every significant mobile feature should be tracked for both:

* iOS
* Android

A feature must not be described as fully mobile-complete if only one platform is implemented.

Use explicit completion terminology, for example:

* iOS implemented
* Android pending

or:

* iOS tested on device
* Android emulator tested

rather than simply:

"Mobile complete."
 ## CONCISE COMPLETION REPORT RULE

All task completion reports MUST be short and result-focused.

Do NOT produce long walkthroughs, detailed implementation narratives, or repeat the original task.

Default completion report format:

1. **Completed** — Maximum 3-5 short bullets describing what was actually done.
2. **Verification** — Only final test/build results.
3. **Blocker / TBD** — Include only if something remains unresolved.

Rules:
- Maximum ~10-15 lines by default.
- Do not list every modified file unless explicitly requested.
- Do not explain implementation details unless they are important.
- Do not repeat successful tests individually when a single summary is enough.
- Do not include a "Next Steps" section unless explicitly requested.
- Never claim completion if required work, tests, or builds failed.

Example:

### Completed
- Portal Email/Password authentication implemented.
- First-login password change enforced.
- Super Admin provisioning and portal authorization completed.

### Verification
- Backend: 33/33 PASS
- Admin Web: BUILD SUCCESS
- Marketing Web: BUILD SUCCESS

### Blocker
None.


Keep PAG focused on the approved product.
