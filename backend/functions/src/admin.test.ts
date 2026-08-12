import {
  verifyAdminUser,
  createOrUpdateSurveyAdminHandler
} from './admin';

describe('Phase Survey Creation & Approval System Unit Tests', () => {
  const fakeNonAdminContext = {
    auth: {
      uid: 'usr_regular_person',
      token: { admin: false }
    }
  } as any;

  const fakeAdminContext = {
    auth: {
      uid: 'usr_admin_google',
      token: {
        email: 'mtntasci@gmail.com',
        firebase: { sign_in_provider: 'google.com' }
      }
    }
  } as any;

  test('Non-admin user calling verifyAdminUser throws permission-denied', async () => {
    await expect(
      verifyAdminUser(fakeNonAdminContext)
    ).rejects.toThrow('Admin privileges are required to perform this action.');
  });

  test('PAG survey draft creation validation', async () => {
    const questions1 = [
      { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] }
    ];

    const res = await createOrUpdateSurveyAdminHandler({
      title: 'PAG Test Draft Survey',
      ownerType: 'PAG',
      surveyType: 'PAG',
      questions: questions1
    }, fakeAdminContext);

    expect(res.success).toBe(true);
    expect(res.data.status).toBe('DRAFT');
  });

  test('Organization survey draft creation requires organizationId', async () => {
    const questions1 = [
      { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] }
    ];

    await expect(
      createOrUpdateSurveyAdminHandler({
        title: 'Org Test Survey',
        ownerType: 'ORGANIZATION',
        surveyType: 'ORGANIZATION',
        questions: questions1
      }, fakeAdminContext)
    ).rejects.toThrow('organizationId is required when ownerType is ORGANIZATION.');
  });

  test('Invalid owner/type combination rejection', async () => {
    const questions1 = [
      { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] }
    ];

    await expect(
      createOrUpdateSurveyAdminHandler({
        title: 'Org Profile Survey Invalid',
        ownerType: 'ORGANIZATION',
        organizationId: 'org_ford',
        surveyType: 'PROFILE',
        questions: questions1
      }, fakeAdminContext)
    ).rejects.toThrow('ORGANIZATION owner cannot create PROFILE surveys.');
  });

  test('Creating survey with 4 questions is rejected', async () => {
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

  test('Invalid targeting type rejected', async () => {
    const questions1 = [
      { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] }
    ];

    await expect(
      createOrUpdateSurveyAdminHandler({
        title: 'Invalid Targeting Survey',
        surveyType: 'PAG',
        questions: questions1,
        targeting: { type: 'INVALID_TARGET' }
      }, fakeAdminContext)
    ).rejects.toThrow('Invalid targeting type.');
  });

  test('Ranked money rewards exceeding total budget rejected', async () => {
    const questions1 = [
      { questionId: 'q1', order: 1, type: 'SINGLE_SELECT', text: 'Q1', options: [] }
    ];

    await expect(
      createOrUpdateSurveyAdminHandler({
        title: 'Over Budget Ranked Survey',
        surveyType: 'PAG',
        questions: questions1,
        rewardDefinition: {
          rewardType: 'MONEY',
          totalBudget: 500,
          distributionModel: 'RANKED',
          rankedRules: [
            { rankFrom: 1, rankTo: 1, amount: 300 },
            { rankFrom: 2, rankTo: 2, amount: 250 },
            { rankFrom: 3, rankTo: 3, amount: 100 }
          ]
        }
      }, fakeAdminContext)
    ).rejects.toThrow('Ranked rewards sum (650 TL) exceeds total budget (500 TL).');
  });
});
