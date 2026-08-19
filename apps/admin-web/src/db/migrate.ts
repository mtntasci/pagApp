import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function runMigration() {
  const connectionUrl =
    process.env.PAGAPP_NEON_POSTGRES_URL_NON_POOLING ||
    process.env.DIRECT_URL ||
    process.env.PAGAPP_NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    '';

  if (!connectionUrl) {
    console.error('❌ Hata: Neon veritabanı bağlantı adresi (PAGAPP_NEON_DATABASE_URL veya DATABASE_URL) bulunamadı.');
    process.exit(1);
  }

  console.log('🚀 Neon PostgreSQL şema kurulumu başlatılıyor...');
  const pool = new Pool({ connectionString: connectionUrl });
  const schemaSqlPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');

  try {
    // Execute the schema script
    await pool.query(schemaSql);
    await pool.end();
    console.log('✅ Tebrikler! Tüm PAG tabloları, indeksleri ve foreign key kısıtları Neon PostgreSQL veritabanında başarıyla oluşturuldu.');
  } catch (err: any) {
    console.error('❌ Migration sırasında hata oluştu:', err);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
