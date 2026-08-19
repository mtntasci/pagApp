'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export interface VerificationAssignmentItem {
  id: string;
  verificationCampaignId: string;
  masterSurveyId: string;
  masterSurveyTitle: string;
  verificationSurveyId: string;
  verificationRewardSummary: string;
  userDisplayName: string;
  selectionSource: 'CUSTOMER' | 'RANDOM';
  status: string;
  assignedAgentId: string | null;
  callStartedAt: string | null;
  callEndedAt: string | null;
  agentNote: string | null;
  createdAt: string | null;
}

export default function VerificationCallsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [assignments, setAssignments] = useState<VerificationAssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCallAssignment, setActiveCallAssignment] = useState<VerificationAssignmentItem | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callNote, setCallNote] = useState('');
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // 1. Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      const listCampFn = httpsCallable(functions, 'listVerificationCampaigns');
      const res: any = await listCampFn({});
      if (res.data?.success && Array.isArray(res.data?.data?.campaigns)) {
        setCampaigns(res.data.data.campaigns);
        if (res.data.data.campaigns.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(res.data.data.campaigns[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch Verification Campaigns Error:', err);
    }
  }, [selectedCampaignId]);

  // 2. Fetch assignments
  const fetchAssignments = useCallback(async (campId?: string) => {
    setIsLoading(true);
    try {
      const listAssignFn = httpsCallable(functions, 'listVerificationAssignmentsForAgent');
      const res: any = await listAssignFn({ campaignId: campId || undefined });
      if (res.data?.success && Array.isArray(res.data?.data?.assignments)) {
        setAssignments(res.data.data.assignments);
      }
    } catch (err) {
      console.error('Fetch Assignments Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    fetchAssignments(selectedCampaignId);
  }, [selectedCampaignId, fetchAssignments]);

  // Start Call (Simulation)
  const handleStartCall = async (assignment: VerificationAssignmentItem) => {
    setIsCalling(true);
    setActiveCallAssignment(assignment);
    setCallNote(assignment.agentNote || '');
    try {
      const startCallFn = httpsCallable(functions, 'startVerificationCall');
      await startCallFn({ assignmentId: assignment.id });
      // Update local status
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignment.id ? { ...a, status: 'CALLING' } : a))
      );
    } catch (err: any) {
      console.error('Start Call Error:', err);
      alert('Çağrı başlatılırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsCalling(false);
    }
  };

  // Submit Call Result
  const handleSubmitResult = async (result: 'ACCEPTED' | 'DECLINED' | 'NO_ANSWER' | 'CALL_BACK_LATER' | 'WRONG_PERSON_OR_ISSUE') => {
    if (!activeCallAssignment) return;
    setIsSubmittingResult(true);
    try {
      const submitResultFn = httpsCallable(functions, 'submitVerificationCallResult');
      await submitResultFn({
        assignmentId: activeCallAssignment.id,
        result,
        agentNote: callNote
      });

      // Refresh assignments
      await fetchAssignments(selectedCampaignId);
      setActiveCallAssignment(null);
      setCallNote('');
    } catch (err: any) {
      console.error('Submit Result Error:', err);
      alert('Çağrı sonucu kaydedilirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSubmittingResult(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return ['QUEUED', 'ASSIGNED', 'CALL_BACK_LATER', 'NO_ANSWER'].includes(a.status);
    if (statusFilter === 'ACCEPTED') return ['ACCEPTED', 'PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(a.status);
    return a.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED':
      case 'ASSIGNED':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)' }}>Bekliyor</span>;
      case 'CALLING':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)', border: '1px solid var(--warning-border)' }}>📞 Aranıyor</span>;
      case 'ACCEPTED':
      case 'PUSH_SENT':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-border)' }}>✓ Kabul Etti</span>;
      case 'VERIFICATION_COMPLETED':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--brand-lime)', color: 'var(--brand-midnight)' }}>⭐ Tamamlandı</span>;
      case 'DECLINED':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)' }}>✕ Reddetti</span>;
      case 'NO_ANSWER':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)' }}>Ulaşılamadı</span>;
      case 'CALL_BACK_LATER':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--accent-bg, #EEF2FF)', color: '#4F46E5' }}>Daha Sonra Ara</span>;
      case 'WRONG_PERSON_OR_ISSUE':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--error-bg)', color: 'var(--error-color)' }}>Yanlış Kişi</span>;
      default:
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>{status}</span>;
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Kalite Doğrulama Aramaları
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
            Çağrı Merkezi Doğrulama Paneli & Arama Havuzu
          </p>
        </div>

        {/* Campaign Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Kampanya:</label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              minWidth: '220px'
            }}
          >
            <option value="">Tüm Kampanyalar</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.masterSurveyTitle} ({c.requestedCount} Katılımcı)
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { key: 'ALL', label: 'Tüm Aramalar' },
          { key: 'PENDING', label: 'Aranacaklar' },
          { key: 'ACCEPTED', label: 'Kabul Edilenler' },
          { key: 'DECLINED', label: 'Reddedilenler' },
          { key: 'NO_ANSWER', label: 'Ulaşılamayanlar' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: statusFilter === t.key ? 'var(--brand-navy)' : 'transparent',
              color: statusFilter === t.key ? '#FFFFFF' : 'var(--text-secondary)',
              border: statusFilter === t.key ? '1px solid var(--brand-navy)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Assignments List Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Aramalar yükleniyor...</div>
      ) : filteredAssignments.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          Bu filtrelere uygun arama kaydı bulunamadı.
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Katılımcı Adı Soyadı</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Anket Başlığı</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ödül Bilgisi</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Seçim Kaynağı</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Arama Durumu</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {a.userDisplayName}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {a.masterSurveyTitle}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--brand-navy)' }}>
                      🎁 {a.verificationRewardSummary}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {a.selectionSource === 'CUSTOMER' ? '🏢 Firma Seçimi' : '🎲 PAG Random'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(a.status)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleStartCall(a)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--brand-navy)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        📞 Ara
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Active Call Modal with Telephony Simulation & Standard Script */}
      {activeCallAssignment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            {/* Header & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ height: '10px', width: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>
                    Çağrı Devam Ediyor (Simulated Provider)
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {activeCallAssignment.userDisplayName}
                </h3>
              </div>
              <button
                onClick={() => setActiveCallAssignment(null)}
                style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Campaign & Reward Context */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Ana Anket:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activeCallAssignment.masterSurveyTitle}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Hak Kazanılacak Ödül:</span>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>🎁 {activeCallAssignment.verificationRewardSummary}</div>
              </div>
            </div>

            {/* Dynamic Standard Agent Script */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📜 Zorunlu Çağrı Metni (Dynamic Call Script)
              </span>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#1E3A8A', margin: 0, fontWeight: 500 }}>
                &ldquo;PAG kalite doğrulama ekibinden arıyorum. Yakın zamanda ‘<strong>{activeCallAssignment.masterSurveyTitle}</strong>’ anketine katıldınız.
                <br /><br />
                Kalite doğrulama sürecimiz kapsamında uygulamanıza tek soruluk ek bir anket gönderebiliriz.
                Bu soruyu tamamladığınızda <strong>{activeCallAssignment.verificationRewardSummary}</strong> kazanacaksınız.
                <br /><br />
                Katılmak ister misiniz?&rdquo;
              </p>
            </div>

            {/* Note Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Görüşme Notu (Opsiyonel):
              </label>
              <textarea
                value={callNote}
                onChange={(e) => setCallNote(e.target.value)}
                placeholder="Örn: Kullanıcı katılımı onayladı, anket push bildirimi bekleniyor..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Görüşme Sonucu Seçin:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <button
                  onClick={() => handleSubmitResult('ACCEPTED')}
                  disabled={isSubmittingResult}
                  style={{ padding: '12px', backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 800, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  ✓ Kabul Etti
                </button>
                <button
                  onClick={() => handleSubmitResult('DECLINED')}
                  disabled={isSubmittingResult}
                  style={{ padding: '12px', backgroundColor: '#EF4444', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  ✕ Kabul Etmedi
                </button>
                <button
                  onClick={() => handleSubmitResult('NO_ANSWER')}
                  disabled={isSubmittingResult}
                  style={{ padding: '12px', backgroundColor: '#F59E0B', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  Ulaşılamadı
                </button>
                <button
                  onClick={() => handleSubmitResult('CALL_BACK_LATER')}
                  disabled={isSubmittingResult}
                  style={{ padding: '12px', backgroundColor: '#6366F1', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  Daha Sonra Ara
                </button>
                <button
                  onClick={() => handleSubmitResult('WRONG_PERSON_OR_ISSUE')}
                  disabled={isSubmittingResult}
                  style={{ padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--error-color)', border: '1px solid var(--error-border)', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Yanlış Kişi / Sorun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
