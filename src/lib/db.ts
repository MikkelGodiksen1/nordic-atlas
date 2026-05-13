import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export interface LeadRow {
  id: number;
  created_at: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  notes: string | null;
  category: string;
  variant_id: string;
  color_id: string;
  custom_text: string | null;
  logo_scale: number | null;
  remove_white_background: boolean | null;
  preview_image: string | null;
  status: string;
}
