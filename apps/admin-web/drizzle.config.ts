import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionUrl =
  process.env.PAGAPP_NEON_POSTGRES_URL_NON_POOLING ||
  process.env.DIRECT_URL ||
  process.env.PAGAPP_NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  '';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionUrl
  }
});
