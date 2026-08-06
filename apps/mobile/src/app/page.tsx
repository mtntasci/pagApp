"use client";

import React, { useState } from 'react';
import { 
  Coffee, Tv, TrendingUp, ShoppingBag, Gamepad2, Wallet, User, Home, 
  ClipboardCheck, ArrowRight, CheckCircle, Award, Play, Sparkles, 
  Coins, HelpCircle, Check, Loader2, Landmark, CreditCard, ChevronRight,
  Info, ShieldCheck, Zap, MapPin, Lock, Smartphone, Shield, Mail, Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Survey, Question, UserProfile, WithdrawalRequest, Transaction, StoryItem, SpeedCampaignState } from '../../../packages/shared/types';
import { INITIAL_USER_PROFILE, INITIAL_STORIES, INITIAL_TRANSACTIONS, INITIAL_SURVEYS, DEMOGRAPHIC_QUESTIONS } from '../../../packages/shared/data';

export default function MobileAppPage() {
  // Login states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
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
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  
  // App state
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);

  // Demographics state
  const [isDemographicsOpen, setIsDemographicsOpen] = useState<boolean>(false);
  const [demoAnswers, setDemoAnswers] = useState<{ [key: string]: number }>({});
  const [currentDemoIdx, setCurrentDemoIdx] = useState<number>(0);

  // Withdrawal States
  const [cashoutAmount, setCashoutAmount] = useState<string>('');
  const [cashoutMethod, setCashoutMethod] = useState<'iban' | 'giftcard'>('iban');
  const [cashoutDestination, setCashoutDestination] = useState<string>('');
  const [isProcessingCashout, setIsProcessingCashout] = useState<boolean>(false);
  const [cashoutSuccessMsg, setCashoutSuccessMsg] = useState<string | null>(null);
  const [cashoutErrorMsg, setCashoutErrorMsg] = useState<string | null>(null);

  // Video Ad simulation
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoRewardTimer, setVideoRewardTimer] = useState<number | null>(null);

  // Celebration state
  const [celebration, setCelebration] = useState<{ show: boolean; cash: number; xp: number; title: string } | null>(null);

  // Survey categories
  const categoryLabels: Record<string, { label: string; bg: string; text: string }> = {
    teknoloji: { label: 'Teknoloji', bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-400' },
    moda: { label: 'Moda', bg: 'bg-pink-500/10 border-pink-500/20', text: 'text-pink-400' },
    gida: { label: 'Gıda', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
    finans: { label: 'Finans', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
    spor: { label: 'Spor', bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400' },
    genel: { label: 'Genel', bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400' }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gida': return <Coffee className="w-4 h-4" />;
      case 'teknoloji': return <Tv className="w-4 h-4" />;
      case 'finans': return <TrendingUp className="w-4 h-4" />;
      case 'moda': return <ShoppingBag className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {/* Phone container representing NextJS mobile client */}
      <div className="w-full max-w-[400px] h-[812px] bg-[#05060b] rounded-[48px] border-[8px] border-[#151825] shadow-2xl overflow-hidden relative flex flex-col">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-2xl z-40 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#0a0a0c] border border-white/5 ml-auto mr-3"></div>
        </div>

        {/* Custom Status Bar */}
        <div className="h-10 pt-3 px-8 flex justify-between items-center text-[10px] text-white/60 font-black z-30 select-none bg-transparent">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <div className="w-4 h-2.5 border border-white/30 rounded-sm p-[1px] flex items-center">
              <div className="w-2.5 h-full bg-emerald-400 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 relative flex flex-col pt-1">
          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col justify-between p-5 pt-7">
              {/* Top Logo */}
              <div className="flex flex-col items-center text-center mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-2xl mb-2.5">
                  PAG
                </div>
                <h2 className="text-lg font-black text-white tracking-tight">PAG Mobil App</h2>
                <p className="text-[9px] text-indigo-300 font-bold uppercase mt-0.5 tracking-wide">Next.js Monorepo Client</p>
                <p className="text-[11px] text-white/50 max-w-[260px] mt-2 leading-relaxed">
                  Gerçek zamanlı lokasyon bazlı görevler yapın ve ödülleri saniyeler içinde kazanın.
                </p>
              </div>

              {/* Login Form */}
              <div className="my-4 flex flex-col gap-3.5">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col gap-3">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" /> E-posta ile Giriş Yap
                  </span>

                  <div className="flex flex-col gap-2.5">
                    <div>
                      <label className="block text-[9px] text-white/50 font-bold mb-1 uppercase tracking-wider">E-POSTA ADRESİNİZ</label>
                      <input 
                        type="email"
                        placeholder="adiniz@eposta.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-[#0a0c14]/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-white/50 font-bold mb-1 uppercase tracking-wider">ŞİFRE</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-[#0a0c14]/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none"
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
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg border border-indigo-500/30"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Giriş Yap / Hesap Aç</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-2 px-2">
                  <div className="flex-1 h-[1px] bg-white/10"></div>
                  <span className="text-[9px] text-white/30 font-black tracking-widest uppercase">VEYA</span>
                  <div className="flex-1 h-[1px] bg-white/10"></div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setIsLoggedIn(true)}
                    className="bg-white hover:bg-white/95 text-slate-900 rounded-xl py-2 px-3 text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Chrome className="w-4 h-4 text-rose-500" />
                    <span>Google</span>
                  </button>
                  <button
                    onClick={() => setIsLoggedIn(true)}
                    className="bg-black hover:bg-neutral-950 text-white border border-white/15 rounded-xl py-2 px-3 text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span className="text-sm font-bold"></span>
                    <span>Apple</span>
                  </button>
                </div>
              </div>

              {/* Location Permission */}
              <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-white/10 rounded-2xl p-3 flex flex-col gap-1.5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-2 text-indigo-400">
                  <MapPin className="w-4 h-4 text-indigo-400 animate-bounce" />
                  <span className="text-[9px] font-black tracking-wider uppercase">Lokasyon Odaklı Güç</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                  Yanından geçtiğiniz mağazaların anlık anketlerini ve hediye çeklerini anında yakalayın!
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setLocationPermGranted('granted')}
                    className="py-1.5 bg-white/5 text-white/70 hover:bg-white/10 rounded-xl text-[9px] font-black transition-all cursor-pointer text-center border border-white/10"
                  >
                    {locationPermGranted === 'granted' ? '✓ İzin Verildi' : 'Her Zaman İzin Ver'}
                  </button>
                  <button
                    onClick={() => setLocationPermGranted('denied')}
                    className="py-1.5 bg-white/5 text-white/70 hover:bg-white/10 rounded-xl text-[9px] font-black transition-all cursor-pointer text-center border border-white/10"
                  >
                    İzin Verme
                  </button>
                </div>
              </div>

              {/* Instant bypass */}
              <div className="mt-2 text-center">
                <button
                  onClick={() => setIsLoggedIn(true)}
                  className="text-[10px] text-white/40 hover:text-white font-bold flex items-center gap-1.5 justify-center mx-auto transition-all cursor-pointer py-1 px-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5"
                >
                  <span>Giriş Yapmadan İlerle</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-4">
              {/* Header profile */}
              <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-3.5 shadow-xl">
                <div className="flex items-center gap-3">
                  <img src={userProfile.avatar} alt={userProfile.name} className="w-10 h-10 rounded-xl border border-white/10 object-cover" />
                  <div>
                    <h3 className="text-xs font-black text-white">{userProfile.name}</h3>
                    <p className="text-[10px] text-indigo-400 font-extrabold uppercase mt-0.5 tracking-wider">Level 4 Kaşif</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-black text-emerald-400 tracking-tight">{userProfile.balance.toFixed(2)} ₺</div>
                  <div className="text-[9px] text-white/40 font-bold uppercase mt-0.5">Bakiye</div>
                </div>
              </div>

              {/* Navigation Switch Tabs */}
              <div className="grid grid-cols-4 gap-1.5 bg-[#0a0c14]/60 p-1 border border-white/5 rounded-xl">
                {(['home', 'surveys', 'wallet', 'profile'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === tab 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {tab === 'home' && 'Ana'}
                    {tab === 'surveys' && 'Anket'}
                    {tab === 'wallet' && 'Cüzdan'}
                    {tab === 'profile' && 'Profil'}
                  </button>
                ))}
              </div>

              {/* View according to Active Tab */}
              {activeTab === 'home' && (
                <div className="flex flex-col gap-3">
                  {/* Quick video ad promo */}
                  <div className="bg-gradient-to-tr from-indigo-950/80 via-indigo-900/60 to-[#0e111d] border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" /> Sponsorlu Hızlı Ödül
                    </span>
                    <h4 className="text-sm font-black text-white">Sponsorlu video izle, anında +5 XP kazan!</h4>
                    <p className="text-[11px] text-white/50 mt-1.5 mb-3 leading-relaxed">Sadece 5 saniyelik mikro reklamlar ile XP seviyeni hızlıca artır.</p>
                    <button className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-500/20">
                      <Play className="w-3 h-3 text-white fill-white" />
                      <span>Videoyu Başlat</span>
                    </button>
                  </div>

                  {/* Stories list */}
                  <div>
                    <h3 className="text-[10px] text-white/40 font-extrabold uppercase tracking-widest mb-2 px-1">Öne Çıkan Keşifler</h3>
                    <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1.5">
                      {stories.map((story) => (
                        <div key={story.id} className="flex-shrink-0 w-24 h-24 rounded-2xl bg-white/5 border border-white/10 p-2.5 flex flex-col justify-between cursor-pointer hover:bg-white/10 transition-all">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${story.gradient} flex items-center justify-center text-white`}>
                            {getCategoryIcon(story.category)}
                          </div>
                          <span className="text-[9px] font-black leading-tight text-white/90">{story.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'surveys' && (
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-[10px] text-white/40 font-extrabold uppercase tracking-widest px-1">Aktif Araştırmalar</h3>
                  {surveys.map((survey) => (
                    <div key={survey.id} className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex justify-between items-center hover:bg-white/10 transition-all cursor-pointer">
                      <div>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryLabels[survey.category].bg} ${categoryLabels[survey.category].text}`}>
                          {categoryLabels[survey.category].label}
                        </span>
                        <h4 className="text-xs font-black text-white mt-2 leading-tight">{survey.title}</h4>
                        <p className="text-[10px] text-white/40 font-medium mt-1">{survey.questionsCount} Soru • {survey.estimatedMinutes} Dakika</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400 block">{survey.rewardCash.toFixed(2)} ₺</span>
                        <span className="text-[9px] font-bold text-indigo-400">+{survey.rewardXp} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="flex flex-col gap-3.5">
                  <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-white/10 rounded-2xl p-4 shadow-xl">
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Mevcut Bakiyeniz</span>
                    <h3 className="text-2xl font-black text-white tracking-tight mt-1">{userProfile.balance.toFixed(2)} ₺</h3>
                    <p className="text-[10px] text-white/40 font-semibold mt-1">Minimum çekim limiti: <span className="text-white font-bold">50.00 ₺</span></p>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="flex flex-col gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Doğrulamalar & Rozetler</span>
                    
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                      <span className="text-white/60 font-medium">E-Posta Doğrulama</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">Doğrulandı ✅</span>
                    </div>

                    <div className="flex flex-col pt-1">
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

                      {/* Phone verify form */}
                      {!isPhoneVerified && isVerifyingPhone && (
                        <div className="mt-2.5 p-3 bg-[#0a0c14]/40 border border-white/10 rounded-xl flex flex-col gap-2.5 text-left">
                          {!verificationSmsSent ? (
                            <div className="flex flex-col gap-2">
                              <label className="block text-[8px] text-white/50 font-bold uppercase">Cep Telefonu Numarası</label>
                              <div className="flex gap-1.5">
                                <span className="bg-[#0a0c14]/50 border border-white/10 rounded-xl px-2 flex items-center justify-center text-[10px] font-semibold text-white/60">
                                  +90
                                </span>
                                <input 
                                  type="tel"
                                  placeholder="(5__) ___ __ __"
                                  value={phoneToVerify}
                                  onChange={(e) => setPhoneToVerify(e.target.value)}
                                  className="flex-1 bg-[#0a0c14]/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (phoneToVerify) setVerificationSmsSent(true);
                                }}
                                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Kod Gönder
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <label className="block text-[8px] text-white/50 font-bold uppercase">6 Haneli Kod</label>
                              <input 
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                value={smsVerificationCode}
                                onChange={(e) => setSmsVerificationCode(e.target.value)}
                                className="w-full bg-[#0a0c14]/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-center text-xs font-mono tracking-[0.2em] text-white"
                              />
                              <p className="text-[8px] text-white/40 text-center">Test kodu: 123456</p>
                              <button
                                type="button"
                                onClick={() => {
                                  if (smsVerificationCode === '123456' || smsVerificationCode.length >= 4) {
                                    setIsPhoneVerified(true);
                                    setIsVerifyingPhone(false);
                                    setUserProfile(prev => ({
                                      ...prev,
                                      xp: prev.xp + 250,
                                      balance: prev.balance + 10
                                    }));
                                  }
                                }}
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Doğrula & Puanı Kazan
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dev Bypass logout */}
                  <button 
                    onClick={() => setIsLoggedIn(false)}
                    className="w-full mt-2 py-2.5 bg-white/5 hover:bg-white/10 text-rose-300 hover:text-rose-200 font-bold rounded-xl border border-rose-500/10 hover:border-rose-500/30 transition-all text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Giriş Ekranına Dön</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Physical Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-30"></div>
      </div>
    </main>
  );
}
