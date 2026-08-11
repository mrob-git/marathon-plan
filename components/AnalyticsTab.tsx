'use client'

import { useState, useEffect } from 'react'
import { TRAINING_PLAN } from '@/lib/trainingData'
import { RunLog } from '@/lib/types'

type PhaseKey = 'base' | 'development' | 'peak' | 'taper'

export default function AnalyticsTab() {
  const [allLogs, setAllLogs] = useState<Record<string, Record<string, RunLog>>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const phases: PhaseKey[] = ['base', 'development', 'peak', 'taper']
      const results: Record<string, Record<string, RunLog>> = {}
      await Promise.all(
        phases.map(async (phase) => {
          const res = await fetch(`/api/runs?phase=${phase}`)
          if (res.ok) results[phase] = await res.json()
          else results[phase] = {}
        })
      )
      setAllLogs(results)
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div style={{ color: '#64748b', textAlign: 'center', padding: '64px', fontSize: '12px' }}>
        LOADING ANALYTICS...
      </div>
    )
  }

  // Build week-by-week data across all phases
  interface WeekData {
    label: string
    planned: number
    actual: number
    sessions: number
    logged: number
    hrValues: number[]
  }
  const weekData: WeekData[] = []

  for (const [phaseId, phase] of Object.entries(TRAINING_PLAN)) {
    const phaseLogs = allLogs[phaseId] ?? {}
    for (const wk of phase.weeks) {
      const planned = wk.sessions.reduce((a, s) => a + s.plannedMinutes, 0)
      let actual = 0
      let logged = 0
      const hrValues: number[] = []
      for (const s of wk.sessions) {
        const key = `runs:${phaseId}:${wk.weekNumber}:${s.day}`
        const log = phaseLogs[key]
        if (log?.actualTime) {
          actual += log.actualTime
          logged++
        }
        if (log?.avgHR) hrValues.push(log.avgHR)
      }
      weekData.push({
        label: `${phaseId.slice(0, 3).toUpperCase()} W${wk.weekNumber}`,
        planned,
        actual,
        sessions: wk.sessions.length,
        logged,
        hrValues,
      })
    }
  }

  const loggedWeeks = weekData.filter((w) => w.actual > 0)
  const allHR = weekData.flatMap((w) => w.hrValues)

  const totalPlanned = loggedWeeks.reduce((a, w) => a + w.planned, 0)
  const totalActual = loggedWeeks.reduce((a, w) => a + w.actual, 0)
  const completionPct = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0
  const avgHR = allHR.length ? Math.round(allHR.reduce((a, v) => a + v, 0) / allHR.length) : null
  const totalSessions = weekData.reduce((a, w) => a + w.logged, 0)

  // Show the last 20 weeks of data for charts
  const chartData = weekData.slice(-20)

  return (
    <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Summary strip */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
        }}
      >
        <Stat label="LOGGED TIME" value={`${Math.round(totalActual / 60)}h ${totalActual % 60}m`} color="#4ade80" />
        <Stat label="COMPLETION" value={`${completionPct}%`} color={completionPct >= 90 ? '#4ade80' : completionPct >= 70 ? '#fbbf24' : '#f87171'} />
        <Stat label="SESSIONS DONE" value={`${totalSessions}`} color="#60a5fa" />
        <Stat label="AVG HR (all)" value={avgHR ? `${avgHR} bpm` : '—'} color="#fbbf24" />
        <Stat label="WEEKS WITH DATA" value={`${loggedWeeks.length}`} color="#a78bfa" />
      </div>

      {/* Planned vs Actual bar chart */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>
          PLANNED VS ACTUAL VOLUME (last 20 weeks)
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', background: '#2a4a3a', borderRadius: '2px' }} />
            <span style={{ color: '#64748b', fontSize: '10px' }}>PLANNED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '2px' }} />
            <span style={{ color: '#64748b', fontSize: '10px' }}>ACTUAL</span>
          </div>
        </div>
        <PlannedActualChart data={chartData} />
        <div
          style={{
            display: 'flex',
            gap: '2px',
            marginTop: '4px',
            overflowX: 'auto',
          }}
        >
          {chartData.map((w, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: '28px',
                color: '#64748b',
                fontSize: '8px',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={w.label}
            >
              {w.label}
            </div>
          ))}
        </div>
      </div>

      {/* HR trend */}
      {allHR.length > 0 && (
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
            AVG HR TREND (per week with data)
          </div>
          <HRTrendChart weekData={weekData} />
        </div>
      )}

      {/* Phase completion table */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', marginBottom: '12px' }}>
          BY PHASE
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
              {['PHASE', 'PLANNED', 'ACTUAL', 'COMPLETION', 'SESSIONS'].map((h) => (
                <th
                  key={h}
                  style={{ color: '#64748b', fontSize: '10px', letterSpacing: '0.5px', textAlign: 'left', padding: '4px 8px 8px 0' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(TRAINING_PLAN).map(([phaseId, phase]) => {
              const phaseLogs = allLogs[phaseId] ?? {}
              let planned = 0, actual = 0, done = 0, total = 0
              for (const wk of phase.weeks) {
                for (const s of wk.sessions) {
                  planned += s.plannedMinutes
                  total++
                  const key = `runs:${phaseId}:${wk.weekNumber}:${s.day}`
                  const log = phaseLogs[key]
                  if (log?.actualTime) {
                    actual += log.actualTime
                    done++
                  }
                }
              }
              const pct = planned > 0 ? Math.round((actual / planned) * 100) : 0
              return (
                <tr key={phaseId} style={{ borderBottom: '1px solid #1a1a24' }}>
                  <td style={{ color: '#4ade80', padding: '8px 8px 8px 0', fontWeight: 'bold' }}>{phase.name}</td>
                  <td style={{ color: '#e2e8f0', padding: '8px 8px 8px 0' }}>{Math.round(planned / 60)}h</td>
                  <td style={{ color: '#4ade80', padding: '8px 8px 8px 0' }}>{actual > 0 ? `${Math.round(actual / 60)}h` : '—'}</td>
                  <td style={{ color: pct >= 90 ? '#4ade80' : pct > 0 ? '#fbbf24' : '#64748b', padding: '8px 8px 8px 0' }}>
                    {pct > 0 ? `${pct}%` : '—'}
                  </td>
                  <td style={{ color: '#94a3b8', padding: '8px 8px 8px 0' }}>{done}/{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface ChartWeek {
  planned: number
  actual: number
  hrValues: number[]
}

function PlannedActualChart({ data }: { data: ChartWeek[] }) {
  const max = Math.max(...data.map((d) => Math.max(d.planned, d.actual)), 1)
  const height = 100

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: `${height}px` }}>
      {data.map((w, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', gap: '1px', alignItems: 'flex-end', height: '100%' }}>
          <div
            title={`Planned: ${w.planned}m`}
            style={{
              flex: 1,
              background: '#2a4a3a',
              height: `${(w.planned / max) * height}px`,
              minHeight: '2px',
              borderRadius: '1px 1px 0 0',
            }}
          />
          {w.actual > 0 && (
            <div
              title={`Actual: ${w.actual}m`}
              style={{
                flex: 1,
                background: w.actual >= w.planned * 0.95 ? '#4ade80' : '#fbbf24',
                height: `${(w.actual / max) * height}px`,
                minHeight: '2px',
                borderRadius: '1px 1px 0 0',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function HRTrendChart({ weekData }: { weekData: ChartWeek[] }) {
  const weeksWithHR = weekData.filter((w) => w.hrValues.length > 0)
  if (!weeksWithHR.length) return null

  const avgHRs = weeksWithHR.map((w) => Math.round(w.hrValues.reduce((a, v) => a + v, 0) / w.hrValues.length))
  const min = Math.min(...avgHRs) - 5
  const max = Math.max(...avgHRs) + 5
  const height = 80
  const width = 100

  const points = avgHRs.map((hr, i) => {
    const x = (i / Math.max(avgHRs.length - 1, 1)) * width
    const y = height - ((hr - min) / (max - min)) * height
    return `${x},${y}`
  })

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '80px', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        {/* LT1 line */}
        <line
          x1="0"
          y1={height - ((156 - min) / (max - min)) * height}
          x2={width}
          y2={height - ((156 - min) / (max - min)) * height}
          stroke="#4ade8044"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
        {/* LT2 line */}
        <line
          x1="0"
          y1={height - ((170 - min) / (max - min)) * height}
          x2={width}
          y2={height - ((170 - min) / (max - min)) * height}
          stroke="#f8717144"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {points.map((pt, i) => {
          const [x, y] = pt.split(',').map(Number)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="#fbbf24"
            />
          )
        })}
      </svg>
      <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '1px', background: '#4ade8044', borderTop: '1px dashed #4ade8044' }} />
          <span style={{ color: '#64748b', fontSize: '9px' }}>LT1 156</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '1px', borderTop: '1px dashed #f8717144' }} />
          <span style={{ color: '#64748b', fontSize: '9px' }}>LT2 170</span>
        </div>
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
