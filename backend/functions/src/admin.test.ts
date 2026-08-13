import {
  verifyAdminUser,
  removeUndefinedFields,
  createOrUpdateSurveyAdminHandler,
  listSurveysAdminHandler,
  approveSurveyAdminHandler,
  submitCompanyApplicationHandler,
  listCompanyApplicationsAdminHandler,
  createPortalUserAdminHandler,
  completePasswordChangePortalUserHandler
} from './admin';

describe('PAG Admin Backend Survey Write & Authorization Unit Tests', () => {
  const fakeNonAdminContext = {
    auth: {
      uid: 'usr_regular_person',
      token: { admin: false, email: 'user@gmail.com' }
    }
  } as any;

  const fakeSuperAdminContext = {
    auth: {
      uid: 'usr_admin_super',
      token: { email: 'admin@pagapp.com' }
    }
  } as any;

  test('removeUndefinedFields recursively removes undefined properties from objects and arrays', () => {
    const rawData = {
      title: 'Test Title',
      description: undefined,
      targeting: {
        type: 'ALL',
        profileFilters: undefined
      },
      questions: [
        {
          questionId: 'q1',
          text: 'Question 1',
          options: [{ optionId: 'opt1', label: 'Option 1', extra: undefined }]
        }
      ],
      storyConfig: {
        showInStory: false,
        storyLabel: undefined
      }
    };

    const cleaned = removeUndefinedFields(rawData);

    expect(cleaned).toEqual({
      title: 'Test Title',
      targeting: {
        type: 'ALL'
      },
      questions: [
        {
          questionId: 'q1',
          text: 'Question 1',
          options: [{ optionId: 'opt1', label: 'Option 1' }]
        }
      ],
      storyConfig: {
        showInStory: false
      }
    });

    expect((cleaned.targeting as any).profileFilters).toBeUndefined();
    expect((cleaned as any).description).toBeUndefined();
  });

  test('Non-provisioned portal user calling verifyAdminUser throws portal access error', async () => {
    await expect(
      verifyAdminUser(fakeNonAdminContext)
    ).rejects.toThrow('Bu hesap için PAG Portal erişimi bulunmuyor.');
  });

  test('Super admin account admin@pagapp.com verifies successfully with SUPER_ADMIN role', async () => {
    const result = await verifyAdminUser(fakeSuperAdminContext);
    expect(result.uid).toBe('usr_admin_super');
    expect(result.role).toBe('SUPER_ADMIN');
  });

  test('A) Save survey with empty profileFilters (targeting ALL) passes without undefined errors', async () => {
    const res: any = await createOrUpdateSurveyAdminHandler({
      surveyId: 'srv_test_all_targeting',
      title: 'All Users Survey',
      ownerType: 'PAG',
      surveyType: 'PAG',
      targeting: {
        type: 'ALL',
        profileFilters: undefined
      },
      questions: [
        {
          questionId: 'q1',
          order: 1,
          type: 'SINGLE_SELECT',
          text: 'General Question',
          options: [{ optionId: 'opt_1', label: 'Yes', order: 1 }]
        }
      ],
      status: 'DRAFT'
    }, fakeSuperAdminContext);

    expect(res.success).toBe(true);
    expect(res.data.surveyId).toBe('srv_test_all_targeting');
    expect(res.data.survey.targeting.profileFilters).toBeUndefined();
  });

  test('B) Save survey with PROFILE targeting and real filters passes', async () => {
    const res: any = await createOrUpdateSurveyAdminHandler({
      surveyId: 'srv_test_profile_targeting',
      title: 'Profile Targeted Survey',
      ownerType: 'PAG',
      surveyType: 'PROFILE',
      targeting: {
        type: 'PROFILE',
        profileFilters: {
          minAge: 18,
          maxAge: 35,
          maritalStatus: 'SINGLE',
          childrenStatus: 'NO_CHILDREN',
          hometown: 'İstanbul'
        }
      },
      questions: [
        {
          questionId: 'q1',
          order: 1,
          type: 'SINGLE_SELECT',
          text: 'Young Single Question',
          options: [{ optionId: 'opt_1', label: 'A', order: 1 }]
        }
      ],
      status: 'DRAFT'
    }, fakeSuperAdminContext);

    expect(res.success).toBe(true);
    expect(res.data.survey.targeting.profileFilters.minAge).toBe(18);
    expect(res.data.survey.targeting.profileFilters.hometown).toBe('İstanbul');
  });

  test('C) Save survey with absent optional storyConfig passes', async () => {
    const res: any = await createOrUpdateSurveyAdminHandler({
      surveyId: 'srv_no_story',
      title: 'No Story Survey',
      ownerType: 'PAG',
      surveyType: 'PAG',
      storyConfig: undefined,
      questions: [
        { questionId: 'q1', text: 'Q1', options: [{ optionId: 'opt1', label: 'A', order: 1 }] }
      ]
    }, fakeSuperAdminContext);

    expect(res.success).toBe(true);
    expect(res.data.survey.storyConfig).toBeDefined();
  });

  test('D) Save survey with absent optional voucher definition passes', async () => {
    const res: any = await createOrUpdateSurveyAdminHandler({
      surveyId: 'srv_no_voucher',
      title: 'No Voucher Survey',
      ownerType: 'PAG',
      surveyType: 'PAG',
      rewardDefinition: { rewardType: 'NONE' },
      questions: [
        { questionId: 'q1', text: 'Q1', options: [{ optionId: 'opt1', label: 'A', order: 1 }] }
      ]
    }, fakeSuperAdminContext);

    expect(res.success).toBe(true);
    expect(res.data.survey.rewardDefinition.rewardType).toBe('NONE');
  });

  test('E) Nested undefined client payload is sanitized automatically and saved', async () => {
    const nestedPayload = {
      surveyId: 'srv_nested_undefined',
      title: 'Nested Undefined Test',
      description: undefined,
      ownerType: 'PAG',
      surveyType: 'PAG',
      targeting: {
        type: 'ALL',
        profileFilters: undefined
      },
      rewardDefinition: {
        rewardType: 'NONE',
        voucherPoolId: undefined
      },
      storyConfig: {
        showInStory: false,
        storyLabel: undefined
      },
      questions: [
        {
          questionId: 'q1',
          text: 'Text',
          extraParam: undefined,
          options: [{ optionId: 'opt1', label: 'Opt 1', unused: undefined }]
        }
      ]
    };

    const res: any = await createOrUpdateSurveyAdminHandler(nestedPayload, fakeSuperAdminContext);

    expect(res.success).toBe(true);
    expect(res.data.survey.targeting.profileFilters).toBeUndefined();
    expect(res.data.survey.description).toBe('');
  });

  test('F) Unauthorized user survey write is DENIED', async () => {
    await expect(
      createOrUpdateSurveyAdminHandler({
        title: 'Hack Survey',
        questions: [{ questionId: 'q1', text: 'Q', options: [] }]
      }, fakeNonAdminContext)
    ).rejects.toThrow('Bu hesap için PAG Portal erişimi bulunmuyor.');
  });

  test('G) SUPER_ADMIN authorized write passes and approves survey', async () => {
    const res: any = await createOrUpdateSurveyAdminHandler({
      surveyId: 'srv_super_admin_approved',
      title: 'Super Admin Approved Survey',
      ownerType: 'PAG',
      surveyType: 'PAG',
      questions: [
        { questionId: 'q1', text: 'Q1', options: [{ optionId: 'o1', label: 'A', order: 1 }] }
      ],
      status: 'APPROVED'
    }, fakeSuperAdminContext);

    expect(res.success).toBe(true);
    expect(res.data.status).toBe('APPROVED');
  });

  test('H) listSurveysAdminHandler and approveSurveyAdminHandler operate correctly for SUPER_ADMIN', async () => {
    const listRes: any = await listSurveysAdminHandler({}, fakeSuperAdminContext);
    expect(listRes.success).toBe(true);

    const approveRes: any = await approveSurveyAdminHandler({ surveyId: 'srv_super_admin_approved' }, fakeSuperAdminContext);
    expect(approveRes.success).toBe(true);
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

    const listAppRes: any = await listCompanyApplicationsAdminHandler({}, fakeSuperAdminContext);
    expect(listAppRes.success).toBe(true);
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

  test('completePasswordChangePortalUserHandler updates mustChangePassword to false', async () => {
    const res: any = await completePasswordChangePortalUserHandler({}, fakeSuperAdminContext);
    expect(res.success).toBe(true);
    expect(res.data.mustChangePassword).toBe(false);
  });
});
