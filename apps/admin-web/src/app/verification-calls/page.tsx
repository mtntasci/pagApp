'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export interface VerificationAssignmentItem {
  id: string;
  verificationCampaignId: string;
  masterSurveyId: string;
  masterSurveyTitle: string;
  verificationSurveyId: string;
  verificationRewardSummary: string;
  userDisplayName: string;
  organizationId?: string | null;
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
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('ALL');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [assignments, setAssignments] = useState<VerificationAssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCallAssignment, setActiveCallAssignment] = useState<VerificationAssignmentItem | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callNote, setCallNote] = useState('');
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // 1. Fetch campaigns & organizations (Instant Direct Firestore Read ~30ms)
  const fetchData = useCallback(async () => {
    try {
      const [campsSnap, orgsSnap] = await Promise.all([
        getDocs(collection(db, 'surveyVerificationCampaigns')).catch(() => null),
        getDocs(collection(db, 'organizations')).catch(() => null)
      ]);

      if (campsSnap && !campsSnap.empty) {
        setCampaigns(campsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      if (orgsSnap && !orgsSnap.empty) {
        setOrganizations(orgsSnap.docs.map(d => ({ organizationId: d.id, ...d.data() })));
      }
    } catch (fsErr) {
      console.warn('Direct Firestore fetch error:', fsErr);
    }

    try {
      const listCampFn = httpsCallable(functions, 'listVerificationCampaigns');
      const listOrgsFn = httpsCallable(functions, 'listOrganizationsAdmin');

      const [campRes, orgsRes]: [any, any] = await Promise.all([
        listCampFn({}).catch(() => null),
        listOrgsFn().catch(() => null)
      ]);

      if (campRes?.data?.success && Array.isArray(campRes.data.data?.campaigns)) {
        setCampaigns(campRes.data.data.campaigns);
      }
      if (orgsRes?.data?.success && Array.isArray(orgsRes.data.data?.organizations)) {
        setOrganizations(orgsRes.data.data.organizations);
      }
    } catch (err) {
      // background
    }
  }, []);

  // 2. Fetch assignments (Instant Direct Firestore Read ~30ms)
  const fetchAssignments = useCallback(async (campId?: string) => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'surveyVerificationAssignments'));
      if (!snap.empty) {
        let list: VerificationAssignmentItem[] = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as VerificationAssignmentItem));
        if (campId) {
          list = list.filter(a => a.verificationCampaignId === campId);
        }
        setAssignments(list);
      }
    } catch (fsErr) {
      console.warn('Direct Firestore assignments read error:', fsErr);
    } finally {
      setIsLoading(false);
    }

    try {
      const listAssignFn = httpsCallable(functions, 'listVerificationAssignmentsForAgent');
      const res: any = await listAssignFn({ campaignId: campId || undefined });
      if (res.data?.success && Array.isArray(res.data?.data?.assignments) && res.data.data.assignments.length > 0) {
        setAssignments(res.data.data.assignments);
      }
    } catch (err) {
      // background
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // Get matching organization name for assignment
  const getOrgNameForAssignment = (a: VerificationAssignmentItem) => {
    const matchedCamp = campaigns.find(c => c.id === a.verificationCampaignId || c.masterSurveyId === a.masterSurveyId);
    const orgId = a.organizationId || matchedCamp?.organizationId;
    if (!orgId) return 'PAG Platformu';
    const org = organizations.find(o => o.organizationId === orgId);
    return org ? org.name : orgId;
  };

  const filteredAssignments = assignments.filter((a) => {
    if (selectedOrgId !== 'ALL') {
      const matchedCamp = campaigns.find(c => c.id === a.verificationCampaignId || c.masterSurveyId === a.masterSurveyId);
      const orgId = a.organizationId || matchedCamp?.organizationId;
      if (orgId !== selectedOrgId) return false;
    }
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return ['QUEUED', 'ASSIGNED', 'CALL_BACK_LATER', 'NO_ANSWER'].includes(a.status);
    if (statusFilter === 'ACCEPTED') return ['ACCEPTED', 'PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(a.status);
    return a.status === statusFilter;
  });

  const pendingCount = assignments.filter(a => ['QUEUED', 'ASSIGNED', 'CALL_BACK_LATER', 'NO_ANSWER'].includes(a.status)).length;
  const acceptedCount = assignments.filter(a => ['ACCEPTED', 'PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(a.status)).length;
  const completedCount = assignments.filter(a => a.status === 'VERIFICATION_COMPLETED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED':
      case 'ASSIGNED':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)' }}>⏳ Bekliyor</span>;
      case 'CALLING':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)', border: '1px solid var(--warning-border)' }}>📞 Aranıyor</span>;
      case 'ACCEPTED':
      case 'PUSH_SENT':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>✓ Kabul Etti</span>;
      case 'VERIFICATION_COMPLETED':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--brand-lime)', color: 'var(--brand-midnight)' }}>⭐ Tamamlandı</span>;
      case 'DECLINED':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)' }}>✕ Reddetti</span>;
      case 'NO_ANSWER':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)' }}>Ulaşılamadı</span>;
      case 'CALL_BACK_LATER':
        return <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'rgba(57, 119, 246, 0.15)', color: '#3977F6' }}>Daha Sonra Ara</span>;
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
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            📞 Arama Portalı & Çağrı Havuzu
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            Firma bazında bekleyen kalite doğrulama aramaları ve canlı görüşme konsolu
          </p>
        </div>

        {/* Filters Bar: Firma & Kampanya Seçimi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Firma Seçimi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>🏢 Firma:</label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">Tüm Firmalar</option>
              {organizations.map((org) => (
                <option key={org.organizationId} value={org.organizationId}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kampanya Seçimi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>📋 Kampanya:</label>
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
                minWidth: '200px'
              }}
            >
              <option value="">Tüm Kampanyalar</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.masterSurveyTitle} ({c.requestedCount} Kişi)
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Toplam Arama</span>
          <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{assignments.length}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Bekleyen Aramalar</span>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B', margin: '4px 0 0 0' }}>⏳ {pendingCount}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Kabul Edenler</span>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', margin: '4px 0 0 0' }}>✓ {acceptedCount}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Anketi Tamamlayan</span>
          <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-navy)', margin: '4px 0 0 0' }}>⭐ {completedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { key: 'ALL', label: 'Tüm Aramalar' },
          { key: 'PENDING', label: '⏳ Aranacaklar / Bekleyenler' },
          { key: 'ACCEPTED', label: '✓ Kabul Edilenler' },
          { key: 'DECLINED', label: '✕ Reddedilenler' },
          { key: 'NO_ANSWER', label: '📞 Ulaşılamayanlar' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: statusFilter === t.key ? 'var(--brand-navy)' : 'var(--bg-surface-secondary)',
              color: statusFilter === t.key ? '#FFFFFF' : 'var(--text-secondary)',
              border: statusFilter === t.key ? '1px solid var(--brand-navy)' : '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Assignments List Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontWeight: 600 }}>Aramalar yükleniyor...</div>
      ) : filteredAssignments.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Bu filtrelere uygun arama kaydı bulunamadı</p>
          <p style={{ fontSize: '13px', marginTop: '4px', margin: 0 }}>Yukarıdaki firma veya kampanya filtresini değiştirebilirsiniz.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Firma / Kurum</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Katılımcı (Maskelenmiş)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Anket Başlığı</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ödül Bilgisi</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Seçim Türü</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Arama Durumu</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(57, 119, 246, 0.12)', color: '#3977F6', fontSize: '12px', fontWeight: 800 }}>
                        🏢 {getOrgNameForAssignment(a)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {a.userDisplayName}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {a.masterSurveyTitle}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--brand-navy)' }}>
                      🎁 {a.verificationRewardSummary}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
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
                          fontWeight: 800,
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        📞 Aramayı Başlat
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
                    Çağrı Devam Ediyor ({getOrgNameForAssignment(activeCallAssignment)})
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {activeCallAssignment.userDisplayName}
                </h3>
              </div>
              <button
                onClick={() => setActiveCallAssignment(null)}
                style={{ color: 'var(--text-secondary)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Campaign & Reward Context */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Firma & Anket:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{getOrgNameForAssignment(activeCallAssignment)} — {activeCallAssignment.masterSurveyTitle}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Kazanılacak Ödül:</span>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>🎁 {activeCallAssignment.verificationRewardSummary}</div>
              </div>
            </div>

            {/* Dynamic Standard Agent Script */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(57, 119, 246, 0.08)',
              border: '1.5px solid rgba(57, 119, 246, 0.25)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#3977F6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📜 Standart Çağrı Metni (Dynamic Call Script)
              </span>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
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
                placeholder="Örn: Katılımcı olumlu yanıt verdi, push bildirimi gönderildi..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
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
                  Yanlış Kişi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
