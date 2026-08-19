'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface PortalUserItem {
  uid: string;
  email: string;
  role: string;
  organizationId?: string | null;
  status: string;
  displayName?: string | null;
  createdAt?: string | null;
}

interface OrgItem {
  organizationId: string;
  name: string;
}

export default function PortalUsersPage() {
  const { isAdmin, isOrgUser } = useAuth();
  const [users, setUsers] = useState<PortalUserItem[]>([]);
  const [organizations, setOrganizations] = useState<OrgItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('Pag2026!');
  const [newRole, setNewRole] = useState<string>('CALL_CENTER_AGENT');
  const [newOrgId, setNewOrgId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const listUsersFn = httpsCallable<any, any>(functions, 'listPortalUsersAdmin');
      const listOrgsFn = httpsCallable<any, any>(functions, 'listOrganizationsAdmin');

      const [usersRes, orgsRes] = await Promise.all([
        listUsersFn({ role: roleFilter !== 'ALL' ? roleFilter : undefined, search: searchQuery }).catch(() => ({ data: { success: false, data: { users: [] } } })),
        listOrgsFn().catch(() => ({ data: { success: false, data: { organizations: [] } } }))
      ]);

      let userList: PortalUserItem[] = [];
      if (usersRes.data?.success && Array.isArray(usersRes.data?.data?.users)) {
        userList = usersRes.data.data.users;
      }

      setUsers(userList);

      if (orgsRes.data?.success && Array.isArray(orgsRes.data?.data?.organizations)) {
        setOrganizations(orgsRes.data.data.organizations);
        if (orgsRes.data.data.organizations.length > 0 && !newOrgId) {
          setNewOrgId(orgsRes.data.data.organizations[0].organizationId);
        }
      }
    } catch (err: any) {
      console.warn('Error loading portal users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, searchQuery, newOrgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSuccessMessage(null);

    if (!newEmail || !newEmail.includes('@')) {
      setModalError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setModalError('Geçici şifre en az 6 karakter olmalıdır.');
      return;
    }
    if ((newRole === 'ORGANIZATION_USER' || newRole === 'ORGANIZATION_ADMIN' || newRole === 'ORGANIZATION_VERIFIER') && !newOrgId) {
      setModalError('Firma kullanıcısı için bir firma seçilmelidir.');
      return;
    }

    try {
      setIsSubmitting(true);
      const createFn = httpsCallable<any, any>(functions, 'createPortalUserAdmin');
      const res = await createFn({
        email: newEmail.trim().toLowerCase(),
        temporaryPassword: newPassword,
        role: newRole,
        organizationId: (newRole === 'ORGANIZATION_USER' || newRole === 'ORGANIZATION_ADMIN' || newRole === 'ORGANIZATION_VERIFIER') ? newOrgId : null
      });

      if (res.data?.success) {
        const createdUser: PortalUserItem = {
          uid: res.data.data?.uid || `usr_${Date.now()}`,
          email: newEmail.trim().toLowerCase(),
          role: newRole,
          organizationId: (newRole === 'ORGANIZATION_USER' || newRole === 'ORGANIZATION_ADMIN' || newRole === 'ORGANIZATION_VERIFIER') ? newOrgId : null,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };

        // Add to local state immediately
        setUsers(prev => [createdUser, ...prev.filter(u => u.email !== createdUser.email)]);
        setSuccessMessage(`✅ Kullanıcı ${newEmail} (${getRoleBadge(newRole).label}) başarıyla oluşturuldu!`);
        setShowAddModal(false);
        setNewEmail('');
        setNewPassword('Pag2026!');
        await loadData();
      } else {
        setModalError(res.data?.error || 'Kullanıcı oluşturulamadı.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Kullanıcı oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: '👑 Süper Admin', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
      case 'PAG_STAFF':
        return { label: '🛡️ PAG Ekibi', bg: 'rgba(57, 119, 246, 0.15)', color: '#3977F6' };
      case 'CALL_CENTER_AGENT':
        return { label: '📞 Çağrı Merkezi Temsilcisi', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
      case 'ORGANIZATION_USER':
      case 'ORGANIZATION_ADMIN':
        return { label: '🏢 Firma Kullanıcısı', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
      case 'ORGANIZATION_VERIFIER':
        return { label: '🎯 Firma Kalite Uzmanı', bg: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' };
      default:
        return { label: role, bg: 'rgba(100, 116, 139, 0.15)', color: 'var(--text-secondary)' };
    }
  };

  const getOrgName = (orgId?: string | null) => {
    if (!orgId) return '—';
    const org = organizations.find(o => o.organizationId === orgId);
    return org ? org.name : orgId;
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            Kullanıcı & Personel Yönetimi
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            Çağrı merkezi personelleri, firma temsilcileri ve PAG portal yöneticileri
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--brand-lime)',
              color: 'var(--brand-midnight)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            ➕ Yeni Kullanıcı / Personel Ekle
          </button>
        )}
      </header>

      {successMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '24px',
          fontWeight: 700,
          fontSize: '14px'
        }}>
          {successMessage}
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'Tüm Kullanıcılar' },
            { id: 'CALL_CENTER_AGENT', label: '📞 Çağrı Merkezi' },
            { id: 'ORGANIZATION_USER', label: '🏢 Firma Temsilcileri' },
            { id: 'PAG_STAFF', label: '🛡️ PAG Ekibi' },
            { id: 'SUPER_ADMIN', label: '👑 Süper Admin' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: roleFilter === tab.id ? 'var(--brand-navy)' : 'var(--border-color)',
                backgroundColor: roleFilter === tab.id ? 'var(--brand-navy)' : 'var(--bg-surface-secondary)',
                color: roleFilter === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="E-posta veya firma ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-secondary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Kullanıcılar yükleniyor...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Kayıtlı kullanıcı bulunamadı</p>
            <p style={{ fontSize: '13px', marginTop: '4px', margin: 0 }}>Yeni personel eklemek için yukarıdaki butonu kullanabilirsiniz.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left', backgroundColor: 'var(--bg-surface-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Kullanıcı / E-Posta</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Yetki & Rol</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Bağlı Kurum</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Durum</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  return (
                    <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div>{u.email}</div>
                        {u.displayName && <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>{u.displayName}</div>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 800,
                          backgroundColor: badge.bg,
                          color: badge.color
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {getOrgName(u.organizationId)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.status === 'ACTIVE' ? '#10B981' : '#EF4444'
                        }}>
                          {u.status === 'ACTIVE' ? '🟢 Aktif' : '🔴 Pasif'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '480px',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                ➕ Yeni Portal Kullanıcısı / Personel Ekle
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ornek@pagapp.com veya personel@cagri.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Geçici Giriş Şifresi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="En az 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Kullanıcı ilk girişinde şifresini değiştirmeye yönlendirilecektir.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Yetki & Görev Rolü *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    fontWeight: 600
                  }}
                >
                  <option value="CALL_CENTER_AGENT">📞 Çağrı Merkezi Temsilcisi (Arama Portalı & Çağrı Yönetimi)</option>
                  <option value="ORGANIZATION_USER">🏢 Firma Kullanıcısı (Firma Anketleri & Katılımcı Havuzu)</option>
                  <option value="ORGANIZATION_ADMIN">🏢 Firma Yöneticisi (Firma Yönetimi & Anketler)</option>
                  <option value="ORGANIZATION_VERIFIER">🎯 Firma Kalite & Katılımcı Uzmanı (Katılımcı Seçme & Raporlar)</option>
                  <option value="PAG_STAFF">🛡️ PAG Operasyon Ekibi (Operasyonel Yönetim)</option>
                  <option value="SUPER_ADMIN">👑 Süper Admin (Tam Yetki)</option>
                </select>
              </div>

              {(newRole === 'ORGANIZATION_USER' || newRole === 'ORGANIZATION_ADMIN' || newRole === 'ORGANIZATION_VERIFIER') && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Bağlanacağı Firma *
                  </label>
                  <select
                    value={newOrgId}
                    onChange={(e) => setNewOrgId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      fontWeight: 600
                    }}
                  >
                    {organizations.map(org => (
                      <option key={org.organizationId} value={org.organizationId}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--brand-lime)',
                    color: 'var(--brand-midnight)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Oluşturuluyor...' : 'Kullanıcıyı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
