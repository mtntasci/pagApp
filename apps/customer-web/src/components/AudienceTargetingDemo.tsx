'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AudienceTargetingDemo() {
  const [selectedAge, setSelectedAge] = useState<string[]>(['25-34']);
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kadıköy');
  const [selectedMarital, setSelectedMarital] = useState<string>('all');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  const toggleAge = (age: string) => {
    if (selectedAge.includes(age)) {
      if (selectedAge.length > 1) {
        setSelectedAge(selectedAge.filter((a) => a !== age));
      }
    } else {
      setSelectedAge([...selectedAge, age]);
    }
  };

  // Dynamic calculation mock
  const calculateAudience = () => {
    let base = 85000;
    if (selectedCity === 'İstanbul') base = 48000;
    else if (selectedCity === 'Ankara') base = 26000;
    else if (selectedCity === 'İzmir') base = 19000;
    else base = 12000;

    // Age factor
    const ageFactor = selectedAge.length * 0.35;
    base = Math.round(base * Math.min(1, ageFactor));

    // District factor
    if (selectedDistrict !== 'Tüm İlçeler') {
      base = Math.round(base * 0.28);
    }

    // Marital factor
    if (selectedMarital !== 'all') {
      base = Math.round(base * 0.55);
    }

    // Child factor
    if (selectedChild !== 'all') {
      base = Math.round(base * 0.5);
    }

    return Math.max(1200, base);
  };

  const audienceCount = calculateAudience();

  return (
    <div className="glass-card-blue" style={{ padding: '40px 32px', border: '1px solid var(--border-blue-highlight)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="badge-blue">🎯 Mikro-Hedefleme Simülatörü</span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginTop: '8px' }}>
            Hassas Hedef Kitle Kurgulayıcı (Mikro-Segmentasyon)
          </h3>
        </div>
        <div style={{
          backgroundColor: 'rgba(57, 119, 246, 0.15)',
          border: '1px solid rgba(57, 119, 246, 0.4)',
          borderRadius: '16px',
          padding: '10px 18px',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tahmini Kitle Erişimi</span>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#60A5FA' }}>
            ~{audienceCount.toLocaleString('tr-TR')} Kişi
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
        Markanızın ürün veya araştırma anketini göndermek istediğiniz parametreleri seçin. PAG'ın mikro-profilleme altyapısıyla anında doğrudan hedef kitleye ulaşın.
      </p>

      {/* Filter Selector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* 1. Age Range */}
        <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '10px' }}>
            🎂 Yaş Aralığı (Çoklu Seçim - OR)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['18-24', '25-34', '35-44', '45+'].map((age) => {
              const isSelected = selectedAge.includes(age);
              return (
                <button
                  key={age}
                  onClick={() => toggleAge(age)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? 'var(--brand-lime)' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#010C26' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. City & District */}
        <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#60A5FA', marginBottom: '10px' }}>
            📍 Lokasyon & İlçe Derinliği
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#010C26',
                color: 'white',
                border: '1px solid var(--border-color)',
                fontSize: '12px'
              }}
            >
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Bursa">Bursa</option>
              <option value="Antalya">Antalya</option>
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#010C26',
                color: 'white',
                border: '1px solid var(--border-color)',
                fontSize: '12px'
              }}
            >
              <option value="Tüm İlçeler">Tüm İlçeler</option>
              <option value="Kadıköy">Kadıköy</option>
              <option value="Beşiktaş">Beşiktaş</option>
              <option value="Çankaya">Çankaya</option>
              <option value="Karşıyaka">Karşıyaka</option>
              <option value="Nilüfer">Nilüfer</option>
            </select>
          </div>
        </div>

        {/* 3. Marital & Child */}
        <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#C084FC', marginBottom: '10px' }}>
            💍 Medeni Durum & Aile
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Fark Etmez' },
              { id: 'single', label: 'Bekar' },
              { id: 'married', label: 'Evli' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMarital(m.id)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: selectedMarital === m.id ? 700 : 500,
                  backgroundColor: selectedMarital === m.id ? '#A855F7' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logical AND / OR query preview */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#010C26',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        fontSize: '13px'
      }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>Filtre Sorgusu:</span>
        <span style={{ color: 'var(--brand-lime)', fontWeight: 600 }}>Yaş: [{selectedAge.join(' VEYA ')}]</span>
        <span style={{ color: 'white', fontWeight: 900 }}>AND</span>
        <span style={{ color: '#60A5FA', fontWeight: 600 }}>Lokasyon: {selectedCity} ({selectedDistrict})</span>
        {selectedMarital !== 'all' && (
          <>
            <span style={{ color: 'white', fontWeight: 900 }}>AND</span>
            <span style={{ color: '#C084FC', fontWeight: 600 }}>Medeni Durum: {selectedMarital === 'married' ? 'Evli' : 'Bekar'}</span>
          </>
        )}
      </div>

      {/* Value highlight pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Maksimum Soru Limiti</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>3 Soru (Single Select)</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ortalama Tamamlanma Hızı</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--brand-lime)', marginTop: '2px' }}>&lt; 15 Dakika</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gizlilik & PII Koruması</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#60A5FA', marginTop: '2px' }}>%100 Anonim / Aggregate</div>
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <Link href="/firma-basvuru" className="btn-lime" style={{ padding: '12px 24px', fontSize: '14px' }}>
          🚀 Markam İçin Anket Başlat
        </Link>
        <Link href="/firmalar" className="btn-outline" style={{ padding: '12px 24px', fontSize: '14px' }}>
          Tüm Kurumsal Özellikler →
        </Link>
      </div>
    </div>
  );
}
