import {
  pgTable,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';

// ============================================================================
// 1. USERS (End-User Accounts & Demographics)
// ============================================================================
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    firebaseUid: varchar('firebase_uid', { length: 128 }).notNull(),
    phone: varchar('phone', { length: 32 }).unique(),
    email: varchar('email', { length: 255 }),
    displayName: varchar('display_name', { length: 255 }).default('Kullanıcı'),
    gender: varchar('gender', { length: 16 }), // 'Erkek', 'Kadın', 'Diğer'
    city: varchar('city', { length: 100 }),
    district: varchar('district', { length: 100 }),
    birthDate: date('birth_date'),
    age: integer('age').default(25),
    maritalStatus: varchar('marital_status', { length: 32 }), // 'EVLI', 'BEKAR'
    childrenStatus: varchar('children_status', { length: 32 }), // 'VAR', 'YOK'
    hometown: varchar('hometown', { length: 100 }),
    education: varchar('education', { length: 64 }),
    occupation: varchar('occupation', { length: 100 }),
    kycStatus: varchar('kyc_status', { length: 32 }).default('NOT_STARTED').notNull(),
    profileScore: integer('profile_score').default(0).notNull(),
    rewardBalance: numeric('reward_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
    isBanned: boolean('is_banned').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    firebaseUidIdx: uniqueIndex('users_firebase_uid_idx').on(table.firebaseUid),
    cityIdx: index('users_city_idx').on(table.city),
    ageIdx: index('users_age_idx').on(table.age),
    genderIdx: index('users_gender_idx').on(table.gender),
    profileScoreIdx: index('users_profile_score_idx').on(table.profileScore)
  })
);

// ============================================================================
// 2. DEVICES (Active Device & FCM Tokens)
// ============================================================================
export const devices = pgTable(
  'devices',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    fcmToken: text('fcm_token').notNull(),
    platform: varchar('platform', { length: 16 }).default('android').notNull(), // 'ios', 'android', 'web'
    appVersion: varchar('app_version', { length: 32 }),
    isActive: boolean('is_active').default(true).notNull(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdIdx: index('devices_user_id_idx').on(table.userId),
    fcmTokenIdx: uniqueIndex('devices_fcm_token_idx').on(table.fcmToken)
  })
);

// ============================================================================
// 3. ORGANIZATIONS (Brand / Customer Tenants)
// ============================================================================
export const organizations = pgTable(
  'organizations',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    logoUrl: text('logo_url'),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  }
);

// ============================================================================
// 4. PORTAL USERS (Super Admin, Admin, Org Admin, Call Agents)
// ============================================================================
export const portalUsers = pgTable(
  'portal_users',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    firebaseUid: varchar('firebase_uid', { length: 128 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 255 }).default('Yönetici').notNull(),
    role: varchar('role', { length: 32 }).default('ADMIN').notNull(), // 'SUPER_ADMIN', 'ADMIN', 'ORG_ADMIN', 'CALL_AGENT'
    organizationId: varchar('organization_id', { length: 64 }).references(() => organizations.id, { onDelete: 'set null' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    firebaseUidIdx: uniqueIndex('portal_users_firebase_uid_idx').on(table.firebaseUid),
    emailIdx: uniqueIndex('portal_users_email_idx').on(table.email),
    orgIdIdx: index('portal_users_org_id_idx').on(table.organizationId)
  })
);

// ============================================================================
// 5. SURVEYS (Master & Verification Surveys)
// ============================================================================
export const surveys = pgTable(
  'surveys',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    ownerType: varchar('owner_type', { length: 32 }).default('PAG').notNull(), // 'PAG', 'ORGANIZATION'
    organizationId: varchar('organization_id', { length: 64 }).references(() => organizations.id, { onDelete: 'set null' }),
    surveyType: varchar('survey_type', { length: 32 }).default('PAG').notNull(), // 'PAG', 'ORGANIZATION', 'PROFILE', 'VERIFICATION'
    category: varchar('category', { length: 64 }).default('Genel').notNull(),
    status: varchar('status', { length: 32 }).default('DRAFT').notNull(), // 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'
    isHighlighted: boolean('is_highlighted').default(false).notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    profileScoreReward: integer('profile_score_reward').default(50).notNull(),
    targetingConfig: jsonb('targeting_config'), // audience filters: minAge, maxAge, gender, cities, profile
    rewardDefinition: jsonb('reward_definition'), // ranked cash rules, voucher pool
    storyConfig: jsonb('story_config'), // story banner, category image
    hasVerification: boolean('has_verification').default(false).notNull(),
    verificationConfig: jsonb('verification_config'), // question text, options, pagTargetCount, orgSelectionQuota, voucher info
    verificationTargetCount: integer('verification_target_count').default(0).notNull(),
    verificationOrgQuota: integer('verification_org_quota').default(0).notNull(),
    startAt: timestamp('start_at', { withTimezone: true }),
    endAt: timestamp('end_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    statusIdx: index('surveys_status_idx').on(table.status),
    orgIdIdx: index('surveys_org_id_idx').on(table.organizationId),
    hasVerificationIdx: index('surveys_has_verification_idx').on(table.hasVerification),
    isHighlightedIdx: index('surveys_is_highlighted_idx').on(table.isHighlighted),
    isArchivedIdx: index('surveys_is_archived_idx').on(table.isArchived)
  })
);

// ============================================================================
// 6. QUESTIONS (Survey Questions)
// ============================================================================
export const questions = pgTable(
  'questions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    surveyId: varchar('survey_id', { length: 64 }).references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
    questionOrder: integer('question_order').notNull(),
    text: text('text').notNull(),
    questionType: varchar('question_type', { length: 32 }).default('SINGLE_SELECT').notNull(),
    options: jsonb('options').notNull(), // [{ optionId, label, order }]
    isRequired: boolean('is_required').default(true).notNull()
  },
  (table) => ({
    surveyIdIdx: index('questions_survey_id_idx').on(table.surveyId)
  })
);

// ============================================================================
// 7. SURVEY RESPONSES (Completed Survey Submissions)
// ============================================================================
export const surveyResponses = pgTable(
  'survey_responses',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    surveyId: varchar('survey_id', { length: 64 }).references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
    userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    answers: jsonb('answers').notNull(), // [{ questionId, optionId, answerText }]
    isVerified: boolean('is_verified').default(false).notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    surveyUserIdx: uniqueIndex('survey_responses_survey_user_idx').on(table.surveyId, table.userId),
    surveyIdIdx: index('survey_responses_survey_id_idx').on(table.surveyId),
    userIdIdx: index('survey_responses_user_id_idx').on(table.userId),
    completedAtIdx: index('survey_responses_completed_at_idx').on(table.completedAt)
  })
);

// ============================================================================
// 8. PROFILE SCORE LEDGER (Auditable Score Events)
// ============================================================================
export const profileScoreLedger = pgTable(
  'profile_score_ledger',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    sourceType: varchar('source_type', { length: 64 }).notNull(), // 'SURVEY_COMPLETED', 'PROFILE_SURVEY', 'PHONE_VERIFIED', 'KYC_VERIFIED'
    sourceId: varchar('source_id', { length: 64 }),
    scoreDelta: integer('score_delta').notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 128 }).unique(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdIdx: index('profile_score_ledger_user_id_idx').on(table.userId),
    idempotencyIdx: uniqueIndex('profile_score_ledger_idempotency_idx').on(table.idempotencyKey),
    createdAtIdx: index('profile_score_ledger_created_at_idx').on(table.createdAt)
  })
);

// ============================================================================
// 9. REWARD LEDGER (Cash / Financial Rewards)
// ============================================================================
export const rewardLedger = pgTable(
  'reward_ledger',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    surveyId: varchar('survey_id', { length: 64 }).references(() => surveys.id, { onDelete: 'set null' }),
    rewardType: varchar('reward_type', { length: 32 }).notNull(), // 'MONEY', 'VOUCHER'
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 8 }).default('TL').notNull(),
    voucherId: varchar('voucher_id', { length: 64 }),
    status: varchar('status', { length: 32 }).default('CREDITED').notNull(), // 'CREDITED', 'PENDING', 'CANCELLED'
    idempotencyKey: varchar('idempotency_key', { length: 128 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdIdx: index('reward_ledger_user_id_idx').on(table.userId),
    surveyIdIdx: index('reward_ledger_survey_id_idx').on(table.surveyId),
    idempotencyIdx: uniqueIndex('reward_ledger_idempotency_idx').on(table.idempotencyKey)
  })
);

// ============================================================================
// 10. VOUCHERS (Gift Codes Pool)
// ============================================================================
export const vouchers = pgTable(
  'vouchers',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    surveyId: varchar('survey_id', { length: 64 }).references(() => surveys.id, { onDelete: 'set null' }),
    organizationId: varchar('organization_id', { length: 64 }).references(() => organizations.id, { onDelete: 'set null' }),
    poolName: varchar('pool_name', { length: 255 }).notNull(),
    code: varchar('code', { length: 128 }).notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
    status: varchar('status', { length: 32 }).default('AVAILABLE').notNull(), // 'AVAILABLE', 'RESERVED', 'ASSIGNED', 'REDEEMED', 'DISABLED'
    assignedUserId: varchar('assigned_user_id', { length: 64 }).references(() => users.id, { onDelete: 'set null' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    surveyIdIdx: index('vouchers_survey_id_idx').on(table.surveyId),
    statusIdx: index('vouchers_status_idx').on(table.status),
    assignedUserIdx: index('vouchers_assigned_user_idx').on(table.assignedUserId)
  })
);

// ============================================================================
// 11. VERIFICATION CAMPAIGNS (Quality Verification Parent Campaigns)
// ============================================================================
export const verificationCampaigns = pgTable(
  'verification_campaigns',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    masterSurveyId: varchar('master_survey_id', { length: 64 }).references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
    organizationId: varchar('organization_id', { length: 64 }).references(() => organizations.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 32 }).default('ACTIVE').notNull(), // 'ACTIVE', 'COMPLETED', 'CANCELLED'
    requestedCount: integer('requested_count').notNull(),
    customerSelectedCount: integer('customer_selected_count').default(0).notNull(),
    randomSelectedCount: integer('random_selected_count').default(0).notNull(),
    verificationSurveyId: varchar('verification_survey_id', { length: 64 }),
    verificationRewardSummary: varchar('verification_reward_summary', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    masterSurveyIdx: index('verification_campaigns_master_survey_idx').on(table.masterSurveyId),
    statusIdx: index('verification_campaigns_status_idx').on(table.status),
    orgIdIdx: index('verification_campaigns_org_id_idx').on(table.organizationId)
  })
);

// ============================================================================
// 12. VERIFICATION ASSIGNMENTS (Call Center Queue & Call Records)
// ============================================================================
export const verificationAssignments = pgTable(
  'verification_assignments',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    campaignId: varchar('campaign_id', { length: 64 }).references(() => verificationCampaigns.id, { onDelete: 'cascade' }).notNull(),
    masterSurveyId: varchar('master_survey_id', { length: 64 }).references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
    respondentUserId: varchar('respondent_user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    callAgentUserId: varchar('call_agent_user_id', { length: 64 }).references(() => portalUsers.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 32 }).default('PENDING').notNull(), // 'PENDING', 'IN_PROGRESS', 'CALLED', 'COMPLETED', 'FAILED'
    callResult: varchar('call_result', { length: 64 }), // 'ACCEPTED', 'DECLINED', 'NO_ANSWER', 'WRONG_PERSON', 'CALL_BACK_LATER'
    verificationAnswers: jsonb('verification_answers'),
    customerSelected: boolean('customer_selected').default(false).notNull(),
    notes: text('notes'),
    calledAt: timestamp('called_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    campaignIdIdx: index('verification_assignments_campaign_idx').on(table.campaignId),
    masterSurveyIdx: index('verification_assignments_master_survey_idx').on(table.masterSurveyId),
    respondentUserIdx: index('verification_assignments_respondent_user_idx').on(table.respondentUserId),
    callAgentIdx: index('verification_assignments_call_agent_idx').on(table.callAgentUserId),
    statusIdx: index('verification_assignments_status_idx').on(table.status)
  })
);

// ============================================================================
// 13. WITHDRAWAL REQUESTS (Cash Out / IBAN Payouts)
// ============================================================================
export const withdrawalRequests = pgTable(
  'withdrawal_requests',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 8 }).default('TL').notNull(),
    iban: varchar('iban', { length: 34 }).notNull(),
    accountHolderName: varchar('account_holder_name', { length: 255 }).notNull(),
    status: varchar('status', { length: 32 }).default('PENDING').notNull(), // 'PENDING', 'APPROVED', 'TRANSFERRED', 'REJECTED'
    reviewedBy: varchar('reviewed_by', { length: 64 }).references(() => portalUsers.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdIdx: index('withdrawal_requests_user_id_idx').on(table.userId),
    statusIdx: index('withdrawal_requests_status_idx').on(table.status)
  })
);
