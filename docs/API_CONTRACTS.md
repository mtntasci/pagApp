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

### 2.0 Firebase HTTPS Callable: `bootstrapCurrentUser`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Callable Context).
- **Request Body**:
  ```json
  {
    "deviceId": "9C2A4B8F-1234-5678-ABCD-EF0123456789",
    "platform": "IOS",
    "appVersion": "1.0.0 (1)"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "userId": "usr_99812",
      "email": "user@example.com",
      "phone": null,
      "displayName": "Metin",
      "photoUrl": null,
      "authProviders": ["GOOGLE"],
      "status": "ACTIVE",
      "profileScore": 0,
      "profileCompleted": false,
      "phoneVerified": false,
      "emailVerified": true,
      "kycStatus": "NOT_STARTED",
      "activeDeviceId": "9C2A4B8F-1234-5678-ABCD-EF0123456789"
    }
  }
  ```
- **Backend Behavior**:
  1. Validates `context.auth` identity.
  2. Checks if `users/{userId}` exists. If new, creates user with `registeredAt = serverTimestamp()`, `profileScore = 0`, `status = "ACTIVE"`, `kycStatus = "NOT_STARTED"`.
  3. If existing, syncs mutable identity fields (`displayName`, `photoUrl`, `authProviders`) while preserving `registeredAt`, `profileScore`, `status`, `kycStatus`.
  4. Upserts active device record in `devices/{deviceId}` and sets `users/{userId}.activeDeviceId`.

---

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

### 2.2 Firebase HTTPS Callable: `getEligibleSurveys`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Callable Context).
- **Request Body**: `{}`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "surveys": [
        {
          "surveyId": "srv_ford_01",
          "ownerType": "ORGANIZATION",
          "organizationId": "org_ford",
          "surveyType": "ORGANIZATION",
          "title": "Otomotiv Tercihleri & Mobilite Alışkanlıkları",
          "description": "Ford Turkey ile araç tercihlerinizi paylaşın.",
          "status": "ACTIVE",
          "questionCount": 3,
          "profileScoreReward": 75,
          "isCompleted": false
        }
      ]
    }
  }
  ```
- **Backend Behavior**: Filters active surveys by `status == "ACTIVE"` and `startAt <= now <= endAt`, evaluates targeting criteria, and marks/excludes completed immutable surveys.

---

### 2.3 Firebase HTTPS Callable: `getSurveyDetail`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Callable Context).
- **Request Body**: `{ "surveyId": "srv_ford_01" }`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "surveyId": "srv_ford_01",
      "ownerType": "ORGANIZATION",
      "organizationId": "org_ford",
      "surveyType": "ORGANIZATION",
      "title": "Otomotiv Tercihleri & Mobilite Alışkanlıkları",
      "description": "Ford Turkey ile araç tercihlerinizi paylaşın.",
      "status": "ACTIVE",
      "questionCount": 3,
      "questions": [
        {
          "questionId": "q1",
          "order": 1,
          "type": "SINGLE_SELECT",
          "text": "Hangi araç gövde tipini tercih edersiniz?",
          "options": [
            { "optionId": "opt_1", "label": "SUV / Crossover", "order": 1 }
          ]
        }
      ],
      "profileScoreReward": 75,
      "isCompleted": false
    }
  }
  ```

---

### 2.4 Firebase HTTPS Callable: `submitSurveyResponse`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Callable Context).
- **Request Body**:
  ```json
  {
    "surveyId": "srv_ford_01",
    "answers": [
      { "questionId": "q1", "optionId": "opt_1" },
      { "questionId": "q2", "optionId": "opt_2" },
      { "questionId": "q3", "optionId": "opt_3" }
    ]
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "completed": true,
      "responseId": "srv_ford_01_usr_99812",
      "surveyId": "srv_ford_01",
      "completedAt": "2026-08-12T22:45:00.000Z",
      "isDuplicate": false,
      "profileScoreAwarded": 75,
      "currentProfileScore": 255
    }
  }
  ```
- **Authoritative Backend Behavior**:
  1. Validates `context.auth` identity.
  2. Ensures max 3 questions and option IDs match survey definition.
  3. Executes inside a Firestore Transaction with deterministic ledger key `profileScoreLedgers/SURVEY_srv_ford_01_userId`.
  4. If existing: Returns idempotent duplicate result (`profileScoreAwarded: 0`).
  5. If new: Creates ledger record, increments `users/{userId}.profileScore` by configured `survey.profileScoreReward`, writes `surveyResponses` document with `profileScoreProcessed: true`.

---

### 2.5 Firebase HTTPS Callable: `updateProfileSurveyResponse`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Callable Context).
- **Request Body**: Same as `submitSurveyResponse`.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "completed": true,
      "responseId": "srv_profile_01_usr_99812",
      "surveyId": "srv_profile_01",
      "completedAt": "2026-08-12T22:45:00.000Z",
      "profileScoreAwarded": 0,
      "currentProfileScore": 255
    }
  }
  ```
- **Backend Behavior**: Updates `users/{userId}/profile/current` document attributes and upserts `surveyResponses/srv_profile_01_userId`. Awards configured score ONCE on initial completion; subsequent answer updates award 0 score without modifying past earned Profile Score.

---

### 2.6 Firebase HTTPS Callable: `getCurrentUserRanking`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Callable Context).
- **Request Body**: `{}`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "profileScore": 255,
      "rank": 14,
      "totalEligibleUsers": 1250,
      "percentileText": "Top %2"
    }
  }
  ```
- **Backend Behavior**: Evaluates deterministic user ordering (`profileScore DESC, registeredAt ASC, userId ASC`) and returns exact 1-based rank and calculated percentile.

---

### 2.7 Firebase HTTPS Callable: `getUserRewards`
- **Actor**: Authenticated Mobile User.
- **Auth**: Firebase Auth Token (Callable Context).
- **Request Body**: `{}`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "rewardBalance": 320,
      "ledgers": [
        {
          "id": "REWARD_srv_ford_01_usr_99812",
          "surveyId": "srv_ford_01",
          "type": "MONEY",
          "amount": 200,
          "reason": "Otomotiv Tercihleri & Mobilite",
          "createdAt": "2026-08-12T22:45:00.000Z"
        }
      ],
      "vouchers": [
        {
          "voucherId": "v_mcd_991",
          "poolId": "pool_mcdonalds",
          "title": "McDonald's 100 TL Menü Çeki",
          "code": "MCD-9981-PAG",
          "valueAmount": 100,
          "status": "ASSIGNED",
          "assignedAt": "2026-08-12T22:45:00.000Z",
          "expiresAt": "2026-12-31T23:59:59.000Z"
        }
      ]
    }
  }
  ```
- **Backend Behavior**: Returns user's current `rewardBalance`, immutable reward ledger history, and assigned voucher codes. Client cannot read unassigned vouchers.

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
