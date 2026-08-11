# PAG API Contracts & Specification

## 1. Global API Standards

1. **Authentication**: Mobile endpoints require Firebase Auth Bearer Token in `Authorization: Bearer <token>` header.
2. **Standard Error Envelope**:
   ```json
   {
     "success": false,
     "error": {
       "code": "SURVEY_EXPIRED",
       "message": "This survey has expired and is no longer accepting responses.",
       "details": {}
     }
   }
   ```
3. **Idempotency Header**: State-mutating POST operations require `X-Idempotency-Key` header.
4. **Standard Error Classes**:
   - `UNAUTHORIZED` (401)
   - `FORBIDDEN` / `TENANT_ACCESS_DENIED` (403)
   - `NOT_FOUND` (404)
   - `DUPLICATE_SUBMISSION` (409)
   - `SURVEY_EXPIRED` (410)
   - `AUDIENCE_MISMATCH` (422)
   - `INSUFFICIENT_BALANCE` (422)
   - `KYC_REQUIRED` (428)
   - `RATE_LIMITED` (429)
   - `INTERNAL_ERROR` (500)

---

## 2. Mobile Client API Contracts

### 2.1 GET `/api/v1/user/profile`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Bearer).
- **Request Headers**: `Authorization: Bearer <idToken>`
- **Query Params**: None.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "userId": "usr_99812",
      "phone": "+905321112233",
      "email": "user@example.com",
      "registeredAt": "2026-08-01T10:00:00Z",
      "kycStatus": "VERIFIED",
      "profileScore": 12480,
      "rewardBalance": 350.00,
      "rankingAdvantage": {
        "label": "Öncelikli Sıra",
        "percentileText": "İlk %8"
      }
    }
  }
  ```
- **Backend Behavior**: Fetches user document and resolves dynamic ranking percentile relative to total registered population.

---

### 2.2 GET `/api/v1/surveys/eligible`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Bearer).
- **Request Headers**: `Authorization: Bearer <idToken>`
- **Query Params**: `limit=20`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "surveys": [
        {
          "surveyId": "srv_ford_01",
          "title": "Otomotiv Tercihleri & Mobilite Alışkanlıkları",
          "ownerName": "Ford Turkey",
          "surveyType": "ORGANIZATION",
          "profileScoreReward": 50,
          "rewardPoolText": "1.000 TL Ödül Havuzu",
          "estimatedDurationMinutes": 2,
          "startAt": "2026-08-11T09:00:00Z",
          "endAt": "2026-08-12T09:00:00Z"
        }
      ]
    }
  }
  ```
- **Backend Behavior**: Filters active surveys by `startAt <= now <= endAt`, verifies user targeting criteria, and excludes surveys the user has already submitted.

---

### 2.3 POST `/api/v1/surveys/submit`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Bearer).
- **Request Headers**:
  - `Authorization: Bearer <idToken>`
  - `X-Idempotency-Key: SUBMIT_srv_ford_01_usr_99812`
- **Request Body**:
  ```json
  {
    "surveyId": "srv_ford_01",
    "answers": {
      "q1": "opt_2",
      "q2": "opt_1",
      "q3": "opt_3"
    }
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "responseId": "srv_ford_01_usr_99812",
      "completedAt": "2026-08-11T12:45:01.123Z",
      "scoreEarned": 50,
      "rewardEarned": {
        "type": "CASH",
        "amount": 200.00,
        "rankAchieved": 2
      },
      "newProfileScore": 12530,
      "newRewardBalance": 550.00
    }
  }
  ```
- **Authoritative Backend Behavior**:
  1. Validates survey active status and targeting eligibility.
  2. Ensures user has not already submitted (`surveyResponses/srv_ford_01_usr_99812` check).
  3. Evaluates response submission in a **Firestore Transaction**:
     - Assigns server execution timestamp `completedAt`.
     - Calculates survey completion order rank among valid respondents.
     - Computes monetary/voucher reward entitlement based on rank.
     - Writes `surveyResponses` document.
     - Writes `profileScoreLedger` event and increments `user.profileScore`.
     - Writes `rewardLedger` event and increments `user.rewardBalance`.
- **Error Codes**: `DUPLICATE_SUBMISSION` (409), `SURVEY_EXPIRED` (410), `AUDIENCE_MISMATCH` (422).

---

### 2.4 GET `/api/v1/user/score`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Bearer).
- **Query Params**: `limit=20`, `startAfter=<ledgerId>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "currentScore": 12530,
      "ledger": [
        {
          "ledgerId": "sc_10029",
          "sourceType": "SURVEY_COMPLETED",
          "sourceTitle": "Otomotiv Tercihleri",
          "scoreDelta": 50,
          "createdAt": "2026-08-11T12:45:01Z"
        }
      ],
      "nextCursor": "sc_10028"
    }
  }
  ```

---

### 2.5 GET `/api/v1/user/rewards`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Bearer).
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "rewardBalance": 550.00,
      "minimumWithdrawalThreshold": "TBD",
      "canWithdraw": true,
      "history": [
        {
          "rewardEventId": "rw_8812",
          "rewardType": "CASH",
          "amount": 200.00,
          "surveyTitle": "Otomotiv Tercihleri",
          "rankAchieved": 2,
          "createdAt": "2026-08-11T12:45:01Z"
        }
      ]
    }
  }
  ```

---

### 2.6 GET `/api/v1/user/vouchers`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Bearer).
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "vouchers": [
        {
          "voucherId": "vch_mcd_0921",
          "organizationName": "McDonald's",
          "code": "MCD-PAG-9821-X",
          "assignedAt": "2026-08-10T14:20:00Z",
          "status": "ASSIGNED"
        }
      ]
    }
  }
  ```
- **Security Note**: Codes are decrypted and returned ONLY to the verified user who owns the assignment.

---

### 2.7 POST `/api/v1/user/withdrawals`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Bearer).
- **Request Body**:
  ```json
  {
    "amount": 200.00,
    "iban": "TR330006100511123456789012"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "requestId": "wdr_77192",
      "amount": 200.00,
      "status": "PENDING",
      "createdAt": "2026-08-11T12:46:00Z"
    }
  }
  ```
- **Authoritative Backend Behavior**:
  1. Checks `kycStatus == VERIFIED`. Returns `KYC_REQUIRED` (428) if unverified.
  2. Checks `rewardBalance >= amount` and `amount >= minimumWithdrawalThreshold`.
  3. Executes transaction: Deducts `amount` from `rewardBalance` and creates `withdrawalRequests` document.

---

## 3. PAG Admin API Contracts

### 3.1 POST `/api/v1/admin/surveys`
- **Actor**: Authenticated PAG Admin.
- **Auth**: Firebase Auth Admin Session / Token.
- **Request Body**:
  ```json
  {
    "title": "Otomotiv Tercihleri & Mobilite",
    "ownerType": "ORGANIZATION",
    "orgId": "org_ford_turkey",
    "surveyType": "ORGANIZATION",
    "startAt": "2026-08-15T09:00:00Z",
    "endAt": "2026-08-16T09:00:00Z",
    "profileScoreReward": 50,
    "questions": [
      {
        "id": "q1",
        "title": "Hangi araç tipini tercih edersiniz?",
        "options": ["SUV", "Sedan", "Hatchback", "Elektrikli"]
      }
    ]
  }
  ```
- **Success Response (201 Created)**: Returns created survey document ID.

---

### 3.2 POST `/api/v1/admin/campaigns/schedule`
- **Actor**: Authenticated PAG Admin.
- **Request Body**:
  ```json
  {
    "surveyId": "srv_ford_01",
    "scheduledAt": "2026-08-15T09:00:00Z",
    "batchSize": 500,
    "batchIntervalSeconds": 60
  }
  ```
- **Backend Behavior**: Creates `Campaign` document in `SCHEDULED` status and registers Cloud Scheduler trigger.

---

## 4. Customer Dashboard API Contracts

### 4.1 GET `/api/v1/customer/surveys/:id/stats`
- **Actor**: Authenticated Organization Member.
- **Auth**: Firebase Auth Token + Tenant Authorization Check.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "surveyId": "srv_ford_01",
      "orgId": "org_ford_turkey",
      "totalResponses": 1250,
      "completionRate": 0.94,
      "questionBreakdown": {
        "q1": {
          "SUV": 520,
          "Sedan": 310,
          "Elektrikli": 280,
          "Hatchback": 140
        }
      }
    }
  }
  ```
- **Security Check**: Backend verifies user belongs to `org_ford_turkey` via `organizations/org_ford_turkey/members/{userId}`. Returns `TENANT_ACCESS_DENIED` (403) if member belongs to a different tenant.
