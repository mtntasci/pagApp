import { Survey, Question, UserProfile, WithdrawalRequest, Transaction, StoryItem, ProfileQuestion } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Mert Yılmaz",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  xp: 420,
  balance: 245.50,
  completedSurveysCount: 8,
  demographicsCompletedCount: 1,
  watchedVideosCount: 3,
  completedProfileQuestionIds: [],
  locationSharingEnabled: false
};

// Kalıcı Profil Soruları (Sadece XP kazandırır, süresizdir, kümülatif puan artışı sağlar)
export const INITIAL_PROFILE_QUESTIONS: ProfileQuestion[] = [
  {
    id: 'pq-1',
    category: 'lokasyon',
    text: 'Hangi şehirde ikamet ediyorsunuz?',
    options: ['İstanbul (Avrupa)', 'İstanbul (Anadolu)', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'],
    rewardXp: 25
  },
  {
    id: 'pq-2',
    category: 'demografi',
    text: 'Hangi taraftarı olduğunuz futbol/spor takımı hangisidir?',
    options: ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Diğer Takım', 'Takım Tutmuyorum'],
    rewardXp: 20
  },
  {
    id: 'pq-3',
    category: 'inanc',
    text: 'İnanç ve dünya görüşü tercihinizi paylaşmak ister misiniz?',
    options: ['Müslüman', 'Deist / Agnostik', 'Ateist', 'Hristiyan / Musevi', 'Belirtmek İstemiyorum'],
    rewardXp: 30
  },
  {
    id: 'pq-4',
    category: 'demografi',
    text: 'En son mezun olduğunuz eğitim seviyeniz nedir?',
    options: ['Lise veya Altı', 'Üniversite Öğrencisi', 'Lisans Mezunu', 'Yüksek Lisans / Doktora'],
    rewardXp: 25
  },
  {
    id: 'pq-5',
    category: 'demografi',
    text: 'Aylık ortalama hane halkı gelir segmentiniz hangisidir?',
    options: ['25.000 ₺ altı', '25.000 ₺ - 50.000 ₺', '50.000 ₺ - 85.000 ₺', '85.000 ₺ ve üzeri'],
    rewardXp: 35
  }
];

export const INITIAL_STORIES: StoryItem[] = [
  {
    id: 'story-1',
    title: 'Kahve Alışkanlıkları',
    category: 'gida',
    gradient: 'from-amber-400 to-orange-500',
    icon: 'Coffee',
    surveyId: 'survey-1'
  },
  {
    id: 'story-2',
    title: 'Yayın Platformları',
    category: 'teknoloji',
    gradient: 'from-purple-500 to-indigo-600',
    icon: 'Tv',
    surveyId: 'survey-2'
  },
  {
    id: 'story-3',
    title: 'Yatırım Tercihleri',
    category: 'finans',
    gradient: 'from-emerald-400 to-teal-600',
    icon: 'TrendingUp',
    surveyId: 'survey-3'
  },
  {
    id: 'story-4',
    title: 'Moda ve Alışveriş',
    category: 'moda',
    gradient: 'from-pink-400 to-rose-600',
    icon: 'ShoppingBag'
  },
  {
    id: 'story-5',
    title: 'Mobil Oyun Trendleri',
    category: 'teknoloji',
    gradient: 'from-blue-400 to-indigo-500',
    icon: 'Gamepad2'
  }
];

export const DEMOGRAPHIC_QUESTIONS: Question[] = [
  {
    id: 'demo-1',
    text: 'Cinsiyetiniz nedir?',
    options: ['Kadın', 'Erkek', 'Belirtmek istemiyorum']
  },
  {
    id: 'demo-2',
    text: 'Hangi yaş grubundasınız?',
    options: ['18-24', '25-34', '35-44', '45+']
  },
  {
    id: 'demo-3',
    text: 'Eğitim durumunuz nedir?',
    options: ['Lise veya altı', 'Ön Lisans / Üniversite öğrencisi', 'Lisans Mezunu', 'Lisansüstü / Doktora']
  },
  {
    id: 'demo-4',
    text: 'Çalışma durumunuz nedir?',
    options: ['Tam zamanlı çalışan', 'Yarı zamanlı / Serbest çalışan', 'Öğrenci', 'Çalışmıyor / İş arıyor']
  },
  {
    id: 'demo-5',
    text: 'Aylık hane geliriniz yaklaşık ne kadardır?',
    options: ['20.000 ₺ altı', '20.000 ₺ - 40.000 ₺', '40.000 ₺ - 70.000 ₺', '70.000 ₺ ve üzeri']
  }
];

export const INITIAL_SURVEYS: Survey[] = [
  {
    id: 'survey-1',
    title: 'Yeni Nesil Kahve Alışkanlıkları',
    type: 'campaign',
    brandName: 'Starbucks / Kahve Dünyası',
    rewardCash: 15.00,
    rewardXp: 40,
    questionsCount: 3,
    estimatedMinutes: 2,
    category: 'gida',
    isCompleted: false,
    expiresAt: '2026-08-31',
    questions: [
      {
        id: 's1-q1',
        text: 'Kahve tüketim sıklığınız nedir?',
        options: ['Günde birden fazla', 'Günde 1 kez', 'Haftada birkaç kez', 'Nadir veya hiç']
      },
      {
        id: 's1-q2',
        text: 'En çok tercih ettiğiniz kahve türü hangisidir?',
        options: ['Türk Kahvesi', 'Filtre Kahve', 'Espresso bazlı kahveler (Latte, Cappuccino vb.)', 'Hazır kahve (Nescafe vb.)']
      },
      {
        id: 's1-q3',
        text: 'Dışarıda kahve içerken bir bardağa en fazla ne kadar ödersiniz?',
        options: ['50 ₺ altı', '50 ₺ - 100 ₺', '100 ₺ - 150 ₺', '150 ₺ ve üzeri']
      }
    ]
  },
  {
    id: 'survey-2',
    title: 'Dijital Yayın Platformları ve Dizi Tercihleri',
    type: 'campaign',
    brandName: 'Netflix / BluTV',
    rewardCash: 20.00,
    rewardXp: 50,
    questionsCount: 3,
    estimatedMinutes: 2,
    category: 'teknoloji',
    isCompleted: false,
    expiresAt: '2026-08-25',
    questions: [
      {
        id: 's2-q1',
        text: 'Aylık en sık kullandığınız dizi/film platformu hangisidir?',
        options: ['Netflix', 'BluTV', 'Prime Video', 'Disney+', 'Diğer / Hiçbiri']
      },
      {
        id: 's2-q2',
        text: 'Dizi ve film izleme kararlarınızda en çok hangisi etkilidir?',
        options: ['Arkadaş tavsiyesi', 'Sosyal medya yorumları', 'Platform algoritması önerileri', 'Fragmanlar']
      },
      {
        id: 's2-q3',
        text: 'Bir dijital yayın aboneliği için aylık makul bütçeniz nedir?',
        options: ['100 ₺ altı', '100 ₺ - 200 ₺', '200 ₺ - 300 ₺', '300 ₺ üzeri']
      }
    ]
  },
  {
    id: 'survey-3',
    title: 'Finansal Yatırım Eğilimleri Araştırması',
    type: 'campaign',
    brandName: 'Garanti BBVA / Midas',
    rewardCash: 35.00,
    rewardXp: 80,
    questionsCount: 3,
    estimatedMinutes: 3,
    category: 'finans',
    isCompleted: false,
    expiresAt: '2026-09-10',
    questions: [
      {
        id: 's3-q1',
        text: 'Birikimlerinizi ağırlıklı olarak nasıl değerlendiriyorsunuz?',
        options: ['Mevduat Hesabı / Faiz', 'Altın / Döviz', 'Borsa / Hisse Senedi', 'Kripto Paralar', 'Değerlendirmiyorum / Diğer']
      },
      {
        id: 's3-q2',
        text: 'Yatırım kararlarınızı alırken en çok kime/neye güvenirsiniz?',
        options: ['Kendi araştırmalarıma', 'Finansal analistlere / Haberlere', 'Sosyal medya fenomenlerine', 'Eş-dost tavsiyesine']
      },
      {
        id: 's3-q3',
        text: 'Mobil bankacılık uygulamalarından en büyük beklentiniz nedir?',
        options: ['Kolay ve hızlı kullanıcı arayüzü', 'Düşük işlem ücretleri / komisyonsuzluk', 'Yüksek faiz ve yatırım oranları', 'Kişisel bütçe analiz araçları']
      }
    ]
  },
  {
    id: 'survey-4',
    title: 'Hızlı Tüketim Gıdaları ve Atıştırmalık Seçimleri',
    type: 'campaign',
    brandName: 'Ülker / Eti',
    rewardCash: 12.50,
    rewardXp: 30,
    questionsCount: 3,
    estimatedMinutes: 2,
    category: 'gida',
    isCompleted: false,
    expiresAt: '2026-08-20',
    questions: [
      {
        id: 's4-q1',
        text: 'Gün içinde en çok ne tür atıştırmalık tüketirsiniz?',
        options: ['Çikolata / Bisküvi', 'Cips / Kuruyemiş', 'Meyve / Sağlıklı barlar', 'Tüketmem']
      },
      {
        id: 's4-q2',
        text: 'Yeni bir atıştırmalık ürün denerken hangisi belirleyicidir?',
        options: ['Farklı aroması / tadı', 'Marka güvenilirliği', 'Fiyat / İndirim', 'Reklamlar / Sosyal medya']
      },
      {
        id: 's4-q3',
        text: 'Atıştırmalık satın alırken paketlerin üzerindeki kalori değerlerine dikkat eder misiniz?',
        options: ['Her zaman', 'Bazen', 'Hiçbir zaman', 'Sadece diyet yaparken']
      }
    ]
  }
];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 'req-1',
    userName: 'Mert Yılmaz',
    amount: 150.00,
    method: 'iban',
    destination: 'TR56 0006 2000 0001 2345 6789 01',
    date: '2026-08-05 14:32',
    status: 'approved'
  },
  {
    id: 'req-2',
    userName: 'Ceren Demir',
    amount: 100.00,
    method: 'giftcard',
    destination: 'cerendemir@gmail.com (Hepsiburada)',
    date: '2026-08-06 09:15',
    status: 'pending'
  },
  {
    id: 'req-3',
    userName: 'Ahmet Kaya',
    amount: 200.00,
    method: 'iban',
    destination: 'TR12 0001 0000 0000 9876 5432 10',
    date: '2026-08-06 11:20',
    status: 'pending'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'survey',
    title: 'Giyim Tercihleri Anketi',
    amount: 10.00,
    xp: 25,
    date: '2026-08-04'
  },
  {
    id: 'tx-2',
    type: 'video',
    title: 'Sponsorlu Video İzleme',
    amount: 0,
    xp: 5,
    date: '2026-08-05'
  },
  {
    id: 'tx-3',
    type: 'profile',
    title: 'Eğitim Bilgisi Güncelleme',
    amount: 0,
    xp: 25,
    date: '2026-08-05'
  },
  {
    id: 'tx-4',
    type: 'withdrawal',
    title: 'Banka Hesabına Çekim (IBAN)',
    amount: -150.00,
    date: '2026-08-05'
  },
  {
    id: 'tx-5',
    type: 'survey',
    title: 'Sosyal Medya Kullanım Alışkanlıkları',
    amount: 25.00,
    xp: 60,
    date: '2026-08-06'
  }
];
