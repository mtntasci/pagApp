import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { bootstrapCurrentUserHandler } from './bootstrap';
import {
  getEligibleSurveysHandler,
  getSurveyDetailHandler,
  submitSurveyResponseHandler,
  updateProfileSurveyResponseHandler
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
  completePasswordChangePortalUserHandler
} from './admin';
import {
  getBasicProfileHandler,
  updateBasicProfileHandler
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

export const getPortalUser = functions.https.onCall(getPortalUserHandler);
export const submitCompanyApplication = functions.https.onCall(submitCompanyApplicationHandler);
export const listCompanyApplicationsAdmin = functions.https.onCall(listCompanyApplicationsAdminHandler);
export const updateCompanyApplicationStatusAdmin = functions.https.onCall(updateCompanyApplicationStatusAdminHandler);
export const createPortalUserAdmin = functions.https.onCall(createPortalUserAdminHandler);
export const completePasswordChangePortalUser = functions.https.onCall(completePasswordChangePortalUserHandler);

// Admin Profile Questions Callables
export const createOrUpdateProfileQuestionAdmin = functions.https.onCall(createOrUpdateProfileQuestionAdminHandler);
export const listProfileQuestionsAdmin = functions.https.onCall(listProfileQuestionsAdminHandler);
export const manageProfileCategoriesAdmin = functions.https.onCall(manageProfileCategoriesAdminHandler);
