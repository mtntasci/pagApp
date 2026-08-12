import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export interface UserRankingResponse {
  profileScore: number;
  rank: number;
  totalEligibleUsers: number;
  percentileText: string;
}

export const getCurrentUserRankingHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  // Fetch all active users for ranking foundation
  const usersSnapshot = await db
    .collection('users')
    .get();

  const userList: Array<{
    userId: string;
    profileScore: number;
    registeredAtMillis: number;
  }> = [];

  usersSnapshot.docs.forEach((doc) => {
    const uData = doc.data();
    const regAt = uData.registeredAt;
    let millis = 0;
    if (regAt) {
      if (typeof regAt.toMillis === 'function') {
        millis = regAt.toMillis();
      } else if (typeof regAt.toDate === 'function') {
        millis = regAt.toDate().getTime();
      } else if (typeof regAt === 'string') {
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
  } else {
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
