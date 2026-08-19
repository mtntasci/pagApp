import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { bootstrapCurrentUserHandler } from './bootstrap';
import {
  getEligibleSurveysHandler,
  getSurveyDetailHandler,
  submitSurveyResponseHandler,
  updateProfileSurveyResponseHandler,
  getCompletedSurveysHandler
} from './survey';
import { getCurrentUserRankingHandler } from './ranking';
import { getUserRewardsHandler } from './reward';
import {
  getAdminDashboardMetricsHandler,
  createOrUpdateSurveyAdminHandler,
  listSurveysAdminHandler,
  getSurveyAdminHandler,
  submitSurveyForApprovalAdminHandler,
  approveSurveyAdminHandler,
  archiveSurveyAdminHandler,
  manageVoucherPoolAdminHandler,
  manageStoryBarAdminHandler,
  getPortalUserHandler,
  submitCompanyApplicationHandler,
  listCompanyApplicationsAdminHandler,
  updateCompanyApplicationStatusAdminHandler,
  createPortalUserAdminHandler,
  completePasswordChangePortalUserHandler,
  manageSurveyCategoriesAdminHandler,
  seedCategoriesAdminHandler,
  cleanSurveyDataAdminHandler,
  getEligibleStoriesHandler,
  listOrganizationsAdminHandler,
  createOrUpdateOrganizationAdminHandler,
  toggleOrganizationVerificationAuthAdminHandler,
  listOrganizationUsersAdminHandler,
  approveSurveyByOrgHandler,
  finalApproveSurveyAdminHandler
} from './admin';
import {
  getBasicProfileHandler,
  updateBasicProfileHandler,
  verifyPhoneHandler,
  submitIbanAndTcknHandler,
  submitKycHandler
} from './profile';
import {
  getProfileQuestionsHandler,
  submitProfileQuestionAnswersHandler,
  getAnsweredProfileQuestionsHandler,
  updateProfileQuestionAnswerHandler,
  createOrUpdateProfileQuestionAdminHandler,
  listProfileQuestionsAdminHandler,
  manageProfileCategoriesAdminHandler
} from './profileSurveys';
import {
  getActiveLegalDocumentsHandler,
  recordLegalAcceptancesHandler,
  updateCommunicationPreferencesHandler,
  seedLegalDocumentsAdminHandler
} from './legal';
import {
  getCompletedRespondentsForVerificationHandler,
  createVerificationCampaignHandler,
  listVerificationCampaignsHandler,
  getVerificationCampaignDetailHandler,
  listVerificationAssignmentsForAgentHandler,
  startVerificationCallHandler,
  submitVerificationCallResultHandler,
  getPendingVerificationSurveyHandler
} from './verification';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Trusted Backend User Bootstrap Callable Function.
 */
export const bootstrapCurrentUser = functions.https.onCall(bootstrapCurrentUserHandler);

/**
 * Survey Domain Callable Functions.
 */
export const getEligibleSurveys = functions.https.onCall(getEligibleSurveysHandler);
export const getCompletedSurveys = functions.https.onCall(getCompletedSurveysHandler);
export const getSurveyDetail = functions.https.onCall(getSurveyDetailHandler);
export const submitSurveyResponse = functions.https.onCall(submitSurveyResponseHandler);
export const updateProfileSurveyResponse = functions.https.onCall(updateProfileSurveyResponseHandler);

/**
 * Profile Questions Engine Callable Functions (Domain B).
 */
export const getProfileQuestions = functions.https.onCall(getProfileQuestionsHandler);
export const submitProfileQuestionAnswers = functions.https.onCall(submitProfileQuestionAnswersHandler);
export const getAnsweredProfileQuestions = functions.https.onCall(getAnsweredProfileQuestionsHandler);
export const updateProfileQuestionAnswer = functions.https.onCall(updateProfileQuestionAnswerHandler);

/**
 * Basic User Profile Callable Functions.
 */
export const getBasicProfile = functions.https.onCall(getBasicProfileHandler);
export const updateBasicProfile = functions.https.onCall(updateBasicProfileHandler);
export const verifyPhone = functions.https.onCall(verifyPhoneHandler);
export const submitIbanAndTckn = functions.https.onCall(submitIbanAndTcknHandler);
export const submitKyc = functions.https.onCall(submitKycHandler);

/**
 * User Ranking Foundation Callable Function.
 */
export const getCurrentUserRanking = functions.https.onCall(getCurrentUserRankingHandler);

/**
 * User Reward Engine & Vouchers Callable Function.
 */
export const getUserRewards = functions.https.onCall(getUserRewardsHandler);

/**
 * Admin Portal & Company Application Callable Functions.
 */
export const getAdminDashboardMetrics = functions.https.onCall(getAdminDashboardMetricsHandler);
export const createOrUpdateSurveyAdmin = functions.https.onCall(createOrUpdateSurveyAdminHandler);
export const listSurveysAdmin = functions.https.onCall(listSurveysAdminHandler);
export const getSurveyAdmin = functions.https.onCall(getSurveyAdminHandler);
export const submitSurveyForApprovalAdmin = functions.https.onCall(submitSurveyForApprovalAdminHandler);
export const approveSurveyAdmin = functions.https.onCall(approveSurveyAdminHandler);
export const archiveSurveyAdmin = functions.https.onCall(archiveSurveyAdminHandler);
export const manageVoucherPoolAdmin = functions.https.onCall(manageVoucherPoolAdminHandler);
export const manageStoryBarAdmin = functions.https.onCall(manageStoryBarAdminHandler);
export const getEligibleStories = functions.https.onCall(getEligibleStoriesHandler);

export const getPortalUser = functions.https.onCall(getPortalUserHandler);
export const submitCompanyApplication = functions.https.onCall(submitCompanyApplicationHandler);
export const listCompanyApplicationsAdmin = functions.https.onCall(listCompanyApplicationsAdminHandler);
export const updateCompanyApplicationStatusAdmin = functions.https.onCall(updateCompanyApplicationStatusAdminHandler);
export const createPortalUserAdmin = functions.https.onCall(createPortalUserAdminHandler);
export const completePasswordChangePortalUser = functions.https.onCall(completePasswordChangePortalUserHandler);

// Admin Profile Questions & Category Callables
export const createOrUpdateProfileQuestionAdmin = functions.https.onCall(createOrUpdateProfileQuestionAdminHandler);
export const listProfileQuestionsAdmin = functions.https.onCall(listProfileQuestionsAdminHandler);
export const manageSurveyCategoriesAdmin = functions.https.onCall(manageSurveyCategoriesAdminHandler);
export const manageProfileCategoriesAdmin = functions.https.onCall(manageProfileCategoriesAdminHandler);
export const seedCategoriesAdmin = functions.https.onCall(seedCategoriesAdminHandler);
export const cleanSurveyDataAdmin = functions.https.onCall(cleanSurveyDataAdminHandler);

/**
 * Legal Documents, User Consent & Communication Preferences Callables.
 */
export const getActiveLegalDocuments = functions.https.onCall(getActiveLegalDocumentsHandler);
export const recordLegalAcceptances = functions.https.onCall(recordLegalAcceptancesHandler);
export const updateCommunicationPreferences = functions.https.onCall(updateCommunicationPreferencesHandler);
export const seedLegalDocumentsAdmin = functions.https.onCall(seedLegalDocumentsAdminHandler);

/**
 * Call Center Quality Verification Module Callables.
 */
export const getCompletedRespondentsForVerification = functions.https.onCall(getCompletedRespondentsForVerificationHandler);
export const createVerificationCampaign = functions.https.onCall(createVerificationCampaignHandler);
export const listVerificationCampaigns = functions.https.onCall(listVerificationCampaignsHandler);
export const getVerificationCampaignDetail = functions.https.onCall(getVerificationCampaignDetailHandler);
export const listVerificationAssignmentsForAgent = functions.https.onCall(listVerificationAssignmentsForAgentHandler);
export const startVerificationCall = functions.https.onCall(startVerificationCallHandler);
export const submitVerificationCallResult = functions.https.onCall(submitVerificationCallResultHandler);
export const getPendingVerificationSurvey = functions.https.onCall(getPendingVerificationSurveyHandler);

/**
 * Organization Management & Multi-Stage Survey Approval Callables.
 */
export const listOrganizationsAdmin = functions.https.onCall(listOrganizationsAdminHandler);
export const createOrUpdateOrganizationAdmin = functions.https.onCall(createOrUpdateOrganizationAdminHandler);
export const toggleOrganizationVerificationAuthAdmin = functions.https.onCall(toggleOrganizationVerificationAuthAdminHandler);
export const listOrganizationUsersAdmin = functions.https.onCall(listOrganizationUsersAdminHandler);
export const approveSurveyByOrg = functions.https.onCall(approveSurveyByOrgHandler);
export const finalApproveSurveyAdmin = functions.https.onCall(finalApproveSurveyAdminHandler);



