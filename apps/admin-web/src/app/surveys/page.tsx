'use client';

import React, { useState } from 'react';

export default function SurveysPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'PENDING' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'ARCHIVED'>('ALL');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const [surveys, setSurveys] = useState([
    {
      surveyId: 'srv_pag_01',
      title: 'Mobil Uygulama Kullanım Alışkanlıkları',
      ownerType: 'PAG',
      surveyType: 'PAG',
      category: 'Teknoloji',
      status: 'ACTIVE',
      isArchived: false,
      questionCount: 3,
      profileScoreReward: 50,
      rewardType: 'MONEY',
      showInStory: true,
      questions: [
        { questionId: 'q1', text: 'En sık kullandığınız mobil işletim sistemi nedir?', type: 'SINGLE_SELECT', options: [{ label: 'iOS' }, { label: 'Android' }] }
      ]
    },
    {
      surveyId: 'srv_ford_01',
      title: 'Otomotiv Tercihleri & Mobilite',
      ownerType: 'ORGANIZATION',
      organizationId: 'org_ford',
      surveyType: 'ORGANIZATION',
      category: 'Otomotiv',
      status: 'PENDING_APPROVAL',
      isArchived: false,
      questionCount: 3,
      profileScoreReward: 75,
      rewardType: 'MONEY',
      showInStory: true,
      questions: [
        { questionId: 'q1', text: 'Elektrikli araç satın almayı düşünür müsünüz?', type: 'SINGLE_SELECT', options: [{ label: 'Evet' }, { label: 'Hayır' }] }
      ]
    },
    {
      surveyId: 'srv_mcd_01',
      title: "McDonald's Menü Değerlendirme",
      ownerType: 'ORGANIZATION',
      organizationId: 'org_mcdonalds',
      surveyType: 'ORGANIZATION',
      category: 'Yeme / İçme',
      status: 'DRAFT',
      isArchived: false,
      questionCount: 2,
      profileScoreReward: 40,
      rewardType: 'VOUCHER',
      showInStory: false,
      questions: [
        { questionId: 'q1', text: 'Yeni ürünü denediniz mi?', type: 'SINGLE_SELECT', options: [{ label: 'Evet' }, { label: 'Hayır' }] }
      ]
    }
  ]);

  // Wizard Form State
  const [formOwnerType, setFormOwnerType] = useState<'PAG' | 'ORGANIZATION'>('PAG');
  const [formOrgId, setFormOrgId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSurveyType, setFormSurveyType] = useState<'PAG' | 'ORGANIZATION' | 'PROFILE'>('PAG');
  const [formCategory, setFormCategory] = useState('Genel');
  const [formTargeting, setFormTargeting] = useState('ALL');
  const [formScoreReward, setFormScoreReward] = useState(50);
  const [formFinancialReward, setFormFinancialReward] = useState<'NONE' | 'MONEY' | 'VOUCHER'>('NONE');
  const [formMoneyModel, setFormMoneyModel] = useState<'RANKED' | 'EQUAL'>('RANKED');
  const [formMoneyBudget, setFormMoneyBudget] = useState(1000);
  const [formRank1, setFormRank1] = useState(300);
  const [formRank2, setFormRank2] = useState(200);
  const [formRank3, setFormRank3] = useState(100);
  const [formVoucherName, setFormVoucherName] = useState('');
  const [formVoucherCodesText, setFormVoucherCodesText] = useState('');
  const [formShowStory, setFormShowStory] = useState(false);
  const [formStoryLabel, setFormStoryLabel] = useState('');
  const [formStoryImageCategory, setFormStoryImageCategory] = useState('Otomotiv');
  const [formQuestions, setFormQuestions] = useState([
    { id: 'q1', text: '1. Soru Metni', options: ['Seçenek 1', 'Seçenek 2'] }
  ]);
  const [formStartAt, setFormStartAt] = useState('2026-08-15T10:00');
  const [formEndAt, setFormEndAt] = useState('2026-08-30T23:59');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddQuestion = () => {
    if (formQuestions.length >= 3) {
      setErrorMsg('PAG V1 Kampanya Anketleri maksimum 3 soru içerebilir. 4. soru engellendi.');
      return;
    }
    setErrorMsg(null);
    setFormQuestions([
      ...formQuestions,
      { id: `q${formQuestions.length + 1}`, text: `${formQuestions.length + 1}. Soru Metni`, options: ['Seçenek 1', 'Seçenek 2'] }
    ]);
  };

  const handleArchiveSurvey = (surveyId: string, archive: boolean) => {
    setSurveys(surveys.map(s => {
      if (s.surveyId === surveyId) {
        return {
          ...s,
          isArchived: archive,
          status: archive ? 'ARCHIVED' : 'DRAFT'
        };
      }
      return s;
    }));
  };

  const handleApproveSurvey = (surveyId: string) => {
    setSurveys(surveys.map(s => {
      if (s.surveyId === surveyId) {
        return {
          ...s,
          status: 'APPROVED'
        };
      }
      return s;
    }));
  };

  const filteredSurveys = surveys.filter(s => {
    if (activeTab === 'ALL') return !s.isArchived;
    if (activeTab === 'ARCHIVED') return s.isArchived;
    if (s.isArchived) return false;
    if (activeTab === 'DRAFT') return s.status === 'DRAFT';
    if (activeTab === 'PENDING') return s.status === 'PENDING_APPROVAL';
    if (activeTab === 'SCHEDULED') return s.status === 'SCHEDULED';
    if (activeTab === 'ACTIVE') return s.status === 'ACTIVE';
    if (activeTab === 'ENDED') return s.status === 'ENDED';
    return true;
  });

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Anket & Kampanya Yönetimi</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Uçtan Uca Kampanya Sihirbazı & Onay Döngüsü</p>
        </div>

        <button
          onClick={() => { setIsWizardOpen(true); setWizardStep(1); }}
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--brand-lime)',
            color: '#011033',
            fontWeight: 'bold',
            borderRadius: '10px',
            fontSize: '14px'
          }}
        >
          + Yeni Kampanya / Anket Oluştur
        </button>
      </header>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { key: 'ALL', label: 'Tüm Aktifler' },
          { key: 'DRAFT', label: 'Taslaklar' },
          { key: 'PENDING', label: 'Onay Bekleyenler' },
          { key: 'SCHEDULED', label: 'Planlananlar' },
          { key: 'ACTIVE', label: 'Canlı Anketler' },
          { key: 'ENDED', label: 'Tamamlananlar' },
          { key: 'ARCHIVED', label: 'Arşiv' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === t.key ? 'rgba(183, 243, 74, 0.15)' : 'transparent',
              color: activeTab === t.key ? 'var(--brand-lime)' : 'var(--text-secondary)',
              border: activeTab === t.key ? '1px solid var(--brand-lime)' : '1px solid transparent'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 10-Step Campaign Creator Wizard Modal */}
      {isWizardOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '900px',
            maxHeight: '90vh',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>
                  Kampanya Hazırlama Sihirbazı (Adım {wizardStep} / 10)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Uçtan Uca Kampanya & Anket Konfigürasyonu</p>
              </div>
              <button onClick={() => setIsWizardOpen(false)} style={{ color: 'var(--text-secondary)', fontSize: '20px' }}>✕</button>
            </div>

            {errorMsg && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(240,68,56,0.15)', border: '1px solid var(--error-color)', color: 'var(--error-color)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Step 1: Owner */}
            {wizardStep === 1 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>1. Adım: Anket Sahibi (Owner)</h4>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sahip Tipi (Owner Type)</label>
                  <select
                    value={formOwnerType}
                    onChange={(e) => setFormOwnerType(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}
                  >
                    <option value="PAG">PAG (Resmi Genel)</option>
                    <option value="ORGANIZATION">Kurumsal Müşteri (Organization)</option>
                  </select>
                </div>

                {formOwnerType === 'ORGANIZATION' && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kurum Seçin (Organization)</label>
                    <select
                      value={formOrgId}
                      onChange={(e) => setFormOrgId(e.target.value)}
                      style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}
                    >
                      <option value="">Kurum Seçin</option>
                      <option value="org_ford">Ford Otosan</option>
                      <option value="org_mcdonalds">McDonald's Türkiye</option>
                      <option value="org_nike">Nike Türkiye</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Info */}
            {wizardStep === 2 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>2. Adım: Anket Bilgileri</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Başlık</label>
                    <input
                      type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Kampanya Anket Başlığı"
                      style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kategori</label>
                    <select
                      value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}
                    >
                      <option value="Otomotiv">Otomotiv</option>
                      <option value="Yeme / İçme">Yeme / İçme</option>
                      <option value="Teknoloji">Teknoloji</option>
                      <option value="Spor">Spor</option>
                      <option value="Genel">Genel</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Açıklama</label>
                  <textarea
                    rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Kampanya hakkında kısa açıklama..."
                    style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Targeting */}
            {wizardStep === 3 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>3. Adım: Hedef Kitle (Targeting - Temel Profil Bağlantısı)</h4>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hedefleme Tipi</label>
                  <select
                    value={formTargeting} onChange={(e) => setFormTargeting(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}
                  >
                    <option value="ALL">Herkese Açık (Tüm PAG Kullanıcıları)</option>
                    <option value="PROFILE">Temel Profil Hedefli (Yaş / Medeni Durum / Çocuk / Adres)</option>
                    <option value="LOCATION">Lokasyon Hedefli (İl / İlçe / Mahalle)</option>
                  </select>
                </div>

                {formTargeting === 'PROFILE' && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>Desteklenen Temel Profil Filtreleri</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Yaş Aralığı (Min - Max)</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <input type="number" placeholder="Min Yaş (Örn: 18)" style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                          <input type="number" placeholder="Max Yaş (Örn: 45)" style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Medeni Durum</label>
                        <select style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}>
                          <option value="ALL">Fark Etmez</option>
                          <option value="SINGLE">Bekar</option>
                          <option value="MARRIED">Evli</option>
                          <option value="DIVORCED">Boşanmış</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Çocuk Durumu</label>
                        <select style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}>
                          <option value="ALL">Fark Etmez</option>
                          <option value="HAS_CHILDREN">Çocuğu Var</option>
                          <option value="NO_CHILDREN">Çocuğu Yok</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Memleket (İl)</label>
                        <input type="text" placeholder="Örn: Ankara" style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Rewards */}
            {wizardStep === 4 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>4. Adım: Profil Puanı & Ödül</h4>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Profil Puanı Ödülü (Profil Score)</label>
                  <input
                    type="number" value={formScoreReward} onChange={(e) => setFormScoreReward(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Finansal Ödül Tipi</label>
                  <select
                    value={formFinancialReward} onChange={(e) => setFormFinancialReward(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}
                  >
                    <option value="NONE">Ödül Yok (Sadece Puan)</option>
                    <option value="MONEY">Nakit TL Ödülü</option>
                    <option value="VOUCHER">Hediye Çeki (Voucher)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Money / Voucher */}
            {wizardStep === 5 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>5. Adım: Ödül Detay Konfigürasyonu</h4>
                {formFinancialReward === 'MONEY' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Toplam Ödül Bütçesi (TL)</label>
                        <input type="number" value={formMoneyBudget} onChange={(e) => setFormMoneyBudget(Number(e.target.value))} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dağıtım Modeli</label>
                        <select value={formMoneyModel} onChange={(e) => setFormMoneyModel(e.target.value as any)} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}>
                          <option value="RANKED">Kademeli Sıralama (1., 2., 3. + Havuz)</option>
                          <option value="EQUAL">Eşit Dağıtım (Kişi Başı Sabit)</option>
                        </select>
                      </div>
                    </div>
                    {formMoneyModel === 'RANKED' && (
                      <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--brand-lime)', marginBottom: '8px' }}>Derece Ödülleri (TL)</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <div><label style={{ fontSize: '11px' }}>1. Sıra</label><input type="number" value={formRank1} onChange={(e) => setFormRank1(Number(e.target.value))} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} /></div>
                          <div><label style={{ fontSize: '11px' }}>2. Sıra</label><input type="number" value={formRank2} onChange={(e) => setFormRank2(Number(e.target.value))} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} /></div>
                          <div><label style={{ fontSize: '11px' }}>3. Sıra</label><input type="number" value={formRank3} onChange={(e) => setFormRank3(Number(e.target.value))} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} /></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {formFinancialReward === 'VOUCHER' && (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kupon Havuzu Adı</label>
                      <input type="text" value={formVoucherName} onChange={(e) => setFormVoucherName(e.target.value)} placeholder="Örn: Ford 200 TL Bakım Çeki" style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Toplu Kupon Kodları (Her satırda 1 kod)</label>
                      <textarea rows={4} value={formVoucherCodesText} onChange={(e) => setFormVoucherCodesText(e.target.value)} placeholder={"CODE-1001-PAG\nCODE-1002-PAG"} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                    </div>
                  </div>
                )}
                {formFinancialReward === 'NONE' && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Bu anket için ek finansal ödül tanımlanmamıştır.</p>}
              </div>
            )}

            {/* Step 6: Story */}
            {wizardStep === 6 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>6. Adım: Story / Görsel Konfigürasyonu (Opsiyonel)</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <input type="checkbox" checked={formShowStory} onChange={(e) => setFormShowStory(e.target.checked)} id="storyCheck" />
                  <label htmlFor="storyCheck" style={{ fontSize: '14px', fontWeight: 600 }}>Story Bar'da Göster</label>
                </div>
                {formShowStory && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kısa Story Etiketi (Label)</label>
                      <input type="text" value={formStoryLabel} onChange={(e) => setFormStoryLabel(e.target.value)} placeholder="Örn: Ford Özel" style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kategori Görseli (Preset Asset)</label>
                      <select value={formStoryImageCategory} onChange={(e) => setFormStoryImageCategory(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }}>
                        <option value="Otomotiv">Otomotiv Görseli</option>
                        <option value="Yeme / İçme">Yeme / İçme Görseli</option>
                        <option value="Teknoloji">Teknoloji Görseli</option>
                        <option value="Spor">Spor Görseli</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Questions */}
            {wizardStep === 7 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>7. Adım: Sorular (Max 3 / Mevcut: {formQuestions.length})</h4>
                  <button onClick={handleAddQuestion} disabled={formQuestions.length >= 3} style={{ padding: '6px 14px', backgroundColor: formQuestions.length >= 3 ? '#475569' : 'var(--brand-lime)', color: formQuestions.length >= 3 ? '#94A3B8' : '#011033', fontWeight: 'bold', borderRadius: '6px', fontSize: '12px' }}>+ Soru Ekle</button>
                </div>
                {formQuestions.map((q, idx) => (
                  <div key={q.id} style={{ padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>{idx + 1}. Soru (SINGLE_SELECT)</p>
                  </div>
                ))}
              </div>
            )}

            {/* Step 8: Schedule */}
            {wizardStep === 8 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>8. Adım: Yayın Tarihi & Saat</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Başlangıç Tarihi</label>
                    <input type="datetime-local" value={formStartAt} onChange={(e) => setFormStartAt(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bitiş Tarihi</label>
                    <input type="datetime-local" value={formEndAt} onChange={(e) => setFormEndAt(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 9: Preview */}
            {wizardStep === 9 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>9. Adım: Önizleme & Konfigürasyon Özeti</h4>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p><strong>Sahip:</strong> {formOwnerType} {formOrgId && `(${formOrgId})`}</p>
                  <p><strong>Başlık:</strong> {formTitle || 'Başlık Girilmedi'}</p>
                  <p><strong>Hedef Kitle:</strong> {formTargeting}</p>
                  <p><strong>Profil Puanı:</strong> +{formScoreReward} Puan</p>
                  <p><strong>Finansal Ödül:</strong> {formFinancialReward} {formFinancialReward === 'MONEY' && `(Bütçe: ${formMoneyBudget} TL)`}</p>
                  <p><strong>Soru Sayısı:</strong> {formQuestions.length} / 3</p>
                </div>
              </div>
            )}

            {/* Step 10: Submit & Approve */}
            {wizardStep === 10 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>10. Adım: Onaya Gönder & Yayınla</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Süper Admin onayı alındıktan sonra anket verileri kilitlenecek ve soru snapshot'ı oluşturulacaktır.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setIsWizardOpen(false); alert('Taslak kaydedildi!'); }} style={{ padding: '12px 20px', backgroundColor: 'var(--bg-surface-secondary)', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>Taslak Kaydet</button>
                  <button onClick={() => { setIsWizardOpen(false); alert('Onay Bekliyor durumuna alındı!'); }} style={{ padding: '12px 20px', backgroundColor: 'var(--brand-lime)', color: '#011033', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>Super Admin Onayına Gönder</button>
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => setWizardStep(Math.max(1, wizardStep - 1))} disabled={wizardStep === 1} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface-secondary)', color: 'white', borderRadius: '6px', opacity: wizardStep === 1 ? 0.5 : 1 }}>Önceki</button>
              <button onClick={() => setWizardStep(Math.min(10, wizardStep + 1))} disabled={wizardStep === 10} style={{ padding: '8px 16px', backgroundColor: 'var(--brand-lime)', color: '#011033', fontWeight: 'bold', borderRadius: '6px', opacity: wizardStep === 10 ? 0.5 : 1 }}>Sonraki</button>
            </div>
          </div>
        </div>
      )}

      {/* Survey List Table */}
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Kampanya Anketleri</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <th style={{ padding: '16px' }}>ID</th>
            <th style={{ padding: '16px' }}>Başlık</th>
            <th style={{ padding: '16px' }}>Sahip</th>
            <th style={{ padding: '16px' }}>Durum</th>
            <th style={{ padding: '16px' }}>Sorular</th>
            <th style={{ padding: '16px' }}>Ödül</th>
            <th style={{ padding: '16px' }}>Aksiyonlar</th>
          </tr>
        </thead>
        <tbody>
          {filteredSurveys.map((s) => (
            <tr key={s.surveyId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
              <td style={{ padding: '16px', fontFamily: 'monospace' }}>{s.surveyId}</td>
              <td style={{ padding: '16px', fontWeight: 500 }}>{s.title}</td>
              <td style={{ padding: '16px' }}>{s.ownerType}</td>
              <td style={{ padding: '16px' }}>
                <span style={{
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                  backgroundColor: s.status === 'ACTIVE' ? 'rgba(183, 243, 74, 0.15)' : s.status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: s.status === 'ACTIVE' ? 'var(--brand-lime)' : s.status === 'PENDING_APPROVAL' ? '#F59E0B' : 'white'
                }}>
                  {s.status}
                </span>
              </td>
              <td style={{ padding: '16px' }}>{s.questionCount} / 3</td>
              <td style={{ padding: '16px' }}>+{s.profileScoreReward} Puan</td>
              <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                {s.status === 'PENDING_APPROVAL' && (
                  <button onClick={() => handleApproveSurvey(s.surveyId)} style={{ padding: '4px 10px', backgroundColor: 'var(--brand-lime)', color: '#011033', fontWeight: 'bold', borderRadius: '4px', fontSize: '12px' }}>Onayla</button>
                )}
                {!s.isArchived ? (
                  <button onClick={() => handleArchiveSurvey(s.surveyId, true)} style={{ padding: '4px 10px', backgroundColor: 'rgba(240, 68, 56, 0.15)', color: 'var(--error-color)', borderRadius: '4px', fontSize: '12px' }}>Arşivle</button>
                ) : (
                  <button onClick={() => handleArchiveSurvey(s.surveyId, false)} style={{ padding: '4px 10px', backgroundColor: 'rgba(183, 243, 74, 0.15)', color: 'var(--brand-lime)', borderRadius: '4px', fontSize: '12px' }}>Geri Al</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
