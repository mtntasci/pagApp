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
 * User Ranking Foundation Callable Function.
 */
export const getCurrentUserRanking = functions.https.onCall(getCurrentUserRankingHandler);
