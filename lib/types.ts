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
  | 'schedule'
  | 'base'
  | 'development'
  | 'peak'
  | 'taper'
  | 'paces'
  | 'nutrition'
  | 'injury'
  | 'analytics'
  | 'bodycomp'
