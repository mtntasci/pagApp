'use client';

import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  category: string;
  points: number;
  options: string[];
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Gündelik Tercihler',
    question: 'Güne başlarken senin olmazsa olmazın hangisi?',
    points: 50,
    options: ['☕ Taze Filtre Kahve / Espresso', '🍵 Demli Türk Çayı', '🥤 Enerji İçeceği / Smoothie', '💧 Bol Buzlu Su']
  },
  {
    id: 2,
    category: 'Teknoloji & Cihaz',
    question: 'Günlük hayatında en çok hangi akıllı cihaz ekosistemini kullanıyorsun?',
    points: 50,
    options: ['🍏 Apple (iOS & macOS)', '🤖 Google & Android Ekosistemi', '💻 Windows & Android Hibrit', '🎮 Hepsi / Çoklu Cihaz']
  },
  {
    id: 3,
    category: 'PAG Motivasyonu',
    question: 'PAG uygulamasında seni en çok heyecanlandıran özellik hangisi?',
    points: 50,
    options: [
      '⚡ Maksimum 3 soru ile 30 saniyede bitmesi',
      '💸 Nakit TL ve Marka Hediye Çekleri kazanmak',
      '🚀 Yüksek Profil Puanı ile bildirimleri ilk almak',
      '🎯 İlgi alanıma tam uyan içerikler görmek'
    ]
  }
];

export default function InteractiveSurveyDemo() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [earnedScore, setEarnedScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const handleSelectOption = (qIndex: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIdx }));
  };

  const handleNext = () => {
    if (currentStep < SAMPLE_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
      setEarnedScore((prev) => prev + SAMPLE_QUESTIONS[currentStep].points);
    } else {
      setEarnedScore((prev) => prev + SAMPLE_QUESTIONS[currentStep].points);
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedAnswers({});
    setEarnedScore(0);
    setIsFinished(false);
  };

  const q = SAMPLE_QUESTIONS[currentStep];
  const isCurrentAnswered = selectedAnswers[currentStep] !== undefined;

  return (
    <div className="glass-card" style={{ padding: '36px 28px', border: '1px solid var(--border-highlight)' }}>
      {/* Top Header info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge-lime">🎮 Canlı İnteraktif Demo</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Maks. 3 Soru Mekanizması
          </span>
        </div>
        <div style={{
          backgroundColor: 'rgba(183, 243, 74, 0.15)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(183, 243, 74, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kazanılan Puan:</span>
          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--brand-lime)' }}>+{earnedScore} P</span>
        </div>
      </div>

      {!isFinished ? (
        <div>
          {/* Progress bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Soru {currentStep + 1} / {SAMPLE_QUESTIONS.length}</span>
              <span style={{ color: 'var(--brand-lime)', fontWeight: 600 }}>{q.category}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentStep + 1) / SAMPLE_QUESTIONS.length) * 100}%`,
                  background: 'linear-gradient(90deg, #3977F6 0%, var(--brand-lime) 100%)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Question title */}
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '20px', lineHeight: '1.4' }}>
            {q.question}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {q.options.map((optionText, idx) => {
              const isSelected = selectedAnswers[currentStep] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentStep, idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    backgroundColor: isSelected ? 'rgba(183, 243, 74, 0.15)' : 'var(--bg-surface-secondary)',
                    border: isSelected ? '2px solid var(--brand-lime)' : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{optionText}</span>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid var(--brand-lime)' : '2px solid var(--border-color)',
                    backgroundColor: isSelected ? '#010C26' : 'transparent',
                    flexShrink: 0
                  }} />
                </button>
              );
            })}
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              className="btn-lime"
              style={{
                opacity: isCurrentAnswered ? 1 : 0.4,
                cursor: isCurrentAnswered ? 'pointer' : 'not-allowed',
                padding: '12px 24px',
                fontSize: '14px'
              }}
            >
              {currentStep < SAMPLE_QUESTIONS.length - 1 ? 'Sonraki Soru →' : 'Anketi Tamamla ve Ödülü Gör 🚀'}
            </button>
          </div>
        </div>
      ) : (
        /* Celebration Completed Screen */
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(183, 243, 74, 0.15)',
            border: '2px solid var(--brand-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 16px auto'
          }}>
            🎉
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>
            Harika! Anketi 24 Saniyede Tamamladın!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
            Tebrikler! PAG mobil uygulamasında gerçek anketler tam olarak bu hızda ve sadelikte gerçekleşir.
          </p>

          {/* Reward preview ticket */}
          <div style={{
            maxWidth: '480px',
            margin: '0 auto 24px auto',
            padding: '20px',
            backgroundColor: 'var(--bg-surface-secondary)',
            border: '1px dashed var(--brand-lime)',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Kazanılan Ödül Paketi
              </span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--brand-lime)', marginTop: '2px' }}>
                +150 Profil Puanı & Erken Erişim
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Anket Sıralaması: #1. Grup (İlk 60 sn)
              </div>
            </div>
            <div style={{
              backgroundColor: 'rgba(57, 119, 246, 0.2)',
              border: '1px solid #3977F6',
              padding: '8px 14px',
              borderRadius: '8px',
              color: '#93C5FD',
              fontSize: '13px',
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}>
              PAG-DEMO-2026
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={handleReset} className="btn-outline" style={{ padding: '10px 20px', fontSize: '13px' }}>
              🔄 Yeniden Dene
            </button>
            <a href="#nasil-calisir" className="btn-lime" style={{ padding: '10px 20px', fontSize: '13px' }}>
              Nasıl Çalışır? Detayları Gör ↓
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
