import React, { useState } from 'react';
import { 
  Sparkles, Loader2, Users, DollarSign, Plus, Check, X, 
  FileSpreadsheet, Gift, Landmark, CreditCard, Award, 
  Send, HelpCircle, BarChart3, AlertCircle, RefreshCw, Zap, Play, Info
} from 'lucide-react';
import { Survey, Question, UserProfile, WithdrawalRequest, Transaction, SpeedCampaignState } from '../types';

interface AdminPanelProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  surveys: Survey[];
  setSurveys: React.Dispatch<React.SetStateAction<Survey[]>>;
  withdrawalRequests: WithdrawalRequest[];
  setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  speedCampaign: SpeedCampaignState;
  setSpeedCampaign: React.Dispatch<React.SetStateAction<SpeedCampaignState>>;
}

export default function AdminPanel({
  userProfile,
  setUserProfile,
  surveys,
  setSurveys,
  withdrawalRequests,
  setWithdrawalRequests,
  transactions,
  setTransactions,
  speedCampaign,
  setSpeedCampaign
}: AdminPanelProps) {
  // AI Wizard State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSurvey, setGeneratedSurvey] = useState<Partial<Survey> | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<'teknoloji' | 'moda' | 'gida' | 'finans' | 'spor' | 'genel'>('genel');
  const [manualRewardCash, setManualRewardCash] = useState<string>('15.00');
  const [manualRewardXp, setManualRewardXp] = useState<string>('40');
  const [manualQuestions, setManualQuestions] = useState<Array<{text: string, options: string[]}>>([
    { text: '', options: ['', '', '', ''] },
    { text: '', options: ['', '', '', ''] },
    { text: '', options: ['', '', '', ''] }
  ]);
  const [activeTab, setActiveTab] = useState<'surveys' | 'withdrawals' | 'analytics' | 'speedRun'>('surveys');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Stopwatch ticking hook for admin live dashboard
  React.useEffect(() => {
    if (!speedCampaign.isActive || !speedCampaign.startTime) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      const sec = (Date.now() - (speedCampaign.startTime || 0)) / 1000;
      setElapsedSeconds(sec);
    }, 100);
    return () => clearInterval(interval);
  }, [speedCampaign.isActive, speedCampaign.startTime]);

  // Handle manual question edits
  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].text = text;
    setManualQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[oIndex] = text;
    setManualQuestions(updated);
  };

  // Submit manual survey
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    // Validate manual entries
    if (!manualTitle.trim()) {
      alert("Anket başlığı giriniz.");
      return;
    }

    for (let i = 0; i < manualQuestions.length; i++) {
      if (!manualQuestions[i].text.trim()) {
        alert(`${i + 1}. sorunun metnini yazınız.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!manualQuestions[i].options[j].trim()) {
          alert(`${i + 1}. sorunun ${j + 1}. seçeneğini doldurunuz.`);
          return;
        }
      }
    }

    // Assemble survey
    const newSurvey: Survey = {
      id: `survey-${Date.now()}`,
      title: manualTitle,
      category: manualCategory,
      rewardCash: parseFloat(manualRewardCash) || 10,
      rewardXp: parseInt(manualRewardXp) || 30,
      questionsCount: manualQuestions.length,
      estimatedMinutes: Math.ceil(manualQuestions.length * 0.8),
      isCompleted: false,
      questions: manualQuestions.map((q, idx) => ({
        id: `q-${idx}-${Date.now()}`,
        text: q.text,
        options: q.options
      }))
    };

    setSurveys(prev => [newSurvey, ...prev]);
    setSuccessMsg("Anket başarıyla oluşturuldu ve Mobil akışta yayına alındı!");
    
    // Reset form
    setManualTitle('');
    setManualQuestions([
      { text: '', options: ['', '', '', ''] },
      { text: '', options: ['', '', '', ''] },
      { text: '', options: ['', '', '', ''] }
    ]);
  };

  // Run AI Survey Wizard
  const handleAiWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);
    setGeneratedSurvey(null);
    setSuccessMsg(null);

    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      if (!response.ok) {
        throw new Error('API isteği başarısız oldu.');
      }

      const data = await response.json();
      setGeneratedSurvey(data);
    } catch (err: any) {
      console.error(err);
      setAiError('Akıllı anket oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Publish AI generated survey
  const handlePublishAiSurvey = () => {
    if (!generatedSurvey) return;

    const finalSurvey: Survey = {
      id: `survey-ai-${Date.now()}`,
      title: generatedSurvey.title || 'AI Özel Anketi',
      category: (generatedSurvey.category as any) || 'genel',
      rewardCash: generatedSurvey.rewardCash || 15.00,
      rewardXp: generatedSurvey.rewardXp || 40,
      questionsCount: generatedSurvey.questions?.length || 3,
      estimatedMinutes: Math.ceil((generatedSurvey.questions?.length || 3) * 0.8),
      isCompleted: false,
      questions: (generatedSurvey.questions || []).map((q: any, idx: number) => ({
        id: `q-ai-${idx}-${Date.now()}`,
        text: q.text,
        options: q.options
      }))
    };

    setSurveys(prev => [finalSurvey, ...prev]);
    setGeneratedSurvey(null);
    setAiPrompt('');
    setSuccessMsg("Akıllı AI anketi başarıyla yayınlandı ve yayına alındı! Mobil uygulamada görebilirsiniz.");
  };

  // Handle Withdrawal actions (Approve / Reject)
  const handleWithdrawalAction = (requestId: string, action: 'approve' | 'reject') => {
    const updated = withdrawalRequests.map(req => {
      if (req.id === requestId) {
        return { ...req, status: action === 'approve' ? 'approved' as const : 'rejected' as const };
      }
      return req;
    });
    setWithdrawalRequests(updated);

    const targetRequest = withdrawalRequests.find(r => r.id === requestId);
    if (targetRequest && action === 'reject') {
      // Refund cash back to user
      setUserProfile(prev => ({
        ...prev,
        balance: prev.balance + targetRequest.amount
      }));

      // Add a refund transaction
      const refundTx: Transaction = {
        id: `tx-refund-${Date.now()}`,
        type: 'profile',
        title: 'Para Çekme İptal İadesi',
        amount: targetRequest.amount,
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions(prev => [refundTx, ...prev]);
    }
  };

  // Stats calculators
  const stats = {
    totalSurveys: surveys.length,
    completedSurveys: surveys.filter(s => s.isCompleted).length,
    pendingWithdrawals: withdrawalRequests.filter(w => w.status === 'pending'),
    totalPayout: withdrawalRequests.filter(w => w.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0),
    avgReward: surveys.reduce((acc, curr) => acc + curr.rewardCash, 0) / (surveys.length || 1)
  };

  const startCampaignSimulation = () => {
    setSpeedCampaign({
      isActive: true,
      startTime: Date.now(),
      playerCompleted: false,
      leaderboard: []
    });
    setSuccessMsg("10.000 ₺ Flaş Hız Kampanyası Başlatıldı! Push Bildirimleri Gönderiliyor...");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const resetCampaignSimulation = () => {
    setSpeedCampaign({
      isActive: false,
      playerCompleted: false,
      leaderboard: []
    });
    setSuccessMsg("Yarış Simülatörü Sıfırlandı.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="w-full bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[780px] backdrop-blur-xl">
      
      {/* Brand Header */}
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center text-white backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center font-display font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/10">
            ₺
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white">VeloQuest Marka Portalı</h1>
            <p className="text-[10px] text-white/45 font-semibold uppercase">Yönetici & Admin Kontrol Paneli</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistem Aktif (Live API)</span>
        </div>
      </div>

      {/* Corporate Dashboard KPIs */}
      <div className="grid grid-cols-4 gap-4 px-6 pt-5 pb-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-start text-white/50">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tanımlı Anketler</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1 font-display">{stats.totalSurveys} Adet</div>
          <div className="text-[9px] text-white/40 font-semibold mt-1">
            {stats.completedSurveys} tamamlanma gerçekleşti
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-start text-white/50">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dağıtılan Ödül</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1 font-display">{stats.totalPayout.toFixed(2)} ₺</div>
          <div className="text-[9px] text-white/40 font-semibold mt-1">
            Kullanıcılara ödenen toplam tutar
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-start text-white/50">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bekleyen Çekimler</span>
            <span className="bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">Kritik</span>
          </div>
          <div className="text-xl font-extrabold text-white mt-1 font-display">{stats.pendingWithdrawals.length} Talep</div>
          <div className="text-[9px] text-white/40 font-semibold mt-1">
            Onay bekleyen IBAN/Çek talebi
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-start text-white/50">
            <span className="text-[10px] font-bold uppercase tracking-wider">Ortalama Bütçe</span>
            <Award className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1 font-display">{stats.avgReward.toFixed(2)} ₺</div>
          <div className="text-[9px] text-white/40 font-semibold mt-1">
            Anket başına kazanılan nakit
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-sm">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('surveys')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'surveys' 
                ? 'bg-indigo-600 text-white border border-indigo-500 shadow-md' 
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            Anket & Kampanya Tanımlama
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'withdrawals' 
                ? 'bg-indigo-600 text-white border border-indigo-500 shadow-md' 
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <span>Para Çekme İstekleri</span>
            {stats.pendingWithdrawals.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {stats.pendingWithdrawals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'analytics' 
                ? 'bg-indigo-600 text-white border border-indigo-500 shadow-md' 
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            Kampanya Analitiği
          </button>
          <button
            onClick={() => setActiveTab('speedRun')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'speedRun' 
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white border border-pink-400 shadow-lg' 
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>10.000 ₺ Hız Yarışı Simülatörü</span>
          </button>
        </div>

        {successMsg && (
          <div className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg animate-pulse-slow">
            {successMsg}
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-none bg-transparent">
        
        {/* ==================== 1. SURVEY CREATOR TAB ==================== */}
        {activeTab === 'surveys' && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* AI Generator Column (Left side) */}
            <div className="col-span-5 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-indigo-950/40 to-[#0a0c14]/40 border border-indigo-500/20 rounded-3xl p-5 text-white shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                  <span>AI Akıllı Anket Sihirbazı</span>
                </div>
                
                <h3 className="text-sm font-bold leading-snug mb-1.5 text-white/90">Anket Konusunu Yazın, AI Oluştursun!</h3>
                <p className="text-[10px] text-white/60 leading-relaxed mb-4">
                  Markanızın araştırma amacını veya test etmek istediği konsepti girin. Gemini yapay zeka motoru, anında 3 soruluk optimize edilmiş bir tüketici anketi tasarlayacaktır.
                </p>

                <form onSubmit={handleAiWizardSubmit} className="flex flex-col gap-3">
                  <textarea
                    rows={3}
                    required
                    placeholder="Örn: Gurme burger zincirimiz için kedi sahiplerine özel yeni menü fikri pazar araştırması..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-[#0a0c14]/50 border border-white/10 focus:outline-none focus:border-indigo-500/50 text-white placeholder-white/20 resize-none font-medium leading-relaxed"
                  />

                  <button
                    type="submit"
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 border border-indigo-500/30 cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-95"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>AI Anketi Tasarlıyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                        <span>Sihirbazı Çalıştır</span>
                      </>
                    )}
                  </button>
                </form>

                {aiError && (
                  <div className="mt-3 p-3 bg-rose-500/10 text-rose-300 rounded-xl text-[10px] font-semibold border border-rose-500/20">
                    {aiError}
                  </div>
                )}
              </div>

              {/* AI Draft Preview Area */}
              {generatedSurvey && (
                <div className="bg-white/5 border border-indigo-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Taslak Anketi
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/70">
                      <span>{generatedSurvey.rewardCash?.toFixed(2)} ₺</span>
                      <span>•</span>
                      <span>{generatedSurvey.rewardXp} XP</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-extrabold text-white leading-snug mb-3">
                    {generatedSurvey.title}
                  </h4>

                  {/* Generated Questions List preview */}
                  <div className="flex flex-col gap-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
                    {generatedSurvey.questions?.map((q, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3">
                        <span className="text-[9px] font-bold text-white/40 block uppercase mb-1">Soru {idx + 1}</span>
                        <p className="text-xs font-extrabold text-white/90 mb-2 leading-snug">{q.text}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {q.options?.map((opt: string, oIdx: number) => (
                            <span key={oIdx} className="text-[10px] bg-[#0a0c14]/40 border border-white/5 rounded-lg p-1.5 text-white/70 truncate font-medium">
                              • {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePublishAiSurvey}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg border border-indigo-500/30 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-emerald-300" />
                    <span>Yayına Al (Mobil Akışa Ekle)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Manual Form Column (Right side) */}
            <div className="col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wide mb-4">Manuel Kampanya & Anket Oluşturucu</h3>

              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Anket Başlığı</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Sürdürülebilir Kozmetik Alışkanlıkları Araştırması"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Kategori</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-2.5 rounded-xl bg-[#0a0c14] border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="genel" className="bg-[#0a0c14] text-white">Genel Kültür</option>
                      <option value="teknoloji" className="bg-[#0a0c14] text-white">Teknoloji</option>
                      <option value="gida" className="bg-[#0a0c14] text-white">Gıda & Gurme</option>
                      <option value="finans" className="bg-[#0a0c14] text-white">Finans</option>
                      <option value="moda" className="bg-[#0a0c14] text-white">Moda & Tarz</option>
                      <option value="spor" className="bg-[#0a0c14] text-white">Spor & Sağlık</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Kullanıcı Ödülü (₺)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      step={0.5}
                      value={manualRewardCash}
                      onChange={(e) => setManualRewardCash(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Kullanıcı XP Puanı</label>
                    <input
                      type="number"
                      required
                      min={10}
                      step={5}
                      value={manualRewardXp}
                      onChange={(e) => setManualRewardXp(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 font-bold"
                    />
                  </div>
                </div>

                {/* Question builder */}
                <div className="border-t border-white/10 pt-3">
                  <span className="text-[10px] font-extrabold text-white/80 block uppercase mb-3">Anket Soruları (3 Adet)</span>
                  
                  <div className="flex flex-col gap-4 max-h-[280px] overflow-y-auto pr-1">
                    {manualQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <label className="block text-[9px] font-bold text-white/40 uppercase mb-1.5">Soru {qIdx + 1}</label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Çevre dostu paketlemelere ne kadar önem verirsiniz?"
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl bg-[#0a0c14]/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 font-bold mb-2.5"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx}>
                              <label className="block text-[8px] font-bold text-white/40 mb-0.5">Seçenek {oIdx + 1}</label>
                              <input
                                type="text"
                                required
                                placeholder="Seçenek..."
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                className="w-full text-[11px] px-2.5 py-1.5 rounded-lg bg-[#0a0c14]/30 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg border border-indigo-500/30 cursor-pointer mt-2 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-emerald-300" />
                  <span>Anketi Oluştur & Mobil Akışta Yayınla</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ==================== 2. WITHDRAWALS TAB ==================== */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white leading-none">Para Çekim Talepleri</h3>
                <p className="text-[10px] text-white/40 mt-1">Kullanıcıların cüzdan bakiyelerinden nakde çevirmek üzere oluşturduğu transfer talepleri.</p>
              </div>
              <span className="text-[10px] font-bold text-white/50">Toplam {withdrawalRequests.length} talep kayıtlı</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
                    <th className="py-3 px-4">Kullanıcı</th>
                    <th className="py-3 px-4">Yöntem</th>
                    <th className="py-3 px-4">Hesap / Adres Bilgisi</th>
                    <th className="py-3 px-4">Tutar</th>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4 text-center">Durum</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawalRequests.map((req) => (
                    <tr key={req.id} className="text-xs hover:bg-white/5 transition-colors">
                      <td className="py-4.5 px-4 font-bold text-white/95">{req.userName}</td>
                      <td className="py-4.5 px-4 font-semibold text-white/60">
                        <span className="flex items-center gap-1">
                          {req.method === 'iban' ? (
                            <><Landmark className="w-3.5 h-3.5 text-white/40" /> Banka Havalesi</>
                          ) : (
                            <><CreditCard className="w-3.5 h-3.5 text-white/40" /> Hediye Çeki</>
                          )}
                        </span>
                      </td>
                      <td className="py-4.5 px-4 font-mono font-medium text-white/50 max-w-[200px] truncate" title={req.destination}>
                        {req.destination}
                      </td>
                      <td className="py-4.5 px-4 font-black font-display text-emerald-400">{req.amount.toFixed(2)} ₺</td>
                      <td className="py-4.5 px-4 text-white/40 font-semibold">{req.date}</td>
                      <td className="py-4.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          req.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : req.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {req.status === 'pending' ? 'Bekliyor' : req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </span>
                      </td>
                      <td className="py-4.5 px-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleWithdrawalAction(req.id, 'approve')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Onayla
                            </button>
                            <button
                              onClick={() => handleWithdrawalAction(req.id, 'reject')}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> İptal Et
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/40 font-medium italic">İşlem Tamamlandı</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {withdrawalRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/40">
                        Herhangi bir çekim talebi bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== 4. SPEED RUN SIMULATOR TAB ==================== */}
        {activeTab === 'speedRun' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            
            {/* Control Panel and Logs */}
            <div className="col-span-7 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-500/20 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                      10.000 ₺ Flaş Hız Kampanyası Kontrolü
                    </h3>
                    <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                      Kullanıcıları hızlı davranmaya sevk ederek katılımı maksimize eden gamifikasyon motoru.
                    </p>
                  </div>
                  
                  {speedCampaign.isActive && (
                    <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span>{elapsedSeconds.toFixed(1)} sn</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mb-4">
                  {!speedCampaign.isActive ? (
                    <button
                      onClick={startCampaignSimulation}
                      className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/25 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white animate-pulse" />
                      <span>10.000 ₺ Flaş Kampanyayı ve Push Gönderimini Başlat!</span>
                    </button>
                  ) : (
                    <button
                      onClick={resetCampaignSimulation}
                      className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Kampanyayı Sıfırla / Yeniden Başlat</span>
                    </button>
                  )}
                </div>

                {/* Explanation parameters */}
                <div className="grid grid-cols-3 gap-2.5 bg-white/5 rounded-2xl p-3 border border-white/10 text-center text-xs mb-4">
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-black">1. Sıra (Altın)</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">5.000 ₺</div>
                  </div>
                  <div className="border-x border-white/10">
                    <div className="text-[9px] text-white/40 uppercase font-black">2. Sıra (Gümüş)</div>
                    <div className="text-sm font-black text-slate-300 mt-0.5">2.000 ₺</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-black">3. Sıra (Bronz)</div>
                    <div className="text-sm font-black text-amber-600 mt-0.5">1.000 ₺</div>
                  </div>
                </div>

                {/* Simulated Push Notification Queue */}
                <div className="bg-[#020617]/60 rounded-2xl p-4 border border-white/5">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Kuyruklu Push Bildirimi Dalga Akışı (Gönderim Kuyruğu)</span>
                  <div className="flex flex-col gap-3 mt-3">
                    <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">1</span>
                        <div>
                          <p className="font-bold text-white/90">Dalga 1 (Altın Segment: &gt;500 XP)</p>
                          <p className="text-[9px] text-white/40">Anında Gönderilir (0sn gecikme)</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${speedCampaign.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-white/40'}`}>
                        {speedCampaign.isActive ? 'Gönderildi' : 'Beklemede'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-400/20 text-slate-300 font-bold flex items-center justify-center text-[10px]">2</span>
                        <div>
                          <p className="font-bold text-white/90">Dalga 2 (Gümüş Segment: 250 - 500 XP)</p>
                          <p className="text-[9px] text-white/40">15 Saniye Gecikmeli Gönderilir</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${speedCampaign.isActive && elapsedSeconds >= 15 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : speedCampaign.isActive ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-white/5 text-white/40'}`}>
                        {speedCampaign.isActive && elapsedSeconds >= 15 ? 'Gönderildi' : speedCampaign.isActive ? 'Geri Sayımda...' : 'Beklemede'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-800/20 text-amber-600 font-bold flex items-center justify-center text-[10px]">3</span>
                        <div>
                          <p className="font-bold text-white/90">Dalga 3 (Bronz Segment: &lt;250 XP)</p>
                          <p className="text-[9px] text-white/40">30 Saniye Gecikmeli Gönderilir</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${speedCampaign.isActive && elapsedSeconds >= 30 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : speedCampaign.isActive && elapsedSeconds >= 15 ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-white/5 text-white/40'}`}>
                        {speedCampaign.isActive && elapsedSeconds >= 30 ? 'Gönderildi' : speedCampaign.isActive && elapsedSeconds >= 15 ? 'Geri Sayımda...' : 'Beklemede'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal Logs Box */}
              <div className="bg-[#020617] rounded-3xl p-4 border border-white/10 font-mono text-[10px] flex-1 flex flex-col min-h-[160px] max-h-[220px]">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2 text-white/45">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                    Sistem Dağıtım ve Hız Günlükleri (Anlık Akış)
                  </span>
                  <span>PAG_ENGINE_v2.0</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-300 scrollbar-none pr-1">
                  {!speedCampaign.isActive ? (
                    <p className="text-white/30 italic text-center py-6">Kuyruk logları için kampanyayı başlatın...</p>
                  ) : (
                    <>
                      <p className="text-indigo-400">⏱️ [0.0s] Kampanya Başlatıldı. Toplam Ödül Havuzu: 10.000 ₺.</p>
                      <p className="text-amber-400">🔔 [0.1s] Dalga 1 Push Bildirimi ateşlendi (Profil XP &gt; 500).</p>
                      <p className="text-emerald-400">📲 [0.5s] Selin Şen ve Kaan Demir bildirimleri aldı. Cevaplar bekleniyor...</p>
                      
                      {elapsedSeconds >= 3.8 && (
                        <p className="text-pink-400 font-bold">🏁 [3.8s] Selin Şen (Altın) anketi tamamladı! (Hız: 3.8sn) &rarr; 1. Sıra (5.000 ₺ Kazandı!)</p>
                      )}
                      {elapsedSeconds >= 6.9 && (
                        <p className="text-pink-400 font-bold">🏁 [6.9s] Kaan Demir (Altın) anketi tamamladı! (Hız: 6.9sn) &rarr; 2. Sıra (2.000 ₺ Kazandı!)</p>
                      )}
                      {elapsedSeconds >= 15 && (
                        <>
                          <p className="text-indigo-400">⏱️ [15.0s] 15 saniye geçti. Dalga 2 Push Bildirimi ateşlendi (Profil XP 250 - 500).</p>
                          <p className="text-amber-400">🔔 [15.1s] Hülya Avcı, Burak Kaya ve Mert Yılmaz (Siz) bildirimleri aldı!</p>
                        </>
                      )}
                      {elapsedSeconds >= 25.5 && ( // Hülya Avcı finishes 10.5s after dalga 2 which is 25.5s total
                        <p className="text-pink-400 font-bold">🏁 [25.5s] Hülya Avcı (Gümüş) anketi tamamladı! (Hız: 10.5sn) &rarr; 3. Sıra (1.000 ₺ Kazandı!)</p>
                      )}
                      {elapsedSeconds >= 30 && (
                        <>
                          <p className="text-indigo-400">⏱️ [30.0s] 30 saniye geçti. Dalga 3 Push Bildirimi ateşlendi (Profil XP &lt; 250).</p>
                          <p className="text-amber-400">🔔 [30.1s] Tüm diğer kayıtlı katılımcılara bildirimler gönderildi.</p>
                        </>
                      )}
                      {elapsedSeconds >= 29.2 && ( // Burak Kaya finishes total 29.2s
                        <p className="text-slate-400">🏁 [29.2s] Burak Kaya (Gümüş) anketi tamamladı! (Hız: 14.2sn) &rarr; 4. Sıra (Kalan Havuzdan 50 ₺ Kazandı!)</p>
                      )}
                      {elapsedSeconds >= 33.5 && ( // Deniz Can finishes total 33.5s
                        <p className="text-slate-400">🏁 [33.5s] Deniz Can (Gümüş) anketi tamamladı! (Hız: 18.5sn) &rarr; 5. Sıra (Kalan Havuzdan 50 ₺ Kazandı!)</p>
                      )}
                      {speedCampaign.playerCompleted && (
                        <p className="text-emerald-400 font-black">🎉 [Kullanıcı] Mert Yılmaz anketi başarıyla tamamladı! Sıralama: {speedCampaign.playerRank}. Sıra, Ödül: {speedCampaign.playerReward?.toFixed(2)} ₺!</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard Table Side */}
            <div className="col-span-5 bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>CANLI YARIŞ SIRALAMASI</span>
                  <span className="text-[10px] font-bold text-indigo-300 tracking-normal bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    Ödül Havuzu: 10.000 ₺
                  </span>
                </h3>

                <div className="overflow-hidden border border-white/5 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-white/50 text-[9px] uppercase font-black">
                        <th className="py-2.5 px-3">Sıra</th>
                        <th className="py-2.5 px-3">Katılımcı</th>
                        <th className="py-2.5 px-3 text-right">Hız</th>
                        <th className="py-2.5 px-3 text-right">Kazanılan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                      {speedCampaign.leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-white/30 italic">
                            Anlık liderlik sıralaması için yarışı başlatın.
                          </td>
                        </tr>
                      ) : (
                        speedCampaign.leaderboard.map((entry, idx) => {
                          const isPlayer = entry.isPlayer;
                          return (
                            <tr key={idx} className={isPlayer ? 'bg-indigo-600/30 text-white border-y border-indigo-500/40' : ''}>
                              <td className="py-2 px-3">
                                <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full text-[10px] font-black ${
                                  entry.rank === 1 ? 'bg-amber-400 text-slate-900 font-extrabold' :
                                  entry.rank === 2 ? 'bg-slate-300 text-slate-900 font-extrabold' :
                                  entry.rank === 3 ? 'bg-amber-600 text-white font-extrabold' : 'bg-white/5 text-slate-400'
                                }`}>
                                  {entry.rank}
                                </span>
                              </td>
                              <td className={`py-2 px-3 flex items-center gap-1.5 ${isPlayer ? 'font-black' : ''}`}>
                                <span className="truncate max-w-[140px]">{entry.userName}</span>
                                {isPlayer && <span className="bg-emerald-500 text-slate-950 text-[8px] font-black px-1 py-0.2 rounded uppercase">Siz</span>}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-300">
                                {(entry.completionTimeMs / 1000).toFixed(2)}s
                              </td>
                              <td className={`py-2 px-3 text-right font-extrabold ${entry.rank <= 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {entry.reward.toLocaleString('tr-TR')} ₺
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-start gap-2 mt-4 text-[9px] text-white/50 leading-relaxed font-semibold">
                <Info className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <p>
                  Yarışı başlattığınızda telefon simülatöründe gerçek zamanlı bir Push Bildirimi görünecektir. Dalga 2 (15. saniye) devreye girdiğinde Mert Yılmaz bildirim alacaktır. Ankete ne kadar hızlı cevap verirseniz, o kadar yüksek sıra elde edersiniz!
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== 3. ANALYTICS TAB ==================== */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Category distribution */}
            <div className="col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wide mb-4">Kategori Dağılımı ve Katılım Oranları</h3>
              <div className="flex flex-col gap-3.5">
                {[
                  { label: 'Gıda & Gurme', count: surveys.filter(s => s.category === 'gida').length, color: 'bg-amber-400', pct: '38%' },
                  { label: 'Teknoloji & Dijital', count: surveys.filter(s => s.category === 'teknoloji').length, color: 'bg-indigo-400', pct: '45%' },
                  { label: 'Kişisel Finans', count: surveys.filter(s => s.category === 'finans').length, color: 'bg-emerald-400', pct: '62%' },
                  { label: 'Moda & Alışveriş', count: surveys.filter(s => s.category === 'moda').length, color: 'bg-pink-400', pct: '28%' },
                  { label: 'Spor & Sağlık', count: surveys.filter(s => s.category === 'spor').length, color: 'bg-blue-400', pct: '15%' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-white/80">{item.label} ({item.count} Anket)</span>
                      <span className="text-white/45 font-semibold">{item.pct} Katılım Oranı</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Quality metrics */}
            <div className="col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wide mb-4">Sistem Performansı & Güvenilirlik</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white/90">Süreç Otomasyonu</h4>
                      <p className="text-[10px] text-white/45 leading-normal mt-0.5">
                        Kullanıcı yanıtları klavye gerektirmeden %100 dijital süzgeçten geçmektedir. Hata oranı sıfıra indirilmiştir.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start pt-3 border-t border-white/5">
                    <div className="p-2 rounded-xl bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white/90">Hedefleme Doğruluğu</h4>
                      <p className="text-[10px] text-white/45 leading-normal mt-0.5">
                        Profil Puanı (XP) yüksek kullanıcılar, demografik eşleşmeye göre kurumsal firmaların anketlerine %94 doğrulukla önceliklendirilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 mt-4">
                <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-[10px] text-white/60 font-medium">İstediğiniz zaman anket ekleyerek veya kullanıcı tarafından katılım sağlayarak sistemi test edebilirsiniz. Değişiklikler anında senkronize olur.</span>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
