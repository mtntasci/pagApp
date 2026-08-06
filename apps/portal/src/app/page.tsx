"use client";

import React, { useState } from 'react';
import { 
  Users, BarChart3, Landmark, Play, Sparkles, Plus, AlertCircle, 
  Search, ShieldCheck, HelpCircle, Check, MapPin, Tag, Smartphone,
  DollarSign, TrendingUp, RefreshCw, Send, CheckCircle2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Survey, Question, UserProfile, WithdrawalRequest, Transaction, SpeedCampaignState } from '../../../packages/shared/types';
import { INITIAL_WITHDRAWAL_REQUESTS, INITIAL_SURVEYS } from '../../../packages/shared/data';

export default function PortalPage() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'withdrawals'>('overview');

  // New survey creation
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyCategory, setNewSurveyCategory] = useState<'teknoloji' | 'moda' | 'gida' | 'finans'>('gida');
  const [newSurveyReward, setNewSurveyReward] = useState('15');
  const [newSurveyXp, setNewSurveyXp] = useState('40');

  // Speed run campaign state
  const [speedCampaign, setSpeedCampaign] = useState<SpeedCampaignState>({
    isActive: false,
    playerCompleted: false,
    leaderboard: []
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurveyTitle) return;

    const newSurvey: Survey = {
      id: `survey-${Date.now()}`,
      title: newSurveyTitle,
      category: newSurveyCategory,
      rewardCash: parseFloat(newSurveyReward) || 10,
      rewardXp: parseInt(newSurveyXp) || 30,
      questionsCount: 3,
      estimatedMinutes: 2,
      isCompleted: false,
      questions: []
    };

    setSurveys([newSurvey, ...surveys]);
    setNewSurveyTitle('');
  };

  const handleApproveWithdrawal = (id: string) => {
    setWithdrawalRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-white/5 bg-[#070913]/60 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
            PAG
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">PAG Brand Portal</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Persona Analytics & Geotargeting</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1 font-bold">
            Next.js Monorepo Portal
          </span>
        </div>
      </nav>

      {/* Main Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          {(['overview', 'campaigns', 'withdrawals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {tab === 'overview' && 'Genel Bakış'}
              {tab === 'campaigns' && 'Kampanya Yönetimi'}
              {tab === 'withdrawals' && 'Para Çekme Talepleri'}
            </button>
          ))}
        </div>

        {/* Workspace views */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Top Cards Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase">Toplam Katılımcı</span>
                  <h3 className="text-xl font-black mt-1">1,248</h3>
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">▲ %12 (Bu Hafta)</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase">Dağıtılan Ödül</span>
                  <h3 className="text-xl font-black mt-1">14,250.00 ₺</h3>
                  <p className="text-[10px] text-indigo-300 font-bold mt-1">Min. limit: 50 ₺</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase">Aktif Anketler</span>
                  <h3 className="text-xl font-black mt-1">{surveys.length} Adet</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Lokasyon odaklı</p>
                </div>
              </div>

              {/* Geographic Performance Simulation */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase text-white tracking-widest mb-3">Antalya AVM Lokasyon Analizi</h3>
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>McDonald's Antalya AVM Çevresi</span>
                      <span className="text-indigo-400">%84 (Yüksek Dönüşüm)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Kahve Dünyası Geofence Alanı</span>
                      <span className="text-indigo-400">%62 (Orta Dönüşüm)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="flex flex-col gap-6">
              {/* Create new campaign */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase text-white tracking-widest mb-4">Yeni Kampanya Tanımla</h3>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Kampanya Başlığı</label>
                      <input 
                        type="text" 
                        value={newSurveyTitle}
                        onChange={(e) => setNewSurveyTitle(e.target.value)}
                        placeholder="Örn: Akıllı Saat Tercihleri" 
                        className="w-full bg-[#0a0c14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Kategori</label>
                      <select 
                        value={newSurveyCategory}
                        onChange={(e) => setNewSurveyCategory(e.target.value as any)}
                        className="w-full bg-[#0a0c14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="gida">Gıda & Restoran</option>
                        <option value="teknoloji">Teknoloji</option>
                        <option value="finans">Finans</option>
                        <option value="moda">Moda</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Nakit Ödül (₺)</label>
                      <input 
                        type="number" 
                        value={newSurveyReward}
                        onChange={(e) => setNewSurveyReward(e.target.value)}
                        className="w-full bg-[#0a0c14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">XP Ödülü</label>
                      <input 
                        type="number" 
                        value={newSurveyXp}
                        onChange={(e) => setNewSurveyXp(e.target.value)}
                        className="w-full bg-[#0a0c14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Kampanyayı Canlıya Al</span>
                  </button>
                </form>
              </div>

              {/* Active campaigns list */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase text-white tracking-widest mb-4">Aktif Araştırmalar</h3>
                <div className="space-y-2.5">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-white">{survey.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Kategori: {survey.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400 block">{survey.rewardCash.toFixed(2)} ₺</span>
                        <span className="text-[9px] font-bold text-indigo-400">+{survey.rewardXp} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs font-black uppercase text-white tracking-widest mb-4">Para Çekme Talepleri</h3>
              <div className="space-y-3">
                {withdrawalRequests.map((req) => (
                  <div key={req.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{req.userName}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'approved' 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {req.status === 'approved' ? 'Tamamlandı' : 'Beklemede'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-mono">{req.destination}</p>
                      <span className="text-[9px] text-slate-500 block mt-1">{req.date}</span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-xs font-black text-emerald-400">{req.amount.toFixed(2)} ₺</span>
                      {req.status === 'pending' && (
                        <button 
                          onClick={() => handleApproveWithdrawal(req.id)}
                          className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-bold tracking-wider cursor-pointer uppercase transition-all"
                        >
                          Onayla
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
