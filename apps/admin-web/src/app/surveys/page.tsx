'use client';

import React, { useState } from 'react';

export default function SurveysPage() {
  const [surveys] = useState([
    {
      surveyId: 'srv_pag_01',
      title: 'Mobil Uygulama Kullanım Alışkanlıkları',
      surveyType: 'PAG',
      status: 'ACTIVE',
      questionCount: 3,
      profileScoreReward: 50,
      rewardType: 'MONEY'
    },
    {
      surveyId: 'srv_ford_01',
      title: 'Otomotiv Tercihleri & Mobilite',
      surveyType: 'ORGANIZATION',
      status: 'ACTIVE',
      questionCount: 3,
      profileScoreReward: 75,
      rewardType: 'MONEY'
    },
    {
      surveyId: 'srv_profile_01',
      title: 'Temel Profil Anketiniz',
      surveyType: 'PROFILE',
      status: 'ACTIVE',
      questionCount: 3,
      profileScoreReward: 100,
      rewardType: 'NONE'
    }
  ]);

  const [questions, setQuestions] = useState([
    { id: 'q1', text: 'Soru 1', options: ['Seçenek 1', 'Seçenek 2'] }
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddQuestion = () => {
    if (questions.length >= 3) {
      setErrorMsg('PAG V1 Anketleri maksimum 3 soru içerebilir. 4. soru eklenemez!');
      return;
    }
    setErrorMsg(null);
    setQuestions([
      ...questions,
      { id: `q${questions.length + 1}`, text: `Soru ${questions.length + 1}`, options: ['Seçenek 1', 'Seçenek 2'] }
    ]);
  };

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Anket Yönetimi</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Yeni Anket Oluşturma ve Yayınlama Yönetimi</p>
      </header>

      {/* New Survey Creator Box */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '40px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Yeni Anket Oluştur</h3>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(240, 68, 56, 0.1)',
            border: '1px solid var(--error-color)',
            color: 'var(--error-color)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Anket Başlığı</label>
            <input
              type="text"
              placeholder="Anket Başlığı Girin"
              style={{
                width: '100%',
                padding: '10px 12px',
                marginTop: '4px',
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'white'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Anket Tipi</label>
            <select style={{
              width: '100%',
              padding: '10px 12px',
              marginTop: '4px',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'white'
            }}>
              <option value="PAG">PAG Genel Anketi</option>
              <option value="ORGANIZATION">Kurumsal Ortak Anketi</option>
              <option value="PROFILE">Profil Anketi</option>
            </select>
          </div>
        </div>

        {/* Questions Section */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>
              Sorular (Max 3 / Mevcut: {questions.length})
            </h4>
            <button
              onClick={handleAddQuestion}
              disabled={questions.length >= 3}
              style={{
                padding: '6px 14px',
                backgroundColor: questions.length >= 3 ? '#475569' : 'var(--brand-lime)',
                color: questions.length >= 3 ? '#94A3B8' : '#011033',
                fontWeight: 'bold',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            >
              + Soru Ekle
            </button>
          </div>

          {questions.map((q, idx) => (
            <div key={q.id} style={{
              padding: '12px',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: '8px',
              marginBottom: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>{idx + 1}. Soru (SINGLE_SELECT)</p>
            </div>
          ))}
        </div>

        <button style={{
          padding: '12px 24px',
          backgroundColor: 'var(--brand-lime)',
          color: '#011033',
          fontWeight: 'bold',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          Anketi Taslak Olarak Kaydet
        </button>
      </div>

      {/* Survey List Table */}
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Mevcut Anketler</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <th style={{ padding: '16px' }}>ID</th>
            <th style={{ padding: '16px' }}>Başlık</th>
            <th style={{ padding: '16px' }}>Tip</th>
            <th style={{ padding: '16px' }}>Durum</th>
            <th style={{ padding: '16px' }}>Soru Sayısı</th>
            <th style={{ padding: '16px' }}>Profil Puanı</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((s) => (
            <tr key={s.surveyId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
              <td style={{ padding: '16px', fontFamily: 'monospace' }}>{s.surveyId}</td>
              <td style={{ padding: '16px', fontWeight: 500 }}>{s.title}</td>
              <td style={{ padding: '16px' }}>{s.surveyType}</td>
              <td style={{ padding: '16px', color: 'var(--brand-lime)' }}>{s.status}</td>
              <td style={{ padding: '16px' }}>{s.questionCount} / 3</td>
              <td style={{ padding: '16px' }}>+{s.profileScoreReward} Puan</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
