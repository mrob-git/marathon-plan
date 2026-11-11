'use client'

import { useState } from 'react'
import { TrainingSession, RunLog } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  Easy: '#60a5fa',
  Long: '#4ade80',
  Tempo: '#fbbf24',
  Steady: '#2dd4bf',
  'Marathon Pace': '#fb923c',
  Intervals: '#f87171',
  Strides: '#a78bfa',
  Race: '#4ade80',
  Recovery: '#64748b',
}

interface SessionTileProps {
  session: TrainingSession
  log: RunLog | null
  phaseId: string
  weekNum: number
  onSave: (log: RunLog) => Promise<void>
}

export default function SessionTile({ session, log, onSave }: SessionTileProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<RunLog>>(log ?? {})
  const [saving, setSaving] = useState(false)

  const color = TYPE_COLORS[session.type] ?? '#94a3b8'
  const hasLog = !!(log?.actualTime)

  async function handleSave() {
    setSaving(true)
    const runLog: RunLog = {
      date: session.date,
      plannedTime: session.plannedMinutes,
      actualTime: form.actualTime ? Number(form.actualTime) : undefined,
      distance: form.distance ? Number(form.distance) : undefined,
      avgHR: form.avgHR ? Number(form.avgHR) : undefined,
      pacePerKm: form.pacePerKm,
      gapPerKm: form.gapPerKm,
      trainingLoad: form.trainingLoad ? Number(form.trainingLoad) : undefined,
      notes: form.notes,
      rpe: form.rpe ? Number(form.rpe) : undefined,
      feel: form.feel,
      niggleNote: form.niggleNote,
    }
    await onSave(runLog)
    setSaving(false)
    setOpen(false)
  }

  return (
    <div
      style={{
        background: hasLog ? '#071a0e' : '#111118',
        border: `1px solid ${hasLog ? '#4ade80' : '#2a2a3a'}`,
        borderRadius: '6px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onClick={() => setOpen(!open)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px' }}>
              {session.day.toUpperCase()} · {session.date}
            </span>
            {hasLog && (
              <span style={{
                background: '#4ade80',
                color: '#0a0a0f',
                fontSize: '9px',
                fontWeight: 'bold',
                padding: '1px 5px',
                borderRadius: '3px',
                letterSpacing: '0.5px',
              }}>
                LOGGED
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span
              style={{
                background: color + '22',
                color: color,
                border: `1px solid ${color}44`,
                padding: '1px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
              }}
            >
              {session.type.toUpperCase()}
            </span>
            <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{session.description}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#64748b', fontSize: '10px' }}>PLANNED</div>
          <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold' }}>
            {session.plannedMinutes}m
          </div>
        </div>
      </div>

      {/* Logged data preview */}
      {hasLog && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #1a2e1a',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {log?.actualTime && <Stat label="TIME" value={`${log.actualTime}m`} color="#4ade80" />}
          {log?.distance && <Stat label="KM" value={`${log.distance}`} color="#4ade80" />}
          {log?.avgHR && <Stat label="AVG HR" value={`${log.avgHR}`} color="#fbbf24" />}
          {log?.pacePerKm && <Stat label="PACE" value={log.pacePerKm} color="#60a5fa" />}
          {log?.gapPerKm && <Stat label="GAP" value={log.gapPerKm} color="#a78bfa" />}
          {log?.trainingLoad && <Stat label="LOAD" value={`${log.trainingLoad}`} color="#94a3b8" />}
          {log?.rpe && <Stat label="EFFORT" value={`${log.rpe}/10`} color={log.rpe <= 4 ? '#4ade80' : log.rpe <= 7 ? '#fbbf24' : '#f87171'} />}
          {log?.feel && <Stat label="FELT" value={log.feel.toUpperCase()} color={log.feel === 'great' ? '#4ade80' : log.feel === 'rough' ? '#f87171' : '#60a5fa'} />}
        </div>
      )}
      {hasLog && log?.strava && (
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1a2e1a' }}>
          <div style={{ color: '#64748b', fontSize: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
            {log.strava.shoes && <span>{log.strava.shoes}</span>}
            {log.strava.elevation !== undefined && <span>{log.strava.elevation} m up</span>}
            {log.strava.tempC !== undefined && <span>{log.strava.tempC}°C{log.strava.weather ? `, ${log.strava.weather}` : ''}{log.strava.windKph ? `, wind ${log.strava.windKph} km/h` : ''}</span>}
            {log.strava.hrDrift !== undefined && (
              <span style={{ color: log.strava.hrDrift >= 8 ? '#fbbf24' : '#64748b' }}>HR drift {log.strava.hrDrift > 0 ? '+' : ''}{log.strava.hrDrift} bpm</span>
            )}
          </div>
          {log.strava.splits.length > 0 && <Splits splits={log.strava.splits} sessionType={session.type} />}
        </div>
      )}
      {hasLog && log?.niggleNote && (
        <div style={{ color: '#fbbf24', fontSize: '11px', marginTop: '6px' }} onClick={(e) => e.stopPropagation()}>
          Niggle: {log.niggleNote}
        </div>
      )}

      {/* Log form */}
      {open && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #2a2a3a',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <Field
              label="Actual time (min)"
              value={form.actualTime?.toString() ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, actualTime: Number(v) }))}
              type="number"
            />
            <Field
              label="Distance (km)"
              value={form.distance?.toString() ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, distance: Number(v) }))}
              type="number"
            />
            <Field
              label="Avg HR (bpm)"
              value={form.avgHR?.toString() ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, avgHR: Number(v) }))}
              type="number"
            />
            <Field
              label="Pace /km (mm:ss)"
              value={form.pacePerKm ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, pacePerKm: v }))}
            />
            <Field
              label="GAP /km (mm:ss)"
              value={form.gapPerKm ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, gapPerKm: v }))}
            />
            <Field
              label="Training load"
              value={form.trainingLoad?.toString() ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, trainingLoad: Number(v) }))}
              type="number"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
            <Field
              label="Effort 1-10"
              value={form.rpe?.toString() ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, rpe: Number(v) }))}
              type="number"
            />
            <div>
              <label style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' }}>FELT</label>
              <select
                value={form.feel ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, feel: (e.target.value || undefined) as RunLog['feel'] }))}
                style={{ width: '100%', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '3px', padding: '4px 8px', color: '#e2e8f0', fontSize: '12px', fontFamily: 'inherit', outline: 'none' }}
              >
                <option value="">—</option>
                <option value="great">Great</option>
                <option value="ok">OK</option>
                <option value="rough">Rough</option>
              </select>
            </div>
            <Field
              label="Niggle"
              value={form.niggleNote ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, niggleNote: v }))}
            />
          </div>
          <Field
            label="Notes"
            value={form.notes ?? ''}
            onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: '#4ade80',
                color: '#0a0a0f',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              {saving ? 'SAVING...' : 'SAVE'}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                color: '#64748b',
                border: '1px solid #2a2a3a',
                padding: '6px 16px',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// HR ceiling for colouring splits: easy days 150, steady 156, quality 163.
function capFor(type: string): number | null {
  if (['Easy', 'Long', 'Strides', 'Fartlek', 'Recovery'].includes(type)) return 150
  if (type === 'Steady') return 156
  if (['Intervals', 'Marathon Pace', 'Tempo'].includes(type)) return 163
  return null
}

const pace = (secs: number) => `${Math.floor(secs / 60)}:${String(Math.round(secs % 60)).padStart(2, '0')}`

function Splits({ splits, sessionType }: { splits: { km: number; secs: number; hr?: number }[]; sessionType: string }) {
  const cap = capFor(sessionType)
  const fastest = Math.min(...splits.map((s) => s.secs))
  const slowest = Math.max(...splits.map((s) => s.secs))
  const range = Math.max(30, slowest - fastest)
  return (
    <div style={{ display: 'flex', gap: '3px', marginTop: '8px', alignItems: 'flex-end', height: '58px', overflowX: 'auto' }}>
      {splits.map((s) => {
        const h = 14 + ((slowest - s.secs) / range) * 26 // faster = taller
        const over = cap !== null && s.hr !== undefined && s.hr > cap
        return (
          <div key={s.km} style={{ flex: '1 0 22px', minWidth: '22px', textAlign: 'center' }}>
            <div style={{ color: over ? '#fbbf24' : '#64748b', fontSize: '8px', lineHeight: 1 }}>{s.hr ?? ''}</div>
            <div style={{ height: `${h}px`, background: over ? '#fbbf2466' : '#60a5fa55', borderTop: `2px solid ${over ? '#fbbf24' : '#60a5fa'}`, borderRadius: '2px 2px 0 0', marginTop: '2px' }} />
            <div style={{ color: '#94a3b8', fontSize: '8px', lineHeight: 1.2, marginTop: '2px' }}>{pace(s.secs)}</div>
          </div>
        )
      })}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color, fontSize: '12px', fontWeight: 'bold' }}>{value}</div>
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
        }}
      />
    </div>
  )
}
