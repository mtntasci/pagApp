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
  submitSurveyForApprovalAdminHandler,
  approveSurveyAdminHandler,
  archiveSurveyAdminHandler,
  manageVoucherPoolAdminHandler,
  manageStoryBarAdminHandler
} from './admin';
import {
  getBasicProfileHandler,
  updateBasicProfileHandler
} from './profile';

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
 * Admin Portal Callable Functions.
 */
export const getAdminDashboardMetrics = functions.https.onCall(getAdminDashboardMetricsHandler);
export const createOrUpdateSurveyAdmin = functions.https.onCall(createOrUpdateSurveyAdminHandler);
export const submitSurveyForApprovalAdmin = functions.https.onCall(submitSurveyForApprovalAdminHandler);
export const approveSurveyAdmin = functions.https.onCall(approveSurveyAdminHandler);
export const archiveSurveyAdmin = functions.https.onCall(archiveSurveyAdminHandler);
export const manageVoucherPoolAdmin = functions.https.onCall(manageVoucherPoolAdminHandler);
export const manageStoryBarAdmin = functions.https.onCall(manageStoryBarAdminHandler);
