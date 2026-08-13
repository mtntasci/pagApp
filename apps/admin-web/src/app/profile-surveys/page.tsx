'use client';

import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export default function ProfileSurveysPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'FORM' | 'JSON'>('FORM');
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [targetingGender, setTargetingGender] = useState('ALL');
  const [scoreReward, setScoreReward] = useState(50);
  const [showOnHome, setShowOnHome] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [optionsList, setOptionsList] = useState<string[]>(['', '']);
  const [isSaving, setIsSaving] = useState(false);

  // JSON Mode State
  const [jsonInputText, setJsonInputText] = useState('');
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);

  const sampleProfileQuestionJson = JSON.stringify({
    "id": "pq_otomobil_sahipligi",
    "questionText": "Kişisel bir otomobiliniz var mı?",
    "categoryId": "cat_automotive",
    "categoryName": "Otomotiv & Ulaşım",
    "targetingGender": "ALL",
    "profileScoreReward": 50,
    "status": "DRAFT",
    "showOnHome": true,
    "options": [
      { "optionId": "opt_auto_own", "label": "Evet, kendi aracıma sahibim", "order": 1 },
      { "optionId": "opt_auto_company", "label": "Şirket aracı kullanıyorum", "order": 2 },
      { "optionId": "opt_auto_plan", "label": "Aracım yok, yakın zamanda almayı planlıyorum", "order": 3 },
      { "optionId": "opt_auto_none", "label": "Aracım yok ve almayı planlamıyorum", "order": 4 }
    ]
  }, null, 2);

  const fetchQuestionsAndCategories = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const getCatsFn = httpsCallable(functions, 'manageProfileCategoriesAdmin');
      const catRes = (await getCatsFn({ action: 'GET' })) as any;
      if (catRes.data && catRes.data.success && Array.isArray(catRes.data.data.categories)) {
        setCategories(catRes.data.data.categories);
      }

      const listFn = httpsCallable(functions, 'listProfileQuestionsAdmin');
      const res = (await listFn({})) as any;
      if (res.data && res.data.success && Array.isArray(res.data.data.questions)) {
        setQuestions(res.data.data.questions);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Veriler yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsAndCategories();
  }, []);

  const handleOpenNewModal = (mode: 'FORM' | 'JSON' = 'FORM') => {
    setEditingQuestion(null);
    setQuestionText('');
    setSelectedCatId(categories.length > 0 ? categories[0].id : 'cat_lifestyle');
    setTargetingGender('ALL');
    setScoreReward(50);
    setShowOnHome(false);
    setStatus('ACTIVE');
    setOptionsList(['', '']);
    setJsonInputText('');
    setJsonImportError(null);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: any) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText || '');
    setSelectedCatId(q.categoryId || '');
    setTargetingGender(q.targetingGender || 'ALL');
    setScoreReward(q.profileScoreReward || 50);
    setShowOnHome(Boolean(q.showOnHome));
    setStatus(q.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT');
    setOptionsList(Array.isArray(q.options) ? q.options.map((o: any) => o.label || o) : ['', '']);
    setModalMode('FORM');
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    if (optionsList.length < 6) setOptionsList([...optionsList, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (optionsList.length > 2) setOptionsList(optionsList.filter((_, idx) => idx !== index));
  };

  const handleSaveFormQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const validOpts = optionsList.map((o) => o.trim()).filter((o) => o.length > 0);
    if (validOpts.length < 2) return;

    setIsSaving(true);
    const catObj = categories.find((c) => c.id === selectedCatId);
    const catName = catObj ? catObj.name : 'Genel';

    const mappedOpts = validOpts.map((optText, idx) => ({
      optionId: 'opt_' + (idx + 1),
      label: optText,
      order: idx + 1
    }));

    const payload = {
      id: editingQuestion ? editingQuestion.id : undefined,
      questionText: questionText.trim(),
      categoryId: selectedCatId,
      categoryName: catName,
      targetingGender: targetingGender,
      options: mappedOpts,
      profileScoreReward: Number(scoreReward) || 50,
      showOnHome: showOnHome,
      status: status
    };

    try {
      const saveFn = httpsCallable(functions, 'createOrUpdateProfileQuestionAdmin');
      const res = (await saveFn(payload)) as any;
      if (res.data && res.data.success) {
        setSuccessMessage('Profil sorusu başarıyla kaydedildi.');
        setIsModalOpen(false);
        fetchQuestionsAndCategories();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Kaydetme hatası.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportJsonQuestions = async () => {
    setJsonImportError(null);
    if (!jsonInputText.trim()) {
      setJsonImportError('Lütfen metin kutusuna JSON formatında soru verisini yapıştırın.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInputText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      setIsSaving(true);

      const saveFn = httpsCallable(functions, 'createOrUpdateProfileQuestionAdmin');

      for (const q of items) {
        if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
          throw new Error('Geçersiz soru formatı. "questionText" ve en az 2 "options" (seçenek) gereklidir.');
        }

        const catObj = categories.find((c) => c.id === q.categoryId) || categories[0];
        const catName = q.categoryName || (catObj ? catObj.name : 'Genel');
        const catId = q.categoryId || (catObj ? catObj.id : 'cat_lifestyle');

        const mappedOpts = q.options.map((opt: any, idx: number) => ({
          optionId: typeof opt === 'object' ? (opt.optionId || 'opt_' + (idx + 1)) : 'opt_' + (idx + 1),
          label: typeof opt === 'string' ? opt : (opt.label || `Seçenek ${idx + 1}`),
          order: typeof opt === 'object' ? (opt.order || idx + 1) : idx + 1
        }));

        const payload = {
          id: q.id || undefined,
          questionText: q.questionText.trim(),
          categoryId: catId,
          categoryName: catName,
          targetingGender: q.targetingGender || 'ALL',
          options: mappedOpts,
          profileScoreReward: Number(q.profileScoreReward) || 50,
          showOnHome: Boolean(q.showOnHome),
          status: q.status || 'DRAFT'
        };

        await saveFn(payload);
      }

      setSuccessMessage(`${items.length} adet profil sorusu başarıyla içeri aktarıldı.`);
      setIsModalOpen(false);
      setJsonInputText('');
      fetchQuestionsAndCategories();
    } catch (err: any) {
      console.error(err);
      setJsonImportError('JSON Yükleme Hatası: ' + (err.message || 'Geçersiz JSON formatı.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.5px' }}>
            Profil Anketleri Yönetimi
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Kullanıcı Profil Soruları, Kategori Hedeflemeleri ve Puan Ödülleri
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleOpenNewModal('FORM')}
            style={{
              padding: '10px 18px',
              backgroundColor: 'var(--brand-navy)',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            + Yeni Profil Sorusu Ekle
          </button>

          <button
            onClick={() => handleOpenNewModal('JSON')}
            style={{
              padding: '10px 18px',
              backgroundColor: '#0F172A',
              color: '#CCFF00',
              fontWeight: 700,
              borderRadius: '8px',
              border: '1px solid #CCFF00',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            📥 JSON İle İçeri Aktar
          </button>
        </div>
      </header>

      {errorMessage && (
        <div style={{ padding: '14px 16px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div style={{ padding: '14px 16px', backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-border)', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Main Table */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          Yükleniyor...
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 16px' }}>Soru Metni</th>
                <th style={{ padding: '14px 16px' }}>Kategori</th>
                <th style={{ padding: '14px 16px' }}>Hedef Cinsiyet</th>
                <th style={{ padding: '14px 16px' }}>Puan Ödülü</th>
                <th style={{ padding: '14px 16px' }}>Durum</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Henüz eklenmiş bir profil sorusu bulunmuyor.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--brand-navy)', maxWidth: '350px' }}>
                      {q.questionText}
                      {q.showOnHome && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--brand-lime-subtle)', color: 'var(--brand-navy)', fontWeight: 700 }}>
                          Ana Sayfa Promosyonu
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600 }}>
                        {q.categoryName || 'Genel'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {q.targetingGender === 'MALE' ? '👨 Yalnız Erkekler' : q.targetingGender === 'FEMALE' ? '👩 Yalnız Kadınlar' : '👥 Herkes'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--brand-navy)' }}>
                      +{q.profileScoreReward} Puan
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: q.status === 'ACTIVE' ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: q.status === 'ACTIVE' ? 'var(--success-color)' : 'var(--warning-color)',
                        border: `1px solid ${q.status === 'ACTIVE' ? 'var(--success-border)' : 'var(--warning-border)'}`
                      }}>
                        {q.status === 'ACTIVE' ? 'Aktif' : 'Taslak (Onaysız)'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-highlight)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--brand-navy)',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Unified Corporate Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', width: '100%', maxWidth: '680px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {editingQuestion ? 'Profil Sorusunu Düzenle' : 'Yeni Profil Sorusu Ekle'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Profil sorularını manuel veya JSON metni ile doğrudan ekleyebilirsiniz.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Modal Mode Selector Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
              <button
                type="button"
                onClick={() => setModalMode('FORM')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  backgroundColor: modalMode === 'FORM' ? 'var(--bg-surface)' : 'var(--bg-surface-secondary)',
                  color: modalMode === 'FORM' ? 'var(--brand-navy)' : 'var(--text-muted)',
                  borderBottom: modalMode === 'FORM' ? '2px solid var(--brand-navy)' : 'none',
                  borderRadius: 0,
                  cursor: 'pointer'
                }}
              >
                📝 Form İle Oluştur
              </button>
              <button
                type="button"
                onClick={() => setModalMode('JSON')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  backgroundColor: modalMode === 'JSON' ? '#0F172A' : 'var(--bg-surface-secondary)',
                  color: modalMode === 'JSON' ? '#CCFF00' : 'var(--text-muted)',
                  borderBottom: modalMode === 'JSON' ? '2px solid #CCFF00' : 'none',
                  borderRadius: 0,
                  cursor: 'pointer'
                }}
              >
                📥 JSON İle Yapıştır
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {modalMode === 'FORM' ? (
                <form onSubmit={handleSaveFormQuestion}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Soru Metni</label>
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Örn: Hangi sektörde çalışıyorsunuz?"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Kategori</label>
                      <select value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)} style={{ width: '100%' }}>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Hedef Cinsiyet</label>
                      <select value={targetingGender} onChange={(e) => setTargetingGender(e.target.value)} style={{ width: '100%' }}>
                        <option value="ALL">👥 Herkes (Tüm Kullanıcılar)</option>
                        <option value="MALE">👨 Yalnız Erkekler</option>
                        <option value="FEMALE">👩 Yalnız Kadınlar</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Profile Score Ödülü</label>
                      <input
                        type="number"
                        value={scoreReward}
                        onChange={(e) => setScoreReward(Number(e.target.value))}
                        style={{ width: '100%' }}
                        min={5}
                        max={500}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Durum</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
                        <option value="ACTIVE">🟢 Aktif (Yayınlansın)</option>
                        <option value="DRAFT">🟡 Taslak (Onaysız Dursun)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={showOnHome} onChange={(e) => setShowOnHome(e.target.checked)} style={{ minHeight: 'auto' }} />
                      Ana Sayfada Promosyon Olarak Göster (showOnHome)
                    </label>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Seçenekler (En az 2 seçenek)</label>
                    {optionsList.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...optionsList];
                            updated[idx] = e.target.value;
                            setOptionsList(updated);
                          }}
                          placeholder={`${idx + 1}. Seçenek Label`}
                          style={{ flex: 1 }}
                          required
                        />
                        {optionsList.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            style={{ padding: '0 12px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {optionsList.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--brand-navy)', border: '1px solid var(--border-color)', borderRadius: '6px', marginTop: '4px' }}
                      >
                        + Seçenek Ekle
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>İptal</button>
                    <button type="submit" disabled={isSaving} style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 700 }}>
                      {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              ) : (
                /* JSON Direct Text Box Mode */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      JSON verisini aşağıdaki metin kutusuna kopyalayıp yapıştırın (Tek soru veya sorular dizisi `[...]` desteklenir).
                    </p>
                    <button
                      type="button"
                      onClick={() => { setJsonInputText(sampleProfileQuestionJson); setJsonImportError(null); }}
                      style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--brand-navy)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      📋 Şablon JSON Yapıştır
                    </button>
                  </div>

                  {jsonImportError && (
                    <div style={{ padding: '12px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>
                      ⚠️ {jsonImportError}
                    </div>
                  )}

                  <textarea
                    rows={14}
                    value={jsonInputText}
                    onChange={(e) => setJsonInputText(e.target.value)}
                    placeholder="JSON verisini doğrudan buraya yapıştırın..."
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#0F172A',
                      color: '#CCFF00',
                      marginBottom: '16px',
                      resize: 'vertical',
                      minHeight: '260px'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>İptal</button>
                    <button
                      type="button"
                      onClick={handleImportJsonQuestions}
                      disabled={isSaving}
                      style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#CCFF00', color: '#0F172A', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                    >
                      {isSaving ? 'Yükleniyor...' : '🚀 Yükle & Kaydet (Onaysız / DRAFT)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
