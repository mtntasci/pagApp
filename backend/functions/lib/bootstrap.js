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
exports.bootstrapCurrentUserHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
function parseSignInProvider(providerId) {
    if (!providerId)
        return 'UNKNOWN';
    if (providerId.includes('google'))
        return 'GOOGLE';
    if (providerId.includes('apple'))
        return 'APPLE';
    if (providerId.includes('password') || providerId.includes('email'))
        return 'EMAIL';
    return providerId.toUpperCase();
}
const bootstrapCurrentUserHandler = async (data, context) => {
    // 1. Authenticated User Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const token = context.auth.token;
    const email = token.email || null;
    const displayName = token.name || null;
    const photoUrl = token.picture || null;
    const emailVerified = !!token.email_verified;
    const phone = token.phone_number || null;
    const phoneVerified = !!token.phone_number;
    const rawProvider = token.firebase?.sign_in_provider;
    const provider = parseSignInProvider(rawProvider);
    const deviceId = data?.deviceId;
    const platform = data?.platform || 'IOS';
    const appVersion = data?.appVersion || '1.0.0';
    if (!deviceId || typeof deviceId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The function requires a valid deviceId.');
    }
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const deviceRef = db.collection('devices').doc(deviceId);
    const now = admin.firestore.FieldValue.serverTimestamp();
    let userSummary;
    await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const deviceDoc = await transaction.get(deviceRef);
        if (!userDoc.exists) {
            // Create server-authoritative User Document
            const initialProviders = [provider];
            const newUserData = {
                userId: uid,
                email: email,
                phone: phone,
                displayName: displayName,
                photoUrl: photoUrl,
                authProviders: initialProviders,
                status: 'ACTIVE',
                registeredAt: now,
                updatedAt: now,
                createdAt: now,
                profileScore: 0,
                profileCompleted: false,
                phoneVerified: phoneVerified,
                emailVerified: emailVerified,
                kycStatus: 'NOT_STARTED',
                activeDeviceId: deviceId
            };
            transaction.set(userRef, newUserData);
            userSummary = {
                userId: uid,
                email: email,
                phone: phone,
                displayName: displayName,
                photoUrl: photoUrl,
                authProviders: initialProviders,
                status: 'ACTIVE',
                profileScore: 0,
                profileCompleted: false,
                phoneVerified: phoneVerified,
                emailVerified: emailVerified,
                kycStatus: 'NOT_STARTED',
                activeDeviceId: deviceId
            };
        }
        else {
            // Existing User Document: Protect registeredAt, profileScore, status, kycStatus
            const existing = userDoc.data();
            const existingProviders = existing.authProviders || [];
            const updatedProviders = Array.from(new Set([...existingProviders, provider]));
            const updatedFields = {
                updatedAt: now,
                activeDeviceId: deviceId,
                authProviders: updatedProviders
            };
            if (displayName && displayName !== existing.displayName) {
                updatedFields.displayName = displayName;
            }
            if (photoUrl && photoUrl !== existing.photoUrl) {
                updatedFields.photoUrl = photoUrl;
            }
            if (email && email !== existing.email) {
                updatedFields.email = email;
            }
            if (emailVerified !== existing.emailVerified) {
                updatedFields.emailVerified = emailVerified;
            }
            transaction.update(userRef, updatedFields);
            userSummary = {
                userId: uid,
                email: updatedFields.email ?? existing.email ?? null,
                phone: existing.phone ?? null,
                displayName: updatedFields.displayName ?? existing.displayName ?? null,
                photoUrl: updatedFields.photoUrl ?? existing.photoUrl ?? null,
                authProviders: updatedProviders,
                status: existing.status || 'ACTIVE',
                profileScore: existing.profileScore ?? 0,
                profileCompleted: existing.profileCompleted ?? false,
                phoneVerified: existing.phoneVerified ?? false,
                emailVerified: updatedFields.emailVerified ?? existing.emailVerified ?? false,
                kycStatus: existing.kycStatus || 'NOT_STARTED',
                activeDeviceId: deviceId
            };
        }
        // Upsert Active Device Record
        if (!deviceDoc.exists) {
            transaction.set(deviceRef, {
                deviceId: deviceId,
                userId: uid,
                platform: platform,
                fcmToken: null,
                notificationPermission: false,
                isActive: true,
                tokenStatus: 'ACTIVE',
                appVersion: appVersion,
                lastSeenAt: now,
                createdAt: now,
                updatedAt: now
            });
        }
        else {
            transaction.update(deviceRef, {
                userId: uid,
                platform: platform,
                isActive: true,
                tokenStatus: 'ACTIVE',
                appVersion: appVersion,
                lastSeenAt: now,
                updatedAt: now
            });
        }
    });
    functions.logger.info(`USER_BOOTSTRAPPED: userId=${uid}, deviceId=${deviceId}`);
    return {
        success: true,
        data: userSummary
    };
};
exports.bootstrapCurrentUserHandler = bootstrapCurrentUserHandler;
//# sourceMappingURL=bootstrap.js.map