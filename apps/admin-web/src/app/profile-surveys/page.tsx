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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const [questionText, setQuestionText] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [targetingGender, setTargetingGender] = useState('ALL');
  const [scoreReward, setScoreReward] = useState(10);
  const [showOnHome, setShowOnHome] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [optionsList, setOptionsList] = useState<string[]>(['', '']);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
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
        setErrorMessage(err.message || 'Hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenNewModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setSelectedCatId(categories.length > 0 ? categories[0].id : 'cat_lifestyle');
    setTargetingGender('ALL');
    setScoreReward(10);
    setShowOnHome(false);
    setStatus('ACTIVE');
    setOptionsList(['', '']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: any) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText || '');
    setSelectedCatId(q.categoryId || '');
    setTargetingGender(q.targetingGender || 'ALL');
    setScoreReward(q.profileScoreReward || 10);
    setShowOnHome(Boolean(q.showOnHome));
    setStatus(q.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT');
    setOptionsList(Array.isArray(q.options) ? q.options.map((o: any) => o.label || o) : ['', '']);
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    if (optionsList.length < 6) setOptionsList([...optionsList, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (optionsList.length > 2) setOptionsList(optionsList.filter((_, idx) => idx !== index));
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const validOpts = optionsList.map((o) => o.trim()).filter((o) => o.length > 0);
    if (validOpts.length < 2) return;

    setIsSaving(true);
    const catObj = categories.find((c) => c.id === selectedCatId);
    const catName = catObj ? catObj.name : 'Genel';

    const mappedOpts = validOpts.map((optText, idx) => {
      return {
        optionId: 'opt_' + (idx + 1),
        label: optText,
        order: idx + 1
      };
    });

    const payload = {
      id: editingQuestion ? editingQuestion.id : undefined,
      questionText: questionText.trim(),
      categoryId: selectedCatId,
      categoryName: catName,
      targetingGender: targetingGender,
      options: mappedOpts,
      profileScoreReward: Number(scoreReward) || 10,
      showOnHome: showOnHome,
      status: status
    };

    try {
      const saveFn = httpsCallable(functions, 'createOrUpdateProfileQuestionAdmin');
      const res = (await saveFn(payload)) as any;
      if (res.data && res.data.success) {
        setSuccessMessage('Başarıyla kaydedildi.');
        setIsModalOpen(false);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);
  const [isJsonImporting, setIsJsonImporting] = useState(false);

  const sampleProfileQuestionJson = JSON.stringify({
    "id": "pq_otomobil_sahipligi",
    "questionText": "Kişisel bir otomobiliniz var mı?",
    "categoryId": "cat_automotive",
    "categoryName": "Otomotiv & Ulaşım",
    "targetingGender": "ALL",
    "profileScoreReward": 50,
    "status": "ACTIVE",
    "showOnHome": true,
    "options": [
      { "optionId": "opt_auto_own", "label": "Evet, kendi aracıma sahibim", "order": 1 },
      { "optionId": "opt_auto_company", "label": "Şirket aracı kullanıyorum", "order": 2 },
      { "optionId": "opt_auto_plan", "label": "Aracım yok, yakın zamanda almayı planlıyorum", "order": 3 },
      { "optionId": "opt_auto_none", "label": "Aracım yok ve almayı planlamıyorum", "order": 4 }
    ]
  }, null, 2);

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setJsonInputText(event.target.result as string);
        setJsonImportError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportJson = async () => {
    setJsonImportError(null);
    if (!jsonInputText.trim()) {
      setJsonImportError('Lütfen bir JSON verisi yapıştırın veya dosya seçin.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInputText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      setIsJsonImporting(true);

      const saveFn = httpsCallable(functions, 'createOrUpdateProfileQuestionAdmin');

      for (const q of items) {
        if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
          throw new Error('Geçersiz soru formatı. "questionText" ve en az 2 "options" gereklidir.');
        }

        const catObj = categories.find((c) => c.id === q.categoryId) || categories[0];
        const catName = q.categoryName || (catObj ? catObj.name : 'Genel');
        const catId = q.categoryId || (catObj ? catObj.id : 'cat_lifestyle');

        const mappedOpts = q.options.map((opt: any, idx: number) => ({
          optionId: opt.optionId || 'opt_' + (idx + 1),
          label: typeof opt === 'string' ? opt : opt.label || `Seçenek ${idx + 1}`,
          order: opt.order || idx + 1
        }));

        const payload = {
          id: q.id || undefined,
          questionText: q.questionText.trim(),
          categoryId: catId,
          categoryName: catName,
          targetingGender: q.targetingGender || 'ALL',
          options: mappedOpts,
          profileScoreReward: Number(q.profileScoreReward) || 10,
          showOnHome: Boolean(q.showOnHome),
          status: q.status || 'ACTIVE'
        };

        await saveFn(payload);
      }

      setSuccessMessage(`${items.length} adet profil sorusu başarıyla içeri aktarıldı.`);
      setIsJsonModalOpen(false);
      setJsonInputText('');

      // Refresh list
      const listFn = httpsCallable(functions, 'listProfileQuestionsAdmin');
      const res = (await listFn({})) as any;
      if (res.data && res.data.success && Array.isArray(res.data.data.questions)) {
        setQuestions(res.data.data.questions);
      }
    } catch (err: any) {
      console.error(err);
      setJsonImportError('JSON İşleme Hata: ' + (err.message || 'Geçersiz JSON formatı.'));
    } finally {
      setIsJsonImporting(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Profil Anketleri Yönetimi
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
          Profil Soruları ve Puan Ödülleri
        </p>
      </header>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={handleOpenNewModal}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--brand-lime)',
            color: 'var(--brand-navy)',
            fontWeight: 700,
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          + Yeni Profil Sorusu Ekle
        </button>

        <button
          onClick={() => { setJsonInputText(''); setJsonImportError(null); setIsJsonModalOpen(true); }}
          style={{
            padding: '10px 18px',
            backgroundColor: '#0F172A',
            color: '#CCFF00',
            fontWeight: 700,
            borderRadius: '8px',
            border: '1px solid #CCFF00',
            cursor: 'pointer'
          }}
        >
          📥 JSON İle İçeri Aktar
        </button>
      </div>

      {errorMessage ? (
        <div style={{ padding: '12px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', borderRadius: '8px', marginBottom: '16px' }}>
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div style={{ padding: '12px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: '8px', marginBottom: '16px' }}>
          {successMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '8px' }}>Soru Metni</th>
                <th style={{ padding: '8px' }}>Kategori</th>
                <th style={{ padding: '8px' }}>Hedef</th>
                <th style={{ padding: '8px' }}>Puan</th>
                <th style={{ padding: '8px' }}>Durum</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px' }}>{q.questionText}</td>
                  <td style={{ padding: '8px' }}>{q.categoryName || 'Genel'}</td>
                  <td style={{ padding: '8px' }}>{q.targetingGender === 'MALE' ? 'Erkek' : q.targetingGender === 'FEMALE' ? 'Kadın' : 'Herkes'}</td>
                  <td style={{ padding: '8px' }}>+{q.profileScoreReward}</td>
                  <td style={{ padding: '8px' }}>{q.status}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenEditModal(q)} style={{ padding: '4px 8px' }}>Düzenle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h3>{editingQuestion ? 'Düzenle' : 'Yeni Soru'}</h3>

            <form onSubmit={handleSaveQuestion}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Soru Metni</label>
                <input type="text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} style={{ width: '100%', padding: '8px' }} required />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Kategori</label>
                <select value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Hedef Cinsiyet</label>
                <select value={targetingGender} onChange={(e) => setTargetingGender(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                  <option value="ALL">Herkes</option>
                  <option value="MALE">Yalnız Erkekler</option>
                  <option value="FEMALE">Yalnız Kadınlar</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Puan</label>
                <input type="number" value={scoreReward} onChange={(e) => setScoreReward(Number(e.target.value))} style={{ width: '100%', padding: '8px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={showOnHome} onChange={(e) => setShowOnHome(e.target.checked)} />
                  Ana Sayfada Promosyon Göster (showOnHome)
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Seçenekler</label>
                {optionsList.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...optionsList];
                        updated[idx] = e.target.value;
                        setOptionsList(updated);
                      }}
                      style={{ flex: 1, padding: '6px' }}
                      required
                    />
                    {optionsList.length > 2 ? (
                      <button type="button" onClick={() => handleRemoveOption(idx)}>✕</button>
                    ) : null}
                  </div>
                ))}
                {optionsList.length < 6 ? (
                  <button type="button" onClick={handleAddOption} style={{ fontSize: '12px', marginTop: '4px' }}>+ Seçenek Ekle</button>
                ) : null}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)}>İptal</button>
                <button type="submit" disabled={isSaving}>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isJsonModalOpen ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '92%', maxWidth: '650px', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>📥 JSON İle Profil Sorusu Yükle</h3>
              <button onClick={() => setIsJsonModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Bir `.json` dosyası yükleyebilir veya aşağıdaki alana JSON metnini doğrudan yapıştırabilirsiniz (Tek nesne veya nesne dizisi desteklenir).
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
              <input type="file" accept=".json" onChange={handleJsonFileUpload} style={{ fontSize: '13px' }} />
              <button
                type="button"
                onClick={() => setJsonInputText(sampleProfileQuestionJson)}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', cursor: 'pointer' }}
              >
                📋 Örnek Şablon Yapıştır
              </button>
            </div>

            {jsonImportError && (
              <div style={{ padding: '10px 12px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {jsonImportError}
              </div>
            )}

            <textarea
              rows={12}
              value={jsonInputText}
              onChange={(e) => setJsonInputText(e.target.value)}
              placeholder="JSON formatını buraya yapıştırın..."
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#0F172A',
                color: '#CCFF00',
                marginBottom: '16px',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setIsJsonModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>İptal</button>
              <button
                type="button"
                onClick={handleImportJson}
                disabled={isJsonImporting}
                style={{ padding: '8px 20px', borderRadius: '6px', backgroundColor: '#CCFF00', color: '#0F172A', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {isJsonImporting ? 'Yükleniyor...' : '🚀 Yükle & Kaydet'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
