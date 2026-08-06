export type SurveyCategory = 'teknoloji' | 'moda' | 'gida' | 'finans' | 'spor' | 'genel';

export interface Question {
  id: string;
  text: string;
  options: string[];
  selectedOptionIndex?: number;
}

export interface Survey {
  id: string;
  title: string;
  rewardCash: number; // ₺
  rewardXp: number; // XP
  questionsCount: number;
  estimatedMinutes: number;
  category: SurveyCategory;
  isCompleted: boolean;
  questions: Question[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  balance: number;
  completedSurveysCount: number;
  demographicsCompletedCount: number;
  watchedVideosCount: number;
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
