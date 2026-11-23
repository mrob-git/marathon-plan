import { NextRequest, NextResponse } from 'next/server'
import { getGymLogs, saveGymLog } from '@/lib/kv'
import { GymLog } from '@/lib/gym'

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// GET /api/gym?from=YYYY-MM-DD&to=YYYY-MM-DD → { [date]: GymLog }
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? '2026-01-01'
  const to = searchParams.get('to') ?? '2099-12-31'
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return NextResponse.json({ error: 'from and to must be YYYY-MM-DD' }, { status: 400 })
  }
  const logs = await getGymLogs(from, to)
  return NextResponse.json(logs, { headers: NO_STORE })
}

// POST /api/gym with one GymLog. Last write wins; an older record (by updatedAt) is skipped.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as GymLog
  if (!body || typeof body.date !== 'string' || !DATE_RE.test(body.date) || !Array.isArray(body.ticks)) {
    return NextResponse.json({ error: 'needs date (YYYY-MM-DD) and ticks[]' }, { status: 400 })
  }
  const existing = (await getGymLogs(body.date, body.date))[body.date]
  if (existing && (existing.updatedAt ?? 0) > (body.updatedAt ?? 0)) {
    return NextResponse.json({ ok: true, saved: 0, skipped: 1 })
  }
  await saveGymLog(body)
  return NextResponse.json({ ok: true, saved: 1, skipped: 0 })
}
