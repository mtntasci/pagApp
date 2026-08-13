import * as admin from 'firebase-admin';
import { onCall, CallableRequest } from 'firebase-functions/v2/https';
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
  getEligibleStoriesHandler
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

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Universal CORS-enabled Firebase Callable wrapper.
 */
const createCallable = (handler: (data: any, context: any) => Promise<any>) => {
  return onCall({ cors: true }, async (request: CallableRequest<any>) => {
    return handler(request.data, {
      auth: request.auth,
      rawRequest: request.rawRequest
    });
  });
};

/**
 * Trusted Backend User Bootstrap Callable Function.
 */
export const bootstrapCurrentUser = createCallable(bootstrapCurrentUserHandler);

/**
 * Survey Domain Callable Functions.
 */
export const getEligibleSurveys = createCallable(getEligibleSurveysHandler);
export const getCompletedSurveys = createCallable(getCompletedSurveysHandler);
export const getSurveyDetail = createCallable(getSurveyDetailHandler);
export const submitSurveyResponse = createCallable(submitSurveyResponseHandler);
export const updateProfileSurveyResponse = createCallable(updateProfileSurveyResponseHandler);

/**
 * Profile Questions Engine Callable Functions (Domain B).
 */
export const getProfileQuestions = createCallable(getProfileQuestionsHandler);
export const submitProfileQuestionAnswers = createCallable(submitProfileQuestionAnswersHandler);
export const getAnsweredProfileQuestions = createCallable(getAnsweredProfileQuestionsHandler);
export const updateProfileQuestionAnswer = createCallable(updateProfileQuestionAnswerHandler);

/**
 * Basic User Profile Callable Functions.
 */
export const getBasicProfile = createCallable(getBasicProfileHandler);
export const updateBasicProfile = createCallable(updateBasicProfileHandler);
export const verifyPhone = createCallable(verifyPhoneHandler);
export const submitIbanAndTckn = createCallable(submitIbanAndTcknHandler);
export const submitKyc = createCallable(submitKycHandler);

/**
 * User Ranking Foundation Callable Function.
 */
export const getCurrentUserRanking = createCallable(getCurrentUserRankingHandler);

/**
 * User Reward Engine & Vouchers Callable Function.
 */
export const getUserRewards = createCallable(getUserRewardsHandler);

/**
 * Admin Portal & Company Application Callable Functions.
 */
export const getAdminDashboardMetrics = createCallable(getAdminDashboardMetricsHandler);
export const createOrUpdateSurveyAdmin = createCallable(createOrUpdateSurveyAdminHandler);
export const listSurveysAdmin = createCallable(listSurveysAdminHandler);
export const getSurveyAdmin = createCallable(getSurveyAdminHandler);
export const submitSurveyForApprovalAdmin = createCallable(submitSurveyForApprovalAdminHandler);
export const approveSurveyAdmin = createCallable(approveSurveyAdminHandler);
export const archiveSurveyAdmin = createCallable(archiveSurveyAdminHandler);
export const manageVoucherPoolAdmin = createCallable(manageVoucherPoolAdminHandler);
export const manageStoryBarAdmin = createCallable(manageStoryBarAdminHandler);
export const getEligibleStories = createCallable(getEligibleStoriesHandler);

export const getPortalUser = createCallable(getPortalUserHandler);
export const submitCompanyApplication = createCallable(submitCompanyApplicationHandler);
export const listCompanyApplicationsAdmin = createCallable(listCompanyApplicationsAdminHandler);
export const updateCompanyApplicationStatusAdmin = createCallable(updateCompanyApplicationStatusAdminHandler);
export const createPortalUserAdmin = createCallable(createPortalUserAdminHandler);
export const completePasswordChangePortalUser = createCallable(completePasswordChangePortalUserHandler);

// Admin Profile Questions & Category Callables
export const createOrUpdateProfileQuestionAdmin = createCallable(createOrUpdateProfileQuestionAdminHandler);
export const listProfileQuestionsAdmin = createCallable(listProfileQuestionsAdminHandler);
export const manageSurveyCategoriesAdmin = createCallable(manageSurveyCategoriesAdminHandler);
export const manageProfileCategoriesAdmin = createCallable(manageProfileCategoriesAdminHandler);
export const seedCategoriesAdmin = createCallable(seedCategoriesAdminHandler);
export const cleanSurveyDataAdmin = createCallable(cleanSurveyDataAdminHandler);

