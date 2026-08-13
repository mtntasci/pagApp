# PAG Security Model & Threat Specification

## 1. Security Philosophy & Trust Boundaries

```text
  UNTRUSTED ZONE                           TRUSTED BACKEND BOUNDARY
┌─────────────────────────┐               ┌─────────────────────────────┐
│  Native iOS App         │               │  Firebase Cloud Functions   │
│  Native Android App     │  (HTTPS/TLS)  │  Next.js Server API         │
│  Admin Web Browser      ├──────────────►│  Firebase Admin SDK         │
│  Customer Web Browser   │               │  Firestore Security Rules   │
└─────────────────────────┘               └──────────────┬──────────────┘
                                                         │
                                                         ▼
                                          ┌─────────────────────────────┐
                                          │  Cloud Firestore Data Store │
                                          └─────────────────────────────┘
```

### Core Security Rules
1. **Zero Client Trust**: No client application (iOS, Android, Browser) is trusted to modify authoritative business state directly.
2. **Backend Authority**: Profile Score, Reward Balance, Ranking, Voucher Allocation, and Withdrawal Approvals are strictly calculated and written by the server via `firebase-admin`.
3. **Tenant Isolation**: Customer Web users CANNOT query or access data belonging to organizations other than their authorized tenant.
4. **Least Privilege**: Firestore Security Rules block client writes to all authoritative fields.

---

## 2. Threat Vectors & Defense Mechanisms

| # | Threat Vector | Risk Level | Defense Mechanism |
| :--- | :--- | :--- | :--- |
| **1** | **Client Score Manipulation** | CRITICAL | Client SDKs cannot write to `users/{userId}.profileScore` or `profileScoreLedger`. Security Rules reject client writes targeting score fields. Score modifications execute ONLY via trusted Cloud Functions. |
| **2** | **Reward Balance Manipulation** | CRITICAL | Balance fields are strictly immutable via client SDKs. Reward balance increments execute inside atomic Firestore Transactions on the backend. |
| **3** | **Forged Completion Timestamp** | HIGH | Client device timestamps (`completedAt`) are ignored for competitive reward ranking. Server execution time (`request.time` / `FieldValue.serverTimestamp()`) determines completion order. |
| **4** | **Duplicate Survey Submission** | HIGH | Document ID for `surveyResponses` is deterministically generated as `surveyId + "_" + userId`. Replay submissions collide on existing key and fail atomically. |
| **5** | **Duplicate Reward Claiming** | CRITICAL | Reward calculation and ledger creation use deterministic key `surveyId + "_" + userId + "_reward"`. Transactions prevent double-crediting. |
| **6** | **Voucher Double Allocation** | CRITICAL | Voucher claims run inside a Firestore Transaction with pessimistic locking: reads `status == AVAILABLE`, updates `status = ASSIGNED`, assigns `userId`, decrements `availableCount`. |
| **7** | **Cross-Tenant Data Leakage** | CRITICAL | Next.js API routes verify `organizations/{orgId}/members/{userId}` membership. Firestore rules enforce `resource.data.orgId == request.auth.token.orgId`. |
| **8** | **Stolen / Stale Device Token** | MEDIUM | Invalid FCM token responses from Google API immediately mark `device.isActive = false`. Devices require active user session ping. |
| **9** | **Unauthorized Admin Operation** | HIGH | Admin endpoints check Custom User Claims (`request.auth.token.admin == true`). Direct client calls without claims fail with 403 Forbidden. |
| **10** | **Service Account Leakage** | CRITICAL | Service account JSON keys are NEVER committed to git or exposed to web browsers. Next.js environment variables use server-only scoping (`FIREBASE_ADMIN_KEY`). |
| **11** | **Replay Requests** | MEDIUM | State-mutating endpoints enforce `X-Idempotency-Key` headers stored in Redis/Firestore idempotency cache for 24 hours. |
| **13** | **Profile Score Forgery via Client Request Amount** | CRITICAL | Score amounts supplied in client HTTP payloads are ignored; `profileScoreReward` is read strictly from authoritative `surveys/{surveyId}` document inside backend transaction. |
| **14** | **Concurrent Duplicate Score Claim** | CRITICAL | Score transaction uses pessimistic locking with deterministic ledger key `profileScoreLedgers/SURVEY_{surveyId}_{userId}`. Simultaneous requests process exactly once. |
| **15** | **Profile Survey Repeated Reward Abuse** | HIGH | `updateProfileSurveyResponse` checks ledger existence; awards `profileScoreReward` ONCE on initial submission and 0 score on subsequent answer updates. |
| **16** | **PII Data Leakage (First Name, Last Name, Email)** | CRITICAL | User `firstName`, `lastName`, and `email` are PII credentials. They are NEVER included in survey targeting rules, customer organization dashboards, company reports, or aggregate metrics. |

---

## 3. Firestore Security Rules Strategy

The following security rules architecture (`firestore.rules`) enforces backend authority:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }

    function isOrgMember(orgId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
    }

    // User Collection Rules
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      // Client CANNOT modify profileScore, rewardBalance, kycStatus
      allow update: if isOwner(userId) && 
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['profileScore', 'rewardBalance', 'kycStatus']);
      allow create, delete: if false; // Backend only
      
      match /profile/main {
        allow read, write: if isOwner(userId);
      }
      
      match /devices/{deviceId} {
        allow read, write: if isOwner(userId);
      }
    }

    // Survey Responses: READ by owner, WRITE strictly prohibited for client SDKs
    match /surveyResponses/{responseId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if false; // All writes via Cloud Functions Admin SDK
    }

    // Profile Score Ledger: READ by owner, WRITE prohibited for clients
    match /profileScoreLedgers/{ledgerId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false;
    }

    // Reward Ledger: READ by owner, WRITE prohibited for clients
    match /rewardLedger/{eventId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false;
    }

    // Voucher Pools & Vouchers: Highly Restricted
    match /voucherPools/{poolId} {
      allow read: if isOrgMember(resource.data.orgId) || isAdmin();
      allow write: if false;
      
      match /vouchers/{voucherId} {
        allow read: if isAuthenticated() && resource.data.assignedUserId == request.auth.uid;
        allow write: if false;
      }
    }

    // Organization Data: Enforces Tenant Isolation
    match /organizations/{orgId} {
      allow read: if isOrgMember(orgId) || isAdmin();
      allow write: if isAdmin();
      
      match /members/{memberId} {
        allow read: if isOrgMember(orgId) || isAdmin();
        allow write: if isAdmin();
      }
    }

    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 4. Sensitive Data Protection & Encryption

1. **Voucher Codes**: Voucher codes are encrypted at rest in Firestore using AES-256 (`packages/shared-config` crypto utility). Codes are decrypted ONLY when delivered to the authenticated code owner in `GET /api/v1/user/vouchers`.
2. **KYC Information**: Identity verification payloads are processed via dedicated server-to-server webhook integration. Plaintext identity numbers (TCKN) are NEVER stored in standard user Firestore documents.
3. **Log Sanitization**: Application logger redacts patterns matching IBANs, phone numbers, auth tokens, and voucher codes before writing to Cloud Logging.
