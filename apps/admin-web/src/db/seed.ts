import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function seedDatabase() {
  const connectionUrl =
    process.env.PAGAPP_NEON_POSTGRES_URL_NON_POOLING ||
    process.env.DIRECT_URL ||
    process.env.PAGAPP_NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    '';

  if (!connectionUrl) {
    console.error('❌ Hata: Neon veritabanı bağlantı adresi bulunamadı.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: connectionUrl });

  try {
    console.log('🌱 Neon PostgreSQL örnek verileri yükleniyor...');

    // 1. Organizations
    await pool.query(`
      INSERT INTO organizations (id, name, slug, description, is_active)
      VALUES 
        ('org_pag', 'PAG Araştırma A.Ş.', 'pag-arastirma', 'PAG Resmi Kamuoyu Araştırmaları', true),
        ('org_trendyol', 'Trendyol Group', 'trendyol', 'E-Ticaret ve Pazaryeri Araştırmaları', true),
        ('org_kahve_dunyasi', 'Kahve Dünyası', 'kahve-dunyasi', 'Yiyecek & İçecek Sektör Araştırmaları', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Surveys
    await pool.query(`
      INSERT INTO surveys (
        id, organization_id, owner_type, title, description, category, survey_type, 
        status, is_highlighted, profile_score_reward, story_config, start_at, end_at
      )
      VALUES
        (
          'srv_online_alisveris_2026', 'org_trendyol', 'ORGANIZATION', 
          '2026 Online Alışveriş Trendleri', 'E-ticaret ve teslimat alışkanlıklarınız hakkında kısa bir araştırma.', 
          'SHOPPING', 'ORGANIZATION', 'APPROVED', true, 50,
          '{"isStory": true, "label": "Alışveriş", "category": "story_tech"}'::jsonb,
          NOW(), NOW() + INTERVAL '30 days'
        ),
        (
          'srv_kahve_tuketim_2026', 'org_kahve_dunyasi', 'ORGANIZATION', 
          'Kahve ve Kafe Tercihleri', 'Günlük kahve alışkanlıklarınız ve tercih ettiğiniz mekanlar.', 
          'LIFESTYLE', 'ORGANIZATION', 'APPROVED', true, 40,
          '{"isStory": true, "label": "Kahve", "category": "story_coffee"}'::jsonb,
          NOW(), NOW() + INTERVAL '30 days'
        ),
        (
          'srv_otomotiv_tercih_2026', 'org_pag', 'PAG', 
          'Elektrikli Araç ve Ulaşım Trendleri', 'Geleceğin otomotiv teknolojileri ve tercihleriniz.', 
          'AUTOMOTIVE', 'PAG', 'APPROVED', true, 60,
          '{"isStory": true, "label": "Otomotiv", "category": "story_auto"}'::jsonb,
          NOW(), NOW() + INTERVAL '30 days'
        )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        is_highlighted = EXCLUDED.is_highlighted,
        story_config = EXCLUDED.story_config;
    `);

    // 3. Questions
    await pool.query(`
      -- Online Alışveriş Soruları
      INSERT INTO questions (id, survey_id, question_order, text, options, is_required)
      VALUES
        ('q_shop_1', 'srv_online_alisveris_2026', 1, 'Haftada ortalama kaç kez online sipariş veriyorsunuz?', '[{"id":"opt1","text":"1-2 kez"},{"id":"opt2","text":"3-5 kez"},{"id":"opt3","text":"5''ten fazla"},{"id":"opt4","text":"Hiç"}]'::jsonb, true),
        ('q_shop_2', 'srv_online_alisveris_2026', 2, 'En çok hangi e-ticaret kategorisinde alışveriş yaparsınız?', '[{"id":"opt1","text":"Giyim & Moda"},{"id":"opt2","text":"Elektronik"},{"id":"opt3","text":"Süpermarket & Gıda"},{"id":"opt4","text":"Kozmetik & Bakım"}]'::jsonb, true),
        ('q_shop_3', 'srv_online_alisveris_2026', 3, 'Aynı gün teslimat seçeneği için ek ücret öder misiniz?', '[{"id":"opt1","text":"Evet, kesinlikle"},{"id":"opt2","text":"Bazen acil durumlar için"},{"id":"opt3","text":"Hayır, teslimat her zaman ücretsiz olmalı"}]'::jsonb, true),

      -- Kahve Tercihleri Soruları
        ('q_coffee_1', 'srv_kahve_tuketim_2026', 1, 'Günde ortalama kaç fincan kahve tüketiyorsunuz?', '[{"id":"opt1","text":"1 fincan"},{"id":"opt2","text":"2-3 fincan"},{"id":"opt3","text":"4 ve üzeri"},{"id":"opt4","text":"Kahve tüketmiyorum"}]'::jsonb, true),
        ('q_coffee_2', 'srv_kahve_tuketim_2026', 2, 'En çok hangi kahve türünü seversiniz?', '[{"id":"opt1","text":"Geleneksel Türk Kahvesi"},{"id":"opt2","text":"Filtre Kahve"},{"id":"opt3","text":"Espresso / Americano"},{"id":"opt4","text":"Sütlü Kahveler (Latte, Cappuccino)"}]'::jsonb, true),
        ('q_coffee_3', 'srv_kahve_tuketim_2026', 3, 'Kafe seçiminde sizin için en önemli kriter nedir?', '[{"id":"opt1","text":"Kahve çekirdeği kalitesi"},{"id":"opt2","text":"Sessiz ve konforlu çalışma ortamı"},{"id":"opt3","text":"Uygun fiyatlar"},{"id":"opt4","text":"Lokasyonun yakınlığı"}]'::jsonb, true),

      -- Otomotiv Soruları
        ('q_auto_1', 'srv_otomotiv_tercih_2026', 1, 'Gelecek 2 yıl içinde elektrikli araç satın almayı düşünür müsünüz?', '[{"id":"opt1","text":"Evet, kesinlikle planlıyorum"},{"id":"opt2","text":"Kararsızım, teknolojiyi izliyorum"},{"id":"opt3","text":"Hayır, benzinli/dizel tercih ederim"}]'::jsonb, true),
        ('q_auto_2', 'srv_otomotiv_tercih_2026', 2, 'Elektrikli araçlarda en büyük çekinceniz nedir?', '[{"id":"opt1","text":"Şarj istasyonu altyapısının yetersizliği"},{"id":"opt2","text":"Menzil yetersizliği"},{"id":"opt3","text":"Batarya ömrü ve yüksek araç fiyatı"}]'::jsonb, true),
        ('q_auto_3', 'srv_otomotiv_tercih_2026', 3, 'Şehir içi günlük ulaşımda en çok hangi yöntemi kullanırsınız?', '[{"id":"opt1","text":"Kendi şahsi aracımla"},{"id":"opt2","text":"Toplu taşıma (Metro, Metrobüs, Otobüs)"},{"id":"opt3","text":"Motosiklet / Scooter / Bisiklet"},{"id":"opt4","text":"Yürüyüş"}]'::jsonb, true)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Örnek anketler, sorular ve kurumlar Neon PostgreSQL veritabanına başarıyla yüklendi!');
    await pool.end();
  } catch (err) {
    console.error('❌ Seed sırasında hata:', err);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
