import {
  verifyAdminUser,
  createOrUpdateSurveyAdminHandler,
  listSurveysAdminHandler,
  getSurveyAdminHandler
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

  test('PAG survey draft creation validation and full payload returned', async () => {
    const questions1 = [
      {
        questionId: 'q1',
        order: 1,
        type: 'SINGLE_SELECT',
        text: 'Q1 Text',
        options: [{ optionId: 'opt_1', label: 'Opt 1', order: 1 }, { optionId: 'opt_2', label: 'Opt 2', order: 2 }]
      }
    ];

    const res: any = await createOrUpdateSurveyAdminHandler({
      surveyId: 'srv_test_draft_verification_01',
      title: 'PAG Test Draft Survey',
      description: 'End-to-End Verification Survey Description',
      ownerType: 'PAG',
      surveyType: 'PAG',
      category: 'Teknoloji',
      targeting: { type: 'ALL' },
      profileScoreReward: 100,
      rewardDefinition: { rewardType: 'NONE' },
      storyConfig: { showInStory: true, storyLabel: 'Test Label', imageCategory: 'Teknoloji' },
      questions: questions1,
      status: 'DRAFT'
    }, fakeAdminContext);

    expect(res.success).toBe(true);
    expect(res.data.status).toBe('DRAFT');
    expect(res.data.surveyId).toBe('srv_test_draft_verification_01');
    expect(res.data.survey.title).toBe('PAG Test Draft Survey');
    expect(res.data.survey.category).toBe('Teknoloji');
    expect(res.data.survey.profileScoreReward).toBe(100);
    expect(res.data.survey.storyConfig.showInStory).toBe(true);
    expect(res.data.survey.questions.length).toBe(1);
  });

  test('listSurveysAdminHandler and getSurveyAdminHandler reject non-admin users', async () => {
    await expect(
      listSurveysAdminHandler({}, fakeNonAdminContext)
    ).rejects.toThrow('Admin privileges are required to perform this action.');

    await expect(
      getSurveyAdminHandler({ surveyId: 'srv_test_draft_verification_01' }, fakeNonAdminContext)
    ).rejects.toThrow('Admin privileges are required to perform this action.');
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
