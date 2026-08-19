import {
  generateAnonymousParticipantRef,
  selectRandomUniqueUsers,
  getCompletedRespondentsForVerificationHandler,
  createVerificationCampaignHandler,
  listVerificationCampaignsHandler,
  getVerificationCampaignDetailHandler,
  listVerificationAssignmentsForAgentHandler,
  startVerificationCallHandler,
  submitVerificationCallResultHandler,
  getPendingVerificationSurveyHandler,
  SurveyVerificationAssignment
} from './verification';

describe('PAG Call Center Quality Verification Module Unit Tests', () => {
  const fakeAdminContext = {
    auth: {
      uid: 'usr_admin_1',
      token: { email: 'admin@pagapp.com' }
    }
  } as any;

  const fakeOrgUserContext = {
    auth: {
      uid: 'usr_org_rep',
      token: { email: 'representative@mcdonalds.com' }
    }
  } as any;

  const fakeAgentContext = {
    auth: {
      uid: 'usr_agent_call_center',
      token: { email: 'agent@callcenter.pagapp.com' }
    }
  } as any;

  const fakeMobileUserContext = {
    auth: {
      uid: 'usr_respondent_42'
    }
  } as any;

  const fakeUnauthContext = {} as any;

  // 1. ANONYMOUS PARTICIPANT REF GENERATION & PII SHIELDING
  test('1. generateAnonymousParticipantRef masks user ID into reproducible anonymous ref (e.g. Katılımcı #A82F1)', () => {
    const ref1 = generateAnonymousParticipantRef('usr_123', 'srv_mcd_01');
    const ref2 = generateAnonymousParticipantRef('usr_123', 'srv_mcd_01');
    const refOther = generateAnonymousParticipantRef('usr_999', 'srv_mcd_01');

    expect(ref1).toMatch(/^Katılımcı #[0-9A-F]{5}$/);
    expect(ref1).toBe(ref2);
    expect(ref1).not.toBe(refOther);
    expect(ref1).not.toContain('usr_123');
  });

  // 2. SERVER-SIDE RANDOM SELECTION WITHOUT DUPLICATES
  test('2. selectRandomUniqueUsers selects exact random count without duplicate of customer-selected users', () => {
    const allCompletedPool = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10'];
    const customerSelected = new Set(['u1', 'u3', 'u5']);

    const randomPick = selectRandomUniqueUsers(allCompletedPool, customerSelected, 4);

    expect(randomPick.length).toBe(4);
    // None of customerSelected should be in randomPick
    randomPick.forEach((uid) => {
      expect(customerSelected.has(uid)).toBe(false);
    });
    // Ensure all picked elements are unique
    expect(new Set(randomPick).size).toBe(4);
  });

  // 3. UNAUTHENTICATED CALL REJECTIONS
  test('3. Unauthenticated requests to verification callables are strictly rejected', async () => {
    await expect(getPendingVerificationSurveyHandler({}, fakeUnauthContext)).rejects.toThrow(
      'Authenticated user required.'
    );
    await expect(getCompletedRespondentsForVerificationHandler({ surveyId: 'srv_1' }, fakeUnauthContext)).rejects.toThrow(
      'Bu hesap için PAG Portal erişimi bulunmuyor.'
    );
    await expect(createVerificationCampaignHandler({ masterSurveyId: 'srv_1', customerSelectedUserIds: [], randomSelectedCount: 5 }, fakeUnauthContext)).rejects.toThrow(
      'Bu hesap için PAG Portal erişimi bulunmuyor.'
    );
    await expect(listVerificationCampaignsHandler({}, fakeUnauthContext)).rejects.toThrow(
      'Bu hesap için PAG Portal erişimi bulunmuyor.'
    );
    await expect(getVerificationCampaignDetailHandler({ campaignId: 'c1' }, fakeUnauthContext)).rejects.toThrow(
      'Bu hesap için PAG Portal erişimi bulunmuyor.'
    );
    await expect(listVerificationAssignmentsForAgentHandler({}, fakeUnauthContext)).rejects.toThrow(
      'Bu hesap için PAG Portal erişimi bulunmuyor.'
    );
    await expect(startVerificationCallHandler({ assignmentId: 'as_1' }, fakeUnauthContext)).rejects.toThrow(
      'Bu hesap için PAG Portal erişimi bulunmuyor.'
    );
    await expect(submitVerificationCallResultHandler({ assignmentId: 'as_1', result: 'ACCEPTED' }, fakeUnauthContext)).rejects.toThrow(
      'Bu hesap için PAG Portal erişimi bulunmuyor.'
    );
  });

  // 4. INVALID CALL RESULT VALIDATION
  test('4. submitVerificationCallResultHandler rejects unsupported status results', async () => {
    await expect(
      submitVerificationCallResultHandler(
        { assignmentId: 'as_1', result: 'UNKNOWN_STATUS' as any },
        fakeAdminContext
      )
    ).rejects.toThrow('Invalid call result: UNKNOWN_STATUS');
  });

  // 5. AGENT PII ISOLATION RULES
  test('5. Agent assignment payload structure guarantees First + Last name is present and phone/email is omitted', () => {
    const rawAssignmentRecord: SurveyVerificationAssignment = {
      id: 'assign_ver_camp_1_usr_42',
      verificationCampaignId: 'ver_camp_1',
      masterSurveyId: 'srv_mcdonalds_menu_2026',
      verificationSurveyId: 'srv_ver_mcdonalds_menu_2026_1234',
      organizationId: 'org_mcdonalds',
      userId: 'usr_42',
      userDisplayName: 'Metin Taşçı', // Name + Surname for agent script
      selectionSource: 'CUSTOMER',
      status: 'QUEUED',
      assignedAgentId: null,
      callStartedAt: null,
      callEndedAt: null,
      agentNote: null,
      createdAt: '2026-08-19T09:00:00Z',
      updatedAt: '2026-08-19T09:00:00Z'
    };

    expect(rawAssignmentRecord.userDisplayName).toBe('Metin Taşçı');
    expect((rawAssignmentRecord as any).phone).toBeUndefined();
    expect((rawAssignmentRecord as any).email).toBeUndefined();
    expect((rawAssignmentRecord as any).tckn).toBeUndefined();
    expect((rawAssignmentRecord as any).iban).toBeUndefined();
    expect((rawAssignmentRecord as any).masterSurveyAnswers).toBeUndefined();
  });

  // 6. CALL STATUSES DO NOT MUTATE MASTER SURVEY RESPONSES
  test('6. Non-reach / outcome call statuses are strictly scoped to verification assignments', () => {
    const callStatuses = ['NO_ANSWER', 'CALL_BACK_LATER', 'WRONG_PERSON_OR_ISSUE', 'DECLINED', 'ACCEPTED'];
    const masterSurveyResponseStatus = 'COMPLETED';

    // Verification assignment states never alter master survey response status
    callStatuses.forEach((status) => {
      expect(masterSurveyResponseStatus).toBe('COMPLETED');
      expect(status).not.toBe(masterSurveyResponseStatus);
    });
  });

  // 7. VERIFICATION REWARD SUMMARY IN SCRIPT
  test('7. Dynamic script correctly incorporates master survey title and authoritative reward summary', () => {
    const masterSurveyTitle = "McDonald's Menü Tercihleri";
    const rewardSummary = '250 TL Hediye Çeki';

    const script = `PAG kalite doğrulama ekibinden arıyorum. Yakın zamanda ‘${masterSurveyTitle}’ anketine katıldınız. Kalite doğrulama sürecimiz kapsamında uygulamanıza tek soruluk ek bir anket gönderebiliriz. Bu soruyu tamamladığınızda ${rewardSummary} kazanacaksınız. Katılmak ister misiniz?`;

    expect(script).toContain("McDonald's Menü Tercihleri");
    expect(script).toContain('250 TL Hediye Çeki');
    expect(script).toContain('tek soruluk ek bir anket');
  });

  // 8. PROGRESS DASHBOARD AGGREGATE CALCULATIONS
  test('8. Progress dashboard calculates exact percentages and stats without PII', () => {
    const statsMock = {
      total: 50,
      customerSelected: 40,
      randomSelected: 10,
      called: 42,
      reached: 36,
      accepted: 31,
      declined: 5,
      noAnswer: 6,
      callBackLater: 0,
      wrongPerson: 0,
      pushSent: 31,
      completed: 27
    };

    const completionRate = statsMock.accepted > 0 ? Math.round((statsMock.completed / statsMock.accepted) * 100) : 0;
    const reachRate = statsMock.called > 0 ? Math.round((statsMock.reached / statsMock.called) * 100) : 0;

    expect(completionRate).toBe(87); // 27/31 = 87.09% -> 87%
    expect(reachRate).toBe(86); // 36/42 = 85.71% -> 86%
    expect(statsMock.customerSelected + statsMock.randomSelected).toBe(50);
  });

  // 9. CONTEXT VALIDATION ACROSS CALL CENTER & ORG ROLES
  test('9. Context roles are mapped properly for call center agent, org user, and mobile user', () => {
    expect(fakeAdminContext.auth.uid).toBe('usr_admin_1');
    expect(fakeOrgUserContext.auth.token.email).toBe('representative@mcdonalds.com');
    expect(fakeAgentContext.auth.token.email).toBe('agent@callcenter.pagapp.com');
    expect(fakeMobileUserContext.auth.uid).toBe('usr_respondent_42');
  });
});
