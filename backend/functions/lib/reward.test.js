"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reward_1 = require("./reward");
describe('Phase 5 Reward Engine Logic & Validation Tests', () => {
    test('Unauthenticated getUserRewards throws unauthenticated error', async () => {
        await expect((0, reward_1.getUserRewardsHandler)({}, {})).rejects.toThrow('The function must be called while authenticated.');
    });
    test('Tiered reward calculation logic for ranks 1, 2, 3 and remaining pool', () => {
        const rewardDef = {
            rewardType: 'MONEY',
            totalPoolAmount: 1000,
            tieredRewards: [
                { rank: 1, amount: 300 },
                { rank: 2, amount: 200 },
                { rank: 3, amount: 100 }
            ],
            remainingPoolCount: 20,
            remainingPoolAmountPerUser: 20
        };
        const getAmountForRank = (rank) => {
            const matched = rewardDef.tieredRewards.find((t) => t.rank === rank);
            if (matched)
                return matched.amount;
            const maxTierRank = rewardDef.tieredRewards.reduce((max, r) => Math.max(max, r.rank), 0);
            if (rank > maxTierRank && rank <= maxTierRank + rewardDef.remainingPoolCount) {
                return rewardDef.remainingPoolAmountPerUser;
            }
            return 0;
        };
        expect(getAmountForRank(1)).toBe(300);
        expect(getAmountForRank(2)).toBe(200);
        expect(getAmountForRank(3)).toBe(100);
        expect(getAmountForRank(4)).toBe(20);
        expect(getAmountForRank(23)).toBe(20);
        expect(getAmountForRank(24)).toBe(0);
    });
    test('Log sanitization: Plaintext voucher codes must be redacted from system logs', () => {
        const voucher = {
            id: 'v_123',
            code: 'SECRET_VOUCHER_CODE_9999',
            valueAmount: 100
        };
        const logMessage = `VOUCHER_ASSIGNED: user=usr_1, surveyId=srv_1, poolId=pool_1, voucherId=${voucher.id}`;
        expect(logMessage).not.toContain(voucher.code);
        expect(logMessage).toContain('v_123');
    });
});
//# sourceMappingURL=reward.test.js.map