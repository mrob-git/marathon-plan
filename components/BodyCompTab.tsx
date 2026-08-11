'use client'

import { useState, useEffect } from 'react'
import { BodyCompEntry } from '@/lib/types'

export default function BodyCompTab() {
  const [entries, setEntries] = useState<BodyCompEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<BodyCompEntry>>({ date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    setLoading(true)
    const res = await fetch('/api/bodycomp')
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
    setForm({ date: new Date().toISOString().split('T')[0] })
    setSaving(false)
  }

  const latest = entries[entries.length - 1]
  const first = entries[0]

  const weightChange = latest && first && entries.length > 1
    ? (latest.weight - first.weight).toFixed(1)
    : null
  const bfChange = latest?.bodyFat && first?.bodyFat && entries.length > 1
    ? (latest.bodyFat - first.bodyFat).toFixed(1)
    : null

  // Chart data
  const chartEntries = entries.slice(-20)

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Summary */}
      {latest && (
        <div
          style={{
            background: '#111118',
            border: '1px solid #2a2a3a',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <Stat label="WEIGHT" value={`${latest.weight} kg`} color="#e2e8f0" />
          {latest.bodyFat && <Stat label="BODY FAT" value={`${latest.bodyFat}%`} color="#fbbf24" />}
          {latest.muscleMass && <Stat label="MUSCLE MASS" value={`${latest.muscleMass} kg`} color="#4ade80" />}
          {latest.bodyWater && <Stat label="BODY WATER" value={`${latest.bodyWater}%`} color="#60a5fa" />}
          {weightChange !== null && (
            <Stat
              label="WEIGHT CHANGE"
              value={`${Number(weightChange) > 0 ? '+' : ''}${weightChange} kg`}
              color={Number(weightChange) <= 0 ? '#4ade80' : '#f87171'}
            />
          )}
          {bfChange !== null && (
            <Stat
              label="BF% CHANGE"
              value={`${Number(bfChange) > 0 ? '+' : ''}${bfChange}%`}
              color={Number(bfChange) <= 0 ? '#4ade80' : '#fbbf24'}
            />
          )}
        </div>
      )}

      {/* Log form */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', marginBottom: '12px' }}>
          LOG WEIGH-IN
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
          <Field
            label="Date"
            value={form.date ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, date: v }))}
            type="date"
          />
          <Field
            label="Weight (kg)"
            value={form.weight?.toString() ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, weight: Number(v) }))}
            type="number"
          />
          <Field
            label="Body Fat %"
            value={form.bodyFat?.toString() ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, bodyFat: Number(v) }))}
            type="number"
          />
          <Field
            label="Muscle Mass (kg)"
            value={form.muscleMass?.toString() ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, muscleMass: Number(v) }))}
            type="number"
          />
          <Field
            label="Body Water %"
            value={form.bodyWater?.toString() ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, bodyWater: Number(v) }))}
            type="number"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !form.weight}
          style={{
            background: saving || !form.weight ? '#1a1a24' : '#4ade80',
            color: saving || !form.weight ? '#64748b' : '#0a0a0f',
            border: 'none',
            padding: '7px 20px',
            borderRadius: '4px',
            fontFamily: 'inherit',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: saving || !form.weight ? 'not-allowed' : 'pointer',
            letterSpacing: '0.5px',
          }}
        >
          {saving ? 'SAVING...' : 'LOG ENTRY'}
        </button>
      </div>

      {/* Chart */}
      {chartEntries.length > 1 && (
        <div
          style={{
            background: '#111118',
            border: '1px solid #2a2a3a',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', marginBottom: '12px' }}>
            WEIGHT TREND
          </div>
          <WeightChart entries={chartEntries} />
        </div>
      )}

      {/* History table */}
      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '32px', fontSize: '12px' }}>LOADING...</div>
      ) : entries.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '32px', fontSize: '12px' }}>
          No entries yet. Log your first weigh-in above.
        </div>
      ) : (
        <div
          style={{
            background: '#111118',
            border: '1px solid #2a2a3a',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
                  {['DATE', 'WEIGHT', 'BODY FAT', 'MUSCLE', 'WATER'].map((h) => (
                    <th
                      key={h}
                      style={{ color: '#64748b', fontSize: '10px', padding: '10px 12px', textAlign: 'left', letterSpacing: '0.5px' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...entries].reverse().map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1a24' }}>
                    <td style={{ color: '#64748b', padding: '8px 12px' }}>{e.date}</td>
                    <td style={{ color: '#e2e8f0', padding: '8px 12px', fontWeight: 'bold' }}>{e.weight} kg</td>
                    <td style={{ color: '#fbbf24', padding: '8px 12px' }}>{e.bodyFat ? `${e.bodyFat}%` : '—'}</td>
                    <td style={{ color: '#4ade80', padding: '8px 12px' }}>{e.muscleMass ? `${e.muscleMass} kg` : '—'}</td>
                    <td style={{ color: '#60a5fa', padding: '8px 12px' }}>{e.bodyWater ? `${e.bodyWater}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function WeightChart({ entries }: { entries: BodyCompEntry[] }) {
  const weights = entries.map((e) => e.weight)
  const min = Math.min(...weights) - 1
  const max = Math.max(...weights) + 1
  const height = 80
  const width = 100

  const points = weights.map((w, i) => {
    const x = (i / Math.max(weights.length - 1, 1)) * width
    const y = height - ((w - min) / (max - min)) * height
    return `${x},${y}`
  })

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '80px', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#4ade80"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {points.map((pt, i) => {
          const [x, y] = pt.split(',').map(Number)
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#4ade80" />
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        <span style={{ color: '#64748b', fontSize: '9px' }}>{entries[0]?.date}</span>
        <span style={{ color: '#64748b', fontSize: '9px' }}>{entries[entries.length - 1]?.date}</span>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color, fontSize: '16px', fontWeight: 'bold' }}>{value}</div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' }}>
        {label.toUpperCase()}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={type === 'number' ? '0.1' : undefined}
        style={{
          width: '100%',
          background: '#0a0a0f',
          border: '1px solid #2a2a3a',
          borderRadius: '3px',
          padding: '4px 8px',
          color: '#e2e8f0',
          fontSize: '12px',
          fontFamily: 'inherit',
          outline: 'none',
          colorScheme: 'dark',
        }}
      />
    </div>
  )
}
