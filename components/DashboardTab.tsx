'use client'

import { useState, useEffect } from 'react'
import { TRAINING_PLAN } from '@/lib/trainingData'

const RACE_DATE = '2027-04-27'
const RACE_NAME = 'LONDON MARATHON'
const RHR_BASELINE = [51, 54] // low, high
const HRV_BASELINE_AVG = 52
const LT1 = 148

interface FitnessTrend {
  date: string
  ctl_fitness: number
  atl_fatigue: number
  ramp_rate: number
  resting_hr: number | null
  hrv: number | null
  sleep_hours: string | null
  sleep_score: number | null
}

interface RecentRun {
  date: string
  name: string
  distance_km: string
  duration: string
  pace: string
  avg_hr: number | null
  max_hr: number | null
  training_load: number | null
  elevation_m: number | null
}

type PhaseKey = 'base' | 'development' | 'peak' | 'taper'

function getCurrentPhaseAndWeek(): { phaseId: PhaseKey; weekIdx: number } {
  const today = new Date().toISOString().split('T')[0]
  for (const [id, phase] of Object.entries(TRAINING_PLAN)) {
    for (let i = 0; i < phase.weeks.length; i++) {
      const wk = phase.weeks[i]
      const weekStart = wk.startDate
      const nextWeekStart =
        i + 1 < phase.weeks.length ? phase.weeks[i + 1].startDate : phase.endDate
      if (today >= weekStart && today < nextWeekStart) {
        return { phaseId: id as PhaseKey, weekIdx: i }
      }
    }
  }
  return { phaseId: 'base', weekIdx: 0 }
}

function daysUntilRace(): number {
  const now = new Date()
  const race = new Date(RACE_DATE + 'T09:35:00')
  return Math.ceil((race.getTime() - now.getTime()) / 86400000)
}

function weeksUntilRace(): number {
  return Math.floor(daysUntilRace() / 7)
}

function computeReadiness(today: FitnessTrend | null, trends: FitnessTrend[]) {
  if (!today) return { call: 'NO DATA' as const, color: '#64748b', signals: [] as string[] }

  const signals: string[] = []
  let hasRed = false
  let amberCount = 0

  // ACWR
  const acwr = today.ctl_fitness > 0 ? today.atl_fatigue / today.ctl_fitness : 0
  if (acwr > 1.5) { signals.push(`ACWR ${acwr.toFixed(2)} — RED`); hasRed = true }
  else if (acwr > 1.3) { signals.push(`ACWR ${acwr.toFixed(2)} — amber`); amberCount++ }

  // Ramp rate
  if (today.ramp_rate > 8) { signals.push(`Ramp ${today.ramp_rate.toFixed(1)} — RED`); hasRed = true }
  else if (today.ramp_rate > 5) { signals.push(`Ramp ${today.ramp_rate.toFixed(1)} — amber`); amberCount++ }

  // RHR
  if (today.resting_hr !== null) {
    const rhrDiff = today.resting_hr - RHR_BASELINE[1]
    if (rhrDiff >= 7) { signals.push(`RHR +${rhrDiff} — RED`); hasRed = true }
    else if (rhrDiff >= 4) { signals.push(`RHR +${rhrDiff} — amber`); amberCount++ }
  }

  // HRV
  if (today.hrv !== null && trends.length >= 7) {
    const recentHRV = trends.slice(0, 7).filter(t => t.hrv !== null)
    if (recentHRV.length >= 3) {
      const avg = recentHRV.reduce((s, t) => s + (t.hrv ?? 0), 0) / recentHRV.length
      const drop = ((avg - today.hrv) / avg) * 100
      if (drop > 25) { signals.push(`HRV -${drop.toFixed(0)}% — RED`); hasRed = true }
      else if (drop > 15) { signals.push(`HRV -${drop.toFixed(0)}% — amber`); amberCount++ }
    }
  }

  // Sleep
  if (today.sleep_score !== null) {
    if (today.sleep_score < 60) { signals.push(`Sleep ${today.sleep_score} — RED`); hasRed = true }
    else if (today.sleep_score < 70) { signals.push(`Sleep ${today.sleep_score} — amber`); amberCount++ }
  }
  if (today.sleep_hours !== null) {
    const hrs = parseFloat(today.sleep_hours)
    if (hrs < 6) { signals.push(`Sleep ${hrs}h — RED`); hasRed = true }
    else if (hrs < 7) { signals.push(`Sleep ${hrs}h — amber`); amberCount++ }
  }

  if (hasRed || amberCount >= 3) return { call: 'REST' as const, color: '#f87171', signals }
  if (amberCount > 0) return { call: 'GO EASY' as const, color: '#fbbf24', signals }
  return { call: 'GO HARD' as const, color: '#4ade80', signals }
}

export default function DashboardTab({ refreshKey }: { refreshKey?: number }) {
  const [trends, setTrends] = useState<FitnessTrend[]>([])
  const [runs, setRuns] = useState<RecentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/dashboard', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setTrends(data.trends ?? [])
        setRuns(data.runs ?? [])
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const today = trends.length > 0 ? trends[0] : null
  const readiness = computeReadiness(today, trends)
  const { phaseId, weekIdx } = getCurrentPhaseAndWeek()
  const phase = TRAINING_PLAN[phaseId]
  const week = phase.weeks[weekIdx]
  const todayStr = new Date().toISOString().split('T')[0]
  const dayOfWeek = new Date().toLocaleDateString('en-GB', { weekday: 'long' })

  // Deduplicate runs by date (keep the main activity — highest training load)
  const runsByDate = new Map<string, RecentRun>()
  for (const run of runs) {
    const existing = runsByDate.get(run.date)
    if (!existing || (run.training_load ?? 0) > (existing.training_load ?? 0)) {
      runsByDate.set(run.date, run)
    }
  }
  const uniqueRuns = Array.from(runsByDate.values()).slice(0, 5)

  // Find today's session
  const todaySession = week?.sessions.find(s => s.date === todayStr)

  return (
    <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      {loading && (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '48px', fontSize: '12px' }}>
          LOADING DASHBOARD...
        </div>
      )}

      {error && (
        <div style={{ color: '#f87171', textAlign: 'center', padding: '48px', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Row 1: Race countdown + Readiness */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {/* Race Countdown */}
            <div style={{
              background: '#111118',
              border: '1px solid #2a2a3a',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>
                {RACE_NAME}
              </div>
              <div style={{ color: '#60a5fa', fontSize: '48px', fontWeight: 'bold', lineHeight: 1 }}>
                {daysUntilRace()}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
                days to go ({weeksUntilRace()} weeks)
              </div>
              <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '8px' }}>
                {phase.name} — Week {week?.weekNumber ?? '?'}
              </div>
            </div>

            {/* Readiness */}
            <div style={{
              background: '#111118',
              border: `1px solid ${readiness.color}33`,
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>
                TODAY&apos;S READINESS
              </div>
              <div style={{ color: readiness.color, fontSize: '28px', fontWeight: 'bold', lineHeight: 1 }}>
                {readiness.call}
              </div>
              {today && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <MiniStat label="Fitness (CTL)" value={today.ctl_fitness.toFixed(0)} />
                  <MiniStat label="Fatigue (ATL)" value={today.atl_fatigue.toFixed(0)} />
                  <MiniStat label="HRV" value={today.hrv !== null ? String(today.hrv) : '—'} color={today.hrv !== null && today.hrv < HRV_BASELINE_AVG * 0.75 ? '#f87171' : undefined} />
                  <MiniStat label="RHR" value={today.resting_hr !== null ? String(today.resting_hr) : '—'} color={today.resting_hr !== null && today.resting_hr > RHR_BASELINE[1] + 4 ? '#fbbf24' : undefined} />
                  <MiniStat label="Sleep" value={today.sleep_hours ? `${parseFloat(today.sleep_hours).toFixed(1)}h` : '—'} />
                </div>
              )}
              {readiness.signals.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#94a3b8' }}>
                  {readiness.signals.join(' · ')}
                </div>
              )}
              {todaySession && (
                <div style={{ marginTop: '10px', padding: '6px 10px', background: '#1a1a24', borderRadius: '4px', fontSize: '11px' }}>
                  <span style={{ color: '#64748b' }}>{dayOfWeek}: </span>
                  <span style={{ color: '#e2e8f0' }}>{todaySession.description}</span>
                  <span style={{ color: '#64748b' }}> ({todaySession.plannedMinutes}m)</span>
                </div>
              )}
              {!todaySession && (
                <div style={{ marginTop: '10px', padding: '6px 10px', background: '#1a1a24', borderRadius: '4px', fontSize: '11px', color: '#64748b' }}>
                  {dayOfWeek}: Rest day
                </div>
              )}
            </div>
          </div>

          {/* Row 2: This Week's Sessions */}
          <div style={{
            background: '#111118',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
          }}>
            <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '12px' }}>
              THIS WEEK — {phase.name.toUpperCase()} W{week?.weekNumber}
            </div>
            {week?.sessions.map((session, i) => {
              // Check if this session has been done (date is in the past and matches a run)
              const matchedRun = runs.find(r => r.date === session.date)
              const isPast = session.date < todayStr
              const isToday = session.date === todayStr

              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  marginBottom: '4px',
                  background: isToday ? '#1a1a24' : 'transparent',
                  borderRadius: '4px',
                  borderLeft: isToday ? '3px solid #60a5fa' : '3px solid transparent',
                }}>
                  <div style={{ width: '28px', textAlign: 'center', marginRight: '10px' }}>
                    {matchedRun ? (
                      <span style={{ color: '#4ade80', fontSize: '14px' }}>✓</span>
                    ) : isPast ? (
                      <span style={{ color: '#f87171', fontSize: '14px' }}>✗</span>
                    ) : (
                      <span style={{ color: '#2a2a3a', fontSize: '14px' }}>○</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: isToday ? '#60a5fa' : '#e2e8f0', fontSize: '12px' }}>
                      {session.day.slice(0, 3)}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>
                      {session.description}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginRight: '8px' }}>
                    {session.plannedMinutes}m
                  </div>
                  {matchedRun && (
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                      <span style={{ color: '#4ade80' }}>{parseFloat(matchedRun.distance_km).toFixed(1)}km</span>
                      <span style={{ color: '#94a3b8' }}>{matchedRun.pace}</span>
                      {matchedRun.avg_hr && (
                        <span style={{ color: matchedRun.avg_hr > LT1 ? '#fbbf24' : '#94a3b8' }}>
                          {matchedRun.avg_hr}bpm
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Row 3: Fitness Trend + Recent Runs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {/* Fitness Trend */}
            <div style={{
              background: '#111118',
              border: '1px solid #2a2a3a',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '12px' }}>
                FITNESS TREND (CTL) — 6 WEEKS
              </div>
              <CTLChart trends={trends} />
              {today && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <MiniStat label="Fitness (CTL)" value={today.ctl_fitness.toFixed(0)} color="#60a5fa" />
                  <MiniStat label="Fatigue (ATL)" value={today.atl_fatigue.toFixed(0)} color="#fbbf24" />
                  <MiniStat label="Form (CTL-ATL)" value={(today.ctl_fitness - today.atl_fatigue).toFixed(0)} color={today.ctl_fitness > today.atl_fatigue ? '#4ade80' : '#f87171'} />
                  <MiniStat label="Ramp" value={today.ramp_rate.toFixed(1)} />
                </div>
              )}
            </div>

            {/* Recent Runs */}
            <div style={{
              background: '#111118',
              border: '1px solid #2a2a3a',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '12px' }}>
                RECENT RUNS
              </div>
              {uniqueRuns.map((run, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: i < uniqueRuns.length - 1 ? '1px solid #1a1a24' : 'none',
                }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '12px' }}>
                      {new Date(run.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>
                      {parseFloat(run.distance_km).toFixed(1)}km · {run.duration}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{run.pace}</div>
                    {run.avg_hr && (
                      <div style={{ color: run.avg_hr > LT1 ? '#fbbf24' : '#64748b', fontSize: '10px' }}>
                        {run.avg_hr} bpm{run.avg_hr > 170 ? ' 🔥' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Niggles */}
          <div style={{
            background: '#111118',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px' }}>
                NIGGLES
              </div>
              <div style={{
                background: '#0f2a1a',
                color: '#4ade80',
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 'bold',
              }}>
                ALL CLEAR
              </div>
            </div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '6px' }}>
              Hamstring, calf and peroneal all resolved as of 5 Oct 2026.
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.3px' }}>{label}</div>
      <div style={{ color: color ?? '#e2e8f0', fontSize: '14px', fontWeight: 'bold' }}>{value}</div>
    </div>
  )
}

function CTLChart({ trends }: { trends: FitnessTrend[] }) {
  if (trends.length < 2) return <div style={{ color: '#64748b', fontSize: '11px' }}>Not enough data</div>

  const data = [...trends].reverse() // oldest first
  const ctlValues = data.map(t => t.ctl_fitness)
  const atlValues = data.map(t => t.atl_fatigue)
  const allValues = [...ctlValues, ...atlValues]
  const min = Math.floor(Math.min(...allValues) - 2)
  const max = Math.ceil(Math.max(...allValues) + 2)
  const range = max - min || 1

  const width = 320
  const height = 120
  const padX = 0
  const padY = 4

  function toX(i: number) { return padX + (i / (data.length - 1)) * (width - padX * 2) }
  function toY(v: number) { return padY + (1 - (v - min) / range) * (height - padY * 2) }

  const ctlPath = ctlValues.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  const atlPath = atlValues.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')

  // Grid lines
  const gridLines = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '120px' }}>
      {/* Grid */}
      {gridLines.map((v, i) => (
        <g key={i}>
          <line x1={0} y1={toY(v)} x2={width} y2={toY(v)} stroke="#1a1a24" strokeWidth="1" />
          <text x={width - 2} y={toY(v) - 3} fill="#64748b" fontSize="8" textAnchor="end">
            {v.toFixed(0)}
          </text>
        </g>
      ))}
      {/* ATL line */}
      <path d={atlPath} fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
      {/* CTL line */}
      <path d={ctlPath} fill="none" stroke="#60a5fa" strokeWidth="2" />
      {/* Current CTL dot */}
      <circle cx={toX(data.length - 1)} cy={toY(ctlValues[ctlValues.length - 1])} r="3" fill="#60a5fa" />
      {/* Legend */}
      <line x1={4} y1={height - 4} x2={16} y2={height - 4} stroke="#60a5fa" strokeWidth="2" />
      <text x={19} y={height - 1} fill="#64748b" fontSize="8">CTL</text>
      <line x1={44} y1={height - 4} x2={56} y2={height - 4} stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
      <text x={59} y={height - 1} fill="#64748b" fontSize="8">ATL</text>
    </svg>
  )
}
