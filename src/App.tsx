import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Sliders, Workflow, Info, Sparkles, RefreshCw, 
  Coins, TrendingUp, CheckCircle, HelpCircle, ArrowRight, Zap
} from 'lucide-react';
import { 
  INITIAL_USER_PROFILE, INITIAL_SURVEYS, 
  INITIAL_WITHDRAWAL_REQUESTS, INITIAL_TRANSACTIONS 
} from './data';
import { UserProfile, Survey, WithdrawalRequest, Transaction, SpeedCampaignState } from './types';
import MobileApp from './components/MobileApp';
import AdminPanel from './components/AdminPanel';
import { motion } from 'motion/react';

export default function App() {
  // Shared reactive database states
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Shared Speed Campaign Simulation State
  const [speedCampaign, setSpeedCampaign] = useState<SpeedCampaignState>({
    isActive: false,
    playerCompleted: false,
    leaderboard: []
  });

  // Simulator useEffect for real-time bot completions during the speed run campaign
  useEffect(() => {
    if (!speedCampaign.isActive || !speedCampaign.startTime || speedCampaign.playerCompleted) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - (speedCampaign.startTime || 0);

      setSpeedCampaign(prev => {
        const currentLeaderboard = [...prev.leaderboard];
        const addedNames = currentLeaderboard.map(b => b.userName);

        const botData = [
          { name: 'Selin Şen (Altın Seviye - 780 XP)', xp: 780, time: 3800, reward: 5000, rank: 1 },
          { name: 'Kaan Demir (Altın Seviye - 550 XP)', xp: 550, time: 6900, reward: 2000, rank: 2 },
          { name: 'Hülya Avcı (Gümüş Seviye - 420 XP)', xp: 420, time: 10500, reward: 1000, rank: 3 },
          { name: 'Burak Kaya (Gümüş Seviye - 310 XP)', xp: 310, time: 14200, reward: 50, rank: 4 },
          { name: 'Deniz Can (Bronz Seviye - 240 XP)', xp: 240, time: 18500, reward: 50, rank: 5 },
          { name: 'Ece Kurt (Bronz Seviye - 180 XP)', xp: 180, time: 23000, reward: 50, rank: 6 },
          { name: 'Merve Tan (Bronz Seviye - 90 XP)', xp: 90, time: 28000, reward: 50, rank: 7 },
        ];

        let changed = false;
        botData.forEach(bot => {
          if (elapsed >= bot.time && !addedNames.includes(bot.name)) {
            currentLeaderboard.push({
              userName: bot.name,
              xp: bot.xp,
              completionTimeMs: bot.time,
              reward: bot.reward,
              rank: 0,
            });
            changed = true;
          }
        });

        if (changed) {
          // Sort by completion speed
          currentLeaderboard.sort((a, b) => a.completionTimeMs - b.completionTimeMs);
          // Re-rank and distribute rewards based on rank
          const reRanked = currentLeaderboard.map((item, idx) => {
            const rank = idx + 1;
            let reward = 50;
            if (rank === 1) reward = 5000;
            else if (rank === 2) reward = 2000;
            else if (rank === 3) reward = 1000;
            
            return {
              ...item,
              rank,
              reward
            };
          });

          return {
            ...prev,
            leaderboard: reRanked
          };
        }

        return prev;
      });

    }, 300);

    return () => clearInterval(interval);
  }, [speedCampaign.isActive, speedCampaign.startTime, speedCampaign.playerCompleted]);

  const handleCompletePlayerSpeedRun = (completionTimeMs: number) => {
    setSpeedCampaign(prev => {
      const currentLeaderboard = [...prev.leaderboard];
      
      // Inject player
      currentLeaderboard.push({
        userName: `${userProfile.name} (Siz)`,
        xp: userProfile.xp,
        completionTimeMs: completionTimeMs,
        reward: 0,
        rank: 0,
        isPlayer: true
      });

      // Sort again
      currentLeaderboard.sort((a, b) => a.completionTimeMs - b.completionTimeMs);

      // Re-rank and distribute rewards
      const reRanked = currentLeaderboard.map((item, idx) => {
        const rank = idx + 1;
        let reward = 50;
        if (rank === 1) reward = 5000;
        else if (rank === 2) reward = 2000;
        else if (rank === 3) reward = 1000;

        return {
          ...item,
          rank,
          reward
        };
      });

      // Find player's entry
      const playerEntry = reRanked.find(item => item.isPlayer);
      const playerRank = playerEntry?.rank || 4;
      const playerReward = playerEntry?.reward || 50;

      // Credit user profile and add transaction
      setUserProfile(prevProfile => ({
        ...prevProfile,
        balance: prevProfile.balance + playerReward,
        xp: prevProfile.xp + 60, // 60 XP bonus
        completedSurveysCount: prevProfile.completedSurveysCount + 1
      }));

      setTransactions(prevTx => [
        {
          id: `tx-speed-${Date.now()}`,
          type: 'survey',
          title: `🏁 PAG 10.000 ₺ Flaş Hız Yarışı (${playerRank}. Sıra)`,
          amount: playerReward,
          xp: 60,
          date: new Date().toISOString().split('T')[0]
        },
        ...prevTx
      ]);

      return {
        ...prev,
        playerCompleted: true,
        playerRank,
        playerReward,
        leaderboard: reRanked
      };
    });
  };

  // Master workspace layout control
  // 'split' -> side-by-side split screen
  // 'mobile' -> show only mobile mockup
  // 'admin' -> show only admin dashboard
  const [viewMode, setViewMode] = useState<'split' | 'mobile' | 'admin'>('split');

  // Reset demo state back to default helper
  const handleResetState = () => {
    if (confirm("Uygulama verilerini sıfırlamak istediğinize emin misiniz? Tüm özel anketleriniz temizlenecektir.")) {
      setUserProfile(INITIAL_USER_PROFILE);
      setSurveys(INITIAL_SURVEYS);
      setWithdrawalRequests(INITIAL_WITHDRAWAL_REQUESTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setSpeedCampaign({
        isActive: false,
        playerCompleted: false,
        leaderboard: []
      });
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans select-none overflow-x-hidden text-white"
      style={{ background: 'radial-gradient(circle at 0% 0%, #0f172a 0%, #020617 100%)' }}
    >
      
      {/* 1. Global Header */}
      <header className="hidden md:block bg-slate-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 px-6 py-3 shadow-lg">
        <div className="max-w-[1550px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              PAG
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-white tracking-tight">PAG</h1>
                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Prototip v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Persona Analytics & Geotargeting Ekosistemi</p>
            </div>
          </div>

          {/* Sync status & workspace rules */}
          <div className="hidden lg:flex items-center gap-5 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Workflow className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Gerçek Zamanlı Senkronize Workspace</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <p className="text-[10px] text-slate-400 font-medium max-w-[280px] leading-relaxed">
              Marka panelinden 10.000 ₺ Flaş Kampanya başlatıp push bildirimini tetikleyin, mobilde hız yarışı yapın!
            </p>
          </div>

          {/* Control actions */}
          <div className="flex items-center gap-2.5">
            {/* View switcher */}
            <div className="bg-white/5 p-1 rounded-xl flex border border-white/10 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'split' 
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title="Çift Ekran Görünümü"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Çift Ekran</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'mobile' 
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title="Sadece Mobil Uygulama"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sadece Mobil</span>
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'admin' 
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title="Sadece Yönetici Paneli"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sadece Admin</span>
              </button>
            </div>

            <button
              onClick={handleResetState}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white border border-transparent hover:border-white/10 transition-all cursor-pointer"
              title="Verileri Sıfırla"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Workspace Body */}
      <main className="flex-1 flex items-center justify-center p-0 md:p-4 lg:p-6">
        <div className="max-w-[1550px] w-full mx-auto">
          
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* Left/Main Column - MOBILE APP (Kullanıcı Tarafı) */}
            {(viewMode === 'split' || viewMode === 'mobile') && (
              <div className={`${
                viewMode === 'split' ? 'col-span-12 xl:col-span-4' : 'col-span-12'
              } flex flex-col items-center justify-center py-0 md:py-4`}>
                
                {viewMode === 'split' && (
                  <div className="mb-3 text-center hidden md:block xl:hidden">
                    <span className="text-xs bg-white/10 text-white/80 border border-white/10 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" /> Mobil Görünüm (PAG App)
                    </span>
                  </div>
                )}

                <div className="relative w-full md:w-auto">
                  {/* Decorative phone shadows */}
                  <div className="absolute inset-4 bg-indigo-500/10 rounded-[48px] blur-3xl -z-10 hidden md:block"></div>
                  
                  <MobileApp 
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    surveys={surveys}
                    setSurveys={setSurveys}
                    withdrawalRequests={withdrawalRequests}
                    setWithdrawalRequests={setWithdrawalRequests}
                    transactions={transactions}
                    setTransactions={setTransactions}
                    speedCampaign={speedCampaign}
                    setSpeedCampaign={setSpeedCampaign}
                    handleCompletePlayerSpeedRun={handleCompletePlayerSpeedRun}
                  />
                </div>

                <div className="mt-4 hidden md:flex flex-col items-center gap-1 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shadow-md text-center max-w-[340px] backdrop-blur-md">
                  <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> %100 İnteraktif Simülatör
                  </span>
                  <span className="text-[10px] text-slate-300 leading-normal">
                    Flaş kampanya push bildirimine tıklayarak hız yarışını başlatın, liderlik tablosunu görün!
                  </span>
                </div>
              </div>
            )}

            {/* Right Column - BRAND ADMIN PORTAL (Yönetici Tarafı) */}
            {(viewMode === 'split' || viewMode === 'admin') && (
              <div className={`${
                viewMode === 'split' ? 'col-span-12 xl:col-span-8' : 'col-span-12'
              } flex flex-col py-4`}>
                
                {viewMode === 'split' && (
                  <div className="mb-3 text-center xl:hidden mt-4">
                    <span className="text-xs bg-white/10 text-white/80 border border-white/10 font-bold px-3 py-1 rounded-full flex items-center gap-1 mx-auto w-max">
                      <Sliders className="w-3.5 h-3.5" /> PAG Marka Kontrol Paneli
                    </span>
                  </div>
                )}

                <AdminPanel 
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  surveys={surveys}
                  setSurveys={setSurveys}
                  withdrawalRequests={withdrawalRequests}
                  setWithdrawalRequests={setWithdrawalRequests}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  speedCampaign={speedCampaign}
                  setSpeedCampaign={setSpeedCampaign}
                />
              </div>
            )}

          </div>

        </div>
      </main>

      {/* 3. Aesthetic Footer */}
      <footer className="hidden md:block bg-transparent border-t border-white/5 py-4 text-center px-6 mt-auto">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          PAG © 2026 • Tüm Hakları Saklıdır
        </p>
      </footer>

    </div>
  );
}
