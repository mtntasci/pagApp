"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const rules_unit_testing_1 = require("@firebase/rules-unit-testing");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let testEnv;
describe('Firestore Security Rules', () => {
    beforeAll(async () => {
        const rulesPath = path.resolve(__dirname, '../../../firestore.rules');
        const rules = fs.readFileSync(rulesPath, 'utf8');
        testEnv = await (0, rules_unit_testing_1.initializeTestEnvironment)({
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
        await (0, rules_unit_testing_1.assertFails)(userRef.get());
    });
    test('Authenticated User A cannot read User B document', async () => {
        const userADb = testEnv.authenticatedContext('userA').firestore();
        const userBRef = userADb.collection('users').doc('userB');
        await (0, rules_unit_testing_1.assertFails)(userBRef.get());
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
        await (0, rules_unit_testing_1.assertSucceeds)(userARef.get());
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
        await (0, rules_unit_testing_1.assertFails)(userARef.update({ profileScore: 50 }));
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
        await (0, rules_unit_testing_1.assertFails)(userARef.update({ registeredAt: '2026-08-12T00:00:00Z' }));
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
        await (0, rules_unit_testing_1.assertFails)(userARef.update({ kycStatus: 'VERIFIED' }));
    });
    test('User A direct client create/edit to profileScoreLedgers is denied', async () => {
        const userADb = testEnv.authenticatedContext('userA').firestore();
        const ledgerRef = userADb.collection('profileScoreLedgers').doc('SURVEY_srv_1_userA');
        await (0, rules_unit_testing_1.assertFails)(ledgerRef.set({
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
        await (0, rules_unit_testing_1.assertFails)(ledgerRef.get());
    });
});
//# sourceMappingURL=rules.test.js.map