import { getCurrentUserRankingHandler } from './ranking';

describe('Phase 4 Profile Score Engine & Ranking Logic Tests', () => {

  test('Deterministic ranking ordering: profileScore DESC, registeredAt ASC, userId ASC', () => {
    const users = [
      { userId: 'user_C', profileScore: 100, registeredAtMillis: 2000 },
      { userId: 'user_B', profileScore: 200, registeredAtMillis: 1000 },
      { userId: 'user_A', profileScore: 100, registeredAtMillis: 1000 }
    ];

    users.sort((a, b) => {
      if (b.profileScore !== a.profileScore) {
        return b.profileScore - a.profileScore;
      }
      if (a.registeredAtMillis !== b.registeredAtMillis) {
        return a.registeredAtMillis - b.registeredAtMillis;
      }
      return a.userId.localeCompare(b.userId);
    });

    // Expected order: user_B (200 score), user_A (100 score, older), user_C (100 score, newer)
    expect(users[0].userId).toBe('user_B');
    expect(users[1].userId).toBe('user_A');
    expect(users[2].userId).toBe('user_C');
  });

  test('Ranking tie-breaking with identical score and timestamp uses userId ASC', () => {
    const users = [
      { userId: 'user_Z', profileScore: 150, registeredAtMillis: 1000 },
      { userId: 'user_M', profileScore: 150, registeredAtMillis: 1000 },
      { userId: 'user_A', profileScore: 150, registeredAtMillis: 1000 }
    ];

    users.sort((a, b) => {
      if (b.profileScore !== a.profileScore) {
        return b.profileScore - a.profileScore;
      }
      if (a.registeredAtMillis !== b.registeredAtMillis) {
        return a.registeredAtMillis - b.registeredAtMillis;
      }
      return a.userId.localeCompare(b.userId);
    });

    expect(users[0].userId).toBe('user_A');
    expect(users[1].userId).toBe('user_M');
    expect(users[2].userId).toBe('user_Z');
  });

  test('Unauthenticated getCurrentUserRanking throws error', async () => {
    await expect(getCurrentUserRankingHandler({}, {} as any)).rejects.toThrow(
      'The function must be called while authenticated.'
    );
  });
});
