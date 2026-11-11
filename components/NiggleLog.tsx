'use client'

import { useState } from 'react'
import { NiggleEntry, NiggleSite } from '@/lib/types'

export const SITE_LABEL: Record<NiggleSite, string> = {
  achilles: 'Achilles',
  calf: 'Calf / soleus',
  peroneal: 'Peroneal (outer ankle)',
  knee: 'Knee',
  hamstring: 'Hamstring',
  hip: 'Hip / glute',
  shin: 'Shin',
  foot: 'Foot',
  other: 'Other',
}
const SITES = Object.keys(SITE_LABEL) as NiggleSite[]

export const severityColor = (n: number) => (n >= 5 ? '#f87171' : n >= 3 ? '#fbbf24' : '#4ade80')

export function describe(e: NiggleEntry): string {
  const side = e.side ? `${e.side === 'L' ? 'Left' : 'Right'} ` : ''
  return `${side}${SITE_LABEL[e.site] ?? e.site}`
}

const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export function daysSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso + 'T12:00:00').getTime()) / 86400000))
}

/* Card used on the Today screen and at the top of the Injury tab. */
export default function NigglesCard({
  log, onChange, compact = true,
}: {
  log: NiggleEntry[] | null
  onChange: (log: NiggleEntry[]) => void
  compact?: boolean
}) {
  const [adding, setAdding] = useState(false)
  const [site, setSite] = useState<NiggleSite>('achilles')
  const [side, setSide] = useState<'' | 'L' | 'R'>('')
  const [severity, setSeverity] = useState(2)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const entries = log ?? []
  const open = entries.filter((e) => !e.resolvedDate)
  const resolved = entries.filter((e) => e.resolvedDate)
  const clear = open.length === 0
  const worst = open.reduce((m, e) => Math.max(m, e.severity), 0)

  async function add() {
    setBusy(true)
    try {
      const res = await fetch('/api/niggles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, side, severity, note }),
      })
      if (res.ok) {
        const entry = (await res.json()) as NiggleEntry
        onChange([entry, ...entries])
        setAdding(false)
        setNote('')
        setSeverity(2)
      }
    } finally {
      setBusy(false)
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true)
    try {
      const res = await fetch('/api/niggles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      })
      if (res.ok) {
        const updated = (await res.json()) as NiggleEntry
        onChange(entries.map((e) => (e.id === id ? updated : e)))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ background: '#111118', border: `1px solid ${clear ? '#2a2a3a' : severityColor(worst) + '55'}`, borderRadius: '8px', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px' }}>NIGGLES</div>
        <div style={{
          background: clear ? '#0f2a1a' : worst >= 5 ? '#2a0f0f' : '#2a1f0a',
          color: clear ? '#4ade80' : severityColor(worst),
          fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold',
        }}>
          {clear ? 'ALL CLEAR' : `${open.length} OPEN · WORST ${worst}/10`}
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} style={btnGhost}>ADD</button>
        )}
      </div>

      {log === null && <div style={{ color: '#64748b', fontSize: '11px', marginTop: '6px' }}>Loading…</div>}

      {log !== null && clear && !adding && (
        <div style={{ color: '#64748b', fontSize: '11px', marginTop: '6px', lineHeight: 1.5 }}>
          Nothing open. Log anything that twinges, even 1/10, so the weekly review and the Dev 11 gate see it.
          {resolved.length > 0 && ` Last resolved: ${describe(resolved[0])} on ${fmtDate(resolved[0].resolvedDate!)}.`}
        </div>
      )}

      {open.map((e) => (
        <div key={e.id} style={{ marginTop: '10px', padding: '8px 10px', background: '#1a1a24', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: severityColor(e.severity), fontWeight: 'bold', fontSize: '13px' }}>{e.severity}/10</span>
            <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{describe(e)}</span>
            <span style={{ color: '#64748b', fontSize: '10px' }}>since {fmtDate(e.date)} ({daysSince(e.date)}d)</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
              <button disabled={busy} onClick={() => patch(e.id, { severity: Math.max(0, e.severity - 1) })} style={btnGhost} title="Better">−</button>
              <button disabled={busy} onClick={() => patch(e.id, { severity: Math.min(10, e.severity + 1) })} style={btnGhost} title="Worse">+</button>
              <button disabled={busy} onClick={() => patch(e.id, { resolve: true })} style={{ ...btnGhost, color: '#4ade80', borderColor: '#166534' }}>GONE</button>
            </span>
          </div>
          {e.note && <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', lineHeight: 1.4 }}>{e.note}</div>}
        </div>
      ))}

      {adding && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#1a1a24', borderRadius: '6px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {SITES.map((s) => (
              <button key={s} onClick={() => setSite(s)} style={{ ...chip, ...(site === s ? chipOn : {}) }}>{SITE_LABEL[s]}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {(['L', 'R', ''] as const).map((v) => (
              <button key={v || 'none'} onClick={() => setSide(v)} style={{ ...chip, ...(side === v ? chipOn : {}) }}>{v === 'L' ? 'Left' : v === 'R' ? 'Right' : 'Both / n/a'}</button>
            ))}
            <span style={{ color: '#64748b', fontSize: '10px', marginLeft: '8px' }}>PAIN</span>
            <input type="range" min={0} max={10} value={severity} onChange={(ev) => setSeverity(Number(ev.target.value))} style={{ flex: '1 1 100px', accentColor: severityColor(severity) }} />
            <span style={{ color: severityColor(severity), fontWeight: 'bold', fontSize: '13px', width: '36px' }}>{severity}/10</span>
          </div>
          <input
            value={note}
            onChange={(ev) => setNote(ev.target.value)}
            placeholder="When does it hurt? e.g. first steps, stairs, fine once warm"
            style={{ width: '100%', marginTop: '8px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '4px', padding: '6px 8px', color: '#e2e8f0', fontSize: '12px', fontFamily: 'inherit', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button onClick={add} disabled={busy} style={btnPrimary}>{busy ? '…' : 'LOG IT'}</button>
            <button onClick={() => setAdding(false)} style={{ ...btnGhost, border: 'none' }}>cancel</button>
          </div>
        </div>
      )}

      {!compact && resolved.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>RESOLVED</div>
          {resolved.map((e) => (
            <div key={e.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #1a1a24', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{fmtDate(e.date)} → {fmtDate(e.resolvedDate!)}</span>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>{describe(e)}, peaked {e.severity}/10{e.note ? ` · ${e.note}` : ''}</span>
              <button disabled={busy} onClick={() => patch(e.id, { reopen: true })} style={{ ...btnGhost, marginLeft: 'auto' }}>REOPEN</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const btnGhost: React.CSSProperties = {
  marginLeft: 'auto', background: 'transparent', border: '1px solid #2a2a3a', color: '#94a3b8',
  borderRadius: '4px', padding: '3px 8px', fontFamily: 'inherit', fontSize: '10px', cursor: 'pointer',
}
const btnPrimary: React.CSSProperties = {
  background: '#4ade80', color: '#0a0a0f', border: 'none', borderRadius: '4px', padding: '6px 12px',
  fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
}
const chip: React.CSSProperties = {
  background: '#0a0a0f', border: '1px solid #2a2a3a', color: '#94a3b8', borderRadius: '12px',
  padding: '4px 10px', fontFamily: 'inherit', fontSize: '11px', cursor: 'pointer',
}
const chipOn: React.CSSProperties = { background: '#4ade80', borderColor: '#4ade80', color: '#0a0a0f', fontWeight: 'bold' }
