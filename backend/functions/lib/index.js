"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserRanking = exports.updateProfileSurveyResponse = exports.submitSurveyResponse = exports.getSurveyDetail = exports.getEligibleSurveys = exports.bootstrapCurrentUser = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const bootstrap_1 = require("./bootstrap");
const survey_1 = require("./survey");
const ranking_1 = require("./ranking");
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * Trusted Backend User Bootstrap Callable Function.
 */
exports.bootstrapCurrentUser = functions.https.onCall(bootstrap_1.bootstrapCurrentUserHandler);
/**
 * Survey Domain Callable Functions.
 */
exports.getEligibleSurveys = functions.https.onCall(survey_1.getEligibleSurveysHandler);
exports.getSurveyDetail = functions.https.onCall(survey_1.getSurveyDetailHandler);
exports.submitSurveyResponse = functions.https.onCall(survey_1.submitSurveyResponseHandler);
exports.updateProfileSurveyResponse = functions.https.onCall(survey_1.updateProfileSurveyResponseHandler);
/**
 * User Ranking Foundation Callable Function.
 */
exports.getCurrentUserRanking = functions.https.onCall(ranking_1.getCurrentUserRankingHandler);
//# sourceMappingURL=index.js.map