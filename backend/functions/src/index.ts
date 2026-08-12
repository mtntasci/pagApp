import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { bootstrapCurrentUserHandler } from './bootstrap';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Trusted Backend User Bootstrap Callable Function.
 * Verifies Auth identity via ID token, creates/syncs user and device records in Firestore.
 */
export const bootstrapCurrentUser = functions.https.onCall(bootstrapCurrentUserHandler);
