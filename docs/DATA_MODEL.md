PAG — FIRESTORE DATA MODEL

Document: docs/DATA_MODEL.md
Status: Phase 1 Data Model Baseline
Database: Cloud Firestore

1. PURPOSE

This document defines the conceptual production Firestore model for PAG.

The goals are:

clear domain boundaries
efficient PAG mobile queries
controlled Firestore cost
tenant isolation
deterministic ranking
idempotent processing
auditable Profile Score
auditable financial rewards
safe voucher allocation
scalable push campaigns

Collection names in this document are recommended baseline names.

Implementation may refine names during Firebase setup, but domain boundaries and security principles must remain intact.

2. DESIGN PRINCIPLES

The Firestore model follows these rules:

Do not model Firestore as a relational SQL database.
Do not create unbounded client queries.
Do not allow clients to modify authoritative fields.
Use denormalized summaries only with a clear consistency owner.
Keep financial history auditable.
Keep Profile Score history auditable.
Keep campaign ordering stable after preparation.
Every organization-owned document must have explicit tenant ownership.
Critical operations must support idempotency.
Sensitive values must not be duplicated unnecessarily.
3. PROPOSED TOP-LEVEL COLLECTIONS

Baseline:

users/
devices/
organizations/
organizationMembers/
surveys/
surveyResponses/
profileScoreLedger/
campaigns/
pushDeliveries/
rewardLedger/
rewardBalances/
voucherPools/
vouchers/
withdrawalRequests/

Some high-volume entities may become subcollections where this improves lifecycle management and access patterns.

Campaign membership is specifically expected to live under its campaign.

Example:

campaigns/{campaignId}/members/{userId}

This keeps large ranking snapshots naturally partitioned by campaign.

4. USERS
users/{userId}

Purpose:

Core PAG account and efficient user summary.

Suggested fields:

userId
email
phone
status
registeredAt
updatedAt

profileScore
profileCompleted

phoneVerified
emailVerified
kycStatus

activeDeviceId

createdAt
Authority

Backend authoritative:

profileScore
kycStatus
status
registeredAt

Clients must not directly modify these values.

Notes

profileScore is a materialized total.

It is NOT the audit history.

Audit history lives in:

profileScoreLedger

registeredAt participates in ranking and must therefore be trusted server data.

5. USER PROFILE

Current profile data may initially be stored in:

users/{userId}/profile/current

or an equivalent dedicated profile structure.

Suggested conceptual fields:

gender
birthYear
city
region
favoriteTeam
interests
otherApprovedAttributes
updatedAt

Profile data represents CURRENT user information.

Profile fields may change.

A profile change may alter:

segmentation
eligibility
current profile statistics

It does not rewrite historical immutable survey responses.

Sensitive attributes should only be collected when the product explicitly requires them.

6. DEVICES

Recommended:

devices/{deviceId}

Fields:

deviceId
userId
platform
fcmToken
notificationPermission
isActive
tokenStatus
appVersion
lastSeenAt
createdAt
updatedAt

Possible platform values:

IOS
ANDROID

Token status may conceptually include:

ACTIVE
INVALID
UNREGISTERED
DISABLED
Security

FCM token management is controlled.

A user must not be able to register a device as belonging to another user.

Query

Typical query:

userId == X
isActive == true
7. ORGANIZATIONS
organizations/{organizationId}

Fields:

organizationId
name
status
createdAt
updatedAt

Possible organization examples:

Ford
McDonald's

Organization is the tenant boundary for commercial customers.

8. ORGANIZATION MEMBERS

Recommended:

organizationMembers/{membershipId}

Fields:

membershipId
organizationId
userId
role
status
createdAt

Conceptual roles:

OWNER
ADMIN
ANALYST
VIEWER

Exact role model will be finalized later.

Important

Customer APIs must validate membership server-side.

Client-provided organizationId is not proof of authorization.

9. SURVEYS & CAMPAIGN CONFIGURATION
surveys/{surveyId}

Fields:
surveyId
ownerType ("PAG" | "ORGANIZATION")
organizationId (optional)
surveyType ("PAG" | "ORGANIZATION" | "PROFILE")
category ("Automotive" | "Food" | "Technology" | "Sports" | "General")
title
description

status ("DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED" | "ARCHIVED")
isArchived (boolean)

startAt
endAt

questionCount (max 3)
questions[]
questionSnapshot[] (immutable array created at approval time)

targeting ({ type: "ALL" | "PROFILE" | "LOCATION", filters: {} })

rewardConfig:
  profileScoreReward: number
  financialReward: "NONE" | "MONEY" | "VOUCHER"
  moneyConfig:
    distributionModel: "RANKED" | "EQUAL"
    totalBudget: number
    rankedRules: [{ rankFrom, rankTo, amount }]
    equalPerUserAmount: number
  voucherConfig:
    poolId: string
    poolName: string
    bulkCodes: string[]

storyConfig:
  showInStory: boolean
  shortLabel: string
  position: number
  imageSourceType: "PRESET" | "CUSTOM_URL"
  imageUrl: string
  category: string

approvalInfo:
  submittedBy: string
  submittedAt: timestamp
  approvedBy: string
  approvedAt: timestamp

createdBy
createdAt
updatedAt
publishedAt

Status Lifecycle & Immutability:
- DRAFT: Editable by author / staff.
- PENDING_APPROVAL: Submitted for Super Admin review.
- APPROVED / SCHEDULED / ACTIVE: Locked against all mutations by normal users or staff. Question snapshot is frozen.
- ENDED: Completed survey campaign.
- ARCHIVED: Soft-deleted item (isArchived = true) preserving full audit & financial ledger history.

10. SURVEY QUESTIONS

Because PAG V1 has a maximum of three questions, questions may be embedded in the survey document if document size and reporting requirements remain reasonable.

Conceptual:

questions: [
  {
    questionId,
    order,
    type,
    text,
    options
  }
]

V1 type:

SINGLE_SELECT

Each question:

questionId
order
text
type
options[]

Option:

optionId
label
order

Maximum:

3 questions

Embedding avoids unnecessary reads for a tiny bounded question set.

If future survey complexity grows substantially, questions can later move to a subcollection.

Do not prematurely create a generic form-builder schema.

11. SURVEY RESPONSES

Recommended:

surveyResponses/{responseId}

For surveys allowing one response per user, prefer deterministic identity such as:

responseId = surveyId_userId

or an equivalent collision-safe deterministic scheme.

Fields:

responseId
surveyId
userId

organizationId

surveyType

answers

status

submittedAt
serverCompletedAt

profileScoreProcessed
rewardProcessed

createdAt

Answers:

answers: [
  {
    questionId,
    optionId
  }
]
PAG / Organization surveys

Submitted responses are immutable.

Profile surveys

Current profile answer may change.

Profile-survey response/history implementation should preserve any history required for audit/reporting while updating the user's current profile state.

12. SURVEY COMPLETION IDEMPOTENCY

The same immutable survey must not be completed twice by the same user.

Deterministic response identity is recommended.

Conceptually:

surveyId + userId

Backend transaction:

check response does not exist
validate survey active
validate user eligibility
validate answers
create response
assign server completion timestamp
trigger/perform score and reward consequences

Client timestamp is not authoritative.

13. PROFILE SCORE LEDGER
profileScoreLedgers/{ledgerId}

Fields:

id (Deterministic: SURVEY_{surveyId}_{userId} or PROFILE_SURVEY_{surveyId}_{userId})
userId

sourceType ("SURVEY" | "PROFILE_SURVEY" | "REWARDED_VIDEO" | "VERIFICATION" | "PARTNER")
sourceId (surveyId)

amount (Authoritative profile score reward)

reason (Survey title or description)

createdAt (serverTimestamp)
metadata ({ surveyType, ownerType })

Supported source types in Phase 4:
- SURVEY (PAG / ORGANIZATION surveys)
- PROFILE_SURVEY (PROFILE survey initial completion)

Future source types:
- REWARDED_VIDEO
- VERIFICATION
- PARTNER

Idempotency & Transaction Rules:

1. Score ledger documents use a deterministic ID (`SURVEY_${surveyId}_${userId}` or `PROFILE_SURVEY_${surveyId}_${userId}`).
2. Created strictly inside atomic Firestore Transactions.
3. Duplicate calls inspect existing ledger; if present, score is NOT incremented (`profileScoreAwarded = 0`).

14. PROFILE SCORE SUMMARY

Efficient ranking requires a materialized total.

Baseline:

users/{userId}.profileScore

The ledger remains the audit source.

The summary is the query/ranking source.

Score update flow must keep:

ledger event
+
materialized score

consistent using a transaction or equivalent safe backend operation.

15. RANKING QUERY

Campaign ranking uses:

profileScore DESC
registeredAt ASC
userId ASC

Firestore query/index design must support this ordering together with campaign eligibility strategy.

Do not download all users to a client and sort locally.

Ranking is a backend responsibility.

16. CAMPAIGNS
campaigns/{campaignId}

Fields:

campaignId

type
surveyId

organizationId

title
message

status

scheduledAt
rankingPreparedAt
startedAt
completedAt

batchSize
batchIntervalSeconds

totalEligibleUsers
processedCount
sentCount
failedCount

currentBatch

createdBy
approvedBy

createdAt
updatedAt

Possible types:

SURVEY
ANNOUNCEMENT
PROMOTION
INFORMATIONAL
17. CAMPAIGN MEMBERS / RANKING SNAPSHOT

Recommended:

campaigns/{campaignId}/members/{userId}

Each document represents the stable campaign ordering.

Fields:

userId

rank
profileScoreSnapshot
registeredAtSnapshot

batchNumber

deliveryStatus

createdAt

Optional fields may include deterministic pagination/cursor metadata.

Critical rule

Once created for an active campaign:

rank
profileScoreSnapshot
batchNumber

must not change because the user's global Profile Score changed.

This is the campaign snapshot.

18. CAMPAIGN SNAPSHOT CREATION

Conceptual flow:

1. Resolve campaign targeting
2. Query eligible users
3. Apply deterministic ranking
4. Create campaign members
5. Assign rank
6. Assign batchNumber
7. Mark ranking prepared

For large campaigns this must use bounded/paginated backend processing.

Do not attempt a giant unbounded single Firestore transaction.

19. PUSH DELIVERIES

Recommended:

pushDeliveries/{deliveryId}

Deterministic logical identity:

campaignId + userId

Fields:

deliveryId
campaignId
userId
deviceId

status

batchNumber

attemptedAt
sentAt
failedAt

errorClass
createdAt

Possible status:

PENDING
CLAIMED
SENT
FAILED
SKIPPED

Automatic retry is not currently part of PAG product behavior.

20. PUSH IDEMPOTENCY

Before sending:

campaignId + userId

must be checked/claimed atomically.

Duplicate worker execution must not produce duplicate campaign delivery.

A delivery record must distinguish:

never processed
claimed
sent
failed
skipped
21. REWARD DEFINITIONS

Reward configuration may be embedded in Survey when simple or referenced through a dedicated reward-definition model.

Conceptual dedicated model:

rewardDefinitions/{rewardDefinitionId}

Fields:

rewardDefinitionId
surveyId

rewardType

currency
totalPool

rules

createdAt
updatedAt

Possible reward types:

NONE
MONEY
VOUCHER

Profile Score is not included here because it is a separate domain.

22. REWARD RULES

Example rule structure:

rules: [
  {
    rankFrom: 1,
    rankTo: 1,
    amount: 300
  },
  {
    rankFrom: 2,
    rankTo: 2,
    amount: 200
  },
  {
    rankFrom: 3,
    rankTo: 3,
    amount: 100
  }
]

Equal-share/range rules may also be supported.

The model must not hardcode one global distribution.

23. REWARD LEDGER
rewardLedger/{rewardEventId}

Fields:

rewardEventId

userId
surveyId

rewardType

amount
currency

voucherId

status

idempotencyKey

createdAt

Possible monetary statuses may include:

EARNED
AVAILABLE
REVERSED

Exact financial state machine must be approved before payout implementation.

Security

Clients cannot create reward events.

Clients cannot alter reward amounts.

24. REWARD BALANCES

Recommended materialized summary:

rewardBalances/{userId}

Fields:

userId

availableAmount
pendingWithdrawalAmount
lifetimeEarnedAmount

currency

updatedAt

For initial PAG operation, currency is expected to be configured consistently.

Do not implement multi-currency complexity unless required.

The Reward Ledger remains the auditable financial event history.

Balance is a materialized financial summary.

25. REWARD CONSISTENCY

Reward allocation must avoid:

write ledger
FAIL
update balance

or the reverse without recovery guarantees.

Use transactionally safe operations where Firestore permits.

Business effect must be exactly once.

Duplicate survey-completion processing must not increase balance twice.

26. VOUCHER POOLS
voucherPools/{poolId}

Fields:

poolId
surveyId
organizationId

name

totalCount
availableCount
assignedCount

status

createdAt
updatedAt

A survey may have its own voucher pool.

27. VOUCHERS

Recommended:

voucherPools/{poolId}/vouchers/{voucherId}

Fields:

voucherId

code

status

assignedUserId
assignedAt

rewardEventId

createdAt

Possible status:

AVAILABLE
ASSIGNED
REDEEMED
DISABLED
Atomic allocation

Backend transaction conceptually:

find AVAILABLE voucher
↓
transaction re-checks availability
↓
mark ASSIGNED
↓
set assignedUserId
↓
create reward relationship

Two concurrent users must never receive the same code.

Voucher code access must be tightly restricted.

28. WITHDRAWAL REQUESTS
withdrawalRequests/{withdrawalId}

Fields:

withdrawalId
userId

amount
currency

status

payoutMethodType
payoutMethodReference

requestedAt
processedAt

createdAt
updatedAt

Conceptual status:

REQUESTED
UNDER_REVIEW
APPROVED
PROCESSING
PAID
REJECTED
CANCELLED

Exact states are not yet final.

Minimum withdrawal threshold is configuration.

KYC may be required.

IBAN is a possible future payout method.

PAGCoin is outside current scope.

29. ORGANIZATION OWNERSHIP

Organization-owned documents must contain:

organizationId

where appropriate.

Examples:

survey
campaign
voucherPool
report aggregate

Do not rely on parent UI state to infer tenant ownership.

30. REPORT AGGREGATES

Large live dashboards should use materialized aggregate documents.

Conceptual:

surveys/{surveyId}/aggregates/summary

Possible fields:

totalResponses

questionStats

lastUpdatedAt

Example:

questionStats: {
  question1: {
    optionA: 1200,
    optionB: 850
  }
}

Because PAG surveys contain a maximum of three Single Select questions, aggregate structures can remain bounded.

Updates must be performed by trusted backend logic.

Customer clients read aggregates rather than scanning every raw response.

31. CURRENT PROFILE AGGREGATES

Current profile statistics must not necessarily use immutable survey-response aggregates.

Because profile answers may change, current-profile statistics need an update strategy supporting:

old value decrement
new value increment

or equivalent recomputation/materialization.

Profile reporting and historical survey reporting are distinct.

32. LOCATION TARGETING

Location targeting may be represented using approved profile/location fields.

Do not assume continuous GPS tracking.

Possible future coarse targeting:

country
city
region

Precise location collection requires explicit product need and privacy review.

33. INDEX PLAN

Likely composite indexes include:

Users / Ranking
status
profileScore DESC
registeredAt ASC
userId ASC

Additional segment fields may precede ranking fields for targeted campaigns.

Example conceptual:

gender
profileScore DESC
registeredAt ASC
userId ASC

Do not create every theoretical demographic combination upfront.

Create indexes from approved query patterns.

Surveys

Likely:

status + startAt
status + endAt
organizationId + status + startAt
ownerType + status + startAt
Survey Responses

Likely:

surveyId + serverCompletedAt
userId + serverCompletedAt DESC
organizationId + surveyId
Campaigns

Likely:

status + scheduledAt
organizationId + status + scheduledAt
Push Deliveries

Likely:

campaignId + status
userId + attemptedAt DESC
Reward Ledger

Likely:

userId + createdAt DESC
surveyId + createdAt
Withdrawals

Likely:

userId + requestedAt DESC
status + requestedAt
34. HIGH-VOLUME RULES

Never:

get all users

from a client.

Never scan every survey response for every dashboard page load.

Never construct 20,000 campaign members inside one Firestore transaction.

Never place thousands of users inside one campaign document array.

Never maintain one giant global ranking document.

Use:

indexed queries
pagination
bounded batches
campaign member documents
materialized aggregates
backend processing
35. DOCUMENT SIZE

Firestore document limits must be respected.

Do not embed:

campaign member lists
large voucher pools
arbitrary response histories

inside one parent document.

Maximum-three-question survey definitions are small enough to embed their questions in the Survey document.

36. DELETE / RETENTION BEHAVIOR

Do not implement cascading hard deletes casually.

Financial, reward, campaign, and audit records may need retention even when a user account changes state.

Future retention policy must explicitly address:

survey responses
Profile Score events
reward ledger
withdrawal history
voucher assignment
campaign delivery

Until defined, critical audit records should not be silently destroyed by ordinary client operations.

37. SERVER TIMESTAMPS

Critical timestamps must be server-authoritative.

Examples:

registeredAt
serverCompletedAt
reward createdAt
voucher assignedAt
campaign startedAt
push attemptedAt
withdrawal requestedAt

Client timestamps may be captured for diagnostics if useful but must not determine authoritative reward ordering.

38. SECURITY SUMMARY

Clients must not directly modify:

users.profileScore

profileScoreLedger

campaign ranking

campaign members

pushDeliveries authoritative state

rewardLedger

rewardBalances

voucher assignment

withdrawal approval/state

organization ownership

admin roles

These operations belong to trusted backend code.

39. DATA MODEL OPEN DECISIONS

The following remain intentionally configurable or unresolved:

exact minimum withdrawal amount
final KYC provider/process
final payout implementation
exact campaign batch size
exact campaign interval
exact ranking preparation offset
final organization role matrix
exact financial reversal rules
final retention periods
future PAGCoin design

Do not invent these during implementation.

40. PHASE 1 DATA MODEL ACCEPTANCE

The model is ready for Firebase implementation when the team confirms:

collection boundaries
tenant model
ranking query strategy
campaign-member snapshot model
score ledger transaction strategy
reward transaction strategy
voucher allocation strategy
response idempotency strategy
reporting aggregate strategy
initial index requirements

After approval, the next architecture artifacts should define:

SECURITY_MODEL.md
API_CONTRACTS.md

before privileged backend endpoints are broadly implemented.