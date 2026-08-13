'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface CategoryItem {
  id: string;
  name: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function CategoriesManagementPage() {
  const [activeTab, setActiveTab] = useState<'SURVEY' | 'PROFILE'>('SURVEY');
  const [surveyCategories, setSurveyCategories] = useState<CategoryItem[]>([]);
  const [profileCategories, setProfileCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);



  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'SURVEY') {
        const fn = httpsCallable(functions, 'manageSurveyCategoriesAdmin');
        const res: any = await fn({ action: 'GET' });
        if (res.data?.success && Array.isArray(res.data.data?.categories)) {
          setSurveyCategories(res.data.data.categories);
        }
      } else {
        const fn = httpsCallable(functions, 'manageProfileCategoriesAdmin');
        const res: any = await fn({ action: 'GET' });
        if (res.data?.success && Array.isArray(res.data.data?.categories)) {
          setProfileCategories(res.data.data.categories);
        }
      }
    } catch (err: any) {
      console.error('Fetch Categories Error:', err);
      setErrorMsg('Kategoriler yüklenirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAddModal = () => {
    const list = activeTab === 'SURVEY' ? surveyCategories : profileCategories;
    setEditingCategory(null);
    setFormName('');
    setFormSortOrder(list.length + 1);
    setFormIsVisible(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSortOrder(cat.sortOrder || 1);
    setFormIsVisible(typeof cat.isVisible === 'boolean' ? cat.isVisible : true);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formName.trim()) {
      setErrorMsg('Lütfen kategori adı giriniz.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const fnName = activeTab === 'SURVEY' ? 'manageSurveyCategoriesAdmin' : 'manageProfileCategoriesAdmin';
      const fn = httpsCallable(functions, fnName);
      const res: any = await fn({
        action: 'SAVE',
        category: {
          id: editingCategory?.id,
          name: formName.trim(),
          sortOrder: Number(formSortOrder) || 1,
          isVisible: formIsVisible
        }
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        setSuccessMsg('Kategori başarıyla kaydedildi.');
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchCategories();
      } else {
        throw new Error(res.data?.error || 'Kategori kaydedilemedi.');
      }
    } catch (err: any) {
      setErrorMsg('Kayıt Hatası: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (cat: CategoryItem) => {
    try {
      const fnName = activeTab === 'SURVEY' ? 'manageSurveyCategoriesAdmin' : 'manageProfileCategoriesAdmin';
      const fn = httpsCallable(functions, fnName);
      const res: any = await fn({
        action: 'SAVE',
        category: {
          ...cat,
          isVisible: !cat.isVisible
        }
      });

      if (res.data?.success) {
        await fetchCategories();
      }
    } catch (err: any) {
      alert('Görünürlük değiştirilemedi: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleSeedOfficialCategories = async () => {
    if (!confirm('13 resmi Anket Kategorisi ve 13 resmi Profil Kategorisi veritabanına yüklensin mi?')) return;
    setIsSeeding(true);
    setErrorMsg(null);
    try {
      const seedFn = httpsCallable(functions, 'seedCategoriesAdmin');
      const res: any = await seedFn({});
      if (res.data?.success) {
        setSuccessMsg('13 Anket ve 13 Profil Anketi Kategorisi başarıyla oluşturuldu!');
        setTimeout(() => setSuccessMsg(null), 4000);
        await fetchCategories();
      }
    } catch (err: any) {
      setErrorMsg('Seed Hatası: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSeeding(false);
    }
  };

  const currentList = activeTab === 'SURVEY' ? surveyCategories : profileCategories;

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            🏷️ Dinamik Kategori Yönetimi
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
            Anket ve Profil Anketi Kategorilerinin Sıralama, Ad ve Görünürlük Yönetimi
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSeedOfficialCategories}
            disabled={isSeeding}
            style={{
              padding: '10px 18px',
              backgroundColor: '#0F172A',
              color: '#CCFF00',
              fontWeight: 700,
              borderRadius: '8px',
              fontSize: '13px',
              border: '1px solid #CCFF00',
              cursor: 'pointer'
            }}
          >
            {isSeeding ? 'Seed ediliyor...' : '🌱 13 Resmi Kategoriyi Seed Et'}
          </button>

          <button
            onClick={handleOpenAddModal}
            style={{
              padding: '10px 18px',
              backgroundColor: 'var(--brand-navy)',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer'
            }}
          >
            + Yeni Kategori Ekle
          </button>
        </div>
      </header>

      {/* Messages */}
      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('SURVEY')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: activeTab === 'SURVEY' ? 'var(--brand-navy)' : 'transparent',
            color: activeTab === 'SURVEY' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          📋 Anket Kategorileri ({surveyCategories.length})
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: activeTab === 'PROFILE' ? 'var(--brand-navy)' : 'transparent',
            color: activeTab === 'PROFILE' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          👤 Profil Anketi Kategorileri ({profileCategories.length})
        </button>
      </div>

      {/* Categories Table */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Kategoriler yükleniyor...
        </div>
      ) : currentList.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Henüz kayıtlı kategori bulunmuyor.</p>
          <button onClick={handleSeedOfficialCategories} style={{ padding: '8px 16px', backgroundColor: '#CCFF00', color: '#0F172A', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            🌱 13 Resmi Kategoriyi Seed Et
          </button>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 16px', width: '80px' }}>Sıra</th>
                <th style={{ padding: '14px 16px' }}>Kategori Adı</th>
                <th style={{ padding: '14px 16px' }}>Kategori ID (Slug)</th>
                <th style={{ padding: '14px 16px', width: '140px' }}>Durum (Görünürlük)</th>
                <th style={{ padding: '14px 16px', width: '160px', textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: cat.isVisible ? 1 : 0.55 }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--brand-lime)' }}>
                    #{cat.sortOrder}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cat.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {cat.id}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: cat.isVisible ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.2)',
                      color: cat.isVisible ? '#22c55e' : '#94a3b8'
                    }}>
                      {cat.isVisible ? '👁️ Görünür' : '🙈 Gizli'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleToggleVisibility(cat)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-card)',
                          cursor: 'pointer'
                        }}
                      >
                        {cat.isVisible ? 'Gizle' : 'Göster'}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--brand-navy)',
                          color: '#FFFFFF',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Düzenle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2200,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                {editingCategory ? '✏️ Kategori Düzenle' : '➕ Yeni Kategori Ekle'} ({activeTab === 'SURVEY' ? 'Anket' : 'Profil Anketi'})
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Kategori Adı *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Örn: Teknoloji & Dijital"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Görüntülenme Sırası (sortOrder)</label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  min={1}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="catVisibleChk"
                  checked={formIsVisible}
                  onChange={(e) => setFormIsVisible(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="catVisibleChk" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Yeni seçimlerde gösterilsin (`isVisible = true`)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
              >
                İptal
              </button>

              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={isSaving}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#CCFF00',
                  color: '#0F172A',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
