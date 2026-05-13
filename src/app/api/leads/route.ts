import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

interface SubmitBody {
  name: string;
  company: string;
  email: string;
  phone?: string;
  notes?: string;
  category: string;
  variantId: string;
  colorId: string;
  customText?: string;
  logoScale?: number;
  removeWhiteBackground?: boolean;
  previewImage?: string;
}

export async function POST(request: Request) {
  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name?.trim() || !body.email?.trim() || !body.company?.trim()) {
    return NextResponse.json({ error: 'Name, company and email are required' }, { status: 400 });
  }

  try {
    const rows = await sql`
      INSERT INTO leads (
        name, company, email, phone, notes,
        category, variant_id, color_id, custom_text,
        logo_scale, remove_white_background, preview_image
      ) VALUES (
        ${body.name.trim()},
        ${body.company.trim()},
        ${body.email.trim()},
        ${body.phone?.trim() ?? null},
        ${body.notes?.trim() ?? null},
        ${body.category},
        ${body.variantId},
        ${body.colorId},
        ${body.customText ?? null},
        ${body.logoScale ?? null},
        ${body.removeWhiteBackground ?? null},
        ${body.previewImage ?? null}
      )
      RETURNING id, created_at
    `;
    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (error) {
    console.error('[leads] insert failed', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
