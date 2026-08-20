import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function getConnectionString(): string {
  return (
    process.env.PAGAPP_NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    'postgresql://neondb_owner:npg_9dsYaCy6qpLk@ep-quiet-credit-b181snpr-pooler.c-5.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
  );
}

const sql = neon(getConnectionString());
export const db = drizzle(sql, { schema });
export * from './schema';
