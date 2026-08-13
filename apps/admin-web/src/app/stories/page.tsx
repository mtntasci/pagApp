'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';

export interface StoryBarItem {
  id: string;
  storyId: string;
  surveyId: string;
  label: string;
  imageUrl?: string;
  position: number;
  sortOrder: number;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryBarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [editingStory, setEditingStory] = useState<StoryBarItem | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formSurveyId, setFormSurveyId] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(999);
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      try {
        const fn = httpsCallable(functions, 'manageStoryBarAdmin');
        const res: any = await fn({ action: 'GET' });
        if (res.data?.success && Array.isArray(res.data.data?.stories)) {
          setStories(res.data.data.stories);
          setIsLoading(false);
          return;
        }
      } catch (cloudErr) {
        console.warn('Cloud Function manageStoryBarAdmin unavailable, falling back to direct Firestore query:', cloudErr);
      }

      // Direct Firestore Fallback
      const snap = await getDocs(collection(db, 'storyBar'));
      const items: StoryBarItem[] = snap.docs.map((d) => {
        const data = d.data();
        const sOrder = typeof data.sortOrder === 'number' ? data.sortOrder : (typeof data.position === 'number' ? data.position : 999);
        return {
          id: d.id,
          storyId: d.id,
          surveyId: data.surveyId || '',
          label: data.label || data.shortLabel || d.id,
          imageUrl: data.imageUrl || '',
          position: sOrder,
          sortOrder: sOrder,
          isActive: data.isActive !== false
        };
      });
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      setStories(items);
    } catch (err: any) {
      console.error('Fetch Stories Error:', err);
      setErrorMsg('Story verileri yüklenirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const resetForm = () => {
    setEditingStory(null);
    setFormLabel('');
    setFormSurveyId('');
    setFormSortOrder(999);
    setFormIsActive(true);
  };

  const handleEditClick = (st: StoryBarItem) => {
    setEditingStory(st);
    setFormLabel(st.label);
    setFormSurveyId(st.surveyId);
    setFormSortOrder(st.sortOrder || st.position || 999);
    setFormIsActive(st.isActive);
  };

  const handleSaveStory = async () => {
    if (!formLabel.trim()) {
      setErrorMsg('Lütfen bir kısa etiket (label) giriniz.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    const targetStoryId = editingStory?.storyId || (formSurveyId.trim() ? `story_${formSurveyId.trim()}` : `story_${Date.now()}`);
    const resolvedOrder = Number(formSortOrder) || 999;

    try {
      try {
        const fn = httpsCallable(functions, 'manageStoryBarAdmin');
        const res: any = await fn({
          action: 'SAVE',
          storyId: targetStoryId,
          surveyId: formSurveyId.trim(),
          label: formLabel.trim(),
          sortOrder: resolvedOrder,
          position: resolvedOrder,
          isActive: formIsActive
        });

        if (res.data?.success) {
          setSuccessMsg('Story başarıyla kaydedildi!');
          setTimeout(() => setSuccessMsg(null), 3000);
          resetForm();
          await fetchStories();
          return;
        }
      } catch (cloudErr) {
        console.warn('Cloud Function save failed, falling back to direct Firestore write:', cloudErr);
      }

      // Direct Firestore Write Fallback
      const docRef = doc(db, 'storyBar', targetStoryId);
      await setDoc(docRef, {
        storyId: targetStoryId,
        surveyId: formSurveyId.trim(),
        label: formLabel.trim(),
        shortLabel: formLabel.trim(),
        position: resolvedOrder,
        sortOrder: resolvedOrder,
        isActive: formIsActive,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSuccessMsg('Story başarıyla kaydedildi!');
      setTimeout(() => setSuccessMsg(null), 3000);
      resetForm();
      await fetchStories();
    } catch (err: any) {
      setErrorMsg('Story kaydedilemedi: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (st: StoryBarItem) => {
    try {
      try {
        const fn = httpsCallable(functions, 'manageStoryBarAdmin');
        await fn({
          action: 'SAVE',
          storyId: st.storyId,
          surveyId: st.surveyId,
          label: st.label,
          sortOrder: st.sortOrder,
          position: st.position,
          isActive: !st.isActive
        });
        await fetchStories();
        return;
      } catch (cloudErr) {
        console.warn('Cloud Function toggle failed, falling back to direct Firestore update:', cloudErr);
      }

      await setDoc(doc(db, 'storyBar', st.storyId), {
        isActive: !st.isActive,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await fetchStories();
    } catch (err: any) {
      alert('Durum güncellenemedi: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleDeleteStory = async (st: StoryBarItem) => {
    if (!confirm(`"${st.label}" başlıklı story'yi Story Bar'dan kaldırmak istediğinize emin misiniz?`)) return;
    try {
      try {
        const fn = httpsCallable(functions, 'manageStoryBarAdmin');
        await fn({ action: 'DELETE', storyId: st.storyId });
        await fetchStories();
        return;
      } catch (cloudErr) {
        console.warn('Cloud Function delete failed, falling back to direct Firestore delete:', cloudErr);
      }

      await deleteDoc(doc(db, 'storyBar', st.storyId));
      await fetchStories();
    } catch (err: any) {
      alert('Silme hatası: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          🏷️ Story Bar Sıralama & Yönetim
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
          Mobil Uygulama Story Akışı ve Anket Öncelik Sıralaması
        </p>
      </header>

      {/* Notice Card */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--info-bg)',
        border: '1px solid var(--info-border)',
        borderRadius: '10px',
        marginBottom: '24px',
        fontSize: '13px',
        color: 'var(--info-color)',
        fontWeight: 500
      }}>
        ℹ️ <strong>Story Sıralama Mantığı:</strong> Anket oluştulurken varsayılan Sıra Numarası (Sort Order) <strong>999</strong> olarak atanır. Öne çıkarmak istediğiniz anketi <strong>1, 2, 3...</strong> olarak düzenleyebilirsiniz. Sıralama önce Sıra Numarasına, ardından Tarih/Saate göredir.
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-color)', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-color)', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Story Upsert Form */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '40px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
            {editingStory ? `✏️ Story Düzenle (#${editingStory.sortOrder} - ${editingStory.label})` : '➕ Yeni Story Ekle / Öne Al'}
          </h3>
          {editingStory && (
            <button
              onClick={resetForm}
              style={{ padding: '6px 12px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}
            >
              Vazgeç (Yeni Ekle)
            </button>
          )}
        </div>

        <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kısa Etiket (Label)</label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="Örn: Ford Özel Anketi"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Bağlı Anket ID (Survey ID)</label>
            <input
              type="text"
              value={formSurveyId}
              onChange={(e) => setFormSurveyId(e.target.value)}
              placeholder="srv_kahve_tercihleri_2026"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              ⭐ Sıra Numarası (Sort Order)
            </label>
            <input
              type="number"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(Number(e.target.value))}
              placeholder="999 (Öne almak için 1, 2, 3 girin)"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 700
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              * Varsayılan 999'dur. Öne almak istediğiniz ankete 1, 2, 3 gibi küçük rakamlar veriniz.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Durum (Aktiflik)</label>
            <select
              value={formIsActive ? 'ACTIVE' : 'PASSIVE'}
              onChange={(e) => setFormIsActive(e.target.value === 'ACTIVE')}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            >
              <option value="ACTIVE">🟢 Aktif (Story Bar'da Yayınlansın)</option>
              <option value="PASSIVE">🔴 Pasif (Yayından Kaldır)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSaveStory}
          disabled={isSaving}
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '12px 24px',
            backgroundColor: 'var(--brand-navy)',
            color: '#FFFFFF',
            fontWeight: 700,
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            opacity: isSaving ? 0.6 : 1
          }}
        >
          {isSaving ? 'Kaydediliyor...' : editingStory ? 'Story Güncelle' : 'Story Yayınla'}
        </button>
      </div>

      {/* Story List Table */}
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
        📋 Story Bar İçerik Listesi ({stories.length})
      </h3>

      {isLoading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>Story içerikleri yükleniyor...</div>
      ) : stories.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          Henüz eklenmiş story bulunmuyor. Anket oluştururken "Story'de Göster" işaretleyebilir veya yukarıdaki formdan yayınlayabilirsiniz.
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="table-desktop-view" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 16px' }}>Sıra (Sort Order)</th>
                  <th style={{ padding: '14px 16px' }}>Kısa Etiket</th>
                  <th style={{ padding: '14px 16px' }}>Bağlı Anket ID</th>
                  <th style={{ padding: '14px 16px' }}>Durum</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((st) => (
                  <tr key={st.storyId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-primary)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: st.sortOrder < 999 ? '#D97706' : 'var(--text-primary)' }}>
                      {st.sortOrder < 999 ? `⭐ #${st.sortOrder}` : `#${st.sortOrder}`}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{st.label}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{st.surveyId || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleActive(st)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: st.isActive ? 'var(--success-bg)' : 'var(--error-bg)',
                          color: st.isActive ? 'var(--success-color)' : 'var(--error-color)',
                          border: `1px solid ${st.isActive ? 'var(--success-border)' : 'var(--error-border)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        {st.isActive ? '🟢 Aktif' : '🔴 Pasif'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEditClick(st)}
                          style={{ padding: '6px 12px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                          ✏️ Düzenle / Öne Al
                        </button>
                        <button
                          onClick={() => handleDeleteStory(st)}
                          style={{ padding: '6px 12px', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--error-color)', cursor: 'pointer' }}
                        >
                          🗑️ Kaldır
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="card-mobile-view">
            {stories.map((st) => (
              <div key={st.storyId} style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {st.sortOrder < 999 ? `⭐ #${st.sortOrder}` : `#${st.sortOrder}`} {st.label}
                  </span>
                  <button
                    onClick={() => handleToggleActive(st)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: st.isActive ? 'var(--success-bg)' : 'var(--error-bg)',
                      color: st.isActive ? 'var(--success-color)' : 'var(--error-color)',
                      border: `1px solid ${st.isActive ? 'var(--success-border)' : 'var(--error-border)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    {st.isActive ? '🟢 Aktif' : '🔴 Pasif'}
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Bağlı Anket:</strong> <span style={{ fontFamily: 'monospace' }}>{st.surveyId || '-'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => handleEditClick(st)}
                    style={{ flex: 1, padding: '8px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    ✏️ Düzenle / Sırala
                  </button>
                  <button
                    onClick={() => handleDeleteStory(st)}
                    style={{ padding: '8px 14px', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--error-color)', cursor: 'pointer' }}
                  >
                    🗑️ Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

