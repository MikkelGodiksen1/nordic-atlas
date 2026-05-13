import { NextResponse } from 'next/server';
import { sql, type LeadRow } from '@/lib/db';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = (await sql`
      SELECT id, created_at, name, company, email, phone, notes,
             category, variant_id, color_id, custom_text, logo_scale,
             remove_white_background, preview_image, status
      FROM leads
      ORDER BY created_at DESC
      LIMIT 200
    `) as LeadRow[];
    return NextResponse.json({ leads: rows });
  } catch (error) {
    console.error('[admin/leads] query failed', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: { id?: number; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.id || !body.status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  }
  const allowed = ['new', 'contacted', 'closed'];
  if (!allowed.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  try {
    await sql`UPDATE leads SET status = ${body.status} WHERE id = ${body.id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/leads] update failed', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
