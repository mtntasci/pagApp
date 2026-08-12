import {
  verifyAdminUser,
  createOrUpdateSurveyAdminHandler
} from './admin';

describe('Phase 6 Admin Portal Engine Unit Tests', () => {
  const fakeNonAdminContext = {
    auth: {
      uid: 'usr_regular_person',
      token: { admin: false }
    }
  } as any;

  // 1. Non-admin access rejection
  test('Non-admin user calling verifyAdminUser throws permission-denied', async () => {
    await expect(
      verifyAdminUser(fakeNonAdminContext)
    ).rejects.toThrow('Admin privileges are required to perform this action.');
  });

  // V1 Admin Email & Provider Verification
  test('Admin V1 rule: Google login with mtntasci@gmail.com is authorized', async () => {
    const validGoogleAdminContext = {
      auth: {
        uid: 'usr_admin_google',
        token: {
          email: 'mtntasci@gmail.com',
          firebase: { sign_in_provider: 'google.com' }
        }
      }
    } as any;

    const resUid = await verifyAdminUser(validGoogleAdminContext);
    expect(resUid).toBe('usr_admin_google');
  });

  test('Admin V1 rule: Apple login with mtntasci@gmail.com is rejected', async () => {
    const appleAdminContext = {
      auth: {
        uid: 'usr_admin_apple',
        token: {
          email: 'mtntasci@gmail.com',
          firebase: { sign_in_provider: 'apple.com' }
        }
      }
    } as any;

    await expect(
      verifyAdminUser(appleAdminContext)
    ).rejects.toThrow('Admin privileges are required to perform this action.');
  });

  test('Admin V1 rule: Google login with non-admin email is rejected', async () => {
    const googleNonAdminContext = {
      auth: {
        uid: 'usr_google_other',
        token: {
          email: 'otherperson@gmail.com',
          firebase: { sign_in_provider: 'google.com' }
        }
      }
    } as any;

    await expect(
      verifyAdminUser(googleNonAdminContext)
    ).rejects.toThrow('Admin privileges are required to perform this action.');
  });

  // 2. Max 3 Questions Enforcement
  test('Creating survey with 4 questions is rejected', async () => {
    const fakeAdminContext = {
      auth: {
        uid: 'usr_admin_user',
        token: { admin: true }
      }
    } as any;

    const questions4 = [
      { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] },
      { questionId: 'q2', order: 2, type: 'SINGLE_SELECT', text: 'Q2', options: [] },
      { questionId: 'q3', order: 3, type: 'SINGLE_SELECT', text: 'Q3', options: [] },
      { questionId: 'q4', order: 4, type: 'SINGLE_SELECT', text: 'Q4', options: [] }
    ];

    await expect(
      createOrUpdateSurveyAdminHandler({
        title: 'Over 3 Questions Survey',
        surveyType: 'PAG',
        questions: questions4
      }, fakeAdminContext)
    ).rejects.toThrow('PAG V1 Surveys support a maximum of 3 questions. 4th question rejected.');
  });

  // 3. Invalid Reward Type Rejection
  test('Creating survey with invalid reward type throws error', async () => {
    const fakeAdminContext = {
      auth: {
        uid: 'usr_admin_user',
        token: { admin: true }
      }
    } as any;

    const questions1 = [
      { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] }
    ];

    await expect(
      createOrUpdateSurveyAdminHandler({
        title: 'Invalid Reward Survey',
        surveyType: 'PAG',
        questions: questions1,
        rewardDefinition: { rewardType: 'CRYPTO_TOKEN' }
      }, fakeAdminContext)
    ).rejects.toThrow('Invalid rewardType in rewardDefinition.');
  });
});
