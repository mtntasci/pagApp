-- +goose Up
-- ============================================================================
-- 19. SEED INITIAL SURVEY CATEGORIES
-- ============================================================================
INSERT INTO survey_categories (id, name, icon, sort_order, is_active) VALUES
('cat_general', 'Genel', 'survey', 1, TRUE),
('cat_tech', 'Teknoloji', 'devices', 2, TRUE),
('cat_life', 'Yaşam & Trend', 'nature_people', 3, TRUE),
('cat_shopping', 'Alışveriş & Tüketim', 'shopping_bag', 4, TRUE),
('cat_finance', 'Finans & Yatırım', 'account_balance', 5, TRUE),
('cat_auto', 'Otomotiv', 'directions_car', 6, TRUE),
('cat_health', 'Sağlık & Spor', 'fitness_center', 7, TRUE),
('cat_food', 'Yeme & İçme', 'restaurant', 8, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 20. SEED INITIAL SUPER ADMIN PORTAL USERS
-- ============================================================================
INSERT INTO portal_users (id, firebase_uid, email, display_name, role, is_active) VALUES
('pusr_root', 'jYK5HZo3ccNhsbl1QxGQkmSlbEM2', 'root@pagapp.com.tr', 'Root Admin (Süper Yetkili)', 'SUPER_ADMIN', TRUE),
('pusr_super_admin_1', 'admin_bootstrap', 'admin@pagapp.com.tr', 'Süper Admin', 'SUPER_ADMIN', TRUE),
('pusr_super_admin_2', 'mtntasci_bootstrap', 'mtntasci@gmail.com', 'Metin Taşçı (Süper Admin)', 'SUPER_ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 21. SEED DEFAULT LEGAL DOCUMENTS
-- ============================================================================
INSERT INTO legal_documents (id, doc_type, title, content, version, is_active) VALUES
('doc_terms', 'TERMS', 'Kullanım Koşulları', 'PAG platformu kullanım koşulları ve kuralları...', '1.0', TRUE),
('doc_privacy', 'PRIVACY', 'Gizlilik Politikası', 'PAG kullanıcı verileri koruma ve gizlilik standartları...', '1.0', TRUE),
('doc_kvkk', 'KVKK', 'KVKK Aydınlatma Metni', '6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metni...', '1.0', TRUE),
('doc_explicit_consent', 'EXPLICIT_CONSENT', 'Açık Rıza Beyanı', 'Kişisel verilerimin işlenmesine ilişkin açık rıza beyanım...', '1.0', TRUE),
('doc_comm', 'COMMUNICATION', 'Ticari Elektronik İleti Onayı', 'Kampanya, anket ve ödül bildirimlerine ilişkin onay...', '1.0', TRUE)
ON CONFLICT (id) DO NOTHING;

-- +goose Down
DELETE FROM legal_documents WHERE id IN ('doc_terms', 'doc_privacy', 'doc_kvkk', 'doc_explicit_consent', 'doc_comm');
DELETE FROM portal_users WHERE id IN ('pusr_super_admin_1', 'pusr_super_admin_2');
DELETE FROM survey_categories WHERE id LIKE 'cat_%';
