'use client'

import { useState, useEffect, useCallback } from 'react'
import { TRAINING_PLAN } from '@/lib/trainingData'
import { RunLog } from '@/lib/types'
import SessionTile from './SessionTile'

type PhaseKey = 'base' | 'development' | 'peak' | 'taper'

function getCurrentPhaseAndWeek(): { phaseId: PhaseKey; weekIdx: number } {
  const today = new Date().toISOString().split('T')[0]
  for (const [id, phase] of Object.entries(TRAINING_PLAN)) {
    for (let i = 0; i < phase.weeks.length; i++) {
      const wk = phase.weeks[i]
      const weekStart = wk.startDate
      const nextWeekStart =
        i + 1 < phase.weeks.length
          ? phase.weeks[i + 1].startDate
          : phase.endDate
      if (today >= weekStart && today < nextWeekStart) {
        return { phaseId: id as PhaseKey, weekIdx: i }
      }
    }
  }
  return { phaseId: 'base', weekIdx: 0 }
}

export default function ScheduleTab({ refreshKey }: { refreshKey?: number }) {
  const { phaseId: defaultPhase, weekIdx: defaultWeek } = getCurrentPhaseAndWeek()

  const [selectedPhase, setSelectedPhase] = useState<PhaseKey>(defaultPhase)
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek)
  const [logs, setLogs] = useState<Record<string, RunLog>>({})
  const [loading, setLoading] = useState(false)

  const phase = TRAINING_PLAN[selectedPhase]
  const week = phase.weeks[selectedWeek]

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/runs?phase=${selectedPhase}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const keys = Object.keys(data)
        console.log(`[ScheduleTab] fetchLogs phase=${selectedPhase} — got ${keys.length} keys:`, keys)
        if (keys.length > 0) {
          console.log('[ScheduleTab] Sample entry:', keys[0], '->', JSON.stringify(data[keys[0]]))
        }
        setLogs(data)
      } else {
        console.log(`[ScheduleTab] fetchLogs failed: ${res.status}`)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedPhase])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs, refreshKey])

  async function handleSave(weekNum: number, day: string, log: RunLog) {
    await fetch('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phaseId: selectedPhase, weekNum, day, log }),
    })
    await fetchLogs()
  }

  // Summary stats for this week
  const weekLogs = week.sessions.map((s) => {
    const key = `runs:${selectedPhase}:${week.weekNumber}:${s.day}`
    return logs[key] ?? null
  })
  const loggedCount = weekLogs.filter((l) => l?.actualTime).length
  const totalPlanned = week.sessions.reduce((acc, s) => acc + s.plannedMinutes, 0)
  const totalActual = weekLogs.reduce((acc, l) => acc + (l?.actualTime ?? 0), 0)
  const avgHR =
    weekLogs.filter((l) => l?.avgHR).length > 0
      ? Math.round(
          weekLogs.reduce((acc, l) => acc + (l?.avgHR ?? 0), 0) /
            weekLogs.filter((l) => l?.avgHR).length
        )
      : null

  const completionPct = Math.round((loggedCount / week.sessions.length) * 100)

  return (
    <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Phase selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(Object.keys(TRAINING_PLAN) as PhaseKey[]).map((pid) => (
          <button
            key={pid}
            onClick={() => {
              setSelectedPhase(pid)
              setSelectedWeek(0)
            }}
            style={{
              background: selectedPhase === pid ? '#4ade80' : '#1a1a24',
              color: selectedPhase === pid ? '#0a0a0f' : '#94a3b8',
              border: `1px solid ${selectedPhase === pid ? '#4ade80' : '#2a2a3a'}`,
              padding: '6px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}
          >
            {TRAINING_PLAN[pid].name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Week selector */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {phase.weeks.map((wk, i) => {
          const wkLogs = wk.sessions.map((s) => logs[`runs:${selectedPhase}:${wk.weekNumber}:${s.day}`] ?? null)
          const done = wkLogs.filter((l) => l?.actualTime).length
          const isCurrentWeek = i === defaultWeek && selectedPhase === defaultPhase
          return (
            <button
              key={i}
              onClick={() => setSelectedWeek(i)}
              title={`Week of ${wk.startDate}`}
              style={{
                background: selectedWeek === i ? '#4ade80' : done > 0 ? '#0f1f14' : '#1a1a24',
                color: selectedWeek === i ? '#0a0a0f' : done > 0 ? '#4ade80' : '#94a3b8',
                border: `1px solid ${selectedWeek === i ? '#4ade80' : isCurrentWeek ? '#4ade8066' : done > 0 ? '#166534' : '#2a2a3a'}`,
                width: '32px',
                height: '28px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '10px',
                fontWeight: isCurrentWeek ? 'bold' : 'normal',
              }}
            >
              {wk.weekNumber}
            </button>
          )
        })}
      </div>

      {/* Week header */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ color: '#4ade80', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            {phase.name} — Week {week.weekNumber}
          </div>
          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
            w/c {week.startDate}
          </div>
          {week.note && (
            <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px', fontStyle: 'italic', maxWidth: '480px' }}>
              {week.note}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <Stat label="PLANNED" value={`${totalPlanned}m`} color="#94a3b8" />
          <Stat label="ACTUAL" value={totalActual > 0 ? `${totalActual}m` : '—'} color="#4ade80" />
          <Stat label="DONE" value={`${loggedCount}/${week.sessions.length}`} color="#fbbf24" />
          <Stat label="COMPLETION" value={`${completionPct}%`} color={completionPct >= 100 ? '#4ade80' : completionPct > 50 ? '#fbbf24' : '#f87171'} />
          {avgHR && <Stat label="AVG HR" value={`${avgHR}`} color="#f87171" />}
        </div>
      </div>

      {/* Sessions */}
      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '32px', fontSize: '12px' }}>
          LOADING...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {week.sessions.map((session) => {
            const key = `runs:${selectedPhase}:${week.weekNumber}:${session.day}`
            return (
              <SessionTile
                key={key}
                session={session}
                log={logs[key] ?? null}
                phaseId={selectedPhase}
                weekNum={week.weekNumber}
                onSave={(log) => handleSave(week.weekNumber, session.day, log)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color, fontSize: '13px', fontWeight: 'bold' }}>{value}</div>
    </div>
  )
}
