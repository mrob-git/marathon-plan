import { NextRequest, NextResponse } from 'next/server'
import { getNutritionDays, saveNutritionDay } from '@/lib/kv'
import { NutritionDay } from '@/lib/nutrition'

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// GET /api/nutrition?from=YYYY-MM-DD&to=YYYY-MM-DD → { [date]: NutritionDay }
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? '2026-10-01'
  const to = searchParams.get('to') ?? '2099-12-31'
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return NextResponse.json({ error: 'from and to must be YYYY-MM-DD' }, { status: 400 })
  }
  const days = await getNutritionDays(from, to)
  return NextResponse.json(days, { headers: NO_STORE })
}

// POST /api/nutrition with one NutritionDay, or { records: NutritionDay[] } for a bulk import.
// Last write wins; a record older than the stored one (by updatedAt) is skipped.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const records: NutritionDay[] = Array.isArray(body?.records) ? body.records : [body]

  for (const r of records) {
    if (!r || typeof r.date !== 'string' || !DATE_RE.test(r.date)) {
      return NextResponse.json({ error: 'each record needs a date (YYYY-MM-DD)' }, { status: 400 })
    }
  }

  const dates = records.map((r) => r.date).sort()
  const existing = await getNutritionDays(dates[0], dates[dates.length - 1])
  let saved = 0, skipped = 0
  for (const r of records) {
    const cur = existing[r.date]
    if (cur && (cur.updatedAt ?? 0) > (r.updatedAt ?? 0)) { skipped++; continue }
    await saveNutritionDay(r)
    saved++
  }
  return NextResponse.json({ ok: true, saved, skipped })
}
