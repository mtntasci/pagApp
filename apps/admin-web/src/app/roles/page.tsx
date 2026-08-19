'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface RolePermission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface SystemRole {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean; // Sistem varsayılan rolleri silinemez
  userCount: number;
  permissions: string[]; // Permission IDs
  color: string;
}

const AVAILABLE_PERMISSIONS: RolePermission[] = [
  // 1. Anket Yönetimi
  { id: 'survey.view', name: 'Anketleri Görüntüleme', category: 'Anket Yönetimi', description: 'Tüm anket listesini ve detaylarını inceleyebilir' },
  { id: 'survey.create', name: 'Yeni Anket Oluşturma', category: 'Anket Yönetimi', description: 'Taslak ve yeni anket tanımlayabilir' },
  { id: 'survey.edit', name: 'Anket Düzenleme', category: 'Anket Yönetimi', description: 'Mevcut anket sorularını ve ayarlarını güncelleyebilir' },
  { id: 'survey.approve_org', name: 'Firma Anket Onayı', category: 'Anket Yönetimi', description: 'Firma adına anket onaylayıp PAG onayına gönderebilir' },
  { id: 'survey.approve_admin', name: 'Süper Admin Yayına Alma', category: 'Anket Yönetimi', description: 'Anketleri kesin yayına alıp kilitleyebilir' },
  { id: 'survey.delete', name: 'Anket Silme / Arşivleme', category: 'Anket Yönetimi', description: 'Anketleri sistemden kaldırabilir veya arşivleyebilir' },

  // 2. Kalite Doğrulama & Çağrı Merkezi
  { id: 'verification.view_respondents', name: 'Katılımcı Havuzunu Görüntüleme', category: 'Kalite Doğrulama', description: 'Anket katılımcılarını maskeli olarak listeleyebilir' },
  { id: 'verification.select_respondents', name: 'Katılımcı Seçme & Kota Kullanımı', category: 'Kalite Doğrulama', description: 'Demografik filtrelerle katılımcı seçip doğrulama başlatabilir' },
  { id: 'verification.make_calls', name: 'Çağrı Başlatma (Arama Portalı)', category: 'Kalite Doğrulama', description: 'Arama portalından kullanıcıları arayabilir ve sonuç girebilir' },
  { id: 'verification.reports', name: 'Doğrulama Canlı Raporları', category: 'Kalite Doğrulama', description: 'Ulaşılma, kabul ve doğrulama oranlarını izleyebilir' },

  // 3. Firma & Başvuru Yönetimi
  { id: 'org.view', name: 'Firma Bilgilerini İnceleme', category: 'Firma Yönetimi', description: 'Firma profili ve istatistiklerini görebilir' },
  { id: 'org.edit', name: 'Firma Bilgilerini Düzenleme', category: 'Firma Yönetimi', description: 'İletişim ve kurumsal ayarları güncelleyebilir' },
  { id: 'org.applications', name: 'Kurumsal Başvuruları Onaylama', category: 'Firma Yönetimi', description: 'Gelen firma başvurularını inceleyip onaylayabilir' },
  { id: 'org.toggle_verification', name: 'Doğrulama Yetkisi Verme/Kaldırma', category: 'Firma Yönetimi', description: 'Firmaya kalite doğrulama yetkisi tanımlayabilir' },

  // 4. Finans & Ödül Yönetimi
  { id: 'rewards.view', name: 'Ödül & Bütçe İnceleme', category: 'Finans & Ödül', description: 'Nakit bütçeleri ve kupon havuzlarını görebilir' },
  { id: 'rewards.manage_vouchers', name: 'Kupon / Kod Havuzu Yükleme', category: 'Finans & Ödül', description: 'Hediye çekleri ve kod listelerini sisteme yükleyebilir' },
  { id: 'rewards.withdrawals', name: 'Nakit Çekim Talebi Onaylama', category: 'Finans & Ödül', description: 'Kullanıcıların IBAN çekim taleplerini onaylayabilir' },

  // 5. Raporlama & Analiz
  { id: 'reports.view_dashboards', name: 'Dashboard & Canlı Metrikler', category: 'Raporlama & Analiz', description: 'Temel analiz panolarını ve katılım oranlarını görebilir' },
  { id: 'reports.export_data', name: 'Veri Dışa Aktarma (Excel/CSV)', category: 'Raporlama & Analiz', description: 'Anket cevaplarını ve demografik verileri indirebilir' },

  // 6. Kullanıcı & Sistem Yönetimi
  { id: 'users.view', name: 'Kullanıcı Listesini Görme', category: 'Kullanıcı & Sistem', description: 'Sistem kullanıcılarını ve rollerini listeleyebilir' },
  { id: 'users.manage', name: 'Personel & Temsilci Ekleme/Düzenleme', category: 'Kullanıcı & Sistem', description: 'Yeni portal kullanıcısı açabilir ve şifre belirleyebilir' },
  { id: 'roles.manage', name: 'Rol & Yetki Yönetimi', category: 'Kullanıcı & Sistem', description: 'Rolleri, yetkileri ve izin matrislerini yapılandırabilir' }
];

const INITIAL_ROLES: SystemRole[] = [
  {
    id: 'role_super_admin',
    code: 'SUPER_ADMIN',
    name: '👑 Süper Admin',
    description: 'Tüm sistem, anket onaylama, finans, firma ve yetki yönetiminde tam yetkili yönetici.',
    isSystem: true,
    userCount: 2,
    color: '#EF4444',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
  },
  {
    id: 'role_pag_staff',
    code: 'PAG_STAFF',
    name: '🛡️ PAG Operasyon Ekibi',
    description: 'Anket hazırlama, firma başvurusu inceleme ve genel operasyonel destek yetkilisi.',
    isSystem: true,
    userCount: 5,
    color: '#3977F6',
    permissions: [
      'survey.view', 'survey.create', 'survey.edit', 'verification.view_respondents',
      'verification.reports', 'org.view', 'org.applications', 'rewards.view',
      'reports.view_dashboards', 'reports.export_data', 'users.view'
    ]
  },
  {
    id: 'role_call_center',
    code: 'CALL_CENTER_AGENT',
    name: '📞 Çağrı Merkezi Temsilcisi',
    description: 'Arama portalı üzerinden kullanıcılara ulaşıp kalite doğrulama aramalarını gerçekleştiren temsilci.',
    isSystem: true,
    userCount: 12,
    color: '#10B981',
    permissions: [
      'verification.view_respondents', 'verification.make_calls', 'reports.view_dashboards'
    ]
  },
  {
    id: 'role_org_admin',
    code: 'ORGANIZATION_ADMIN',
    name: '🏢 Firma Yöneticisi',
    description: 'Firma adına anket onaylama, katılımcı seçme, rapor inceleme ve firma kullanıcılarını yönetme yetkisi.',
    isSystem: false,
    userCount: 8,
    color: '#8B5CF6',
    permissions: [
      'survey.view', 'survey.approve_org', 'verification.view_respondents',
      'verification.select_respondents', 'verification.reports', 'org.view',
      'rewards.view', 'reports.view_dashboards', 'reports.export_data', 'users.view', 'users.manage'
    ]
  },
  {
    id: 'role_org_verifier',
    code: 'ORGANIZATION_VERIFIER',
    name: '🎯 Firma Kalite & Katılımcı Uzmanı',
    description: 'Firma anketlerinin katılımcı havuzunu demografik filtrelerle inceleyip doğrulama seçimlerini yapan uzman.',
    isSystem: false,
    userCount: 4,
    color: '#F59E0B',
    permissions: [
      'survey.view', 'verification.view_respondents', 'verification.select_respondents',
      'verification.reports', 'reports.view_dashboards'
    ]
  }
];

export default function RolesPage() {
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState<SystemRole[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(INITIAL_ROLES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'NEW' | 'EDIT' | 'COPY'>('NEW');
  const [formRoleName, setFormRoleName] = useState('');
  const [formRoleCode, setFormRoleCode] = useState('');
  const [formRoleDesc, setFormRoleDesc] = useState('');
  const [formRoleColor, setFormRoleColor] = useState('#3977F6');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Create Modal
  const handleOpenNew = () => {
    setModalMode('NEW');
    setFormRoleName('');
    setFormRoleCode('');
    setFormRoleDesc('');
    setFormRoleColor('#3977F6');
    setFormPermissions([]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (role: SystemRole) => {
    setModalMode('EDIT');
    setFormRoleName(role.name.replace(/^[^\s]+\s/, '')); // strip emoji if desired
    setFormRoleCode(role.code);
    setFormRoleDesc(role.description);
    setFormRoleColor(role.color);
    setFormPermissions([...role.permissions]);
    setIsModalOpen(true);
  };

  // Open Copy / Clone Modal
  const handleOpenCopy = (role: SystemRole) => {
    setModalMode('COPY');
    setFormRoleName(`${role.name.replace(/^[^\s]+\s/, '')} (Kopya)`);
    setFormRoleCode(`${role.code}_COPY`);
    setFormRoleDesc(`${role.name} yetki şablonundan türetilmiş özel rol.`);
    setFormRoleColor(role.color);
    setFormPermissions([...role.permissions]);
    setIsModalOpen(true);
  };

  // Toggle Permission in Modal
  const handleTogglePermission = (permId: string) => {
    setFormPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  // Select All Permissions in a Category
  const handleSelectCategoryPermissions = (category: string) => {
    const catPerms = AVAILABLE_PERMISSIONS.filter(p => p.category === category).map(p => p.id);
    const allSelected = catPerms.every(id => formPermissions.includes(id));
    if (allSelected) {
      setFormPermissions(prev => prev.filter(id => !catPerms.includes(id)));
    } else {
      setFormPermissions(prev => Array.from(new Set([...prev, ...catPerms])));
    }
  };

  // Save Modal Form (Mock Ready)
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim() || !formRoleCode.trim()) {
      alert('Lütfen rol adı ve kodunu giriniz.');
      return;
    }

    if (modalMode === 'NEW' || modalMode === 'COPY') {
      const newRole: SystemRole = {
        id: `role_${Date.now()}`,
        code: formRoleCode.toUpperCase().trim().replace(/[^A-Z0-9_]/g, '_'),
        name: formRoleName.trim(),
        description: formRoleDesc.trim(),
        isSystem: false,
        userCount: 0,
        color: formRoleColor,
        permissions: formPermissions
      };
      setRoles(prev => [...prev, newRole]);
      setSelectedRole(newRole);
      showToast(`✅ "${newRole.name}" rolü başarıyla oluşturuldu!`);
    } else if (modalMode === 'EDIT' && selectedRole) {
      const updated: SystemRole = {
        ...selectedRole,
        name: formRoleName.trim(),
        code: formRoleCode.toUpperCase().trim(),
        description: formRoleDesc.trim(),
        color: formRoleColor,
        permissions: formPermissions
      };
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? updated : r));
      setSelectedRole(updated);
      showToast(`✅ "${updated.name}" yetki tanımları güncellendi!`);
    }

    setIsModalOpen(false);
  };

  // Delete Role
  const handleDeleteRole = (role: SystemRole) => {
    if (role.isSystem) {
      alert('Sistem varsayılan rolleri silinemez.');
      return;
    }
    if (confirm(`"${role.name}" rolünü silmek istediğinize emin misiniz? Bu role sahip kullanıcılar varsayılan yetkiye düşürülecektir.`)) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
      if (selectedRole?.id === role.id) {
        setSelectedRole(roles[0]);
      }
      showToast(`🗑️ "${role.name}" rolü kaldırıldı.`);
    }
  };

  const categories = Array.from(new Set(AVAILABLE_PERMISSIONS.map(p => p.category)));

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            🛡️ Yetki & Rol Yönetimi
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            Kullanıcı ve firma temsilcileri için rol oluşturma, yetki kopyalama ve detaylı izin matrisi yapılandırması
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            backgroundColor: 'var(--brand-lime)',
            color: 'var(--brand-midnight)',
            fontWeight: 800,
            fontSize: '13.5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>➕</span>
          <span>Yeni Rol / Yetki Tanımla</span>
        </button>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: 700,
          fontSize: '13.5px'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Roles List Card */}
        <div style={{
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
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Tanımlı Roller ({roles.length})
            </span>
          </div>

          <input
            type="text"
            placeholder="Rol ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-secondary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {filteredRoles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(57, 119, 246, 0.08)' : 'var(--bg-surface-secondary)',
                    border: isSelected ? `2px solid ${role.color || 'var(--brand-navy)'}` : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {role.name}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: isSelected ? role.color : 'rgba(15, 23, 42, 0.1)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                    }}>
                      {role.userCount} Kullanıcı
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                    {role.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{role.code}</span>
                    <span>{role.permissions.length} İzin</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Role Details & Permission Matrix */}
        {selectedRole ? (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Role Header Info & Action Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {selectedRole.name}
                  </h3>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: selectedRole.color,
                    fontFamily: 'monospace'
                  }}>
                    {selectedRole.code}
                  </span>
                  {selectedRole.isSystem && (
                    <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontSize: '11px', fontWeight: 800 }}>
                      SİSTEM ROLÜ
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {selectedRole.description}
                </p>
              </div>

              {/* Action Buttons: Düzenle, Kopyala, Sil */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleOpenCopy(selectedRole)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(57, 119, 246, 0.1)',
                    color: '#3977F6',
                    border: '1px solid rgba(57, 119, 246, 0.25)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Bu rolün tüm yetkilerini kopyalayarak yeni rol tanımla"
                >
                  📋 Yetkiyi Kopyala
                </button>

                <button
                  onClick={() => handleOpenEdit(selectedRole)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Düzenle
                </button>

                {!selectedRole.isSystem && (
                  <button
                    onClick={() => handleDeleteRole(selectedRole)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Sil
                  </button>
                )}
              </div>
            </div>

            {/* Permission Matrix Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Yetki & İzin Matrisi ({selectedRole.permissions.length} / {AVAILABLE_PERMISSIONS.length} Yetki Tanımlı)
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                  Bu role sahip kullanıcıların sistemde gerçekleştirebileceği eylem ve erişim seviyeleri
                </p>
              </div>

              {/* Category Filter Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    backgroundColor: selectedCategory === 'ALL' ? 'var(--brand-navy)' : 'var(--bg-surface-secondary)',
                    color: selectedCategory === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  Tümü
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      backgroundColor: selectedCategory === cat ? 'var(--brand-navy)' : 'var(--bg-surface-secondary)',
                      color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Categories & Permissions Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {categories
                .filter(cat => selectedCategory === 'ALL' || selectedCategory === cat)
                .map((category) => {
                  const catPermissions = AVAILABLE_PERMISSIONS.filter(p => p.category === category);
                  const activeCount = catPermissions.filter(p => selectedRole.permissions.includes(p.id)).length;

                  return (
                    <div
                      key={category}
                      style={{
                        backgroundColor: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          📁 {category}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: activeCount === catPermissions.length ? 'rgba(16, 185, 129, 0.15)' : (activeCount > 0 ? 'rgba(57, 119, 246, 0.15)' : 'rgba(15, 23, 42, 0.08)'),
                          color: activeCount === catPermissions.length ? '#10B981' : (activeCount > 0 ? '#3977F6' : 'var(--text-muted)')
                        }}>
                          {activeCount} / {catPermissions.length} İzin Aktif
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                        {catPermissions.map((perm) => {
                          const isGranted = selectedRole.permissions.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: isGranted ? 'var(--bg-surface)' : 'rgba(15, 23, 42, 0.03)',
                                border: isGranted ? '1.5px solid rgba(16, 185, 129, 0.3)' : '1px dashed var(--border-color)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                opacity: isGranted ? 1 : 0.6
                              }}
                            >
                              <span style={{
                                fontSize: '15px',
                                color: isGranted ? '#10B981' : 'var(--text-muted)',
                                marginTop: '1px'
                              }}>
                                {isGranted ? '✅' : '🔒'}
                              </span>
                              <div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: isGranted ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                  {perm.name}
                                </span>
                                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '3px 0 0 0', lineHeight: 1.35 }}>
                                  {perm.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Role Create / Edit / Clone Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {modalMode === 'NEW' ? '➕ Yeni Rol & Yetki Tanımla' : (modalMode === 'COPY' ? '📋 Rolü Kopyala & Özelleştir' : '✏️ Rolü Düzenle')}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Rol adı, kodu ve kategori bazlı izin matrisini yapılandırın
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Rol Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRoleName}
                    onChange={(e) => setFormRoleName(e.target.value)}
                    placeholder="Örn: Saha Denetim Uzmanı"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Rol Kodu (Büyük Harf / ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRoleCode}
                    onChange={(e) => setFormRoleCode(e.target.value.toUpperCase())}
                    placeholder="Örn: FIELD_INSPECTOR"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Rol Açıklaması
                </label>
                <input
                  type="text"
                  value={formRoleDesc}
                  onChange={(e) => setFormRoleDesc(e.target.value)}
                  placeholder="Bu rolün görev ve sorumlulukları..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              {/* Permission Checkboxes by Category */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    İzin Matrisi ({formPermissions.length} / {AVAILABLE_PERMISSIONS.length} Seçili)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setFormPermissions(AVAILABLE_PERMISSIONS.map(p => p.id))}
                      style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', cursor: 'pointer', color: 'var(--brand-navy)' }}
                    >
                      Tümünü Seç
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormPermissions([])}
                      style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '340px', overflowY: 'auto', paddingRight: '6px' }}>
                  {categories.map((category) => {
                    const catPerms = AVAILABLE_PERMISSIONS.filter(p => p.category === category);
                    const allCatSelected = catPerms.every(p => formPermissions.includes(p.id));

                    return (
                      <div key={category} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', backgroundColor: 'var(--bg-surface-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectCategoryPermissions(category)}
                            style={{ background: 'none', border: 'none', color: '#3977F6', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            {allCatSelected ? 'Kategori Seçimini Kaldır' : 'Kategoriyi Seç'}
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {catPerms.map((perm) => {
                            const isChecked = formPermissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: isChecked ? 'rgba(57, 119, 246, 0.1)' : 'var(--bg-surface)',
                                  border: isChecked ? '1px solid #3977F6' : '1px solid var(--border-color)',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: isChecked ? 700 : 500,
                                  color: isChecked ? 'var(--brand-navy)' : 'var(--text-primary)'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.id)}
                                  style={{ cursor: 'pointer' }}
                                />
                                <span>{perm.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--brand-lime)', color: 'var(--brand-midnight)', fontWeight: 900, fontSize: '13.5px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                >
                  {modalMode === 'NEW' ? 'Rolü Kaydet' : (modalMode === 'COPY' ? 'Kopyalanan Rolü Kaydet' : 'Değişiklikleri Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
