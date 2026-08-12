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
exports.seedDemoSurveys = void 0;
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'pag-test-project'
    });
}
const seedDemoSurveys = async (db) => {
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
    // 1. Organizations
    await db.collection('organizations').doc('org_ford').set({
        organizationId: 'org_ford',
        name: 'Ford Turkey',
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('organizations').doc('org_mcdonalds').set({
        organizationId: 'org_mcdonalds',
        name: "McDonald's Turkey",
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // 2. Demo Survey 1: PAG Survey
    await db.collection('surveys').doc('srv_pag_01').set({
        surveyId: 'srv_pag_01',
        ownerType: 'PAG',
        organizationId: null,
        surveyType: 'PAG',
        title: 'Mobil Uygulama Kullanım Alışkanlıkları',
        description: 'Günlük mobil uygulama tercihlerinizi değerlendirin ve profil puanınızı yükseltin.',
        status: 'ACTIVE',
        startAt: admin.firestore.Timestamp.fromDate(now),
        endAt: admin.firestore.Timestamp.fromDate(future),
        questionCount: 3,
        profileScoreReward: 50,
        targeting: { type: 'ALL' },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        questions: [
            {
                questionId: 'q1',
                order: 1,
                type: 'SINGLE_SELECT',
                text: 'Günlük ortalama akıllı telefon kullanım süreniz nedir?',
                options: [
                    { optionId: 'opt_1', label: '1 saatten az', order: 1 },
                    { optionId: 'opt_2', label: '1-3 saat arası', order: 2 },
                    { optionId: 'opt_3', label: '3 saatten fazla', order: 3 }
                ]
            },
            {
                questionId: 'q2',
                order: 2,
                type: 'SINGLE_SELECT',
                text: 'En sık kullandığınız mobil uygulama kategorisi hangisidir?',
                options: [
                    { optionId: 'opt_1', label: 'Sosyal Medya', order: 1 },
                    { optionId: 'opt_2', label: 'Finans & Bankacılık', order: 2 },
                    { optionId: 'opt_3', label: 'Oyun & Eğlence', order: 3 }
                ]
            },
            {
                questionId: 'q3',
                order: 3,
                type: 'SINGLE_SELECT',
                text: 'Mobil anket uygulamalarından en büyük beklentiniz nedir?',
                options: [
                    { optionId: 'opt_1', label: 'Hızlı Ödül Kazancı', order: 1 },
                    { optionId: 'opt_2', label: 'Kısa ve Eğlenceli Sorular', order: 2 },
                    { optionId: 'opt_3', label: 'Marka Kampanyaları', order: 3 }
                ]
            }
        ]
    });
    // 3. Demo Survey 2: Organization Survey (Ford)
    await db.collection('surveys').doc('srv_ford_01').set({
        surveyId: 'srv_ford_01',
        ownerType: 'ORGANIZATION',
        organizationId: 'org_ford',
        surveyType: 'ORGANIZATION',
        title: 'Otomotiv Tercihleri & Mobilite Alışkanlıkları',
        description: 'Ford Turkey ile araç tercihlerinizi ve geleceğin elektrikli mobilite çözümlerini paylaşın.',
        status: 'ACTIVE',
        startAt: admin.firestore.Timestamp.fromDate(now),
        endAt: admin.firestore.Timestamp.fromDate(future),
        questionCount: 3,
        profileScoreReward: 75,
        targeting: { type: 'ALL' },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        questions: [
            {
                questionId: 'q1',
                order: 1,
                type: 'SINGLE_SELECT',
                text: 'Hangi araç gövde tipini tercih edersiniz?',
                options: [
                    { optionId: 'opt_1', label: 'SUV / Crossover', order: 1 },
                    { optionId: 'opt_2', label: 'Sedan', order: 2 },
                    { optionId: 'opt_3', label: 'Hatchback', order: 3 }
                ]
            },
            {
                questionId: 'q2',
                order: 2,
                type: 'SINGLE_SELECT',
                text: 'Elektrikli araç satın almayı düşünür müsünüz?',
                options: [
                    { optionId: 'opt_1', label: 'Evet, önümüzdeki 1 yıl içinde', order: 1 },
                    { optionId: 'opt_2', label: 'Emin değilim, altyapı gelişmeli', order: 2 },
                    { optionId: 'opt_3', label: 'Hayır, benzinli/dizel tercih ederim', order: 3 }
                ]
            },
            {
                questionId: 'q3',
                order: 3,
                type: 'SINGLE_SELECT',
                text: 'Yeni bir otomobil alırken sizin için en önemli kriter nedir?',
                options: [
                    { optionId: 'opt_1', label: 'Güvenlik & Teknoloji', order: 1 },
                    { optionId: 'opt_2', label: 'Yakıt / Enerji Verimliliği', order: 2 },
                    { optionId: 'opt_3', label: 'Fiyat & Tasarım', order: 3 }
                ]
            }
        ]
    });
    // 4. Demo Survey 3: Organization Survey (McDonald's)
    await db.collection('surveys').doc('srv_mcd_01').set({
        surveyId: 'srv_mcd_01',
        ownerType: 'ORGANIZATION',
        organizationId: 'org_mcdonalds',
        surveyType: 'ORGANIZATION',
        title: 'Hızlı Yemek Tercihleri & Menü Alışkanlıkları',
        description: 'McDonald\'s lezzet deneyiminizi geliştirin.',
        status: 'ACTIVE',
        startAt: admin.firestore.Timestamp.fromDate(now),
        endAt: admin.firestore.Timestamp.fromDate(future),
        questionCount: 2,
        profileScoreReward: 40,
        targeting: { type: 'ALL' },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        questions: [
            {
                questionId: 'q1',
                order: 1,
                type: 'SINGLE_SELECT',
                text: 'Hızlı yemek siparişinizi en sık nasıl verirsiniz?',
                options: [
                    { optionId: 'opt_1', label: 'Mobil Uygulama Adrese Teslimat', order: 1 },
                    { optionId: 'opt_2', label: 'Restoranda Gel-Al / Masa', order: 2 },
                    { optionId: 'opt_3', label: 'Drive-Thru', order: 3 }
                ]
            },
            {
                questionId: 'q2',
                order: 2,
                type: 'SINGLE_SELECT',
                text: 'En sevdiğiniz menü yan ürünü hangisidir?',
                options: [
                    { optionId: 'opt_1', label: 'Patates Kızartması', order: 1 },
                    { optionId: 'opt_2', label: 'Chili Cheese Nuggets', order: 2 },
                    { optionId: 'opt_3', label: 'Çıtır Tavuk Parçaları', order: 3 }
                ]
            }
        ]
    });
    // 5. Demo Survey 4: Profile Survey
    await db.collection('surveys').doc('srv_profile_01').set({
        surveyId: 'srv_profile_01',
        ownerType: 'PAG',
        organizationId: null,
        surveyType: 'PROFILE',
        title: 'Temel Profil Anketiniz',
        description: 'Profil tercihlerinizi belirleyin ve size özel anket eşleşmelerini artırın.',
        status: 'ACTIVE',
        startAt: admin.firestore.Timestamp.fromDate(now),
        endAt: admin.firestore.Timestamp.fromDate(future),
        questionCount: 3,
        profileScoreReward: 100,
        targeting: { type: 'ALL' },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        questions: [
            {
                questionId: 'gender',
                order: 1,
                type: 'SINGLE_SELECT',
                text: 'Cinsiyetiniz:',
                options: [
                    { optionId: 'opt_male', label: 'Erkek', order: 1 },
                    { optionId: 'opt_female', label: 'Kadın', order: 2 },
                    { optionId: 'opt_other', label: 'Belirtmek İstemiyorum', order: 3 }
                ]
            },
            {
                questionId: 'favoriteTeam',
                order: 2,
                type: 'SINGLE_SELECT',
                text: 'Desteklediğiniz futbol takımı:',
                options: [
                    { optionId: 'opt_gs', label: 'Galatasaray', order: 1 },
                    { optionId: 'opt_fb', label: 'Fenerbahçe', order: 2 },
                    { optionId: 'opt_bjk', label: 'Beşiktaş', order: 3 }
                ]
            },
            {
                questionId: 'city',
                order: 3,
                type: 'SINGLE_SELECT',
                text: 'Yaşadığınız şehir bölgesi:',
                options: [
                    { optionId: 'opt_ist', label: 'İstanbul', order: 1 },
                    { optionId: 'opt_ank', label: 'Ankara', order: 2 },
                    { optionId: 'opt_izmir', label: 'İzmir', order: 3 }
                ]
            }
        ]
    });
    console.log('Seed demo surveys complete!');
};
exports.seedDemoSurveys = seedDemoSurveys;
//# sourceMappingURL=seed.js.map