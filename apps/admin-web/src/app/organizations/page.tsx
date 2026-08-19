'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export interface OrganizationItem {
  id: string;
  organizationId: string;
  name: string;
  sector: string;
  contactEmail: string | null;
  contactPhone: string | null;
  status: 'ACTIVE' | 'DISABLED';
  isVerificationAuthorized: boolean;
  surveyCount: number;
  portalUserCount: number;
  createdAt: string | null;
}

export interface OrgUserItem {
  uid: string;
  email: string;
  role: string;
  status: string;
  createdAt: string | null;
}

export default function OrganizationsPage() {
  const { isAdmin, isOrgUser, portalUser } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrgForUsers, setSelectedOrgForUsers] = useState<OrganizationItem | null>(null);
  const [orgUsers, setOrgUsers] = useState<OrgUserItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // New Organization Modal
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSector, setNewOrgSector] = useState('Otomotiv');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgPhone, setNewOrgPhone] = useState('');
  const [newOrgVerificationAuth, setNewOrgVerificationAuth] = useState(true);
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  // Add Portal User for Org Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // 1. Fetch Organizations
  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const listFn = httpsCallable(functions, 'listOrganizationsAdmin');
      const res: any = await listFn({});
      if (res.data?.success && Array.isArray(res.data.data?.organizations)) {
        setOrganizations(res.data.data.organizations);
      }
    } catch (err: any) {
      console.error('Fetch Organizations Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // 2. Fetch Users for specific Organization
  const handleOpenOrgUsers = async (org: OrganizationItem) => {
    setSelectedOrgForUsers(org);
    setIsLoadingUsers(true);
    try {
      const listUsersFn = httpsCallable(functions, 'listOrganizationUsersAdmin');
      const res: any = await listUsersFn({ organizationId: org.organizationId });
      if (res.data?.success && Array.isArray(res.data.data?.users)) {
        setOrgUsers(res.data.data.users);
      }
    } catch (err: any) {
      console.error('Fetch Org Users Error:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // 3. Toggle Verification Authorization
  const handleToggleVerificationAuth = async (org: OrganizationItem) => {
    const newStatus = !org.isVerificationAuthorized;
    try {
      const toggleFn = httpsCallable(functions, 'toggleOrganizationVerificationAuthAdmin');
      await toggleFn({
        organizationId: org.organizationId,
        isVerificationAuthorized: newStatus
      });
      setOrganizations(prev =>
        prev.map(o => o.organizationId === org.organizationId ? { ...o, isVerificationAuthorized: newStatus } : o)
      );
    } catch (err: any) {
      console.error('Toggle Verification Auth Error:', err);
      alert('Yetki güncellenirken hata: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  // 4. Create Organization
  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      alert('Lütfen firma adını giriniz.');
      return;
    }
    setIsSavingOrg(true);
    try {
      const createFn = httpsCallable(functions, 'createOrUpdateOrganizationAdmin');
      const res: any = await createFn({
        name: newOrgName.trim(),
        sector: newOrgSector,
        contactEmail: newOrgEmail.trim() || null,
        contactPhone: newOrgPhone.trim() || null,
        isVerificationAuthorized: newOrgVerificationAuth,
        status: 'ACTIVE'
      });

      if (res.data?.success) {
        alert(`"${newOrgName}" firması başarıyla oluşturuldu!`);
        setIsCreateOrgModalOpen(false);
        setNewOrgName('');
        setNewOrgEmail('');
        setNewOrgPhone('');
        await fetchOrganizations();
      }
    } catch (err: any) {
      console.error('Create Organization Error:', err);
      alert('Firma oluşturulurken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSavingOrg(false);
    }
  };

  // 5. Add Portal User to selected Org
  const handleCreateOrgUser = async () => {
    if (!selectedOrgForUsers) return;
    if (!newUserEmail || !newUserEmail.includes('@')) {
      alert('Lütfen geçerli bir e-posta girin.');
      return;
    }
    if (!newUserPassword || newUserPassword.length < 6) {
      alert('Geçici şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const createFn = httpsCallable(functions, 'createPortalUserAdmin');
      const res: any = await createFn({
        email: newUserEmail.trim(),
        temporaryPassword: newUserPassword,
        role: 'ORGANIZATION_USER',
        organizationId: selectedOrgForUsers.organizationId
      });

      if (res.data?.success) {
        alert(`Kullanıcı oluşturuldu!\nE-posta: ${newUserEmail}\nFirma: ${selectedOrgForUsers.name}`);
        setIsAddUserModalOpen(false);
        setNewUserEmail('');
        setNewUserPassword('');
        await handleOpenOrgUsers(selectedOrgForUsers);
        await fetchOrganizations();
      }
    } catch (err: any) {
      console.error('Create Org User Error:', err);
      alert('Kullanıcı eklenirken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Kurumsal Müşteriler & Firma Yönetimi
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
            Kayıtlı Kurumlar, Kalite Doğrulama Yetkileri ve Yetkili Firma Kullanıcıları
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateOrgModalOpen(true)}
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
            🏢 Yeni Firma Ekle
          </button>
        )}
      </header>

      {/* Organizations Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Firmalar yükleniyor...</div>
      ) : organizations.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          Kayıtlı firma bulunamadı.
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Firma Adı & Kod</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Sektör</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>İletişim</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Anket Sayısı</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Kullanıcı Sayısı</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Kalite Doğrulama Yetkisi</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>{org.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{org.organizationId}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface-secondary)', fontSize: '11px', fontWeight: 600 }}>
                        {org.sector}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      <div>{org.contactEmail || '-'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{org.contactPhone || ''}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--brand-navy)' }}>
                      📝 {org.surveyCount} Anket
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      👤 {org.portalUserCount} Kullanıcı
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {isAdmin ? (
                        <button
                          onClick={() => handleToggleVerificationAuth(org)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: org.isVerificationAuthorized ? 'var(--success-bg)' : 'var(--bg-surface-secondary)',
                            color: org.isVerificationAuthorized ? 'var(--success-color)' : 'var(--text-muted)'
                          }}
                        >
                          {org.isVerificationAuthorized ? '🛡️ Yetkili (Aktif)' : '⚪ Yetkisiz (Pasif)'}
                        </button>
                      ) : (
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                          backgroundColor: org.isVerificationAuthorized ? 'var(--success-bg)' : 'var(--bg-surface-secondary)',
                          color: org.isVerificationAuthorized ? 'var(--success-color)' : 'var(--text-muted)'
                        }}>
                          {org.isVerificationAuthorized ? '🛡️ Yetkili' : 'Yetkisiz'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenOrgUsers(org)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-surface-secondary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-highlight)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        👥 Kullanıcılar ({org.portalUserCount})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Organization Users Modal */}
      {selectedOrgForUsers && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Firma Kullanıcıları</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {selectedOrgForUsers.name} ({selectedOrgForUsers.organizationId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrgForUsers(null)}
                style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Bu firmaya bağlı portal kullanıcıları ({orgUsers.length})
              </span>
              {isAdmin && (
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  style={{
                    padding: '6px 12px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF',
                    borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer'
                  }}
                >
                  + Yeni Kullanıcı Ekle
                </button>
              )}
            </div>

            {isLoadingUsers ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Kullanıcılar yükleniyor...</div>
            ) : orgUsers.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Bu firma için henüz yetkili bir portal kullanıcısı oluşturulmamış.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>E-posta</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Rol</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Durum</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgUsers.map(u => (
                      <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{u.email}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{u.role}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--success-bg)', color: 'var(--success-color)' }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '11px' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                onClick={() => setSelectedOrgForUsers(null)}
                style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Portal User to Org Modal */}
      {isAddUserModalOpen && selectedOrgForUsers && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-navy)' }}>
              👤 {selectedOrgForUsers.name} İçin Kullanıcı Ekle
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Firma Yetkili E-postası:
              </label>
              <input
                type="email"
                placeholder="yetkili@firma.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px' }}
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
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                style={{ padding: '8px 14px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                onClick={handleCreateOrgUser}
                disabled={isCreatingUser}
                style={{ padding: '8px 18px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', borderRadius: '6px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {isCreatingUser ? 'Oluşturuluyor...' : 'Kullanıcıyı Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Organization Modal */}
      {isCreateOrgModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '520px', backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                🏢 Yeni Firma / Kurum Tanımla
              </h3>
              <button onClick={() => setIsCreateOrgModalOpen(false)} style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Firma / Kurum Adı:
              </label>
              <input
                type="text"
                placeholder="Örn: McDonald's Türkiye"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Sektör:
              </label>
              <select
                value={newOrgSector}
                onChange={(e) => setNewOrgSector(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}
              >
                <option value="Otomotiv">Otomotiv & Ulaşım</option>
                <option value="Yeme & İçme">Yeme & İçme / Restoran</option>
                <option value="Perakende">Perakende & Alışveriş</option>
                <option value="Teknoloji">Teknoloji & Telekomünikasyon</option>
                <option value="Finans">Finans & Bankacılık</option>
                <option value="Sağlık">Sağlık & Kozmetik</option>
                <option value="Turizm">Turizm & Eğlence</option>
                <option value="Genel">Diğer / Genel</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Kurumsal E-posta:
                </label>
                <input
                  type="email"
                  placeholder="contact@mcdonalds.com.tr"
                  value={newOrgEmail}
                  onChange={(e) => setNewOrgEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Telefon:
                </label>
                <input
                  type="tel"
                  placeholder="0212 XXX XX XX"
                  value={newOrgPhone}
                  onChange={(e) => setNewOrgPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newOrgVerificationAuth}
                  onChange={(e) => setNewOrgVerificationAuth(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand-navy)', cursor: 'pointer' }}
                />
                🛡️ Kalite Doğrulama Yetkisi Ver (Quality Verification Authorization)
              </label>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 28px' }}>
                İşaretlenirse firma kendi anket katılımcıları arasından doğrulama listesi oluşturabilir.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => setIsCreateOrgModalOpen(false)}
                style={{ padding: '8px 14px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                onClick={handleCreateOrganization}
                disabled={isSavingOrg}
                style={{ padding: '8px 18px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', borderRadius: '6px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {isSavingOrg ? 'Kaydediliyor...' : 'Firmayı Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
