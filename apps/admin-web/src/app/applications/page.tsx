'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';

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

  // Portal User Creation Modal
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'CALL_CENTER_AGENT' | 'ORGANIZATION_USER' | 'PAG_STAFF' | 'SUPER_ADMIN'>('CALL_CENTER_AGENT');
  const [newUserOrgId, setNewUserOrgId] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    // 1. Instant Direct Firestore Read (~30ms)
    try {
      const snap = await getDocs(collection(db, 'companyApplications'));
      if (!snap.empty) {
        const appsList: CompanyApplication[] = snap.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            ...d,
            applicationId: docSnap.id,
            companyName: d.companyName || d.name || 'Firma',
            contactName: d.contactName || '',
            contactEmail: d.contactEmail || '',
            contactPhone: d.contactPhone || '',
            status: d.status || 'PENDING',
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || ''
          } as CompanyApplication;
        });
        setApplications(appsList);
      }
    } catch (fsErr) {
      console.warn('Direct Firestore applications read error:', fsErr);
    } finally {
      setIsLoading(false);
    }

    // 2. Background Callable Functions sync (non-blocking)
    try {
      const listFn = httpsCallable(functions, 'listCompanyApplicationsAdmin');
      const res: any = await listFn({});
      if (res.data?.success && Array.isArray(res.data.data?.applications) && res.data.data.applications.length > 0) {
        setApplications(res.data.data.applications);
      }
    } catch (err: any) {
      // background
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
      
      if (status === 'APPROVED') {
        const createOrgFn = httpsCallable(functions, 'createOrUpdateOrganizationAdmin');
        const targetApp = applications.find(a => a.applicationId === applicationId) || selectedApp;
        if (targetApp) {
          const cleanName = (targetApp.companyName || 'Firma').trim();
          const orgId = `org_${cleanName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
          try {
            await createOrgFn({
              organizationId: orgId,
              name: cleanName,
              sector: (targetApp as any).sector || 'Genel',
              contactEmail: targetApp.contactEmail || null,
              contactPhone: targetApp.contactPhone || null,
              isVerificationAuthorized: true,
              status: 'ACTIVE'
            });
          } catch (cErr) {
            console.warn('Auto create org error:', cErr);
          }
        }
      }

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

  const handleCreatePortalUser = async () => {
    if (!newUserEmail || !newUserEmail.includes('@')) {
      alert('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    if (!newUserPassword || newUserPassword.length < 6) {
      alert('Geçici şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (newUserRole === 'ORGANIZATION_USER' && !newUserOrgId) {
      alert('Firma Temsilcisi rolü için Organization ID zorunludur.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const createFn = httpsCallable(functions, 'createPortalUserAdmin');
      const res: any = await createFn({
        email: newUserEmail.trim(),
        temporaryPassword: newUserPassword,
        role: newUserRole,
        organizationId: newUserRole === 'ORGANIZATION_USER' ? newUserOrgId.trim() : null
      });

      if (res.data?.success) {
        alert(`Kullanıcı (${newUserRole}) başarıyla oluşturuldu!\nE-posta: ${newUserEmail}\nGeçici Şifre: ${newUserPassword}`);
        setIsCreateUserModalOpen(false);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserOrgId('');
      }
    } catch (err: any) {
      console.error('Create User Error:', err);
      alert('Kullanıcı oluşturulurken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsCreatingUser(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'ALL') return true;
    return app.status === activeTab;
  });

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Firma Başvuruları & Kullanıcı Yönetimi
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
            Kurumsal Müşteri Başvuruları ve Portal Personel Yetkilendirme
          </p>
        </div>

        <button
          onClick={() => setIsCreateUserModalOpen(true)}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--brand-navy)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          👤 Yeni Portal Kullanıcısı Ekle
        </button>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { key: 'ALL', label: 'Tüm Başvurular' },
          { key: 'PENDING', label: 'Bekleyenler' },
          { key: 'APPROVED', label: 'Onaylananlar' },
          { key: 'REJECTED', label: 'Reddedilenler' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === t.key ? 'var(--brand-navy)' : 'transparent',
              color: activeTab === t.key ? '#FFFFFF' : 'var(--text-secondary)',
              border: activeTab === t.key ? '1px solid var(--brand-navy)' : '1px solid transparent'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Başvurular Yükleniyor...
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-desktop-view" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 16px' }}>Firma Adı</th>
                  <th style={{ padding: '14px 16px' }}>Yetkili</th>
                  <th style={{ padding: '14px 16px' }}>E-posta</th>
                  <th style={{ padding: '14px 16px' }}>Telefon</th>
                  <th style={{ padding: '14px 16px' }}>Tarih</th>
                  <th style={{ padding: '14px 16px' }}>Durum</th>
                  <th style={{ padding: '14px 16px' }}>Aksiyonlar</th>
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
                    <tr key={app.applicationId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-primary)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{app.companyName}</td>
                      <td style={{ padding: '14px 16px' }}>{app.contactName}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{app.contactEmail}</td>
                      <td style={{ padding: '14px 16px' }}>{app.contactPhone}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {app.createdAt ? new Date(app.createdAt).toLocaleString('tr-TR') : '-'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                          backgroundColor: app.status === 'APPROVED' ? 'var(--success-bg)' : app.status === 'PENDING' ? 'var(--warning-bg)' : 'var(--error-bg)',
                          color: app.status === 'APPROVED' ? 'var(--success-color)' : app.status === 'PENDING' ? 'var(--warning-color)' : 'var(--error-color)',
                          border: app.status === 'APPROVED' ? '1px solid var(--success-border)' : app.status === 'PENDING' ? '1px solid var(--warning-border)' : '1px solid var(--error-border)'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedApp(app)}
                            style={{ padding: '6px 12px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                          >
                            Detay
                          </button>
                          {app.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId, 'APPROVED')}
                                disabled={isUpdating}
                                style={{ padding: '6px 12px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 700, borderRadius: '6px', fontSize: '12px' }}
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}
                                disabled={isUpdating}
                                style={{ padding: '6px 12px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                              >
                                Reddet
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Presentation */}
          <div className="card-mobile-view">
            {filteredApplications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                Bu filtreye uygun başvuru bulunamadı.
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div key={app.applicationId} style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{app.companyName}</h3>
                    <span style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                      backgroundColor: app.status === 'APPROVED' ? 'var(--success-bg)' : app.status === 'PENDING' ? 'var(--warning-bg)' : 'var(--error-bg)',
                      color: app.status === 'APPROVED' ? 'var(--success-color)' : app.status === 'PENDING' ? 'var(--warning-color)' : 'var(--error-color)',
                      border: app.status === 'APPROVED' ? '1px solid var(--success-border)' : app.status === 'PENDING' ? '1px solid var(--warning-border)' : '1px solid var(--error-border)'
                    }}>
                      {app.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div><strong>Yetkili:</strong> {app.contactName}</div>
                    <div><strong>E-posta:</strong> {app.contactEmail}</div>
                    <div><strong>Telefon:</strong> {app.contactPhone}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {app.createdAt ? new Date(app.createdAt).toLocaleString('tr-TR') : '-'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      onClick={() => setSelectedApp(app)}
                      style={{ flex: 1, padding: '10px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                    >
                      Detay
                    </button>
                    {app.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(app.applicationId, 'APPROVED')}
                          disabled={isUpdating}
                          style={{ flex: 1, padding: '10px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', fontSize: '13px' }}
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}
                          disabled={isUpdating}
                          style={{ flex: 1, padding: '10px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                        >
                          Reddet
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>Firma Başvuru Detayı</h3>
              <button onClick={() => setSelectedApp(null)} style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
              <div><strong>Firma / Kurum Adı:</strong> {selectedApp.companyName}</div>
              <div><strong>Yetkili Ad Soyad:</strong> {selectedApp.contactName}</div>
              <div><strong>Kurumsal E-posta:</strong> {selectedApp.contactEmail}</div>
              <div><strong>Telefon:</strong> {selectedApp.contactPhone}</div>
              {selectedApp.website && <div><strong>Web Sitesi:</strong> {selectedApp.website}</div>}
              {selectedApp.message && (
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '8px' }}>
                  <strong>Mesaj / Talep:</strong>
                  <p style={{ marginTop: '4px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedApp.message}</p>
                </div>
              )}
              <div><strong>Başvuru Tarihi:</strong> {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleString('tr-TR') : '-'}</div>
              <div>
                <strong>Durum:</strong>{' '}
                <span style={{
                  padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
                  backgroundColor: selectedApp.status === 'APPROVED' ? 'var(--success-bg)' : selectedApp.status === 'PENDING' ? 'var(--warning-bg)' : 'var(--error-bg)',
                  color: selectedApp.status === 'APPROVED' ? 'var(--success-color)' : selectedApp.status === 'PENDING' ? 'var(--warning-color)' : 'var(--error-color)'
                }}>
                  {selectedApp.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              {selectedApp.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.applicationId, 'APPROVED')}
                    disabled={isUpdating}
                    style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', fontSize: '13px' }}
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.applicationId, 'REJECTED')}
                    disabled={isUpdating}
                    style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                  >
                    Reddet
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedApp(null)}
                style={{ flex: 1, minWidth: '100px', padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Portal User Modal */}
      {isCreateUserModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                👤 Yeni Portal Kullanıcısı Ekle
              </h3>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Kullanıcı Rolü:
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600
                }}
              >
                <option value="CALL_CENTER_AGENT">📞 CALL_CENTER_AGENT (Çağrı Merkezi Personeli)</option>
                <option value="ORGANIZATION_USER">🏢 ORGANIZATION_USER (Firma Temsilcisi)</option>
                <option value="PAG_STAFF">⭐ PAG_STAFF (PAG Operasyon Ekibi)</option>
                <option value="SUPER_ADMIN">👑 SUPER_ADMIN (Süper Yönetici)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                E-posta Adresi:
              </label>
              <input
                type="email"
                placeholder="ornek@callcenter.pagapp.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Geçici Şifre:
              </label>
              <input
                type="text"
                placeholder="En az 6 karakter"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px'
                }}
              />
            </div>

            {newUserRole === 'ORGANIZATION_USER' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Firma / Organization ID:
                </label>
                <input
                  type="text"
                  placeholder="org_mcdonalds"
                  value={newUserOrgId}
                  onChange={(e) => setNewUserOrgId(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                style={{ padding: '10px 16px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                onClick={handleCreatePortalUser}
                disabled={isCreatingUser}
                style={{ padding: '10px 20px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {isCreatingUser ? 'Oluşturuluyor...' : 'Kullanıcıyı Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
