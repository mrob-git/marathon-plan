import { NextResponse } from 'next/server'
import { getAllSessions } from '@/lib/trainingData'
import { getRunLogByKey, saveRunLogByKey, getLastSyncTime, setLastSyncTime } from '@/lib/kv'
import { RunLog } from '@/lib/types'

const INTERVALS_MCP_URL = 'https://intervals-mcp.vercel.app/mcp'

// Matches the formatted shape that intervals-mcp/api/mcp.ts actually returns
interface IntervalsRun {
  id: string
  date: string        // "YYYY-MM-DD"
  name: string
  type: string
  distance_km: string // "12.34" — km as string
  duration: string    // "45m 30s" or "1h 23m 45s"
  pace: string        // "4:30 /km"
  avg_hr: number | null
  training_load: number | null
}

interface MCPToolResult {
  content: Array<{ type: string; text?: string }>
}

async function callIntervalsMCP(limit: number): Promise<IntervalsRun[]> {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_recent_runs',
      arguments: { limit },
    },
  }

  console.log(`[sync] Calling intervals-mcp with limit=${limit}`)

  const res = await fetch(INTERVALS_MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    throw new Error(`intervals-mcp returned ${res.status}`)
  }

  const json = await res.json()
  const result: MCPToolResult = json.result

  const textContent = result?.content?.find((c) => c.type === 'text')?.text
  if (!textContent) {
    console.log('[sync] No text content in MCP response:', JSON.stringify(json))
    return []
  }

  if (textContent === 'No recent runs found.') {
    console.log('[sync] MCP returned: No recent runs found')
    return []
  }

  try {
    const parsed = JSON.parse(textContent)
    const runs = Array.isArray(parsed) ? parsed : []
    console.log(`[sync] Parsed ${runs.length} runs from MCP. First run:`, runs[0] ?? 'none')
    return runs
  } catch (e) {
    console.log('[sync] Failed to parse MCP response:', e, 'Raw text:', textContent.slice(0, 200))
    return []
  }
}

// Parse "45m 30s" or "1h 23m 45s" → whole minutes
function parseDurationToMinutes(duration: string): number {
  const hourMatch = duration.match(/(\d+)h/)
  const minMatch = duration.match(/(\d+)m/)
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0
  const mins = minMatch ? parseInt(minMatch[1]) : 0
  return hours * 60 + mins
}

// Format total minutes + total distance → "mm:ss" pace per km
function calcPace(totalMinutes: number, totalKm: number): string | undefined {
  if (!totalMinutes || !totalKm) return undefined
  const secsPerKm = (totalMinutes * 60) / totalKm
  const mins = Math.floor(secsPerKm / 60)
  const secs = Math.round(secsPerKm % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function dateDiffDays(a: string, b: string): number {
  return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / 86400000)
}

interface DailyTotal {
  date: string
  totalMinutes: number
  totalKm: number
  weightedHRSum: number  // sum of (avgHR * minutes) for runs that have HR
  hrMinutes: number      // total minutes from runs that have HR data
  totalLoad: number
  runCount: number
}

// Group individual runs by date and combine into daily totals
function groupByDate(runs: IntervalsRun[]): DailyTotal[] {
  const byDate = new Map<string, DailyTotal>()

  for (const run of runs) {
    if (!run.date) continue
    const mins = parseDurationToMinutes(run.duration)
    const km = parseFloat(run.distance_km) || 0
    const load = run.training_load ?? 0

    const existing = byDate.get(run.date)
    if (!existing) {
      byDate.set(run.date, {
        date: run.date,
        totalMinutes: mins,
        totalKm: km,
        weightedHRSum: run.avg_hr ? run.avg_hr * mins : 0,
        hrMinutes: run.avg_hr ? mins : 0,
        totalLoad: load,
        runCount: 1,
      })
    } else {
      existing.totalMinutes += mins
      existing.totalKm += km
      existing.totalLoad += load
      existing.runCount += 1
      if (run.avg_hr) {
        existing.weightedHRSum += run.avg_hr * mins
        existing.hrMinutes += mins
      }
    }
  }

  return Array.from(byDate.values())
}

// Runs uploaded after the last sync, plus a few days' grace for late Garmin uploads.
const GRACE_DAYS = 3

function isoDaysAgo(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().split('T')[0]
}

export async function POST(): Promise<NextResponse> {
  try {
    const lastSync = await getLastSyncTime()

    // First sync pulls the full history the tool allows; after that only
    // enough runs to cover the days since the last sync (about one run a day
    // at most, plus a margin), so a daily sync fetches a handful, not 40+.
    let limit = 50
    let sinceDate: string | null = null
    if (lastSync) {
      const daysSince = Math.ceil((Date.now() - new Date(lastSync).getTime()) / 86400000)
      limit = Math.min(50, Math.max(5, daysSince + GRACE_DAYS + 2))
      sinceDate = isoDaysAgo(lastSync, GRACE_DAYS)
    }

    const fetched = await callIntervalsMCP(limit)
    const runs = sinceDate ? fetched.filter((r) => r.date >= sinceDate) : fetched

    console.log(`[sync] lastSync=${lastSync ?? 'never'} limit=${limit} fetched=${fetched.length} since=${sinceDate ?? 'all'} candidates=${runs.length}`)

    // Group by date — handles split activities (e.g. battery restart)
    const dailyTotals = groupByDate(runs)
    const splitDays = dailyTotals.filter((d) => d.runCount > 1)
    if (splitDays.length > 0) {
      console.log(`[sync] Combined split activities on ${splitDays.length} day(s):`, splitDays.map((d) => `${d.date} (${d.runCount} runs)`))
    }

    const sessions = getAllSessions()
    let added = 0
    let updated = 0
    let unchanged = 0
    const savedKeys: string[] = []

    for (const day of dailyTotals) {
      // Find the closest planned session within 2 days
      const match = sessions
        .map((s) => ({ session: s, diff: dateDiffDays(s.date, day.date) }))
        .filter((x) => x.diff <= 2)
        .sort((a, b) => a.diff - b.diff)[0]

      if (!match) continue

      const s = match.session
      const avgHR = day.hrMinutes > 0 ? Math.round(day.weightedHRSum / day.hrMinutes) : undefined
      const pacePerKm = calcPace(day.totalMinutes, day.totalKm)

      const phaseId = getPhaseForDate(s.date)
      if (!phaseId) continue

      const weekNum = getWeekNumberForDate(s.date, phaseId)
      if (!weekNum) continue

      const key = `runs:${phaseId}:${weekNum}:${s.day}`
      const existing = await getRunLogByKey(key)

      const log: RunLog = {
        date: day.date,
        plannedTime: s.plannedMinutes,
        actualTime: day.totalMinutes > 0 ? day.totalMinutes : undefined,
        distance: day.totalKm > 0 ? Math.round(day.totalKm * 10) / 10 : undefined,
        avgHR,
        pacePerKm,
        trainingLoad: day.totalLoad > 0 ? day.totalLoad : undefined,
        // Keep anything typed in by hand on the Schedule tab.
        gapPerKm: existing?.gapPerKm,
        notes: existing?.notes,
        rpe: existing?.rpe,
        feel: existing?.feel,
        niggleNote: existing?.niggleNote,
      }

      if (
        existing &&
        existing.date === log.date &&
        existing.actualTime === log.actualTime &&
        existing.distance === log.distance &&
        existing.avgHR === log.avgHR &&
        existing.trainingLoad === log.trainingLoad
      ) {
        unchanged++
        continue
      }

      console.log(`[sync] Writing key=${key} date=${day.date} runs=${day.runCount} actualTime=${log.actualTime} distance=${log.distance} hr=${log.avgHR}`)
      await saveRunLogByKey(key, log)
      savedKeys.push(key)
      if (existing) updated++
      else added++
    }

    await setLastSyncTime(new Date().toISOString())

    const matched = added + updated
    console.log(`[sync] Done. added=${added} updated=${updated} unchanged=${unchanged} keys=${savedKeys.join(', ')}`)

    const parts: string[] = []
    if (added) parts.push(`${added} new run${added === 1 ? '' : 's'} logged`)
    if (updated) parts.push(`${updated} updated`)
    if (!added && !updated) parts.push('Nothing new since last sync')
    if (unchanged) parts.push(`${unchanged} already up to date`)

    return NextResponse.json({
      synced: runs.length,
      matched,
      savedKeys,
      message: parts.join(', '),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getPhaseForDate(date: string): string | null {
  const phases: Record<string, [string, string]> = {
    base: ['2026-05-04', '2026-09-07'],
    development: ['2026-09-07', '2026-11-30'],
    peak: ['2026-11-30', '2027-04-05'],
    taper: ['2027-04-05', '2027-04-28'],
  }
  for (const [id, [start, end]] of Object.entries(phases)) {
    if (date >= start && date < end) return id
  }
  return null
}

function getWeekNumberForDate(date: string, phaseId: string): number | null {
  const phaseStarts: Record<string, string> = {
    base: '2026-05-04',
    development: '2026-09-07',
    peak: '2026-11-30',
    taper: '2027-04-05',
  }
  const start = phaseStarts[phaseId]
  if (!start) return null
  const diffMs = new Date(date).getTime() - new Date(start).getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  return Math.floor(diffDays / 7) + 1
}
