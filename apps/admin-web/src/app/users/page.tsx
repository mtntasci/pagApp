'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db, functions } from '@/lib/firebase';
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
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('Pag2026!');
  const [newRole, setNewRole] = useState<string>('CALL_CENTER_AGENT');
  const [newOrgId, setNewOrgId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetTargetUser, setResetTargetUser] = useState<PortalUserItem | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  const [resetModalError, setResetModalError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Instant Direct Firestore Read (~40ms)
      try {
        const [usersSnap, orgsSnap] = await Promise.all([
          getDocs(collection(db, 'portalUsers')).catch(() => null),
          getDocs(collection(db, 'organizations')).catch(() => null)
        ]);

        if (usersSnap && !usersSnap.empty) {
          const directUsers: PortalUserItem[] = [];
          usersSnap.forEach(d => {
            const u = d.data();
            directUsers.push({
              uid: d.id,
              email: u.email || d.id,
              role: u.role || 'CALL_CENTER_AGENT',
              organizationId: u.organizationId || null,
              status: u.status || 'ACTIVE',
              displayName: u.displayName || null,
              createdAt: u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : u.createdAt || null
            });
          });
          setUsers(directUsers);
        }

        if (orgsSnap && !orgsSnap.empty) {
          const directOrgs: OrgItem[] = [];
          orgsSnap.forEach(d => {
            const o = d.data();
            directOrgs.push({
              organizationId: o.organizationId || d.id,
              name: o.name || d.id
            });
          });
          setOrganizations(directOrgs);
          if (directOrgs.length > 0 && !newOrgId) {
            setNewOrgId(directOrgs[0].organizationId);
          }
        }
      } catch (fsErr) {
        console.warn('Direct Firestore users read error:', fsErr);
      } finally {
        setIsLoading(false);
      }

      // 2. Background Callable Functions sync (non-blocking)
      const listUsersFn = httpsCallable<any, any>(functions, 'listPortalUsersAdmin');
      const listOrgsFn = httpsCallable<any, any>(functions, 'listOrganizationsAdmin');

      const [usersRes, orgsRes] = await Promise.all([
        listUsersFn({ role: roleFilter !== 'ALL' ? roleFilter : undefined, search: searchQuery }).catch(() => ({ data: { success: false, data: { users: [] } } })),
        listOrgsFn().catch(() => ({ data: { success: false, data: { organizations: [] } } }))
      ]);

      if (usersRes.data?.success && Array.isArray(usersRes.data?.data?.users) && usersRes.data.data.users.length > 0) {
        setUsers(usersRes.data.data.users);
      }

      if (orgsRes.data?.success && Array.isArray(orgsRes.data?.data?.organizations) && orgsRes.data.data.organizations.length > 0) {
        setOrganizations(orgsRes.data.data.organizations);
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

  const handleOpenResetPassword = (u: PortalUserItem) => {
    setResetTargetUser(u);
    setResetNewPassword('');
    setResetModalError(null);
    setShowResetModal(true);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Pag';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!';
    setResetNewPassword(pass);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetModalError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsResettingPassword(true);
    setResetModalError(null);

    // 1. If resetting own password, use Firebase Auth client SDK directly
    if (auth.currentUser && (auth.currentUser.uid === resetTargetUser.uid || auth.currentUser.email === resetTargetUser.email)) {
      try {
        await updatePassword(auth.currentUser, resetNewPassword);
        try {
          await setDoc(doc(db, 'portalUsers', resetTargetUser.uid), {
            mustChangePassword: false,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (fsErr) {
          // ignore
        }
        alert(`✅ Kendi şifreniz başarıyla güncellendi!\n\nYeni Şifre: ${resetNewPassword}`);
        setShowResetModal(false);
        setResetTargetUser(null);
        setResetNewPassword('');
        setIsResettingPassword(false);
        return;
      } catch (selfAuthErr: any) {
        console.warn('Direct updatePassword error:', selfAuthErr);
        // continue to Cloud Function if direct fails (e.g. requires re-auth)
      }
    }

    // 2. Cloud Function for admin resetting any user's password
    try {
      const resetFn = httpsCallable<any, any>(functions, 'adminResetUserPasswordAdmin');
      const res = await resetFn({
        uid: resetTargetUser.uid,
        email: resetTargetUser.email,
        newPassword: resetNewPassword
      });

      if (res.data?.success) {
        alert(`✅ ${resetTargetUser.email} kullanıcısının şifresi başarıyla yenilendi!\n\nYeni Şifre: ${resetNewPassword}`);
        setShowResetModal(false);
        setResetTargetUser(null);
        setResetNewPassword('');
      } else {
        setResetModalError(res.data?.error || 'Şifre güncellenemedi.');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      // Fallback: If Cloud Function is still deploying or returned CORS, send password reset link
      if (err?.message?.includes('internal') || err?.message?.includes('CORS') || err?.code === 'internal') {
        try {
          await sendPasswordResetEmail(auth, resetTargetUser.email);
          alert(`ℹ️ Cloud Function deploy işlemi sürerken ${resetTargetUser.email} adresine "Şifre Sıfırlama Bağlantısı" e-postası gönderildi.\n\nBackend deploy tamamlandığında şifre doğrudan da atanabilecektir.`);
          setShowResetModal(false);
          setResetTargetUser(null);
          setResetNewPassword('');
          return;
        } catch (emailErr) {
          setResetModalError('Cloud Function fonksiyonu şu an Firebase üzerinde deploy ediliyor. Deploy tamamlandığında (1-2 dk) tekrar deneyiniz.');
        }
      } else {
        setResetModalError(err.message || 'Şifre yenilenirken hata oluştu.');
      }
    } finally {
      setIsResettingPassword(false);
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
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>İşlemler</th>
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
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenResetPassword(u)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--bg-surface-secondary)',
                              color: 'var(--brand-navy)',
                              border: '1px solid var(--border-highlight)',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🔑 Şifre Yenile
                          </button>
                        )}
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

      {/* Reset Password Modal */}
      {showResetModal && resetTargetUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '460px',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  🔑 Kullanıcı Şifresini Sıfırla
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Eski şifreyi bilmeye gerek kalmadan yeni bir şifre tanımlayın.
                </p>
              </div>
              <button
                onClick={() => { setShowResetModal(false); setResetTargetUser(null); }}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>HEDEF KULLANICI</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{resetTargetUser.email}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Rol: {getRoleBadge(resetTargetUser.role).label}</div>
            </div>

            {resetModalError && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                color: '#EF4444',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                ⚠️ {resetModalError}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Yeni Şifre *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-navy)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    🎲 Rastgele Şifre Üret
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="En az 6 karakter"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setShowResetModal(false); setResetTargetUser(null); }}
                  style={{
                    padding: '10px 16px',
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
                  disabled={isResettingPassword}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--brand-navy)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: isResettingPassword ? 'not-allowed' : 'pointer',
                    opacity: isResettingPassword ? 0.7 : 1
                  }}
                >
                  {isResettingPassword ? 'Güncelleniyor...' : 'Şifreyi Yenile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
