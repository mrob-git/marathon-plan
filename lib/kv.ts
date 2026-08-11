// KV abstraction — uses Vercel KV in production, falls back to in-memory store in dev
import { kv } from '@vercel/kv'
import { RunLog, BodyCompEntry } from './types'

// --- Run logs ---
export async function getRunLog(phaseId: string, wk: number, day: string): Promise<RunLog | null> {
  const key = `runs:${phaseId}:${wk}:${day}`
  return kv.get<RunLog>(key)
}

export async function saveRunLog(phaseId: string, wk: number, day: string, data: RunLog): Promise<void> {
  const key = `runs:${phaseId}:${wk}:${day}`
  await kv.set(key, data)
}

export async function getAllRunLogs(phaseId: string): Promise<Record<string, RunLog>> {
  const pattern = `runs:${phaseId}:*`
  const keys = await kv.keys(pattern)
  if (!keys.length) return {}
  const values = await kv.mget<RunLog[]>(...keys)
  const result: Record<string, RunLog> = {}
  keys.forEach((key, i) => {
    if (values[i]) result[key] = values[i] as RunLog
  })
  return result
}

export async function saveRunLogByKey(key: string, data: RunLog): Promise<void> {
  await kv.set(key, data)
}

// --- Body comp ---
export async function getBodyCompEntries(): Promise<BodyCompEntry[]> {
  const entries = await kv.get<BodyCompEntry[]>('bodycomp:entries')
  return entries ?? []
}

export async function saveBodyCompEntry(entry: BodyCompEntry): Promise<void> {
  const existing = await getBodyCompEntries()
  const idx = existing.findIndex((e) => e.date === entry.date)
  if (idx >= 0) {
    existing[idx] = entry
  } else {
    existing.push(entry)
    existing.sort((a, b) => a.date.localeCompare(b.date))
  }
  await kv.set('bodycomp:entries', existing)
}

// --- Sync state ---
export async function getLastSyncTime(): Promise<string | null> {
  return kv.get<string>('sync:lastRun')
}

export async function setLastSyncTime(ts: string): Promise<void> {
  await kv.set('sync:lastRun', ts)
}
