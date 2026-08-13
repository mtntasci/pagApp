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

      <button
        onClick={handleOpenNewModal}
        style={{
          padding: '10px 18px',
          backgroundColor: 'var(--brand-lime)',
          color: 'var(--brand-navy)',
          fontWeight: 700,
          borderRadius: '8px',
          border: 'none',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        Yeni Profil Sorusu Ekle
      </button>

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
    </div>
  );
}
