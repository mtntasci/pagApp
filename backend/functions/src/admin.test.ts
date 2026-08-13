import {
  verifyAdminUser,
  createOrUpdateSurveyAdminHandler,
  listSurveysAdminHandler,
  submitCompanyApplicationHandler,
  listCompanyApplicationsAdminHandler,
  createPortalUserAdminHandler,
  completePasswordChangePortalUserHandler
} from './admin';

describe('Phase Survey Creation & Portal Auth System Unit Tests', () => {
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
        email: 'admin@pagapp.com'
      }
    }
  } as any;

  test('Non-provisioned portal user calling verifyAdminUser throws portal access error', async () => {
    await expect(
      verifyAdminUser(fakeNonAdminContext)
    ).rejects.toThrow('Bu hesap için PAG Portal erişimi bulunmuyor.');
  });

  test('Super admin account admin@pagapp.com verifies successfully', async () => {
    const uid = await verifyAdminUser(fakeAdminContext);
    expect(uid).toBe('usr_admin_google');
  });

  test('submitCompanyApplicationHandler validates required fields and creates application', async () => {
    const res: any = await submitCompanyApplicationHandler({
      companyName: 'Ford Otosan',
      contactName: 'Ahmet Yılmaz',
      contactEmail: 'ahmet@ford.com.tr',
      contactPhone: '+905551112233',
      website: 'https://ford.com.tr',
      message: 'PAG anket sistemiyle ilgileniyoruz.'
    }, {} as any);

    expect(res.success).toBe(true);
    expect(res.data.status).toBe('PENDING');
    expect(res.data.applicationId).toBeDefined();
  });

  test('submitCompanyApplicationHandler rejects missing required company name', async () => {
    await expect(
      submitCompanyApplicationHandler({
        companyName: '',
        contactName: 'Ahmet Yılmaz',
        contactEmail: 'ahmet@ford.com.tr',
        contactPhone: '+905551112233'
      }, {} as any)
    ).rejects.toThrow('Firma / Kurum adı zorunludur.');
  });

  test('createPortalUserAdminHandler requires SUPER_ADMIN privilege', async () => {
    await expect(
      createPortalUserAdminHandler({
        email: 'staff@pagapp.com',
        temporaryPassword: 'Password123!',
        role: 'PAG_STAFF'
      }, fakeNonAdminContext)
    ).rejects.toThrow('Bu hesap için PAG Portal erişimi bulunmuyor.');
  });

  test('createPortalUserAdminHandler rejects ORGANIZATION_USER without organizationId', async () => {
    await expect(
      createPortalUserAdminHandler({
        email: 'mcdonalds_user@mcdonalds.com',
        temporaryPassword: 'Password123!',
        role: 'ORGANIZATION_USER'
      }, fakeAdminContext)
    ).rejects.toThrow('ORGANIZATION_USER rolü için organizationId zorunludur.');
  });

  test('completePasswordChangePortalUserHandler updates mustChangePassword to false', async () => {
    const res: any = await completePasswordChangePortalUserHandler({}, fakeAdminContext);
    expect(res.success).toBe(true);
    expect(res.data.mustChangePassword).toBe(false);
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
  });

  test('listSurveysAdminHandler and listCompanyApplicationsAdminHandler reject non-admin users', async () => {
    await expect(
      listSurveysAdminHandler({}, fakeNonAdminContext)
    ).rejects.toThrow('Bu hesap için PAG Portal erişimi bulunmuyor.');

    await expect(
      listCompanyApplicationsAdminHandler({}, fakeNonAdminContext)
    ).rejects.toThrow('Bu hesap için PAG Portal erişimi bulunmuyor.');
  });
});
