'use client'

import { useState } from 'react'
import { RunLog } from '@/lib/types'

export interface PendingRun {
  key: string // runs:<phase>:<week>:<day>
  phaseId: string
  weekNum: number
  day: string
  log: RunLog
  description: string
}

const FEELS: { v: RunLog['feel']; label: string; color: string }[] = [
  { v: 'great', label: 'GREAT', color: '#4ade80' },
  { v: 'ok', label: 'OK', color: '#60a5fa' },
  { v: 'rough', label: 'ROUGH', color: '#f87171' },
]

/* Twenty-second check-in after a synced run: effort, feel, anything that twinged. */
export default function CheckInCard({ run, onSaved }: { run: PendingRun; onSaved: (log: RunLog) => void }) {
  const [rpe, setRpe] = useState<number | null>(null)
  const [feel, setFeel] = useState<RunLog['feel'] | null>(null)
  const [niggle, setNiggle] = useState('')
  const [saving, setSaving] = useState(false)

  const when = new Date(run.log.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long' })
  const stats = [
    run.log.actualTime ? `${run.log.actualTime} min` : null,
    run.log.distance ? `${run.log.distance} km` : null,
    run.log.pacePerKm ? `${run.log.pacePerKm}/km` : null,
    run.log.avgHR ? `${run.log.avgHR} bpm` : null,
  ].filter(Boolean).join(' · ')

  async function save() {
    if (rpe === null || !feel) return
    setSaving(true)
    const log: RunLog = { ...run.log, rpe, feel, niggleNote: niggle.trim() || undefined }
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phaseId: run.phaseId, weekNum: run.weekNum, day: run.day, log }),
      })
      if (res.ok) onSaved(log)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: '#111118', border: '1px solid #60a5fa55', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
      <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px' }}>HOW WAS {when.toUpperCase()}&apos;S RUN?</div>
      <div style={{ color: '#e2e8f0', fontSize: '12px', marginTop: '4px' }}>{run.description}</div>
      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{stats}</div>

      <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '0.5px', marginTop: '12px' }}>EFFORT (1 easy chat · 10 flat out)</div>
      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setRpe(n)}
            style={{
              flex: 1, minWidth: 0, padding: '8px 0', borderRadius: '4px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer',
              background: rpe === n ? rpeColor(n) : '#0a0a0f',
              color: rpe === n ? '#0a0a0f' : '#94a3b8',
              border: `1px solid ${rpe === n ? rpeColor(n) : '#2a2a3a'}`,
              fontWeight: rpe === n ? 'bold' : 'normal',
            }}
          >
            {n}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
        {FEELS.map((f) => (
          <button
            key={f.v}
            onClick={() => setFeel(f.v)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: '4px', fontFamily: 'inherit', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.5px',
              background: feel === f.v ? f.color : '#0a0a0f',
              color: feel === f.v ? '#0a0a0f' : f.color,
              border: `1px solid ${feel === f.v ? f.color : '#2a2a3a'}`,
              fontWeight: 'bold',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <input
        value={niggle}
        onChange={(e) => setNiggle(e.target.value)}
        placeholder="Anything twinge? Leave blank if not"
        style={{ width: '100%', marginTop: '10px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '4px', padding: '7px 8px', color: '#e2e8f0', fontSize: '12px', fontFamily: 'inherit', outline: 'none' }}
      />

      <button
        onClick={save}
        disabled={saving || rpe === null || !feel}
        style={{
          marginTop: '10px', width: '100%', padding: '9px', borderRadius: '4px', border: 'none', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px',
          background: rpe !== null && feel ? '#4ade80' : '#1a1a24',
          color: rpe !== null && feel ? '#0a0a0f' : '#64748b',
          cursor: rpe !== null && feel ? 'pointer' : 'not-allowed',
        }}
      >
        {saving ? 'SAVING…' : 'SAVE CHECK-IN'}
      </button>
    </div>
  )
}

export function rpeColor(n: number): string {
  return n <= 4 ? '#4ade80' : n <= 7 ? '#fbbf24' : '#f87171'
}
