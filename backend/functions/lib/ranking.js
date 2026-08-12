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
exports.getCurrentUserRankingHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const getCurrentUserRankingHandler = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const db = admin.firestore();
    // Fetch all active users for ranking foundation
    const usersSnapshot = await db
        .collection('users')
        .get();
    const userList = [];
    usersSnapshot.docs.forEach((doc) => {
        const uData = doc.data();
        const regAt = uData.registeredAt;
        let millis = 0;
        if (regAt) {
            if (typeof regAt.toMillis === 'function') {
                millis = regAt.toMillis();
            }
            else if (typeof regAt.toDate === 'function') {
                millis = regAt.toDate().getTime();
            }
            else if (typeof regAt === 'string') {
                millis = new Date(regAt).getTime();
            }
        }
        userList.push({
            userId: doc.id,
            profileScore: uData.profileScore || 0,
            registeredAtMillis: millis
        });
    });
    // Deterministic Ordering: profileScore DESC, registeredAt ASC, userId ASC
    userList.sort((a, b) => {
        if (b.profileScore !== a.profileScore) {
            return b.profileScore - a.profileScore;
        }
        if (a.registeredAtMillis !== b.registeredAtMillis) {
            return a.registeredAtMillis - b.registeredAtMillis;
        }
        return a.userId.localeCompare(b.userId);
    });
    const totalEligibleUsers = userList.length || 1;
    const userIndex = userList.findIndex((u) => u.userId === uid);
    let rank = 1;
    let currentUserScore = 0;
    if (userIndex !== -1) {
        rank = userIndex + 1;
        currentUserScore = userList[userIndex].profileScore;
    }
    else {
        // If current user is not found, fetch current user doc directly
        const uDoc = await db.collection('users').doc(uid).get();
        currentUserScore = uDoc.exists ? (uDoc.data()?.profileScore || 0) : 0;
        rank = totalEligibleUsers;
    }
    const percentile = Math.max(1, Math.ceil((rank / totalEligibleUsers) * 100));
    const percentileText = `Top %${percentile}`;
    return {
        success: true,
        data: {
            profileScore: currentUserScore,
            rank: rank,
            totalEligibleUsers: totalEligibleUsers,
            percentileText: percentileText
        }
    };
};
exports.getCurrentUserRankingHandler = getCurrentUserRankingHandler;
//# sourceMappingURL=ranking.js.map