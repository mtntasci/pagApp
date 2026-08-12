"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = require("./admin");
describe('Phase 6 Admin Portal Engine Unit Tests', () => {
    const fakeNonAdminContext = {
        auth: {
            uid: 'usr_regular_person',
            token: { admin: false }
        }
    };
    // 1. Non-admin access rejection
    test('Non-admin user calling admin functions throws permission-denied', async () => {
        await expect((0, admin_1.getAdminDashboardMetricsHandler)({}, fakeNonAdminContext)).rejects.toThrow('Admin privileges are required to perform this action.');
        await expect((0, admin_1.createOrUpdateSurveyAdminHandler)({ title: 'Test', surveyType: 'PAG', questions: [] }, fakeNonAdminContext)).rejects.toThrow('Admin privileges are required to perform this action.');
        await expect((0, admin_1.manageVoucherPoolAdminHandler)({ action: 'LIST_POOLS' }, fakeNonAdminContext)).rejects.toThrow('Admin privileges are required to perform this action.');
        await expect((0, admin_1.manageStoryBarAdminHandler)({ action: 'LIST_STORIES' }, fakeNonAdminContext)).rejects.toThrow('Admin privileges are required to perform this action.');
    });
    // 2. Max 3 Questions Enforcement
    test('Creating survey with 4 questions is rejected', async () => {
        const fakeAdminContext = {
            auth: {
                uid: 'usr_admin_user',
                token: { admin: true }
            }
        };
        const questions4 = [
            { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] },
            { questionId: 'q2', order: 2, type: 'SINGLE_SELECT', text: 'Q2', options: [] },
            { questionId: 'q3', order: 3, type: 'SINGLE_SELECT', text: 'Q3', options: [] },
            { questionId: 'q4', order: 4, type: 'SINGLE_SELECT', text: 'Q4', options: [] }
        ];
        await expect((0, admin_1.createOrUpdateSurveyAdminHandler)({
            title: 'Over 3 Questions Survey',
            surveyType: 'PAG',
            questions: questions4
        }, fakeAdminContext)).rejects.toThrow('PAG V1 Surveys support a maximum of 3 questions. 4th question rejected.');
    });
    // 3. Invalid Reward Type Rejection
    test('Creating survey with invalid reward type throws error', async () => {
        const fakeAdminContext = {
            auth: {
                uid: 'usr_admin_user',
                token: { admin: true }
            }
        };
        const questions1 = [
            { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] }
        ];
        await expect((0, admin_1.createOrUpdateSurveyAdminHandler)({
            title: 'Invalid Reward Survey',
            surveyType: 'PAG',
            questions: questions1,
            rewardDefinition: { rewardType: 'CRYPTO_TOKEN' }
        }, fakeAdminContext)).rejects.toThrow('Invalid rewardType in rewardDefinition.');
    });
});
//# sourceMappingURL=admin.test.js.map