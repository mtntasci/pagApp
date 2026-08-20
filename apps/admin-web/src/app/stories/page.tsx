'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface StoryBarItem {
  id: string;
  storyId: string;
  surveyId: string;
  title: string;
  label: string;
  shortLabel: string;
  storyLabel?: string;
  imageCategory: string;
  imageUrl?: string | null;
  position: number;
  sortOrder: number;
  isActive: boolean;
  surveyTitle?: string;
  status?: string;
}

export interface AvailableSurvey {
  id: string;
  title: string;
  category: string;
  status: string;
  hasStory: boolean;
}

const STORY_CATEGORY_PRESETS = [
  { id: 'Genel', name: 'Genel / PAG', color: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', icon: '⭐' },
  { id: 'Teknoloji', name: 'Teknoloji', color: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', icon: '💻' },
  { id: 'Otomotiv & Ulaşım', name: 'Otomotiv & Ulaşım', color: 'linear-gradient(135deg, #EF4444, #B91C1C)', icon: '🚗' },
  { id: 'Yeme & İçme', name: 'Yeme & İçme', color: 'linear-gradient(135deg, #F59E0B, #B45309)', icon: '☕' },
  { id: 'Alışveriş & Tüketim', name: 'Alışveriş & Tüketim', color: 'linear-gradient(135deg, #EC4899, #BE185D)', icon: '🛍️' },
  { id: 'Finans', name: 'Finans', color: 'linear-gradient(135deg, #10B981, #047857)', icon: '💳' },
  { id: 'Yaşam', name: 'Yaşam & Şehir', color: 'linear-gradient(135deg, #0EA5E9, #0284C7)', icon: '🌿' },
  { id: 'Spor & Sağlıklı Yaşam', name: 'Spor & Sağlık', color: 'linear-gradient(135deg, #059669, #047857)', icon: '🏃' },
  { id: 'Seyahat & Eğlence', name: 'Seyahat & Tatil', color: 'linear-gradient(135deg, #0284C7, #0369A1)', icon: '✈️' },
  { id: 'Ev & Yaşam', name: 'Ev & Yaşam', color: 'linear-gradient(135deg, #D97706, #B45309)', icon: '🏠' },
  { id: 'Moda & Kişisel Bakım', name: 'Moda & Bakım', color: 'linear-gradient(135deg, #F472B6, #BE185D)', icon: '💄' },
  { id: 'Medya & Dijital İçerik', name: 'Medya & Dijital', color: 'linear-gradient(135deg, #6366F1, #4338CA)', icon: '📱' },
  { id: 'Eğitim & Kariyer', name: 'Eğitim & Kariyer', color: 'linear-gradient(135deg, #7C3AED, #5B21B6)', icon: '🎓' }
];

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryBarItem[]>([]);
  const [availableSurveys, setAvailableSurveys] = useState<AvailableSurvey[]>([]);
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
  const [formImageCategory, setFormImageCategory] = useState('Genel');
  const [formImageUrl, setFormImageUrl] = useState('');

  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/admin/stories', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (Array.isArray(json.data?.stories)) {
            setStories(json.data.stories);
          }
          if (Array.isArray(json.data?.availableSurveys)) {
            setAvailableSurveys(json.data.availableSurveys);
          }
        } else {
          setStories([]);
        }
      } else {
        setStories([]);
      }
    } catch (err: any) {
      console.error('Fetch Stories Error:', err);
      setErrorMsg('Story verileri yüklenirken hata: ' + (err.message || 'Bilinmeyen hata'));
      setStories([]);
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
    setFormImageCategory('Genel');
    setFormImageUrl('');
  };

  const handleEditClick = (st: StoryBarItem) => {
    setEditingStory(st);
    setFormLabel(st.label || st.shortLabel || st.title || '');
    setFormSurveyId(st.surveyId || st.id || '');
    setFormSortOrder(st.sortOrder !== undefined ? st.sortOrder : (st.position !== undefined ? st.position : 999));
    setFormIsActive(st.isActive);
    setFormImageCategory(st.imageCategory || 'Genel');
    setFormImageUrl(st.imageUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSurvey = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setFormSurveyId(selectedId);
    if (selectedId) {
      const found = availableSurveys.find(s => s.id === selectedId);
      if (found) {
        if (!formLabel.trim()) {
          setFormLabel(found.title.length > 20 ? found.title.slice(0, 18) + '...' : found.title);
        }
        if (found.category) {
          setFormImageCategory(found.category);
        }
      }
    }
  };

  const handleSaveStory = async () => {
    const targetSurveyId = formSurveyId.trim() || editingStory?.surveyId || '';
    if (!targetSurveyId) {
      setErrorMsg('Lütfen bağlı bir anket seçiniz veya Anket ID giriniz.');
      return;
    }
    if (!formLabel.trim()) {
      setErrorMsg('Lütfen bir kısa etiket (label) giriniz.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    const resolvedOrder = Number(formSortOrder) || 999;

    try {
      const res = await fetch('/api/v1/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: targetSurveyId,
          shortLabel: formLabel.trim(),
          label: formLabel.trim(),
          storyLabel: formLabel.trim(),
          position: resolvedOrder,
          sortOrder: resolvedOrder,
          imageCategory: formImageCategory,
          imageUrl: formImageUrl.trim() || null,
          isActive: formIsActive
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSuccessMsg('Story başarıyla kaydedildi!');
        setTimeout(() => setSuccessMsg(null), 3000);
        resetForm();
        await fetchStories();
      } else {
        setErrorMsg(data.error || 'Story kaydedilemedi.');
      }
    } catch (err: any) {
      setErrorMsg('Story kaydedilemedi: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (st: StoryBarItem) => {
    try {
      const res = await fetch('/api/v1/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: st.surveyId,
          shortLabel: st.label || st.shortLabel || st.title,
          label: st.label || st.shortLabel || st.title,
          position: st.sortOrder || st.position || 999,
          sortOrder: st.sortOrder || st.position || 999,
          imageCategory: st.imageCategory,
          imageUrl: st.imageUrl || null,
          isActive: !st.isActive
        })
      });
      await fetchStories();
    } catch (err: any) {
      alert('Durum güncellenemedi: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleDeleteStory = async (st: StoryBarItem) => {
    const storyName = st.label || st.shortLabel || st.title || 'Anket';
    if (!confirm(`"${storyName}" başlıklı story'yi Story Bar'dan kaldırmak istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch('/api/v1/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: st.surveyId,
          shortLabel: storyName,
          label: storyName,
          position: st.sortOrder || st.position || 999,
          sortOrder: st.sortOrder || st.position || 999,
          imageCategory: st.imageCategory,
          imageUrl: st.imageUrl || null,
          isActive: false
        })
      });
      await fetchStories();
    } catch (err: any) {
      alert('Silme hatası: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const selectedPreset = STORY_CATEGORY_PRESETS.find(p => p.id === formImageCategory) || STORY_CATEGORY_PRESETS[0];

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          🏷️ Story Bar Sıralama & Görsel Yönetimi
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
          Mobil Uygulama Story Akışı, Özel Görseller, Sıra Numarası ve Kısa Etiket Yönetimi
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
        ℹ️ <strong>Story Sıralama & Görsel Mantığı:</strong> Anketler Story Bar üzerinde <strong>Sıra Numarasına (Sort Order)</strong> göre küçükten büyüğe (1, 2, 3...) sıralanır. Özel görsel URL belirleyebilir veya kategori temalı preset ikonlardan seçebilirsiniz.
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
            {editingStory ? `✏️ Story Düzenle (#${editingStory.sortOrder || editingStory.position} - ${editingStory.label || editingStory.shortLabel})` : '➕ Yeni Story Ekle / Öne Al'}
          </h3>
          {editingStory && (
            <button
              onClick={resetForm}
              style={{ padding: '6px 12px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Vazgeç (Yeni Ekle)
            </button>
          )}
        </div>

        {/* Survey Picker & Label */}
        <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              🎯 Bağlı Anket Seçimi
            </label>
            <select
              value={formSurveyId}
              onChange={handleSelectSurvey}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <option value="">-- Listeden Anket Seçin --</option>
              {availableSurveys.map(s => (
                <option key={s.id} value={s.id}>
                  {s.hasStory ? '⭐ ' : ''}{s.title} ({s.id}) [{s.status}]
                </option>
              ))}
            </select>
            <div style={{ marginTop: '6px' }}>
              <input
                type="text"
                value={formSurveyId}
                onChange={(e) => setFormSurveyId(e.target.value)}
                placeholder="Veya doğrudan Anket ID girin (Örn: srv_kahve_2026)"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              🏷️ Kısa Etiket (Story Altı Başlığı)
            </label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="Örn: Fırsat Anketi, Kahve, Teknoloji..."
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              * Mobil uygulamadaki dairenin altında görünecek kısa isim (Örn: Max 15 karakter).
            </span>
          </div>
        </div>

        {/* Sort Order & Status */}
        <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ⭐ Sıra Numarası (Sort Order)
            </label>
            <input
              type="number"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(Number(e.target.value))}
              placeholder="999 (En başa almak için 1, 2, 3...)"
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
              * 1 en önde çıkar. Birden fazla ankete 1, 2, 3 vererek sıralayabilirsiniz.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Durum (Aktiflik)
            </label>
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
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <option value="ACTIVE">🟢 Aktif (Story Bar'da Yayınlansın)</option>
              <option value="PASSIVE">🔴 Pasif (Yayından Kaldır)</option>
            </select>
          </div>
        </div>

        {/* Story Image & Visual Theme Customization */}
        <div style={{
          padding: '18px',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            🖼️ Story Görseli & Kategori Teması
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '20px', alignItems: 'start' }}>
            {/* Live Story Circle Preview */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px dashed var(--border-highlight)',
              borderRadius: '10px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Mobil Canlı Önizleme
              </span>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                border: '2px solid #84CC16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                backgroundColor: '#0F172A',
                marginBottom: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                {formImageUrl ? (
                  <img
                    src={formImageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: selectedPreset.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#FFF'
                  }}>
                    {selectedPreset.icon}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formLabel.trim() || 'Kısa Etiket'}
              </span>
            </div>

            {/* Custom Image URL and Category Selector */}
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🌐 Özel Görsel Bağlantısı (Image URL)
                </label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://example.com/story-banner.png (Boş bırakılırsa tema ikonu kullanılır)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    marginTop: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  * Doğrudan bir resim linki (HTTPS) girerek Story görselini özelleştirebilirsiniz.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                  🎨 Veya Kategori Teması Seçin:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {STORY_CATEGORY_PRESETS.map((p) => {
                    const isSelected = formImageCategory === p.id && !formImageUrl;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormImageCategory(p.id);
                          setFormImageUrl('');
                        }}
                        style={{
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'var(--brand-navy)' : 'var(--bg-surface)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                          border: isSelected ? '1px solid var(--brand-navy)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{p.icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
          Henüz eklenmiş story bulunmuyor. Yukarıdaki formdan anket seçerek yayınlayabilirsiniz.
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="table-desktop-view" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 16px' }}>Sıra (Sort Order)</th>
                  <th style={{ padding: '14px 16px' }}>Görsel</th>
                  <th style={{ padding: '14px 16px' }}>Kısa Etiket</th>
                  <th style={{ padding: '14px 16px' }}>Bağlı Anket & ID</th>
                  <th style={{ padding: '14px 16px' }}>Durum</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((st) => {
                  const itemLabel = st.label || st.shortLabel || st.title || 'Anket';
                  const itemOrder = st.sortOrder !== undefined ? st.sortOrder : (st.position !== undefined ? st.position : 999);
                  const preset = STORY_CATEGORY_PRESETS.find(p => p.id === st.imageCategory) || STORY_CATEGORY_PRESETS[0];

                  return (
                    <tr key={st.storyId || st.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-primary)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: itemOrder < 999 ? '#D97706' : 'var(--text-primary)' }}>
                        {itemOrder < 999 ? `⭐ #${itemOrder}` : `#${itemOrder}`}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {st.imageUrl ? (
                          <img
                            src={st.imageUrl}
                            alt={itemLabel}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: preset.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#FFF' }}>
                            {preset.icon}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        {itemLabel}
                        {st.imageCategory && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {st.imageCategory}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {st.surveyTitle || st.title || '-'}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {st.surveyId || st.id}
                        </div>
                      </td>
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
                            ✏️ Düzenle / Sırala
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="card-mobile-view">
            {stories.map((st) => {
              const itemLabel = st.label || st.shortLabel || st.title || 'Anket';
              const itemOrder = st.sortOrder !== undefined ? st.sortOrder : (st.position !== undefined ? st.position : 999);

              return (
                <div key={st.storyId || st.id} style={{
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
                      {itemOrder < 999 ? `⭐ #${itemOrder}` : `#${itemOrder}`} {itemLabel}
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
                    <strong>Bağlı Anket:</strong> <span style={{ fontFamily: 'monospace' }}>{st.surveyId || st.id || '-'}</span>
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
