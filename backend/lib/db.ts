import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const databaseKey = process.env.DATABASE_KEY;

if (!databaseUrl || !databaseKey) {
  throw new Error(
    'Database is not configured. Set DATABASE_URL and DATABASE_KEY to the environment.'
  );
}

export const database: SupabaseClient = createClient(databaseUrl, databaseKey);
