import { NextRequest, NextResponse } from 'next/server'
import { getBodyCompEntries, saveBodyCompEntry } from '@/lib/kv'
import { BodyCompEntry } from '@/lib/types'

export async function GET(): Promise<NextResponse> {
  const entries = await getBodyCompEntries()
  return NextResponse.json(entries)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const entry = await request.json() as BodyCompEntry
  if (!entry.date || !entry.weight) {
    return NextResponse.json({ error: 'date and weight required' }, { status: 400 })
  }
  await saveBodyCompEntry(entry)
  return NextResponse.json({ ok: true })
}
