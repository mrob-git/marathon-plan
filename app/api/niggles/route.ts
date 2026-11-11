import { NextRequest, NextResponse } from 'next/server'
import { getNiggleLog, saveNiggleLog, getNiggleStatus, setNiggleStatus } from '@/lib/kv'
import { NiggleEntry, NiggleSite } from '@/lib/types'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const SITES: NiggleSite[] = ['achilles', 'calf', 'peroneal', 'knee', 'hamstring', 'hip', 'shin', 'foot', 'other']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const today = () => new Date().toISOString().split('T')[0]
const clamp = (n: unknown, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)))

// Newest first, open entries before resolved ones.
function sorted(log: NiggleEntry[]): NiggleEntry[] {
  return [...log].sort((a, b) => {
    if (!!a.resolvedDate !== !!b.resolvedDate) return a.resolvedDate ? 1 : -1
    return b.date.localeCompare(a.date)
  })
}

export async function GET(): Promise<NextResponse> {
  let log = await getNiggleLog()

  // Carry the old one-line status (PR #5) into the log once.
  if (log.length === 0) {
    const legacy = await getNiggleStatus()
    if (legacy?.text) {
      log = [{
        id: `legacy-${legacy.date}`,
        date: legacy.date || today(),
        site: 'other',
        side: '',
        severity: 3,
        note: legacy.text,
        updatedAt: Date.now(),
      }]
      await saveNiggleLog(log)
      await setNiggleStatus({ text: '', date: legacy.date })
    }
  }

  return NextResponse.json(sorted(log), { headers: NO_STORE })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as Partial<NiggleEntry>
  const site = SITES.includes(body.site as NiggleSite) ? (body.site as NiggleSite) : 'other'
  const entry: NiggleEntry = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    date: typeof body.date === 'string' && DATE_RE.test(body.date) ? body.date : today(),
    site,
    side: body.side === 'L' || body.side === 'R' ? body.side : '',
    severity: clamp(body.severity, 0, 10),
    note: typeof body.note === 'string' ? body.note.trim().slice(0, 300) : '',
    updatedAt: Date.now(),
  }
  const log = await getNiggleLog()
  log.push(entry)
  await saveNiggleLog(log)
  return NextResponse.json(entry, { headers: NO_STORE })
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as Partial<NiggleEntry> & { id?: string; resolve?: boolean; reopen?: boolean }
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const log = await getNiggleLog()
  const entry = log.find((e) => e.id === body.id)
  if (!entry) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (body.severity !== undefined) entry.severity = clamp(body.severity, 0, 10)
  if (typeof body.note === 'string') entry.note = body.note.trim().slice(0, 300)
  if (body.resolve) entry.resolvedDate = today()
  if (body.reopen) delete entry.resolvedDate
  entry.updatedAt = Date.now()

  await saveNiggleLog(log)
  return NextResponse.json(entry, { headers: NO_STORE })
}
