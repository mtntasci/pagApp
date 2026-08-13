'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface CompanyApplication {
  applicationId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string | null;
  message?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<CompanyApplication | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const listFn = httpsCallable(functions, 'listCompanyApplicationsAdmin');
      const res: any = await listFn({});
      if (res.data?.success && Array.isArray(res.data.data?.applications)) {
        setApplications(res.data.data.applications);
      }
    } catch (err: any) {
      console.error('Fetch Company Applications Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    setIsUpdating(true);
    try {
      const updateFn = httpsCallable(functions, 'updateCompanyApplicationStatusAdmin');
      const res: any = await updateFn({ applicationId, status });
      if (res.data?.success) {
        if (selectedApp && selectedApp.applicationId === applicationId) {
          setSelectedApp({ ...selectedApp, status });
        }
        await fetchApplications();
      }
    } catch (err: any) {
      console.error('Update Application Status Error:', err);
      alert('Başvuru durumu güncellenirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'ALL') return true;
    return app.status === activeTab;
  });

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Firma Başvuruları</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>www.pagapp.com.tr Kurumsal İş Ortaklığı ve Müşteri Başvuruları</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { key: 'ALL', label: 'Tüm Başvurular' },
          { key: 'PENDING', label: 'Bekleyenler (PENDING)' },
          { key: 'APPROVED', label: 'Onaylananlar (APPROVED)' },
          { key: 'REJECTED', label: 'Reddedilenler (REJECTED)' }
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

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Başvurular Yükleniyor...
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <th style={{ padding: '16px' }}>Firma Adı</th>
              <th style={{ padding: '16px' }}>Yetkili</th>
              <th style={{ padding: '16px' }}>E-posta</th>
              <th style={{ padding: '16px' }}>Telefon</th>
              <th style={{ padding: '16px' }}>Tarih</th>
              <th style={{ padding: '16px' }}>Durum</th>
              <th style={{ padding: '16px' }}>Aksiyonlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Bu filtreye uygun firma başvurusu bulunamadı.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.applicationId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{app.companyName}</td>
                  <td style={{ padding: '16px' }}>{app.contactName}</td>
                  <td style={{ padding: '16px', fontFamily: 'monospace' }}>{app.contactEmail}</td>
                  <td style={{ padding: '16px' }}>{app.contactPhone}</td>
                  <td style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {app.createdAt ? new Date(app.createdAt).toLocaleString('tr-TR') : '-'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: app.status === 'APPROVED' ? 'rgba(183, 243, 74, 0.15)' : app.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(240, 68, 56, 0.15)',
                      color: app.status === 'APPROVED' ? 'var(--brand-lime)' : app.status === 'PENDING' ? '#F59E0B' : 'var(--error-color)'
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedApp(app)}
                      style={{ padding: '4px 10px', backgroundColor: 'var(--bg-surface-secondary)', color: 'white', borderRadius: '4px', fontSize: '12px' }}
                    >
                      Detay
                    </button>
                    {app.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(app.applicationId, 'APPROVED')}
                          disabled={isUpdating}
                          style={{ padding: '4px 10px', backgroundColor: 'var(--brand-lime)', color: '#011033', fontWeight: 'bold', borderRadius: '4px', fontSize: '12px' }}
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}
                          disabled={isUpdating}
                          style={{ padding: '4px 10px', backgroundColor: 'rgba(240, 68, 56, 0.15)', color: 'var(--error-color)', borderRadius: '4px', fontSize: '12px' }}
                        >
                          Reddet
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            width: '600px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>Firma Başvuru Detayı</h3>
              <button onClick={() => setSelectedApp(null)} style={{ color: 'var(--text-secondary)', fontSize: '20px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div><strong>Firma / Kurum Adı:</strong> {selectedApp.companyName}</div>
              <div><strong>Yetkili Ad Soyad:</strong> {selectedApp.contactName}</div>
              <div><strong>Kurumsal E-posta:</strong> {selectedApp.contactEmail}</div>
              <div><strong>Telefon:</strong> {selectedApp.contactPhone}</div>
              {selectedApp.website && <div><strong>Web Sitesi:</strong> {selectedApp.website}</div>}
              {selectedApp.message && (
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', marginTop: '8px' }}>
                  <strong>Mesaj / Talep:</strong>
                  <p style={{ marginTop: '4px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedApp.message}</p>
                </div>
              )}
              <div><strong>Başvuru Tarihi:</strong> {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleString('tr-TR') : '-'}</div>
              <div><strong>Durum:</strong> <span style={{ fontWeight: 'bold', color: selectedApp.status === 'APPROVED' ? 'var(--brand-lime)' : selectedApp.status === 'PENDING' ? '#F59E0B' : 'var(--error-color)' }}>{selectedApp.status}</span></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              {selectedApp.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.applicationId, 'APPROVED')}
                    disabled={isUpdating}
                    style={{ padding: '10px 20px', backgroundColor: 'var(--brand-lime)', color: '#011033', fontWeight: 'bold', borderRadius: '8px', fontSize: '14px' }}
                  >
                    Başvuruyu Onayla
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.applicationId, 'REJECTED')}
                    disabled={isUpdating}
                    style={{ padding: '10px 20px', backgroundColor: 'rgba(240, 68, 56, 0.15)', color: 'var(--error-color)', borderRadius: '8px', fontSize: '14px' }}
                  >
                    Başvuruyu Reddet
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedApp(null)}
                style={{ padding: '10px 20px', backgroundColor: 'var(--bg-surface-secondary)', color: 'white', borderRadius: '8px', fontSize: '14px' }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
