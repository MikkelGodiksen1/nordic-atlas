'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LeadRow } from '@/lib/db';

const STATUS_LABELS: Record<string, string> = {
  new: 'Ny',
  contacted: 'Kontaktet',
  closed: 'Lukket',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-800',
  contacted: 'bg-amber-100 text-amber-800',
  closed: 'bg-slate-200 text-slate-700',
};

export function AdminDashboard({ initialLeads }: { initialLeads: LeadRow[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [selected, setSelected] = useState<LeadRow | null>(null);

  async function updateStatus(id: number, status: string) {
    const res = await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      if (selected?.id === id) setSelected({ ...selected, status });
    }
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Nordic Atlas — Leads</h1>
            <p className="text-sm text-slate-500">{leads.length} samlede henvendelser</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5"
          >
            Log ud
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {leads.length === 0 ? (
          <p className="text-center text-slate-500 py-20">Ingen leads endnu.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Dato</th>
                  <th className="text-left px-4 py-3 font-medium">Navn</th>
                  <th className="text-left px-4 py-3 font-medium">Firma</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Telefon</th>
                  <th className="text-left px-4 py-3 font-medium">Produkt</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Detaljer</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleString('da-DK', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                    <td className="px-4 py-3 text-slate-700">{lead.company}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${lead.email}`} className="text-emerald-700 hover:underline">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{lead.variant_id}</div>
                      <div className="text-xs text-slate-400">{lead.color_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${STATUS_COLORS[lead.status] ?? STATUS_COLORS.new}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(lead)}
                        className="text-emerald-700 hover:underline font-medium"
                      >
                        Se preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2>
                <p className="text-sm text-slate-500">{selected.company}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Kontakt</h3>
                <dl className="text-sm space-y-1">
                  <div className="flex gap-2">
                    <dt className="text-slate-500 w-20">Email:</dt>
                    <dd><a href={`mailto:${selected.email}`} className="text-emerald-700 hover:underline">{selected.email}</a></dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500 w-20">Telefon:</dt>
                    <dd>{selected.phone ?? '—'}</dd>
                  </div>
                </dl>
                <h3 className="text-sm font-medium text-slate-700 mt-5 mb-2">Konfiguration</h3>
                <dl className="text-sm space-y-1">
                  <div className="flex gap-2">
                    <dt className="text-slate-500 w-32">Kategori:</dt>
                    <dd>{selected.category}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500 w-32">Variant:</dt>
                    <dd>{selected.variant_id}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500 w-32">Farve:</dt>
                    <dd>{selected.color_id}</dd>
                  </div>
                  {selected.custom_text && (
                    <div className="flex gap-2">
                      <dt className="text-slate-500 w-32">Tekst:</dt>
                      <dd>&quot;{selected.custom_text}&quot;</dd>
                    </div>
                  )}
                </dl>
                {selected.notes && (
                  <>
                    <h3 className="text-sm font-medium text-slate-700 mt-5 mb-2">Noter</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.notes}</p>
                  </>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Preview</h3>
                {selected.preview_image ? (
                  <a href={selected.preview_image} download={`preview-${selected.id}.png`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.preview_image}
                      alt="Bag preview"
                      className="w-full rounded-lg border border-slate-200"
                    />
                    <span className="block text-xs text-emerald-700 mt-2 hover:underline">
                      Download original
                    </span>
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">Intet preview gemt</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
