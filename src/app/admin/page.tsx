import { redirect } from 'next/navigation';
import { sql, type LeadRow } from '@/lib/db';
import { isAdmin } from '@/lib/admin-auth';
import { AdminDashboard } from './AdminDashboard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect('/admin/login');
  }

  const leads = (await sql`
    SELECT id, created_at, name, company, email, phone, notes,
           category, variant_id, color_id, custom_text, logo_scale,
           remove_white_background, preview_image, status
    FROM leads
    ORDER BY created_at DESC
    LIMIT 200
  `) as LeadRow[];

  return <AdminDashboard initialLeads={leads} />;
}
