import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK safely (Vercel Serverless singleton pattern)
if (!admin.apps.length) {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized successfully via FIREBASE_SERVICE_ACCOUNT env');
    } else {
      // Fallback for default GCP / Application Default Credentials
      admin.initializeApp();
      console.log('⚠️ Firebase Admin initialized with default application credentials');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  }
}

export const db = admin.apps.length ? admin.firestore() : null;
export default admin;
