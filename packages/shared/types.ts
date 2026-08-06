export type SurveyCategory = 'teknoloji' | 'moda' | 'gida' | 'finans' | 'spor' | 'genel' | 'demografi' | 'lokasyon' | 'inanc';

export interface Question {
  id: string;
  text: string;
  options: string[];
  selectedOptionIndex?: number;
}

export type SurveyType = 'profile' | 'campaign';

export interface Survey {
  id: string;
  title: string;
  type?: SurveyType; // 'profile' (kalıcı, XP ödüllü) veya 'campaign' (süreli, ₺ ve XP ödüllü)
  rewardCash: number; // ₺
  rewardXp: number; // XP
  questionsCount: number;
  estimatedMinutes: number;
  category: SurveyCategory;
  isCompleted: boolean;
  expiresAt?: string; // Süreli anketler için son kullanma tarihi (ISO String / YYYY-MM-DD)
  brandName?: string; // Marka adı (Normal anketler için)
  questions: Question[];
}

// Kalıcı Profil Sorusu Modeli (Sadece XP kazandırır, süresizdir)
export interface ProfileQuestion {
  id: string;
  category: SurveyCategory;
  text: string;
  options: string[];
  rewardXp: number;
  isAnswered?: boolean;
  selectedOptionIndex?: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  avatar: string;
  xp: number;
  balance: number;
  completedSurveysCount: number;
  demographicsCompletedCount: number;
  watchedVideosCount: number;
  completedProfileQuestionIds?: string[];
  locationSharingEnabled?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userName: string;
  amount: number;
  method: 'iban' | 'giftcard';
  destination: string; // IBAN value or Email for giftcard
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Transaction {
  id: string;
  type: 'survey' | 'video' | 'profile' | 'withdrawal';
  title: string;
  amount: number; // positive or negative
  xp?: number;
  date: string;
}

export interface StoryItem {
  id: string;
  title: string;
  category: SurveyCategory;
  gradient: string;
  icon: string;
  surveyId?: string; // Links to a survey
}

export interface SpeedCampaignLeaderboardEntry {
  userName: string;
  xp: number;
  completionTimeMs: number;
  reward: number;
  rank: number;
  isPlayer?: boolean;
}

export interface SpeedCampaignState {
  isActive: boolean;
  startTime?: number;
  playerCompleted: boolean;
  playerRank?: number;
  playerReward?: number;
  leaderboard: SpeedCampaignLeaderboardEntry[];
}
