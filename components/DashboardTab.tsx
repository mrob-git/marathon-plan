'use client'

import { useState, useEffect } from 'react'
import { TRAINING_PLAN } from '@/lib/trainingData'
import { TabId, NiggleStatus, TrainingSession } from '@/lib/types'
import { NutritionDay, TYPES, normaliseDay, targetFor, eaten, todayIso } from '@/lib/nutrition'

const RACE_DATE = '2027-04-24'
const RHR_BASELINE = [51, 54] // low, high
const HRV_BASELINE_AVG = 52
// Lab thresholds (Focused Running, May 2024): LT1 156, LT2 170. Easy-day ceiling 150.
const EASY_CAP = 150
const LT1 = 156

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
  const today = todayIso()
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

// HR ceiling for a planned session, used to colour the week's rows.
function hrCapFor(session: TrainingSession): number | null {
  switch (session.type) {
    case 'Easy': case 'Long': case 'Strides': case 'Fartlek': case 'Recovery': return EASY_CAP
    case 'Steady': return LT1
    case 'Intervals': case 'Marathon Pace': case 'Tempo': return 163
    default: return null
  }
}

type Call = 'GO HARD' | 'GO EASY' | 'REST' | 'NO DATA'

function computeReadiness(today: FitnessTrend | null, trends: FitnessTrend[]) {
  if (!today) return { call: 'NO DATA' as Call, color: '#64748b', signals: [] as string[] }

  const signals: string[] = []
  let hasRed = false
  let amberCount = 0

  const acwr = today.ctl_fitness > 0 ? today.atl_fatigue / today.ctl_fitness : 0
  if (acwr > 1.5) { signals.push(`load ratio ${acwr.toFixed(2)} (over 1.5)`); hasRed = true }
  else if (acwr > 1.3) { signals.push(`load ratio ${acwr.toFixed(2)} (over 1.3)`); amberCount++ }

  if (today.ramp_rate > 8) { signals.push(`ramp ${today.ramp_rate.toFixed(1)} a week`); hasRed = true }
  else if (today.ramp_rate > 5) { signals.push(`ramp ${today.ramp_rate.toFixed(1)} a week`); amberCount++ }

  if (today.resting_hr !== null) {
    const rhrDiff = today.resting_hr - RHR_BASELINE[1]
    if (rhrDiff >= 7) { signals.push(`RHR ${today.resting_hr}, +${rhrDiff} on baseline`); hasRed = true }
    else if (rhrDiff >= 4) { signals.push(`RHR ${today.resting_hr}, +${rhrDiff} on baseline`); amberCount++ }
  }

  if (today.hrv !== null && trends.length >= 7) {
    const recentHRV = trends.slice(0, 7).filter(t => t.hrv !== null)
    if (recentHRV.length >= 3) {
      const avg = recentHRV.reduce((s, t) => s + (t.hrv ?? 0), 0) / recentHRV.length
      const drop = ((avg - today.hrv) / avg) * 100
      if (drop > 25) { signals.push(`HRV ${today.hrv} is ${drop.toFixed(0)}% under your week`); hasRed = true }
      else if (drop > 15) { signals.push(`HRV ${today.hrv} is ${drop.toFixed(0)}% under your week`); amberCount++ }
    }
  }

  if (today.sleep_score !== null) {
    if (today.sleep_score < 60) { signals.push(`sleep score ${today.sleep_score}`); hasRed = true }
    else if (today.sleep_score < 70) { signals.push(`sleep score ${today.sleep_score}`); amberCount++ }
  }
  if (today.sleep_hours !== null) {
    const hrs = parseFloat(today.sleep_hours)
    if (hrs < 6) { signals.push(`only ${hrs}h sleep`); hasRed = true }
    else if (hrs < 7) { signals.push(`only ${hrs}h sleep`); amberCount++ }
  }

  if (hasRed || amberCount >= 3) return { call: 'REST' as Call, color: '#f87171', signals }
  if (amberCount > 0) return { call: 'GO EASY' as Call, color: '#fbbf24', signals }
  return { call: 'GO HARD' as Call, color: '#4ade80', signals }
}

// Turn the readiness call into the one line that matters for today's session.
function todayAdvice(call: Call, signals: string[], session: TrainingSession | undefined, today: FitnessTrend | null) {
  const because = signals.length ? `: ${signals.join(', ')}` : ''
  const nums = today
    ? `HRV ${today.hrv ?? '—'}, RHR ${today.resting_hr ?? '—'}, sleep ${today.sleep_hours ? parseFloat(today.sleep_hours).toFixed(1) + 'h' : '—'}.`
    : ''
  if (call === 'NO DATA') return { headline: session ? session.type.toUpperCase() : 'REST DAY', line: 'No wellness data yet today.' }
  if (!session) {
    return {
      headline: 'REST DAY',
      line: signals.length ? `Nothing to run. Worth noting${because}.` : `Nothing to decide. ${nums}`,
    }
  }
  const type = session.type.toLowerCase()
  const isEasy = ['easy', 'long', 'strides', 'fartlek', 'recovery'].includes(type)
  if (call === 'REST') return { headline: 'REST', line: `Skip today's ${type} run${because}.` }
  if (call === 'GO EASY') {
    return isEasy
      ? { headline: 'GO EASY', line: `Keep today's ${type} run genuinely easy and cut it short if it feels flat${because}.` }
      : { headline: 'DROP TO EASY', line: `Make today's ${type} session an easy run instead${because}.` }
  }
  return { headline: 'AS PLANNED', line: `Today's ${type} run is on. ${nums}` }
}

export default function DashboardTab({ refreshKey, onOpenTab }: { refreshKey?: number; onOpenTab?: (id: TabId) => void }) {
  const [trends, setTrends] = useState<FitnessTrend[]>([])
  const [runs, setRuns] = useState<RecentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fuel, setFuel] = useState<NutritionDay | null>(null)
  const [niggle, setNiggle] = useState<NiggleStatus | null>(null)

  const todayStr = todayIso()

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

    fetch(`/api/nutrition?from=${todayStr}&to=${todayStr}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : {}))
      .then((data: Record<string, Partial<NutritionDay>>) => setFuel(normaliseDay(todayStr, data[todayStr])))
      .catch(() => setFuel(normaliseDay(todayStr)))

    fetch('/api/niggles', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : { text: '', date: '' }))
      .then((data: NiggleStatus) => setNiggle(data))
      .catch(() => setNiggle({ text: '', date: '' }))
  }, [refreshKey, todayStr])

  const today = trends.length > 0 ? trends[0] : null
  const readiness = computeReadiness(today, trends)
  const { phaseId, weekIdx } = getCurrentPhaseAndWeek()
  const phase = TRAINING_PLAN[phaseId]
  const week = phase.weeks[weekIdx]
  const todaySession = week?.sessions.find(s => s.date === todayStr)
  const advice = todayAdvice(readiness.call, readiness.signals, todaySession, today)
  const adviceColor = readiness.call === 'NO DATA' ? '#64748b' : !todaySession ? '#94a3b8' : readiness.color

  // Deduplicate runs by date (keep the main activity — highest training load)
  const runsByDate = new Map<string, RecentRun>()
  for (const run of runs) {
    const existing = runsByDate.get(run.date)
    if (!existing || (run.training_load ?? 0) > (existing.training_load ?? 0)) {
      runsByDate.set(run.date, run)
    }
  }
  const uniqueRuns = Array.from(runsByDate.values()).slice(0, 5)

  return (
    <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      {loading && (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '48px', fontSize: '12px' }}>
          LOADING TODAY...
        </div>
      )}

      {error && (
        <div style={{ color: '#f87171', textAlign: 'center', padding: '48px', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Today: the call, phrased against the session */}
          <Card accent={adviceColor}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
              <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px' }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
              </div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>
                {phase.name} W{week?.weekNumber ?? '?'} · {daysUntilRace()} days to London
              </div>
            </div>
            <div style={{ color: adviceColor, fontSize: '28px', fontWeight: 'bold', lineHeight: 1.1, marginTop: '8px' }}>
              {advice.headline}
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '12px', marginTop: '6px', lineHeight: 1.5 }}>
              {advice.line}
            </div>
            {todaySession && (
              <div style={{ marginTop: '10px', padding: '8px 10px', background: '#1a1a24', borderRadius: '4px', fontSize: '11px', lineHeight: 1.5 }}>
                <span style={{ color: '#e2e8f0' }}>{todaySession.description}</span>
                <span style={{ color: '#64748b' }}> · {todaySession.plannedMinutes} min</span>
              </div>
            )}
            {today && (
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <MiniStat label="Fitness" value={today.ctl_fitness.toFixed(0)} />
                <MiniStat label="Fatigue" value={today.atl_fatigue.toFixed(0)} />
                <MiniStat label="HRV" value={today.hrv !== null ? String(today.hrv) : '—'} color={today.hrv !== null && today.hrv < HRV_BASELINE_AVG * 0.75 ? '#f87171' : undefined} />
                <MiniStat label="RHR" value={today.resting_hr !== null ? String(today.resting_hr) : '—'} color={today.resting_hr !== null && today.resting_hr > RHR_BASELINE[1] + 4 ? '#fbbf24' : undefined} />
                <MiniStat label="Sleep" value={today.sleep_hours ? `${parseFloat(today.sleep_hours).toFixed(1)}h` : '—'} />
              </div>
            )}
          </Card>

          {/* Fuel today */}
          {fuel && <FuelCard day={fuel} onOpen={() => onOpenTab?.('nutrition')} />}

          {/* This week */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px' }}>
                THIS WEEK — {phase.name.toUpperCase()} W{week?.weekNumber}
              </div>
              {(() => {
                const matched = week?.sessions.filter(s => runs.find(r => r.date === s.date)) ?? []
                const totalKm = matched.reduce((sum, s) => {
                  const r = runs.find(r2 => r2.date === s.date)
                  return sum + (r ? parseFloat(r.distance_km) || 0 : 0)
                }, 0)
                return (
                  <div style={{ fontSize: '10px', display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#4ade80' }}>{matched.length}/{week?.sessions.length ?? 0} done</span>
                    {totalKm > 0 && <span style={{ color: '#94a3b8' }}>{totalKm.toFixed(1)} km</span>}
                  </div>
                )
              })()}
            </div>
            {week?.sessions.map((session, i) => {
              const matchedRun = runs.find(r => r.date === session.date)
              const isPast = session.date < todayStr
              const isToday = session.date === todayStr
              const cap = hrCapFor(session)
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  marginBottom: '4px',
                  background: isToday ? '#1a1a24' : 'transparent',
                  borderRadius: '4px',
                  borderLeft: isToday ? '3px solid #60a5fa' : '3px solid transparent',
                  gap: '8px',
                }}>
                  <div style={{ width: '16px', textAlign: 'center', flexShrink: 0 }}>
                    {matchedRun ? (
                      <span style={{ color: '#4ade80', fontSize: '14px' }}>✓</span>
                    ) : isPast ? (
                      <span style={{ color: '#f87171', fontSize: '14px' }}>✗</span>
                    ) : (
                      <span style={{ color: '#2a2a3a', fontSize: '14px' }}>○</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ color: isToday ? '#60a5fa' : '#e2e8f0', fontSize: '12px', fontWeight: isToday ? 'bold' : 'normal' }}>
                        {session.day.slice(0, 3)}
                        <span style={{ color: '#64748b', fontWeight: 'normal' }}> · {session.plannedMinutes} min</span>
                      </span>
                      {matchedRun && (
                        <span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#4ade80' }}>{parseFloat(matchedRun.distance_km).toFixed(1)} km</span>
                          <span style={{ color: '#94a3b8' }}> · {matchedRun.pace.replace(' /km', '')}</span>
                          {matchedRun.avg_hr && (
                            <span style={{ color: cap !== null && matchedRun.avg_hr > cap ? '#fbbf24' : '#94a3b8' }}> · {matchedRun.avg_hr} bpm</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px', lineHeight: 1.4 }}>
                      {session.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </Card>

          {/* Fitness trend + recent runs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            <Card>
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
            </Card>

            <Card>
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
                        {run.avg_hr} bpm
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Niggles */}
          <div style={{ marginTop: '12px' }}>
            <NigglesCard status={niggle} onSaved={setNiggle} />
          </div>
        </>
      )}
    </div>
  )
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: '#111118',
      border: `1px solid ${accent ? accent + '55' : '#2a2a3a'}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
    }}>
      {children}
    </div>
  )
}

function FuelCard({ day, onOpen }: { day: NutritionDay; onOpen: () => void }) {
  const G = targetFor(day)
  const e = eaten(day)
  const left = G.k - e.k
  const pct = Math.min(100, Math.max(0, (e.k / G.k) * 100))
  const fmt = (n: number) => Math.round(n).toLocaleString('en-GB')
  return (
    <div
      onClick={onOpen}
      role="button"
      style={{
        background: '#111118',
        border: '1px solid #2a2a3a',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px' }}>
          FUEL — {TYPES[day.type].label.toUpperCase()}{day.recovery ? ' · UNWELL' : ''}
        </div>
        <div style={{ color: '#64748b', fontSize: '10px' }}>open ›</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
        <div>
          <span style={{ color: left < 0 ? '#f87171' : '#e2e8f0', fontSize: '22px', fontWeight: 'bold' }}>{fmt(Math.abs(left))}</span>
          <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '6px' }}>{left < 0 ? 'kcal over' : 'kcal left'}</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '11px' }}>{fmt(e.k)} of {fmt(G.k)} · carbs {Math.round(e.c)}/{G.c} g</div>
      </div>
      <div style={{ height: '6px', background: '#1a1a24', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: left < 0 ? '#f87171' : '#4ade80', borderRadius: '3px' }} />
      </div>
    </div>
  )
}

function NigglesCard({ status, onSaved }: { status: NiggleStatus | null; onSaved: (s: NiggleStatus) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const clear = !status?.text

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/niggles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        const data = await res.json()
        onSaved({ text: data.text, date: data.date })
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px' }}>NIGGLES</div>
        <div style={{
          background: clear ? '#0f2a1a' : '#2a1f0a',
          color: clear ? '#4ade80' : '#fbbf24',
          fontSize: '10px',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: 'bold',
        }}>
          {clear ? 'ALL CLEAR' : 'WATCHING'}
        </div>
        {!editing && (
          <button
            onClick={() => { setText(status?.text ?? ''); setEditing(true) }}
            style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #2a2a3a', color: '#94a3b8', borderRadius: '4px', padding: '3px 8px', fontFamily: 'inherit', fontSize: '10px', cursor: 'pointer' }}
          >
            {clear ? 'ADD' : 'EDIT'}
          </button>
        )}
      </div>
      {!editing && (
        <div style={{ color: clear ? '#64748b' : '#e2e8f0', fontSize: '11px', marginTop: '6px', lineHeight: 1.5 }}>
          {clear
            ? 'Nothing logged. Add anything that twinges so the weekly review sees it.'
            : <>{status?.text} <span style={{ color: '#64748b' }}>· updated {new Date(status!.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></>}
        </div>
      )}
      {editing && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Left Achilles 2/10 on stairs, fine running"
            autoFocus
            style={{ flex: '1 1 200px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '4px', padding: '6px 8px', color: '#e2e8f0', fontSize: '12px', fontFamily: 'inherit', outline: 'none' }}
          />
          <button onClick={save} disabled={saving} style={{ background: '#4ade80', color: '#0a0a0f', border: 'none', borderRadius: '4px', padding: '6px 12px', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
            {saving ? '…' : 'SAVE'}
          </button>
          <button onClick={() => { setText(''); save() }} disabled={saving} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #2a2a3a', borderRadius: '4px', padding: '6px 10px', fontFamily: 'inherit', fontSize: '11px', cursor: 'pointer' }}>
            CLEAR
          </button>
          <button onClick={() => setEditing(false)} style={{ background: 'transparent', color: '#64748b', border: 'none', fontFamily: 'inherit', fontSize: '11px', cursor: 'pointer' }}>
            cancel
          </button>
        </div>
      )}
    </Card>
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

  const gridLines = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '120px' }}>
      {gridLines.map((v, i) => (
        <g key={i}>
          <line x1={0} y1={toY(v)} x2={width} y2={toY(v)} stroke="#1a1a24" strokeWidth="1" />
          <text x={width - 2} y={toY(v) - 3} fill="#64748b" fontSize="8" textAnchor="end">
            {v.toFixed(0)}
          </text>
        </g>
      ))}
      <path d={atlPath} fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
      <path d={ctlPath} fill="none" stroke="#60a5fa" strokeWidth="2" />
      <circle cx={toX(data.length - 1)} cy={toY(ctlValues[ctlValues.length - 1])} r="3" fill="#60a5fa" />
      <line x1={4} y1={height - 4} x2={16} y2={height - 4} stroke="#60a5fa" strokeWidth="2" />
      <text x={19} y={height - 1} fill="#64748b" fontSize="8">CTL</text>
      <line x1={44} y1={height - 4} x2={56} y2={height - 4} stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
      <text x={59} y={height - 1} fill="#64748b" fontSize="8">ATL</text>
    </svg>
  )
}
