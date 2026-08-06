"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Coffee, Tv, TrendingUp, ShoppingBag, Gamepad2, Wallet, User, Home, 
  ClipboardCheck, ArrowRight, CheckCircle, Award, Play, Sparkles, 
  Coins, HelpCircle, Check, Loader2, Landmark, CreditCard, ChevronRight,
  Info, ShieldCheck, Zap, MapPin, Lock, Smartphone, Shield, Mail, Chrome
} from 'lucide-react';
import { Survey, Question, UserProfile, WithdrawalRequest, Transaction, StoryItem, SpeedCampaignState, ProfileQuestion } from '../../../../packages/shared/types';
import { DEMOGRAPHIC_QUESTIONS, INITIAL_STORIES, INITIAL_PROFILE_QUESTIONS, INITIAL_USER_PROFILE, INITIAL_SURVEYS, INITIAL_TRANSACTIONS } from '../../../../packages/shared/data';
import { motion, AnimatePresence } from 'motion/react';



export default function Page() {
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [speedCampaign, setSpeedCampaign] = useState<SpeedCampaignState>({
    isActive: false,
    playerCompleted: false,
    leaderboard: []
  });

  const handleCompletePlayerSpeedRun = (ms: number) => {
    // Dummy implementation for now, will be replaced with Firebase later
    setSpeedCampaign(prev => ({
      ...prev,
      playerCompleted: true,
      playerRank: 1,
      playerReward: 15.00
    }));
  };

  // Login states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);
  const [locationPermGranted, setLocationPermGranted] = useState<'granted' | 'denied' | 'none'>('none');

  // Rewarded Phone Verification states in Profile
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const [phoneToVerify, setPhoneToVerify] = useState<string>('');
  const [verificationSmsSent, setVerificationSmsSent] = useState<boolean>(false);
  const [smsVerificationCode, setSmsVerificationCode] = useState<string>('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState<boolean>(false);

  // Navigation states
  const [activeTab, setActiveTab] = useState<'home' | 'surveys' | 'wallet' | 'profile'>('home');
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [currentSurveyQuestionIndex, setCurrentSurveyQuestionIndex] = useState<number>(0);
  const [selectedSurveyAnswer, setSelectedSurveyAnswer] = useState<number | null>(null);

  // Demographics state
  const [isDemographicsOpen, setIsDemographicsOpen] = useState<boolean>(false);
  const [currentDemoIndex, setCurrentDemoIndex] = useState<number>(0);
  const [selectedDemoAnswer, setSelectedDemoAnswer] = useState<number | null>(null);

  // Video state
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoTimer, setVideoTimer] = useState<number>(5);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cashout Form
  const [cashoutMethod, setCashoutMethod] = useState<'iban' | 'giftcard'>('iban');
  const [ibanInput, setIbanInput] = useState<string>('TR');
  const [fullNameInput, setFullNameInput] = useState<string>('');
  const [giftcardEmail, setGiftcardEmail] = useState<string>('');
  const [giftcardBrand, setGiftcardBrand] = useState<string>('Hepsiburada');
  const [cashoutAmount, setCashoutAmount] = useState<string>('100.00');
  const [cashoutSuccessMsg, setCashoutSuccessMsg] = useState<string | null>(null);
  const [cashoutErrorMsg, setCashoutErrorMsg] = useState<string | null>(null);

  // Screen transition / Success Celebrations
  const [celebration, setCelebration] = useState<{
    show: boolean;
    cash: number;
    xp: number;
    title: string;
  } | null>(null);

  // === SPEED RUN STATES ===
  const [campaignElapsedSec, setCampaignElapsedSec] = useState<number>(0);
  const [isSpeedRunActiveScreen, setIsSpeedRunActiveScreen] = useState<boolean>(false);
  const [speedRunQuestionIdx, setSpeedRunQuestionIdx] = useState<number>(0);
  const [speedRunAnswers, setSpeedRunAnswers] = useState<number[]>([]);
  const [playerStartTime, setPlayerStartTime] = useState<number>(0);
  const [playerElapsedMs, setPlayerElapsedMs] = useState<number>(0);
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const [activeSpeedrunElapsedMs, setActiveSpeedrunElapsedMs] = useState<number>(0);

  // Stopwatch ticking hook for active speedrun survey in Mobile
  useEffect(() => {
    if (!speedCampaign.isActive || !speedCampaign.startTime || speedCampaign.playerCompleted) {
      setCampaignElapsedSec(0);
      return;
    }
    const interval = setInterval(() => {
      const elapsed = (Date.now() - (speedCampaign.startTime || 0)) / 1000;
      setCampaignElapsedSec(elapsed);
    }, 150);
    return () => clearInterval(interval);
  }, [speedCampaign.isActive, speedCampaign.startTime, speedCampaign.playerCompleted]);

  useEffect(() => {
    if (speedCampaign.isActive && !speedCampaign.playerCompleted && campaignElapsedSec >= 15 && !isSpeedRunActiveScreen) {
      setShowNotificationBanner(true);
    } else {
      setShowNotificationBanner(false);
    }
  }, [speedCampaign.isActive, speedCampaign.playerCompleted, campaignElapsedSec, isSpeedRunActiveScreen]);

  // Player stopwatch tick while answering the active campaign
  useEffect(() => {
    if (!isSpeedRunActiveScreen || playerStartTime === 0 || speedCampaign.playerCompleted) {
      return;
    }
    const interval = setInterval(() => {
      setActiveSpeedrunElapsedMs(Date.now() - playerStartTime);
    }, 45);
    return () => clearInterval(interval);
  }, [isSpeedRunActiveScreen, playerStartTime, speedCampaign.playerCompleted]);

  // Filter & Search inside "Anketlerim"
  const [surveyTab, setSurveyTab] = useState<'active' | 'completed'>('active');
  const [surveyTypeTab, setSurveyTypeTab] = useState<'campaign' | 'profile'>('campaign');
  const [profileQuestions, setProfileQuestions] = useState<ProfileQuestion[]>(INITIAL_PROFILE_QUESTIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load backend profile questions from API if available
  useEffect(() => {
    fetch('/api/profile-questions')
      .then(res => res.json())
      .then(data => {
        if (data && data.questions && Array.isArray(data.questions)) {
          setProfileQuestions(data.questions);
        }
      })
      .catch(err => console.log('Using local profile questions'));
  }, []);

  const handleAnswerProfileQuestion = (questionId: string, optionIdx: number, rewardXp: number, text: string) => {
    if (userProfile.completedProfileQuestionIds?.includes(questionId)) return;

    setUserProfile(prev => ({
      ...prev,
      xp: prev.xp + rewardXp,
      demographicsCompletedCount: prev.demographicsCompletedCount + 1,
      completedProfileQuestionIds: [...(prev.completedProfileQuestionIds || []), questionId]
    }));

    setTransactions(prev => [
      {
        id: `tx-pq-${Date.now()}`,
        type: 'profile',
        title: `Profil Sorusu: ${text.length > 22 ? text.substring(0, 20) + '...' : text}`,
        amount: 0,
        xp: rewardXp,
        date: new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);

    setCelebration({
      show: true,
      cash: 0,
      xp: rewardXp,
      title: 'Profil XP Puanı Kazanıldı!'
    });
  };

  // Triggered when a survey category story is clicked
  const handleStoryClick = (story: StoryItem) => {
    if (story.surveyId) {
      const survey = surveys.find(s => s.id === story.surveyId);
      if (survey) {
        if (survey.isCompleted) {
          setActiveTab('surveys');
          setSurveyTab('completed');
        } else {
          startSurvey(survey);
        }
      }
    } else {
      // General categories without specific survey
      setSelectedCategory(story.category);
      setActiveTab('surveys');
      setSurveyTab('active');
    }
  };

  // Demographic Question Answered
  const handleDemoAnswerSubmit = () => {
    if (selectedDemoAnswer === null) return;

    // Is it the last demographic question?
    if (currentDemoIndex >= DEMOGRAPHIC_QUESTIONS.length - 1) {
      // Finished all demographics!
      const gainedXp = 25;
      const newXp = userProfile.xp + gainedXp;
      
      setUserProfile(prev => ({
        ...prev,
        xp: newXp,
        demographicsCompletedCount: Math.min(DEMOGRAPHIC_QUESTIONS.length, prev.demographicsCompletedCount + 1)
      }));

      // Add transaction
      const newTx: Transaction = {
        id: `tx-demo-${Date.now()}`,
        type: 'profile',
        title: 'Profil Profil Bilgisi Anketi',
        amount: 0,
        xp: gainedXp,
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions(prev => [newTx, ...prev]);

      setIsDemographicsOpen(false);
      setCurrentDemoIndex(0);
      setSelectedDemoAnswer(null);

      // Trigger Celebration
      setCelebration({
        show: true,
        cash: 0,
        xp: gainedXp,
        title: 'Profil Puanı Başarıyla Yükseltildi!'
      });
    } else {
      // Move to next demo question
      setUserProfile(prev => ({
        ...prev,
        demographicsCompletedCount: Math.min(DEMOGRAPHIC_QUESTIONS.length, prev.demographicsCompletedCount + 1)
      }));
      
      // Update with points for each? The user asked: "Bu eylemler doğrudan Profil Puanı biriktirmelerini sağlar."
      // Let's add 5 XP per intermediate demographic question to give instant satisfaction!
      const intermediateXp = 5;
      setUserProfile(prev => ({
        ...prev,
        xp: prev.xp + intermediateXp
      }));

      setTransactions(prev => [{
        id: `tx-demo-part-${Date.now()}`,
        type: 'profile',
        title: `Demografik Bilgi (${DEMOGRAPHIC_QUESTIONS[currentDemoIndex].text})`,
        amount: 0,
        xp: intermediateXp,
        date: new Date().toISOString().split('T')[0]
      }, ...prev]);

      setCurrentDemoIndex(prev => prev + 1);
      setSelectedDemoAnswer(null);
    }
  };

  // Video play helper
  const startVideoAd = () => {
    setIsVideoPlaying(true);
    setVideoTimer(5);
    
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    
    videoIntervalRef.current = setInterval(() => {
      setVideoTimer(prev => {
        if (prev <= 1) {
          if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
          setIsVideoPlaying(false);
          
          // Add reward
          const gainedXp = 5;
          setUserProfile(profile => ({
            ...profile,
            xp: profile.xp + gainedXp,
            watchedVideosCount: profile.watchedVideosCount + 1
          }));

          setTransactions(txs => [{
            id: `tx-video-${Date.now()}`,
            type: 'video',
            title: 'Sponsorlu Video Ödülü',
            amount: 0,
            xp: gainedXp,
            date: new Date().toISOString().split('T')[0]
          }, ...txs]);

          // Trigger Celebration
          setCelebration({
            show: true,
            cash: 0,
            xp: gainedXp,
            title: 'Sponsor Videosu Başarıyla İzlendi!'
          });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, []);

  // Survey Flow helpers
  const startSurvey = (survey: Survey) => {
    setCurrentSurvey(survey);
    setCurrentSurveyQuestionIndex(0);
    setSelectedSurveyAnswer(null);
  };

  const handleSurveyAnswerSubmit = () => {
    if (!currentSurvey || selectedSurveyAnswer === null) return;

    // Check if there are more questions
    if (currentSurveyQuestionIndex >= currentSurvey.questions.length - 1) {
      // Completed the survey!
      const updatedSurveys = surveys.map(s => {
        if (s.id === currentSurvey.id) {
          return { ...s, isCompleted: true };
        }
        return s;
      });
      setSurveys(updatedSurveys);

      // Reward User
      setUserProfile(prev => ({
        ...prev,
        xp: prev.xp + currentSurvey.rewardXp,
        balance: prev.balance + currentSurvey.rewardCash,
        completedSurveysCount: prev.completedSurveysCount + 1
      }));

      // Add Transaction
      const newTx: Transaction = {
        id: `tx-survey-${Date.now()}`,
        type: 'survey',
        title: `${currentSurvey.title} Anketi`,
        amount: currentSurvey.rewardCash,
        xp: currentSurvey.rewardXp,
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions(prev => [newTx, ...prev]);

      const finishedSurvey = currentSurvey;
      setCurrentSurvey(null);
      setCurrentSurveyQuestionIndex(0);
      setSelectedSurveyAnswer(null);

      // Trigger Celebration Page
      setCelebration({
        show: true,
        cash: finishedSurvey.rewardCash,
        xp: finishedSurvey.rewardXp,
        title: finishedSurvey.title
      });
    } else {
      // Proceed to next question
      setCurrentSurveyQuestionIndex(prev => prev + 1);
      setSelectedSurveyAnswer(null);
    }
  };

  // Submit cashout request
  const handleCashoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCashoutSuccessMsg(null);
    setCashoutErrorMsg(null);

    const amount = parseFloat(cashoutAmount);
    if (isNaN(amount) || amount <= 0) {
      setCashoutErrorMsg('Lütfen geçerli bir çekim tutarı giriniz.');
      return;
    }

    if (amount < 50) {
      setCashoutErrorMsg('Minimum para çekme limiti 50.00 ₺\'dir.');
      return;
    }

    if (amount > userProfile.balance) {
      setCashoutErrorMsg('Yetersiz bakiye. Mevcut bakiyenizden daha yüksek bir miktar çekemezsiniz.');
      return;
    }

    // Process Withdrawal Request
    let destination = '';
    if (cashoutMethod === 'iban') {
      if (!ibanInput.startsWith('TR') || ibanInput.length < 20) {
        setCashoutErrorMsg('Lütfen geçerli bir TR ile başlayan IBAN numarası giriniz.');
        return;
      }
      if (fullNameInput.trim().length < 5) {
        setCashoutErrorMsg('Lütfen geçerli bir ad soyad giriniz.');
        return;
      }
      destination = `${fullNameInput} - ${ibanInput.replace(/\s+/g, '')}`;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(giftcardEmail)) {
        setCashoutErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
        return;
      }
      destination = `${giftcardEmail} (${giftcardBrand} Çeki)`;
    }

    // Success - Create the pending request
    const newRequest: WithdrawalRequest = {
      id: `req-${Date.now()}`,
      userName: userProfile.name,
      amount: amount,
      method: cashoutMethod,
      destination: destination,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending'
    };

    // Deduct balance instantly as pending transaction
    setUserProfile(prev => ({
      ...prev,
      balance: prev.balance - amount
    }));

    // Add withdrawal transaction
    const newTx: Transaction = {
      id: `tx-withdrawal-${Date.now()}`,
      type: 'withdrawal',
      title: `${cashoutMethod === 'iban' ? 'Banka Hesabına Çekim (IBAN)' : 'Hediye Çeki Çekimi'}`,
      amount: -amount,
      date: new Date().toISOString().split('T')[0]
    };

    setWithdrawalRequests(prev => [newRequest, ...prev]);
    setTransactions(prev => [newTx, ...prev]);

    // Reset Form
    setIbanInput('TR');
    setGiftcardEmail('');
    setCashoutSuccessMsg('Para çekme talebiniz başarıyla oluşturuldu! Kurumsal onay panelimize gönderildi.');
  };

  // Helper to get Category Color
  const getCategoryMeta = (cat: string) => {
    switch(cat) {
      case 'gida': return { label: 'Gıda & Gurme', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
      case 'teknoloji': return { label: 'Teknoloji', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' };
      case 'finans': return { label: 'Finans', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
      case 'moda': return { label: 'Moda & Tarz', color: 'bg-pink-500/10 text-pink-300 border-pink-500/20' };
      case 'spor': return { label: 'Spor & Sağlık', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' };
      default: return { label: 'Genel Kültür', color: 'bg-slate-500/10 text-slate-300 border-slate-500/20' };
    }
  };

  // Get stories category icon
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-5 h-5 text-white" />;
      case 'Tv': return <Tv className="w-5 h-5 text-white" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-white" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-white" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-white" />;
      default: return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  // Get gamified tier level
  const getUserTier = (xp: number) => {
    if (xp >= 1000) return { label: 'Altın Üye', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    if (xp >= 500) return { label: 'Gümüş Üye', color: 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30' };
    return { label: 'Bronz Üye', color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' };
  };

  const userTier = getUserTier(userProfile.xp);

  return (
    <div className="w-full h-[100dvh] bg-[#0a0c14] flex flex-col select-none text-white relative overflow-hidden">

      {/* GLOBAL TOP BAR (Sabit) */}
      {isLoggedIn && !currentSurvey && !isDemographicsOpen && !isVideoPlaying && !isSpeedRunActiveScreen && (
        <div className="w-full pt-4 px-5 pb-3 bg-[#0a0c14]/90 z-30 flex justify-between items-center border-b border-white/5 sticky top-0 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img 
                src={userProfile.avatar} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-0.5 border-2 border-[#0a0c14]">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-none">PAG Mobil</h1>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Hoş geldin, {userProfile.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-emerald-400">₺{userProfile.balance.toFixed(2)}</span>
              <span className="text-[9px] text-indigo-300 font-semibold">{userProfile.xp} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area (Scrollable with hidden bar) */}
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-none relative flex flex-col">
        {!isLoggedIn ? (
          <div className="flex-1 flex flex-col justify-between p-5 pt-7">
            {/* Top Logo and Tagline */}
            <div className="flex flex-col items-center text-center mt-8 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-500/30 mb-4">
                PAG
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">PAG Mobil</h2>
              <p className="text-xs text-indigo-300 font-bold uppercase mt-1 tracking-wide">
                Persona Analytics & Geotargeting
              </p>
            </div>

            {/* Login Options */}
            <div className="flex-1 flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {!showEmailForm ? (
                  <motion.div
                    key="social-login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-3"
                  >
                    <button
                      onClick={() => {
                        setIsLoginLoading(true);
                        setTimeout(() => {
                          setIsLoginLoading(false);
                          setIsLoggedIn(true);
                        }, 600);
                      }}
                      className="bg-white hover:bg-white/95 text-slate-900 rounded-xl py-3.5 px-4 text-sm font-black tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Chrome className="w-5 h-5 text-rose-500" />
                      <span>Google ile Giriş Yap</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsLoginLoading(true);
                        setTimeout(() => {
                          setIsLoginLoading(false);
                          setIsLoggedIn(true);
                        }, 600);
                      }}
                      className="bg-black hover:bg-neutral-950 text-white border border-white/15 rounded-xl py-3.5 px-4 text-sm font-black tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span className="text-lg leading-none font-bold"></span>
                      <span>Apple ile Giriş Yap</span>
                    </button>

                    <div className="flex items-center gap-3 my-2 px-4">
                      <div className="flex-1 h-[1px] bg-white/10"></div>
                      <span className="text-[10px] text-white/30 font-black tracking-widest uppercase">VEYA</span>
                      <div className="flex-1 h-[1px] bg-white/10"></div>
                    </div>

                    <button
                      onClick={() => setShowEmailForm(true)}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-3.5 px-4 text-sm font-black tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
                    >
                      <Mail className="w-5 h-5 text-indigo-400" />
                      <span>E-posta ile Giriş Yap</span>
                    </button>
                    
                    {/* Quick Demo Bypass */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setIsLoggedIn(true)}
                        className="text-[10px] text-white/40 hover:text-white font-bold flex items-center gap-1.5 justify-center mx-auto transition-all cursor-pointer py-1.5 px-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/5"
                      >
                        <span>Şifresiz Demo Girişi</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="email-login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-4"
                  >
                    <button 
                      onClick={() => setShowEmailForm(false)}
                      className="self-start text-xs text-white/50 hover:text-white flex items-center gap-1 mb-2 transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Geri Dön
                    </button>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl flex flex-col gap-4">
                      <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-400" /> E-posta ile Giriş
                      </span>

                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="block text-[10px] text-white/50 font-bold mb-1.5 uppercase tracking-wider">E-posta Adresiniz</label>
                          <input 
                            type="email"
                            placeholder="adiniz@eposta.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full bg-[#0a0c14]/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 font-bold mb-1.5 uppercase tracking-wider">Şifre</label>
                          <input 
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-[#0a0c14]/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsLoginLoading(true);
                          setTimeout(() => {
                            setIsLoginLoading(false);
                            setIsLoggedIn(true);
                          }, 800);
                        }}
                        className="w-full h-12 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg border border-indigo-500/30"
                        disabled={isLoginLoading}
                      >
                        {isLoginLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        ) : (
                          <>
                            <span>Giriş Yap / Kayıt Ol</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <>
            {/* TRANSITION OVERLAYS (No popup rule applied) */}
            <AnimatePresence mode="wait">
          
          {/* Active Survey Answering Screen */}
          {currentSurvey && (
            <motion.div 
              key="survey-screen"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute inset-0 bg-[#0a0c14]/95 backdrop-blur-2xl z-40 flex flex-col p-6 text-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setCurrentSurvey(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <span className="text-xs font-semibold text-white/50">
                  Soru {currentSurveyQuestionIndex + 1} / {currentSurvey.questions.length}
                </span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                  +{currentSurvey.rewardCash.toFixed(2)} ₺
                </span>
              </div>

              {/* Progress Indicator */}
              <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSurveyQuestionIndex + 1) / currentSurvey.questions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <span className="inline-block text-[10px] uppercase tracking-wider text-indigo-300 font-bold bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded-full mb-2">
                  {getCategoryMeta(currentSurvey.category).label}
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {currentSurvey.questions[currentSurveyQuestionIndex].text}
                </h3>
              </div>

              {/* Options */}
              <div className="flex-1 flex flex-col gap-3">
                {currentSurvey.questions[currentSurveyQuestionIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSurveyAnswer(idx)}
                    className={`w-full min-h-[52px] p-4 text-left rounded-2xl border transition-all duration-200 flex items-center justify-between text-sm cursor-pointer ${
                      selectedSurveyAnswer === idx
                        ? 'border-indigo-500 bg-indigo-500/20 text-white font-semibold shadow-lg shadow-indigo-500/10'
                        : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span>{option}</span>
                    {selectedSurveyAnswer === idx && (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer Button */}
              <button
                disabled={selectedSurveyAnswer === null}
                onClick={handleSurveyAnswerSubmit}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mt-4 border border-indigo-500/30 cursor-pointer shadow-lg"
              >
                <span>
                  {currentSurveyQuestionIndex === currentSurvey.questions.length - 1 ? 'Anketi Bitir & Kazan' : 'Sonraki Soru'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Demographic Profile Survey Screen */}
          {isDemographicsOpen && (
            <motion.div 
              key="demographics-screen"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute inset-0 bg-[#0a0c14]/95 backdrop-blur-2xl z-40 flex flex-col p-6 text-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setIsDemographicsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <span className="text-xs font-semibold text-white/50">
                  Adım {currentDemoIndex + 1} / {DEMOGRAPHIC_QUESTIONS.length}
                </span>
                <span className="text-xs bg-orange-500/15 text-orange-400 font-bold px-2.5 py-1 rounded-full border border-orange-500/20">
                  +25 XP Toplam
                </span>
              </div>

              {/* Progress Indicator */}
              <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${((currentDemoIndex + 1) / DEMOGRAPHIC_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <span className="inline-block text-[10px] uppercase tracking-wider text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full mb-2">
                  Profil Geliştirme
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {DEMOGRAPHIC_QUESTIONS[currentDemoIndex].text}
                </h3>
              </div>

              {/* Options */}
              <div className="flex-1 flex flex-col gap-3">
                {DEMOGRAPHIC_QUESTIONS[currentDemoIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDemoAnswer(idx)}
                    className={`w-full min-h-[52px] p-4 text-left rounded-2xl border transition-all duration-200 flex items-center justify-between text-sm cursor-pointer ${
                      selectedDemoAnswer === idx
                        ? 'border-orange-500 bg-orange-500/20 text-white font-semibold shadow-lg shadow-orange-500/10'
                        : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span>{option}</span>
                    {selectedDemoAnswer === idx && (
                      <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer Button */}
              <button
                disabled={selectedDemoAnswer === null}
                onClick={handleDemoAnswerSubmit}
                className="w-full h-12 bg-orange-600 hover:bg-orange-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mt-4 border border-orange-500/30 cursor-pointer shadow-lg"
              >
                <span>
                  {currentDemoIndex === DEMOGRAPHIC_QUESTIONS.length - 1 ? 'Profili Kaydet & Kazan' : 'Cevapla & Devam Et'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Video Ad Screen with Timer */}
          {isVideoPlaying && (
            <motion.div 
              key="video-ad-screen"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="absolute inset-0 bg-slate-950 z-50 flex flex-col p-6 items-center justify-between text-white"
            >
              <div className="w-full flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Sponsorlu Reklam</span>
                <span className="bg-white/10 text-xs px-3 py-1.5 rounded-full font-mono font-bold">
                  {videoTimer} sn sonra ödül
                </span>
              </div>

              {/* Mock Video Container */}
              <div className="w-full aspect-[9/16] max-h-[480px] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-cover bg-center filter brightness-50 flex items-center justify-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400')" }}>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center animate-pulse">
                      <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </div>
                    <span className="text-sm font-bold text-white text-center px-4 drop-shadow">
                      Yeni Mobil Oyuna Göz At & İndir!
                    </span>
                  </div>
                </div>
                {/* Progress bar overlay */}
                <div className="absolute bottom-0 left-0 h-1 bg-teal-400 transition-all duration-1000" style={{ width: `${(1 - videoTimer / 5) * 100}%` }}></div>
              </div>

              <div className="w-full flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-400 text-center">Video bitene kadar uygulamadan çıkmayınız</span>
                <span className="text-[10px] text-teal-400 font-bold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> +5 Profil Puanı (XP)
                </span>
              </div>
            </motion.div>
          )}

          {/* Reward Celebration Screen */}
          {celebration && celebration.show && (
            <motion.div 
              key="celebration-screen"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl z-40 flex flex-col items-center justify-center p-6 text-center text-white"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 animate-bounce">
                <Award className="w-12 h-12 text-emerald-400" />
              </div>

              <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-extrabold mb-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Harika İş!
              </span>
              
              <h3 className="text-xl font-bold text-white px-4 leading-snug mb-3">
                {celebration.title}
              </h3>
              
              <p className="text-xs text-white/60 mb-8 max-w-[240px]">
                Fikirlerini paylaştığın için ödüllerin hesabına anında yatırıldı!
              </p>

              {/* Rewards Summary */}
              <div className="flex gap-4 mb-10">
                {celebration.cash > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4 w-28 flex flex-col items-center shadow-md">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase mb-1">Kazanılan</span>
                    <span className="text-lg font-black text-emerald-300 font-display">
                      {celebration.cash.toFixed(2)} ₺
                    </span>
                  </div>
                )}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-4 w-28 flex flex-col items-center shadow-md">
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase mb-1">Kazanılan</span>
                  <span className="text-lg font-black text-indigo-300 font-display">
                    +{celebration.xp} XP
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCelebration(null)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg border border-indigo-500/30 transition-all text-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Ödülü Topla</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== 1. HOME TAB ==================== */}
        {activeTab === 'home' && (
          <div className="flex flex-col">
            
            {/* Horizontal circular "Stories" strip (Instagram tarzı hikayeler) */}
            <div className="bg-transparent py-3 border-b border-white/5 overflow-x-auto scrollbar-none flex gap-3 px-4">
              
              {/* User Profile Story (En soldaki ilk daire) */}
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex flex-col items-center cursor-pointer flex-shrink-0"
              >
                <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
                  <div className="p-[2px] bg-[#0a0c14] rounded-full">
                    <img 
                      src={userProfile.avatar} 
                      alt="Profilim" 
                      className="w-[48px] h-[48px] rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white/80 mt-1">Profilim</span>
              </div>

              {/* Fırsat Anketleri Stories */}
              {INITIAL_STORIES.map((story) => (
                <div 
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="flex flex-col items-center cursor-pointer flex-shrink-0"
                >
                  <div className={`relative p-[2.5px] rounded-full bg-gradient-to-tr ${story.gradient} animate-pulse-slow`}>
                    <div className="p-[2px] bg-[#0a0c14] rounded-full">
                      <div className={`w-[48px] h-[48px] rounded-full bg-gradient-to-tr ${story.gradient} flex items-center justify-center`}>
                        {getCategoryIcon(story.icon)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-white/70 mt-1 max-w-[64px] truncate text-center">
                    {story.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Middle Gamified Points Engine */}
            <div className="px-4 pt-4 pb-2">
              <span className="text-xs font-semibold text-white/50">Hoş geldin,</span>
              <h2 className="text-base font-extrabold text-white leading-none">{userProfile.name}</h2>
              
              {/* Profile XP Meter */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-4 mt-3 shadow-2xl flex flex-col backdrop-blur-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60 font-semibold">Profil Gücü & Puanı</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${userTier.color}`}>
                    {userTier.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-black text-white tracking-tight font-display">{userProfile.xp}</span>
                  <span className="text-xs font-bold text-white/40">XP</span>
                </div>

                {/* Progress bar to next tier (500 for Silver, 1000 for Gold) */}
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] rounded-full" 
                    style={{ width: `${Math.min(100, (userProfile.xp / 1000) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-white/40 mt-1.5 self-end">
                  Sonraki Seviye için {1000 - userProfile.xp} XP kaldı
                </span>

                {/* Two side-by-side action cards (Profilini Tamamla & Video İzle) */}
                <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-white/10">
                  <button 
                    onClick={() => {
                      if (userProfile.demographicsCompletedCount >= DEMOGRAPHIC_QUESTIONS.length) {
                        alert("Profil anketlerinizi zaten tamamladınız! Yeni demografik sorular eklendiğinde bildirim alacaksınız.");
                      } else {
                        setIsDemographicsOpen(true);
                      }
                    }}
                    className="flex flex-col items-start p-3 bg-orange-500/10 hover:bg-orange-500/15 rounded-2xl border border-orange-500/20 text-left transition-all group cursor-pointer"
                  >
                    <span className="p-1.5 bg-orange-500/25 rounded-xl text-orange-300 mb-1.5 group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-bold text-orange-300">Profili Tamamla</span>
                    <span className="text-[9px] font-semibold text-orange-400 mt-0.5">+25 Puan</span>
                  </button>

                  <button 
                    onClick={startVideoAd}
                    className="flex flex-col items-start p-3 bg-teal-500/10 hover:bg-teal-500/15 rounded-2xl border border-teal-500/20 text-left transition-all group cursor-pointer"
                  >
                    <span className="p-1.5 bg-teal-500/25 rounded-xl text-teal-300 mb-1.5 group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-bold text-teal-300">Video İzle</span>
                    <span className="text-[9px] font-semibold text-teal-400 mt-0.5">+5 Puan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Wallet Card Section (Cüzdan Kartı) */}
            <div className="px-4 py-2">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[28px] p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-[155px] border border-white/15">
                {/* Visual Accent */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-black/20 rounded-full blur-xl"></div>
                
                <div className="flex justify-between items-start z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-indigo-100/70 font-bold uppercase tracking-wider">Cüzdan Bakiyem</span>
                    <span className="text-2xl font-black font-display text-white mt-1">
                      {userProfile.balance.toFixed(2)} ₺
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-indigo-200 font-bold tracking-wider">PAG PAY</span>
                  </div>
                </div>

                <div className="flex justify-between items-end z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-indigo-200/50 font-bold">KART SAHİBİ</span>
                    <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
                      {userProfile.name}
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveTab('wallet');
                      setCashoutSuccessMsg(null);
                      setCashoutErrorMsg(null);
                    }}
                    className="px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Parayı Çek</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Active Surveys (Aktif Anket Listesi) */}
            <div className="px-4 py-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-white/80 uppercase tracking-wider">Öne Çıkan Anketler</span>
                <span 
                  onClick={() => {
                    setActiveTab('surveys');
                    setSurveyTab('active');
                  }} 
                  className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Tümünü Gör
                </span>
              </div>

              {/* Survey List */}
              <div className="flex flex-col gap-3">
                {surveys.filter(s => !s.isCompleted).slice(0, 3).map((survey) => {
                  const meta = getCategoryMeta(survey.category);
                  return (
                    <div 
                      key={survey.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col transition-all hover:border-white/20 backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${meta.color}`}>
                          {meta.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-semibold">
                          <ClipboardCheck className="w-3.5 h-3.5 text-white/40" />
                          <span>{survey.questionsCount} Soru</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug mb-3">
                        {survey.title}
                      </h4>

                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
                        {/* Reward tag */}
                        <div className="flex gap-2">
                          <span className="text-xs font-black text-emerald-400 font-display">
                            {survey.rewardCash.toFixed(2)} ₺
                          </span>
                          <span className="text-xs font-semibold text-indigo-400">
                            +{survey.rewardXp} XP
                          </span>
                        </div>

                        <button
                          onClick={() => startSurvey(survey)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-indigo-500/30"
                        >
                          <span>Doldur</span>
                          <ArrowRight className="w-3 h-3 text-emerald-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {surveys.filter(s => !s.isCompleted).length === 0 && (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl py-6 px-4 text-center backdrop-blur-md">
                    <CheckCircle className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-xs text-white/70 font-medium">Harika! Tüm aktif anketleri doldurdunuz.</p>
                    <p className="text-[10px] text-white/40 mt-1">Yönetici panelinden anında yeni bir anket ekleyerek test edebilirsiniz.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 2. SURVEYS TAB ==================== */}
        {activeTab === 'surveys' && (
          <div className="px-4 pt-4 pb-12">
            <h2 className="text-base font-extrabold text-white mb-3">Fırsat & Profil Marketim</h2>

            {/* Type selector: Normal (Kampanya) vs Profil (Süresiz XP) */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setSurveyTypeTab('campaign')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  surveyTypeTab === 'campaign'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/30 shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Marka Anketleri (₺ + XP)</span>
              </button>
              <button
                onClick={() => setSurveyTypeTab('profile')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  surveyTypeTab === 'profile'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/30 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>Profil Anketleri (XP)</span>
              </button>
            </div>

            {surveyTypeTab === 'campaign' ? (
              <>
                {/* In-app Subtabs */}
                <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 mb-4">
                  <button
                    onClick={() => setSurveyTab('active')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      surveyTab === 'active' 
                        ? 'bg-white/10 text-white border border-white/10 shadow-sm' 
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    Aktif ({surveys.filter(s => !s.isCompleted).length})
                  </button>
                  <button
                    onClick={() => setSurveyTab('completed')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      surveyTab === 'completed' 
                        ? 'bg-white/10 text-white border border-white/10 shadow-sm' 
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    Tamamlananlar ({surveys.filter(s => s.isCompleted).length})
                  </button>
                </div>

                {/* Filter Categories Chips */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-3 mb-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full border flex-shrink-0 transition-all cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-600 text-white border-indigo-500/50 shadow-md'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Hepsi
                  </button>
                  {['gida', 'teknoloji', 'finans', 'moda', 'spor', 'genel'].map((cat) => {
                    const meta = getCategoryMeta(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-full border flex-shrink-0 transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-indigo-600 text-white border-indigo-500/50 shadow-md'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>

                {/* Campaign Survey Cards Feed */}
                <div className="flex flex-col gap-3">
                  {surveys
                    .filter(s => (surveyTab === 'active' ? !s.isCompleted : s.isCompleted))
                    .filter(s => selectedCategory === 'all' || s.category === selectedCategory)
                    .map((survey) => {
                      const meta = getCategoryMeta(survey.category);
                      return (
                        <div 
                          key={survey.id}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col backdrop-blur-md"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${meta.color}`}>
                                {meta.label}
                              </span>
                              {survey.expiresAt && (
                                <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                  ⏳ Son: {survey.expiresAt}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-white/40 text-[10px] font-semibold">
                              <span>{survey.questionsCount} Soru</span>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-white leading-snug mb-3">
                            {survey.title}
                          </h4>

                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <div className="flex gap-2">
                              <span className="text-xs font-black text-emerald-400 font-display">
                                {survey.rewardCash.toFixed(2)} ₺
                              </span>
                              <span className="text-xs font-semibold text-indigo-400">
                                +{survey.rewardXp} XP
                              </span>
                            </div>

                            {surveyTab === 'active' ? (
                              <button
                                onClick={() => startSurvey(survey)}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-indigo-500/30 shadow-md"
                              >
                                <span>Doldur</span>
                                <ArrowRight className="w-3 h-3 text-emerald-400" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Tamamlandı
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {surveys
                    .filter(s => (surveyTab === 'active' ? !s.isCompleted : s.isCompleted))
                    .filter(s => selectedCategory === 'all' || s.category === selectedCategory)
                    .length === 0 && (
                    <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl py-8 text-center text-white/50 backdrop-blur-md">
                      <p className="text-xs font-semibold">Gösterilecek marka anketi bulunamadı.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* PROFIL ANKETLERI (Kalıcı, XP Ödüllü, Süresiz) */
              <div className="flex flex-col gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-200 leading-relaxed mb-1">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Kalıcı Profil Puanı Havuzu</span>
                  </div>
                  Bu bölümdeki sorular **süresizdir ve asla silinmez**. Cevapladıkça kümülatif XP puanınız sürekli artar!
                </div>

                {profileQuestions.map((pq) => {
                  const isCompleted = userProfile.completedProfileQuestionIds?.includes(pq.id);
                  return (
                    <div key={pq.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col backdrop-blur-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          {pq.category} • Kalıcı Sorular
                        </span>
                        <span className="text-xs font-bold text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          +{pq.rewardXp} XP
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white mb-3 leading-snug">
                        {pq.text}
                      </h4>

                      {isCompleted ? (
                        <div className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl text-center flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Cevaplandı (+{pq.rewardXp} XP Kazanıldı)
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5">
                          {pq.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAnswerProfileQuestion(pq.id, idx, pq.rewardXp, pq.text)}
                              className="px-3 py-2 bg-white/5 hover:bg-emerald-600/30 text-white/90 hover:text-white text-[10px] font-bold rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all text-left cursor-pointer"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. WALLET TAB ==================== */}
        {activeTab === 'wallet' && (
          <div className="px-4 pt-4">
            <h2 className="text-base font-extrabold text-white mb-3">Cüzdanım & Çekim</h2>

            {/* Small Balance Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 text-white shadow-xl flex justify-between items-center mb-4 backdrop-blur-xl">
              <div>
                <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Çekilebilir Bakiye</span>
                <div className="text-xl font-black font-display text-white mt-0.5">
                  {userProfile.balance.toFixed(2)} ₺
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-2xl border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Güvenli Çekim
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-xl mb-4 backdrop-blur-xl">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wide mb-3">Kolay Ödeme Yöntemi</h3>
              
              {/* Tabs for IBAN or Giftcard */}
              <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setCashoutMethod('iban');
                    setCashoutSuccessMsg(null);
                    setCashoutErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    cashoutMethod === 'iban' 
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm' 
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" /> Banka Transferi (IBAN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCashoutMethod('giftcard');
                    setCashoutSuccessMsg(null);
                    setCashoutErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    cashoutMethod === 'giftcard' 
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm' 
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Hediye Çeki
                </button>
              </div>

              {/* Status Messages */}
              {cashoutSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-bold mb-3 border border-emerald-500/20 leading-snug">
                  {cashoutSuccessMsg}
                </div>
              )}
              {cashoutErrorMsg && (
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl text-[10px] font-bold mb-3 border border-rose-500/20 leading-snug">
                  {cashoutErrorMsg}
                </div>
              )}

              {/* Dynamic Form fields */}
              <form onSubmit={handleCashoutSubmit} className="flex flex-col gap-3">
                {cashoutMethod === 'iban' ? (
                  <>
                    <div>
                      <label className="block text-[9px] font-bold text-white/50 uppercase mb-1">ALICI ADI SOYADI</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Mert Yılmaz"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-white/50 uppercase mb-1">IBAN NUMARASI</label>
                      <input
                        type="text"
                        required
                        maxLength={26}
                        placeholder="TR..."
                        value={ibanInput}
                        onChange={(e) => setIbanInput(e.target.value.toUpperCase())}
                        className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase mb-1">MARKA SEÇİMİ</label>
                        <select
                          value={giftcardBrand}
                          onChange={(e) => setGiftcardBrand(e.target.value)}
                          className="w-full text-xs px-2 py-2 rounded-xl bg-[#0a0c14] border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                        >
                          <option value="Hepsiburada" className="bg-[#0a0c14] text-white">Hepsiburada</option>
                          <option value="Trendyol" className="bg-[#0a0c14] text-white">Trendyol</option>
                          <option value="Getir" className="bg-[#0a0c14] text-white">Getir</option>
                          <option value="Amazon TR" className="bg-[#0a0c14] text-white">Amazon TR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase mb-1">ÇEKİM TUTARI (₺)</label>
                        <input
                          type="number"
                          min={50}
                          step={10}
                          value={cashoutAmount}
                          onChange={(e) => setCashoutAmount(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-white/50 uppercase mb-1">TESLİMAT E-POSTASI</label>
                      <input
                        type="email"
                        required
                        placeholder="Örn: adiniz@domain.com"
                        value={giftcardEmail}
                        onChange={(e) => setGiftcardEmail(e.target.value)}
                        className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 font-medium"
                      />
                    </div>
                  </>
                )}

                {cashoutMethod === 'iban' && (
                  <div>
                    <label className="block text-[9px] font-bold text-white/50 uppercase mb-1">ÇEKİM TUTARI (₺)</label>
                    <input
                      type="number"
                      min={50}
                      step={10}
                      value={cashoutAmount}
                      onChange={(e) => setCashoutAmount(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 font-bold"
                    />
                  </div>
                )}

                <span className="text-[9px] text-white/40 leading-snug flex items-start gap-1">
                  <Info className="w-3 h-3 text-white/40 flex-shrink-0 mt-0.5" />
                  <span>Para çekme talepleri genellikle 24 saat içinde kurumsal markamız tarafından incelenerek onaylanır. Minimum çekim limiti 50 ₺'dir.</span>
                </span>

                <button
                  type="submit"
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg border border-indigo-500/30 cursor-pointer active:scale-95"
                >
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>Talebi Kurumsal Onaya Gönder</span>
                </button>
              </form>
            </div>

            {/* Withdrawal & General History list */}
            <div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wide mb-2">Para Hareketlerim</h3>
              <div className="flex flex-col gap-2">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex justify-between items-center shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        tx.amount < 0 
                          ? 'bg-rose-500/15 text-rose-400' 
                          : tx.xp ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {tx.amount < 0 ? <Landmark className="w-4 h-4" /> : <ClipboardCheck className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/90">{tx.title}</span>
                        <span className="text-[9px] text-white/40">{tx.date}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      {tx.amount !== 0 && (
                        <span className={`text-xs font-black font-display ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {tx.amount < 0 ? '-' : '+'}{Math.abs(tx.amount).toFixed(2)} ₺
                        </span>
                      )}
                      {tx.xp && (
                        <span className="text-[9px] font-bold text-indigo-400">
                          +{tx.xp} XP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 4. PROFILE TAB ==================== */}
        {activeTab === 'profile' && (
          <div className="px-4 pt-4">
            <h2 className="text-base font-extrabold text-white mb-3">Hesabım</h2>

            {/* User Profile Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col items-center text-center mb-4 backdrop-blur-xl">
              <div className="relative mb-3">
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-emerald-400" />
                </span>
              </div>

              <h3 className="text-sm font-black text-white">{userProfile.name}</h3>
              <p className="text-[10px] text-white/40 font-semibold mb-3">mtntasci@gmail.com</p>
              
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${userTier.color}`}>
                {userTier.label} ({userProfile.xp} XP)
              </span>

              {/* Core user stats boxes */}
              <div className="grid grid-cols-3 gap-2.5 w-full mt-5 pt-4 border-t border-white/10">
                <div className="flex flex-col items-center bg-white/5 rounded-2xl p-2.5 border border-white/10">
                  <span className="text-xs font-black text-white">{userProfile.completedSurveysCount}</span>
                  <span className="text-[8px] text-white/40 font-bold uppercase mt-0.5">Anket</span>
                </div>
                <div className="flex flex-col items-center bg-white/5 rounded-2xl p-2.5 border border-white/10">
                  <span className="text-xs font-black text-white">{userProfile.demographicsCompletedCount}</span>
                  <span className="text-[8px] text-white/40 font-bold uppercase mt-0.5">Profil</span>
                </div>
                <div className="flex flex-col items-center bg-white/5 rounded-2xl p-2.5 border border-white/10">
                  <span className="text-xs font-black text-white">{userProfile.watchedVideosCount}</span>
                  <span className="text-[8px] text-white/40 font-bold uppercase mt-0.5">Video</span>
                </div>
              </div>
            </div>

            {/* Profile Power Tracker (Oyunlaştırılmış profil sadakat seviyesi) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-xl mb-4 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-2.5">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wide">Profil Tamamlama Gücü</h4>
                <span className="text-[10px] text-indigo-400 font-bold">
                  %{Math.round((userProfile.demographicsCompletedCount / DEMOGRAPHIC_QUESTIONS.length) * 100)}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500"
                  style={{ width: `${(userProfile.demographicsCompletedCount / DEMOGRAPHIC_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>

              {/* Sub items */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-medium">Demografik Sorular ({userProfile.demographicsCompletedCount}/{DEMOGRAPHIC_QUESTIONS.length})</span>
                  {userProfile.demographicsCompletedCount >= DEMOGRAPHIC_QUESTIONS.length ? (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">Tamamlandı</span>
                  ) : (
                    <button 
                      onClick={() => setIsDemographicsOpen(true)}
                      className="text-[9px] font-bold text-orange-400 bg-orange-500/15 hover:bg-orange-500/25 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-orange-500/20"
                    >
                      Doldur (+25 XP)
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                  <span className="text-white/60 font-medium">Cihaz Doğrulama</span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">Aktif 📱</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                  <span className="text-white/60 font-medium">E-Posta Doğrulama</span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">Doğrulandı ✅</span>
                </div>

                <div className="flex flex-col pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60 font-medium">Telefon Doğrulama</span>
                    {isPhoneVerified ? (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Doğrulandı (+250 XP & +10 ₺) ✅
                      </span>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setIsVerifyingPhone(!isVerifyingPhone)}
                        className="text-[9px] font-bold text-indigo-400 bg-indigo-500/15 hover:bg-indigo-500/25 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-indigo-500/20"
                      >
                        {isVerifyingPhone ? 'Kapat' : 'Doğrula (+250 XP & +10 ₺)'}
                      </button>
                    )}
                  </div>

                  {/* Inline phone verification form */}
                  {!isPhoneVerified && isVerifyingPhone && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2.5 p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2.5 overflow-hidden text-left"
                    >
                      {!verificationSmsSent ? (
                        <div className="flex flex-col gap-2">
                          <label className="block text-[8px] text-white/50 font-bold uppercase">Cep Telefonu Numaranız</label>
                          <div className="flex gap-1.5">
                            <span className="bg-[#0a0c14]/50 border border-white/10 rounded-xl px-2 flex items-center justify-center text-[10px] font-semibold text-white/60">
                              +90
                            </span>
                            <input 
                              type="tel"
                              placeholder="(5__) ___ __ __"
                              value={phoneToVerify}
                              onChange={(e) => setPhoneToVerify(e.target.value)}
                              className="flex-1 bg-[#0a0c14]/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!phoneToVerify) return;
                              setVerificationSmsSent(true);
                            }}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black tracking-wide transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Doğrulama SMS'i Gönder</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] text-indigo-300 font-bold uppercase">SMS KODUNU GİRİN</span>
                            <button 
                              type="button"
                              onClick={() => setVerificationSmsSent(false)}
                              className="text-[8px] text-white/40 hover:text-white font-bold underline"
                            >
                              Geri Git
                            </button>
                          </div>
                          <input 
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={smsVerificationCode}
                            onChange={(e) => setSmsVerificationCode(e.target.value)}
                            className="w-full bg-[#0a0c14]/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-center text-xs font-mono tracking-[0.2em] text-white placeholder-white/10 focus:outline-none focus:border-indigo-500"
                          />
                          <p className="text-[8px] text-white/40 font-semibold text-center leading-normal">
                            Deneme kodu: <span className="text-white font-bold">123456</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (smsVerificationCode === '123456' || smsVerificationCode.length >= 4) {
                                setIsPhoneVerified(true);
                                setIsVerifyingPhone(false);
                                // Reward user: +250 XP and +10 TL balance
                                setUserProfile(prev => ({
                                  ...prev,
                                  xp: prev.xp + 250,
                                  balance: prev.balance + 10,
                                  demographicsCompletedCount: prev.demographicsCompletedCount + 1
                                }));
                                // Add transaction log
                                setTransactions(prev => [
                                  {
                                    id: `tx-phone-${Date.now()}`,
                                    type: 'profile',
                                    title: '📱 Cep Telefonu Doğrulama Ödülü',
                                    amount: 10,
                                    xp: 250,
                                    date: new Date().toISOString().split('T')[0]
                                  },
                                  ...prev
                                ]);
                                // Trigger completion modal/celebration
                                setCelebration({
                                  show: true,
                                  cash: 10,
                                  xp: 250,
                                  title: 'Telefon Doğrulama Tamamlandı!'
                                });
                              }
                            }}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black tracking-wide transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Kodu Doğrula & Ödülü Al</span>
                            <Check className="w-3 h-3 text-emerald-400" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Loyalty levels explained */}
            <div className="bg-gradient-to-r from-indigo-950 to-slate-905 rounded-3xl p-4 text-white shadow-xl flex flex-col gap-2 border border-white/10 backdrop-blur-xl bg-white/5">
              <span className="text-[10px] text-indigo-400 font-black tracking-wider uppercase">Sadakat & Ayrıcalık Seviyeleri</span>
              <p className="text-[10px] text-white/60 leading-relaxed">
                Profil puanınızı (XP) yükselterek kurumsal markaların yüksek bütçeli ödüllü anketlerinde öne çıkın!
              </p>
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center text-[9px] bg-white/5 p-1.5 rounded-xl border border-white/5">
                  <span className="font-bold text-white/85">Bronz (0 - 499 XP)</span>
                  <span className="text-white/40">Standart Anket Erişimi</span>
                </div>
                <div className="flex justify-between items-center text-[9px] bg-white/5 p-1.5 rounded-xl border border-white/5">
                  <span className="font-bold text-slate-300">Gümüş (500 - 999 XP)</span>
                  <span className="text-indigo-400 font-semibold">%10 Daha Yüksek Kazanç</span>
                </div>
                <div className="flex justify-between items-center text-[9px] bg-white/10 p-1.5 rounded-xl border border-white/10">
                  <span className="font-bold text-amber-300">Altın (1000+ XP)</span>
                  <span className="text-emerald-400 font-black">Öncelikli Push Bildirimi + %25 Fazla Ödül</span>
                </div>
              </div>
            </div>

            {/* Giriş Ekranı Test Butonu */}
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-rose-300 hover:text-rose-200 font-bold rounded-2xl border border-rose-500/10 hover:border-rose-500/30 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Giriş Ekranını Gör (Çıkış Yap)</span>
            </button>

          </div>
        )}
          </>
        )}
      </div>

      {/* 4. Bottom Navigation Menu (Sabit Alt Navigasyon) */}
      {isLoggedIn && (
        <div className="absolute bottom-0 left-0 right-0 h-[68px] bg-[#0a0c14]/90 border-t border-white/5 flex items-center justify-around px-2 z-30 backdrop-blur-xl">
          
          <button 
            onClick={() => {
              setActiveTab('home');
              setCurrentSurvey(null);
              setIsDemographicsOpen(false);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'home' ? 'text-indigo-400 scale-105' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold">Ana Sayfa</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('surveys');
              setCurrentSurvey(null);
              setIsDemographicsOpen(false);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'surveys' ? 'text-indigo-400 scale-105' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[9px] font-bold">Anketlerim</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('wallet');
              setCurrentSurvey(null);
              setIsDemographicsOpen(false);
              setCashoutSuccessMsg(null);
              setCashoutErrorMsg(null);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'wallet' ? 'text-indigo-400 scale-105' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] font-bold">Cüzdan</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('profile');
              setCurrentSurvey(null);
              setIsDemographicsOpen(false);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'profile' ? 'text-indigo-400 scale-105' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold">Profil</span>
          </button>

        </div>
      )}

      {/* Physical Home Indicator bar */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-30"></div>

      {/* ==================== 5. PUSH NOTIFICATION BANNER (FLOAT OVERLAY) ==================== */}
      <AnimatePresence>
        {showNotificationBanner && (
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 12, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => {
              setShowNotificationBanner(false);
              setIsSpeedRunActiveScreen(true);
              setPlayerStartTime(Date.now());
              setActiveSpeedrunElapsedMs(0);
              setSpeedRunQuestionIdx(0);
              setSpeedRunAnswers([]);
            }}
            className="absolute top-0 left-3 right-3 bg-slate-900/90 border border-indigo-500/30 shadow-2xl rounded-2xl p-3.5 z-50 flex gap-3 cursor-pointer select-none backdrop-blur-md active:scale-98 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              VQ
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">VeloQuest • Şimdi</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              </div>
              <h4 className="text-xs font-black text-white mt-0.5">🚨 FLAŞ KAMPANYA: 10.000 ₺ Dağıtılıyor!</h4>
              <p className="text-[10px] text-slate-300 leading-normal mt-0.5">İlk cevap veren ol, 5.000 ₺ kap! Süre saniyelerle yarışıyor. Hemen katıl!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 6. HIGH-INTENSITY SPEEDRUN GAME SCREEN ==================== */}
      <AnimatePresence>
        {isSpeedRunActiveScreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-slate-950/98 z-50 flex flex-col p-5 text-white select-none overflow-hidden"
          >
            {/* Countdown / Stopwatch HUD */}
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">CANLI HIZ YARIŞI</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-sm px-3.5 py-1.5 rounded-xl font-bold animate-pulse-slow">
                ⏱️ {(activeSpeedrunElapsedMs / 1000).toFixed(3)} sn
              </div>
            </div>

            {!speedCampaign.playerCompleted ? (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Progress Header */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400">SORU {speedRunQuestionIdx + 1} / 3</span>
                    <span className="text-[10px] font-black text-indigo-300 tracking-wider bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                      HIZ BONUSU: +60 XP
                    </span>
                  </div>

                  {/* Question Cards */}
                  <AnimatePresence mode="wait">
                    {speedRunQuestionIdx === 0 && (
                      <motion.div
                        key="q1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-sm font-black text-white leading-relaxed">
                          Hangi bankacılık kanalını veya mobil cüzdanı günlük hayatınızda en aktif kullanıyorsunuz?
                        </h3>
                        <div className="flex flex-col gap-2.5 pt-2">
                          {["Mobil Bankacılık", "Kredi / Banka Kartı", "Temassız Telefon / QR", "Kullanmıyorum"].map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSpeedRunAnswers(prev => [...prev, i]);
                                setSpeedRunQuestionIdx(1);
                              }}
                              className="w-full py-3 px-4 text-left rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 text-xs font-bold text-white/90 active:scale-98 transition-all cursor-pointer"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {speedRunQuestionIdx === 1 && (
                      <motion.div
                        key="q2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-sm font-black text-white leading-relaxed">
                          Kredi kartı tercihinizde ve finansal ürün seçimlerinizde en belirleyici faktör hangisidir?
                        </h3>
                        <div className="flex flex-col gap-2.5 pt-2">
                          {["Nakit Avans Limiti", "Puan / Mil Oranları", "Aidatsız / Masrafsız Olması", "Alışveriş Taksitleri"].map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSpeedRunAnswers(prev => [...prev, i]);
                                setSpeedRunQuestionIdx(2);
                              }}
                              className="w-full py-3 px-4 text-left rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 text-xs font-bold text-white/90 active:scale-98 transition-all cursor-pointer"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {speedRunQuestionIdx === 2 && (
                      <motion.div
                        key="q3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-sm font-black text-white leading-relaxed">
                          Gelecekteki tasarruf ve kişisel finansal yatırımlarınızda hangi enstrümanı tercih edersiniz?
                        </h3>
                        <div className="flex flex-col gap-2.5 pt-2">
                          {["Vadeli Mevduat Faizi", "Hisse Senedi / Fonlar", "Altın / Döviz", "Kripto Varlıklar"].map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const finishedAnswers = [...speedRunAnswers, i];
                                setSpeedRunAnswers(finishedAnswers);
                                const finalMs = Date.now() - playerStartTime;
                                setPlayerElapsedMs(finalMs);
                                handleCompletePlayerSpeedRun(finalMs);
                              }}
                              className="w-full py-3 px-4 text-left rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 text-xs font-bold text-white/90 active:scale-98 transition-all cursor-pointer"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5 text-[9px] text-white/50 mb-4 leading-normal font-semibold">
                  <Info className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Süreç otomatik dalga bildirimlerine göre anlık ölçülmektedir. Ne kadar hızlı bitirirseniz, ödül bütçesinden (10.000 ₺) o kadar yüksek pay alırsınız!</span>
                </div>
              </div>
            ) : (
              /* RESULTS CELEBRATION PAGE */
              <div className="flex-1 flex flex-col justify-between overflow-y-auto scrollbar-none">
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0.7, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-3xl mx-auto shadow-lg shadow-orange-500/20 mb-3"
                  >
                    🏆
                  </motion.div>

                  <h3 className="text-base font-black text-white tracking-tight">Yarış Tamamlandı!</h3>
                  <p className="text-[10px] text-slate-400">Skorunuz ve sıralamanız başarıyla işlendi.</p>

                  {/* Highlights Card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-4 grid grid-cols-2 gap-3 max-w-[280px] mx-auto text-center backdrop-blur-md">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">SIRALAMANIZ</span>
                      <span className="text-xl font-black text-amber-400 font-display mt-1 block">
                        {speedCampaign.playerRank}. Sıra
                      </span>
                    </div>
                    <div className="border-l border-white/10">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">TAMAMLAMA HIZI</span>
                      <span className="text-xl font-black text-rose-400 font-display mt-1 block">
                        {(playerElapsedMs / 1000).toFixed(3)}sn
                      </span>
                    </div>
                  </div>

                  {/* Profit Gained */}
                  <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-3.5 mt-3 max-w-[280px] mx-auto flex items-center justify-between text-left">
                    <div>
                      <span className="text-[9px] text-indigo-200/60 font-black tracking-wider uppercase block">Kazanılan Ödül</span>
                      <span className="text-lg font-black text-emerald-400 font-display block mt-0.5">+{speedCampaign.playerReward?.toFixed(2)} ₺</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-indigo-200/60 font-black tracking-wider uppercase block">Sadakat Bonusu</span>
                      <span className="text-xs font-extrabold text-indigo-300 block mt-0.5">+60 XP</span>
                    </div>
                  </div>

                  {/* Live Leaderboard subset */}
                  <div className="mt-4 border border-white/5 bg-[#020617]/50 rounded-2xl p-3 max-w-[300px] mx-auto text-left">
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-wider mb-2 block">Dalga İçi Liderlik Tablosu</span>
                    <div className="space-y-1.5 mt-2">
                      {speedCampaign.leaderboard.slice(0, 4).map((user, idx) => (
                        <div key={idx} className={`flex justify-between items-center text-[10px] p-1 px-2 rounded-xl ${user.isPlayer ? 'bg-indigo-500/20 border border-indigo-500/30 font-bold text-white' : 'text-slate-300'}`}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-indigo-400">#{user.rank}</span>
                            <span className="truncate max-w-[120px]">{user.userName}</span>
                          </div>
                          <div className="flex gap-2 items-center font-mono">
                            <span>{(user.completionTimeMs / 1000).toFixed(2)}s</span>
                            <span className="font-bold text-emerald-400">{user.reward}₺</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsSpeedRunActiveScreen(false);
                    setActiveTab('wallet');
                  }}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg mt-2 active:scale-95"
                >
                  <Wallet className="w-4 h-4 text-emerald-300" />
                  <span>Cüzdanımı Kontrol Et ve Bitir</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
