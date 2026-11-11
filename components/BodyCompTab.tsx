'use client'

import { useState, useEffect } from 'react'
import { BodyCompEntry } from '@/lib/types'
import { NutritionDay, TYPES, eaten, normaliseDay, todayIso, shiftDays, mondayOf } from '@/lib/nutrition'

// Target line from the nutrition plan (23 Oct 2026): ~0.45 kg/week to 71 kg by 6 Dec.
const TARGET_START = { date: '2026-10-22', kg: 73.8 }
const TARGET_END = { date: '2026-12-06', kg: 71.0 }
const KCAL_PER_KG = 7700

interface WeightPoint { date: string; kg: number; src: 'scales' | 'manual' }

const dayNum = (iso: string) => Math.round(new Date(iso + 'T12:00:00Z').getTime() / 86400000)
export function targetOn(iso: string): number {
  const t = (dayNum(iso) - dayNum(TARGET_START.date)) / (dayNum(TARGET_END.date) - dayNum(TARGET_START.date))
  return TARGET_START.kg + (TARGET_END.kg - TARGET_START.kg) * Math.min(1, Math.max(0, t))
}

// Trailing 7-day mean of the points on or before `iso` (needs at least 3).
function avg7(points: WeightPoint[], iso: string): number | null {
  const from = shiftDays(iso, -6)
  const xs = points.filter((p) => p.date >= from && p.date <= iso)
  if (xs.length < 3) return null
  return xs.reduce((a, p) => a + p.kg, 0) / xs.length
}

export default function BodyCompTab() {
  const [entries, setEntries] = useState<BodyCompEntry[]>([])
  const [scales, setScales] = useState<{ date: string; kg: number }[]>([])
  const [food, setFood] = useState<Record<string, NutritionDay>>({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<BodyCompEntry>>({ date: todayIso() })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEntries()
    fetch('/api/weight', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setScales(Array.isArray(d) ? d : []))
      .catch(() => setScales([]))
    fetch(`/api/nutrition?from=${shiftDays(todayIso(), -42)}&to=${todayIso()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: Record<string, Partial<NutritionDay>>) => {
        const out: Record<string, NutritionDay> = {}
        for (const [date, rec] of Object.entries(d)) out[date] = normaliseDay(date, rec)
        setFood(out)
      })
      .catch(() => setFood({}))
  }, [])

  async function fetchEntries() {
    setLoading(true)
    const res = await fetch('/api/bodycomp', { cache: 'no-store' })
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }

  async function handleSave() {
    if (!form.date || !form.weight) return
    setSaving(true)
    await fetch('/api/bodycomp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    await fetchEntries()
    setForm({ date: todayIso() })
    setSaving(false)
  }

  // One weight per day: a typed entry wins over the scales.
  const byDate = new Map<string, WeightPoint>()
  for (const s of scales) byDate.set(s.date, { date: s.date, kg: s.kg, src: 'scales' })
  for (const e of entries) byDate.set(e.date, { date: e.date, kg: e.weight, src: 'manual' })
  const points = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  const latest = points[points.length - 1]
  const latestAvg = latest ? avg7(points, latest.date) : null
  const twoWeeksAgoAvg = latest ? avg7(points, shiftDays(latest.date, -14)) : null
  const target = latest ? targetOn(latest.date) : null
  const gap = latestAvg !== null && target !== null ? latestAvg - target : null
  const latestEntry = entries[entries.length - 1]

  // Last four complete-ish weeks: what the food log says you ate under maintenance, vs what the scales did.
  const weeks: { label: string; days: number; deficit: number; expected: number; actual: number | null }[] = []
  const thisMon = mondayOf(todayIso())
  for (let w = 4; w >= 1; w--) {
    const start = shiftDays(thisMon, -7 * w)
    const end = shiftDays(start, 6)
    let deficit = 0, days = 0
    for (let d = start; d <= end; d = shiftDays(d, 1)) {
      const rec = food[d]
      if (!rec) continue
      const e = eaten(rec).k
      if (e <= 0) continue
      days++
      deficit += (rec.recovery ? TYPES[rec.type].maint + 400 : TYPES[rec.type].maint) - e
    }
    const a0 = avg7(points, shiftDays(start, -1)), a1 = avg7(points, end)
    weeks.push({
      label: `${new Date(start + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      days,
      deficit,
      expected: -deficit / KCAL_PER_KG,
      actual: a0 !== null && a1 !== null ? a1 - a0 : null,
    })
  }

  const chartPoints = points.filter((p) => p.date >= shiftDays(todayIso(), -56))

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Summary */}
      {latest && (
        <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '6px', padding: '16px', marginBottom: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Stat label="LATEST" value={`${latest.kg.toFixed(1)} kg`} color="#e2e8f0" sub={`${latest.src === 'scales' ? 'scales' : 'typed'} · ${fmtDate(latest.date)}`} />
          {latestAvg !== null && <Stat label="7-DAY AVG" value={`${latestAvg.toFixed(1)} kg`} color="#60a5fa" />}
          {latestAvg !== null && twoWeeksAgoAvg !== null && (
            <Stat label="2 WEEKS" value={`${latestAvg - twoWeeksAgoAvg > 0 ? '+' : ''}${(latestAvg - twoWeeksAgoAvg).toFixed(1)} kg`} color={latestAvg - twoWeeksAgoAvg <= 0 ? '#4ade80' : '#f87171'} />
          )}
          {gap !== null && target !== null && (
            <Stat label="VS TARGET LINE" value={`${gap > 0 ? '+' : ''}${gap.toFixed(1)} kg`} color={gap <= 0.3 ? '#4ade80' : gap <= 0.8 ? '#fbbf24' : '#f87171'} sub={`line says ${target.toFixed(1)} today`} />
          )}
          {latestEntry?.bodyFat && <Stat label="BODY FAT" value={`${latestEntry.bodyFat}%`} color="#fbbf24" sub={fmtDate(latestEntry.date)} />}
        </div>
      )}

      {/* Chart */}
      {chartPoints.length > 1 && (
        <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '6px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '10px' }}>
            WEIGHT — 8 WEEKS · dots scales, line 7-day average, dashed target to 71 kg by 6 Dec
          </div>
          <WeightChart points={chartPoints} />
        </div>
      )}

      {/* Deficit vs scales */}
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '6px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '8px' }}>IS 2,400 THE RIGHT NUMBER?</div>
        <div style={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.5, marginBottom: '10px' }}>
          Each week: what the Fuel log says you ate below maintenance, the loss that should produce (7,700 kcal per kg), and what the 7-day average actually did. If actual keeps beating expected, maintenance is lower than we think and the targets can come down; if it keeps missing, the other way.
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px' }}>
              <th style={th}>W/C</th><th style={th}>DAYS LOGGED</th><th style={th}>DEFICIT</th><th style={th}>EXPECTED</th><th style={th}>ACTUAL</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.label} style={{ borderTop: '1px solid #1a1a24' }}>
                <td style={td}>{w.label}</td>
                <td style={td}>{w.days ? `${w.days}/7` : '—'}</td>
                <td style={td}>{w.days ? `${Math.round(w.deficit).toLocaleString('en-GB')} kcal` : '—'}</td>
                <td style={{ ...td, color: '#94a3b8' }}>{w.days ? `${w.expected.toFixed(2)} kg` : '—'}</td>
                <td style={{ ...td, color: w.actual === null ? '#64748b' : w.actual <= 0 ? '#4ade80' : '#f87171' }}>
                  {w.actual === null ? 'no scales' : `${w.actual > 0 ? '+' : ''}${w.actual.toFixed(2)} kg`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log form (body fat etc. still by hand) */}
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '6px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>LOG BY HAND</div>
        <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '10px' }}>Weight arrives from the Garmin scales via Intervals on its own. Use this for body fat, or a weigh-in the scales missed.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          <Field label="Date" value={form.date ?? ''} onChange={(v) => setForm((f) => ({ ...f, date: v }))} type="date" />
          <Field label="Weight (kg)" value={form.weight?.toString() ?? ''} onChange={(v) => setForm((f) => ({ ...f, weight: Number(v) }))} type="number" />
          <Field label="Body Fat %" value={form.bodyFat?.toString() ?? ''} onChange={(v) => setForm((f) => ({ ...f, bodyFat: Number(v) }))} type="number" />
          <Field label="Muscle (kg)" value={form.muscleMass?.toString() ?? ''} onChange={(v) => setForm((f) => ({ ...f, muscleMass: Number(v) }))} type="number" />
          <Field label="Water %" value={form.bodyWater?.toString() ?? ''} onChange={(v) => setForm((f) => ({ ...f, bodyWater: Number(v) }))} type="number" />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !form.weight}
          style={{
            background: saving || !form.weight ? '#1a1a24' : '#4ade80',
            color: saving || !form.weight ? '#64748b' : '#0a0a0f',
            border: 'none', padding: '7px 20px', borderRadius: '4px', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold',
            cursor: saving || !form.weight ? 'not-allowed' : 'pointer', letterSpacing: '0.5px',
          }}
        >
          {saving ? 'SAVING...' : 'LOG ENTRY'}
        </button>
      </div>

      {/* History */}
      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '24px', fontSize: '12px' }}>LOADING...</div>
      ) : points.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '24px', fontSize: '12px' }}>No weights yet.</div>
      ) : (
        <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '6px', padding: '12px 16px' }}>
          <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '6px' }}>RECENT WEIGH-INS</div>
          {[...points].reverse().slice(0, 14).map((p) => (
            <div key={p.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #1a1a24', fontSize: '11px' }}>
              <span style={{ color: '#94a3b8' }}>{fmtDate(p.date)}</span>
              <span style={{ color: '#64748b' }}>{p.src}</span>
              <span style={{ color: '#e2e8f0' }}>{p.kg.toFixed(1)} kg</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '4px 6px 4px 0', fontWeight: 'normal' }
const td: React.CSSProperties = { padding: '6px 6px 6px 0', color: '#e2e8f0' }
const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

function WeightChart({ points }: { points: WeightPoint[] }) {
  const width = 320, height = 140, padL = 4, padR = 28, padT = 8, padB = 14
  const first = points[0].date, last = points[points.length - 1].date
  const span = Math.max(1, dayNum(last) - dayNum(first))
  const avgs = points.map((p) => ({ date: p.date, kg: avg7(points, p.date) })).filter((a) => a.kg !== null) as { date: string; kg: number }[]
  const targets = [first, last].map((d) => ({ date: d, kg: targetOn(d) }))
  const all = [...points.map((p) => p.kg), ...avgs.map((a) => a.kg), ...targets.map((t) => t.kg)]
  const min = Math.floor(Math.min(...all) * 2) / 2 - 0.5
  const max = Math.ceil(Math.max(...all) * 2) / 2 + 0.5
  const toX = (d: string) => padL + ((dayNum(d) - dayNum(first)) / span) * (width - padL - padR)
  const toY = (v: number) => padT + (1 - (v - min) / (max - min)) * (height - padT - padB)
  const path = (xs: { date: string; kg: number }[]) => xs.map((p, i) => `${i ? 'L' : 'M'}${toX(p.date).toFixed(1)},${toY(p.kg).toFixed(1)}`).join(' ')
  const grid: number[] = []
  for (let v = Math.ceil(min); v <= max; v += 1) grid.push(v)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '150px' }}>
      {grid.map((v) => (
        <g key={v}>
          <line x1={padL} x2={width - padR} y1={toY(v)} y2={toY(v)} stroke="#1a1a24" />
          <text x={width - 2} y={toY(v) + 3} fill="#64748b" fontSize="8" textAnchor="end">{v}</text>
        </g>
      ))}
      <path d={path(targets)} fill="none" stroke="#4ade80" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
      {points.map((p) => (
        <circle key={p.date} cx={toX(p.date)} cy={toY(p.kg)} r={p.src === 'manual' ? 2.6 : 2} fill={p.src === 'manual' ? '#fbbf24' : '#64748b'} />
      ))}
      {avgs.length > 1 && <path d={path(avgs)} fill="none" stroke="#60a5fa" strokeWidth="2" />}
      <text x={padL} y={height - 3} fill="#64748b" fontSize="8">{fmtDate(first)}</text>
      <text x={width - padR} y={height - 3} fill="#64748b" fontSize="8" textAnchor="end">{fmtDate(last)}</text>
    </svg>
  )
}

function Stat({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color, fontSize: '14px', fontWeight: 'bold' }}>{value}</div>
      {sub && <div style={{ color: '#64748b', fontSize: '9px' }}>{sub}</div>}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' }}>{label.toUpperCase()}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '3px', padding: '5px 8px', color: '#e2e8f0', fontSize: '12px', fontFamily: 'inherit', outline: 'none' }}
      />
    </div>
  )
}
