export interface RunLog {
  date: string // YYYY-MM-DD
  plannedTime: number // minutes
  actualTime?: number // minutes
  distance?: number // km
  avgHR?: number // bpm
  pacePerKm?: string // mm:ss
  gapPerKm?: string // mm:ss
  trainingLoad?: number
  notes?: string
  // Post-run check-in (Today screen): effort 1-10, how it felt, anything that twinged.
  rpe?: number
  feel?: 'great' | 'ok' | 'rough'
  niggleNote?: string
}

export interface BodyCompEntry {
  date: string // YYYY-MM-DD
  weight: number // kg
  bodyFat?: number // %
  muscleMass?: number // kg
  bodyWater?: number // %
}

export interface TrainingSession {
  day: string // e.g. "Tuesday"
  date: string // YYYY-MM-DD
  type: string // e.g. "Easy", "Tempo", "Long"
  description: string
  plannedMinutes: number
  zone?: string
  notes?: string
}

export interface TrainingWeek {
  weekNumber: number // 1-based within phase
  startDate: string // YYYY-MM-DD (Monday)
  sessions: TrainingSession[]
  note?: string
}

export interface Phase {
  id: string
  name: string
  startDate: string
  endDate: string
  weeks: TrainingWeek[]
}

export interface SyncResult {
  synced: number
  matched: number
  message: string
}

export type TabId =
  | 'dashboard'
  | 'schedule'
  | 'nutrition'
  | 'bodycomp'
  | 'more'
  | 'analytics'
  | 'paces'
  | 'injury'

// Legacy one-line status (PR #5); migrated into the log on first read.
export interface NiggleStatus {
  text: string
  date: string
}

export type NiggleSite =
  | 'achilles' | 'calf' | 'peroneal' | 'knee' | 'hamstring' | 'hip' | 'shin' | 'foot' | 'other'

export interface NiggleEntry {
  id: string
  date: string // YYYY-MM-DD first noticed / logged
  site: NiggleSite
  side?: 'L' | 'R' | ''
  severity: number // 0-10
  note?: string
  resolvedDate?: string // YYYY-MM-DD, set when it's gone
  updatedAt: number
}
