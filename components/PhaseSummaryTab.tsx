'use client'

import { Phase } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  Easy: '#60a5fa',
  Long: '#4ade80',
  Tempo: '#fbbf24',
  'Marathon Pace': '#fb923c',
  Intervals: '#f87171',
  Strides: '#a78bfa',
  Race: '#4ade80',
}

interface Props {
  phase: Phase
}

export default function PhaseSummaryTab({ phase }: Props) {
  const totalSessions = phase.weeks.reduce((acc, w) => acc + w.sessions.length, 0)
  const totalMins = phase.weeks.reduce(
    (acc, w) => acc + w.sessions.reduce((a, s) => a + s.plannedMinutes, 0),
    0
  )
  const totalHours = Math.round(totalMins / 60)

  // Type breakdown
  const byType: Record<string, number> = {}
  phase.weeks.forEach((w) =>
    w.sessions.forEach((s) => {
      byType[s.type] = (byType[s.type] ?? 0) + s.plannedMinutes
    })
  )

  return (
    <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Phase header */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ color: '#4ade80', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          {phase.name}
        </div>
        <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>
          {phase.startDate} → {phase.endDate} · {phase.weeks.length} weeks
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Stat label="TOTAL SESSIONS" value={`${totalSessions}`} color="#e2e8f0" />
          <Stat label="TOTAL TIME" value={`${totalHours}h`} color="#4ade80" />
          <Stat label="AVG / WEEK" value={`${Math.round(totalMins / phase.weeks.length)}m`} color="#60a5fa" />
        </div>
      </div>

      {/* Type breakdown */}
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
          VOLUME BY SESSION TYPE
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {Object.entries(byType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, mins]) => (
              <div key={type}>
                <div
                  style={{
                    background: (TYPE_COLORS[type] ?? '#94a3b8') + '22',
                    border: `1px solid ${(TYPE_COLORS[type] ?? '#94a3b8') + '44'}`,
                    borderRadius: '4px',
                    padding: '6px 12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: TYPE_COLORS[type] ?? '#94a3b8', fontSize: '10px', letterSpacing: '0.5px' }}>
                    {type.toUpperCase()}
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 'bold' }}>
                    {Math.round(mins / 60)}h
                  </div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>
                    {Math.round((mins / totalMins) * 100)}%
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Week-by-week volume chart (bar) */}
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
          WEEKLY VOLUME
        </div>
        <WeeklyVolumeChart weeks={phase.weeks} />
      </div>

      {/* Week list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {phase.weeks.map((wk) => {
          const wkMins = wk.sessions.reduce((a, s) => a + s.plannedMinutes, 0)
          const isRecovery = wkMins < 200

          return (
            <div
              key={wk.weekNumber}
              style={{
                background: '#111118',
                border: `1px solid ${isRecovery ? '#1a2a1a' : '#2a2a3a'}`,
                borderRadius: '6px',
                padding: '10px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 'bold' }}>
                    W{wk.weekNumber}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>
                    {wk.startDate}
                  </span>
                  {isRecovery && (
                    <span
                      style={{
                        color: '#22c55e',
                        background: '#14532d44',
                        border: '1px solid #14532d',
                        borderRadius: '3px',
                        fontSize: '9px',
                        padding: '1px 6px',
                        marginLeft: '8px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      RECOVERY
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{wk.sessions.length} sessions</span>
                  <span style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}>{wkMins}m</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                {wk.sessions.map((s) => (
                  <span
                    key={`${s.day}-${s.type}`}
                    title={`${s.day}: ${s.description} (${s.plannedMinutes}m)`}
                    style={{
                      background: (TYPE_COLORS[s.type] ?? '#94a3b8') + '22',
                      color: TYPE_COLORS[s.type] ?? '#94a3b8',
                      border: `1px solid ${(TYPE_COLORS[s.type] ?? '#94a3b8') + '44'}`,
                      borderRadius: '3px',
                      fontSize: '9px',
                      padding: '2px 6px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {s.day.slice(0, 3).toUpperCase()} {s.type.slice(0, 4).toUpperCase()} {s.plannedMinutes}m
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeeklyVolumeChart({ weeks }: { weeks: Phase['weeks'] }) {
  const volumes = weeks.map((w) => w.sessions.reduce((a, s) => a + s.plannedMinutes, 0))
  const max = Math.max(...volumes)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
      {volumes.map((v, i) => {
        const pct = (v / max) * 100
        const isRecovery = v < 200
        return (
          <div
            key={i}
            title={`W${i + 1}: ${v}m`}
            style={{
              flex: 1,
              background: isRecovery ? '#166534' : '#4ade80',
              height: `${pct}%`,
              minHeight: '4px',
              borderRadius: '2px 2px 0 0',
              opacity: 0.8,
              cursor: 'default',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '1')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = '0.8')}
          />
        )
      })}
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
