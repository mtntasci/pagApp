import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    const rulesPath = path.resolve(__dirname, '../../../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: 'pag-test-project',
      firestore: {
        rules: rules,
        host: '127.0.0.1',
        port: 8080
      }
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  test('Unauthenticated user cannot read user document', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    const userRef = unauthDb.collection('users').doc('user123');
    await assertFails(userRef.get());
  });

  test('Authenticated User A cannot read User B document', async () => {
    const userADb = testEnv.authenticatedContext('userA').firestore();
    const userBRef = userADb.collection('users').doc('userB');
    await assertFails(userBRef.get());
  });

  test('Authenticated User A can read own document', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('users').doc('userA').set({
        userId: 'userA',
        displayName: 'User A',
        profileScore: 0
      });
    });

    const userADb = testEnv.authenticatedContext('userA').firestore();
    const userARef = userADb.collection('users').doc('userA');
    await assertSucceeds(userARef.get());
  });

  test('User A direct client write to profileScore is denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('users').doc('userA').set({
        userId: 'userA',
        profileScore: 0,
        status: 'ACTIVE'
      });
    });

    const userADb = testEnv.authenticatedContext('userA').firestore();
    const userARef = userADb.collection('users').doc('userA');
    await assertFails(userARef.update({ profileScore: 50 }));
  });

  test('User A direct client write to registeredAt is denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('users').doc('userA').set({
        userId: 'userA',
        registeredAt: '2026-08-01T00:00:00Z'
      });
    });

    const userADb = testEnv.authenticatedContext('userA').firestore();
    const userARef = userADb.collection('users').doc('userA');
    await assertFails(userARef.update({ registeredAt: '2026-08-12T00:00:00Z' }));
  });

  test('User A direct client write to kycStatus is denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('users').doc('userA').set({
        userId: 'userA',
        kycStatus: 'NOT_STARTED'
      });
    });

    const userADb = testEnv.authenticatedContext('userA').firestore();
    const userARef = userADb.collection('users').doc('userA');
    await assertFails(userARef.update({ kycStatus: 'VERIFIED' }));
  });

  test('User A direct client create/edit to profileScoreLedgers is denied', async () => {
    const userADb = testEnv.authenticatedContext('userA').firestore();
    const ledgerRef = userADb.collection('profileScoreLedgers').doc('SURVEY_srv_1_userA');
    await assertFails(ledgerRef.set({
      id: 'SURVEY_srv_1_userA',
      userId: 'userA',
      amount: 1000
    }));
  });

  test('User B reading User A profileScoreLedgers document is denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('profileScoreLedgers').doc('SURVEY_srv_1_userA').set({
        id: 'SURVEY_srv_1_userA',
        userId: 'userA',
        amount: 50
      });
    });

    const userBDb = testEnv.authenticatedContext('userB').firestore();
    const ledgerRef = userBDb.collection('profileScoreLedgers').doc('SURVEY_srv_1_userA');
    await assertFails(ledgerRef.get());
  });
});
