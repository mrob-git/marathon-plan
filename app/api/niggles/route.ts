import { NextRequest, NextResponse } from 'next/server'
import { getNiggleStatus, setNiggleStatus } from '@/lib/kv'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(): Promise<NextResponse> {
  const status = await getNiggleStatus()
  return NextResponse.json(status ?? { text: '', date: '' }, { headers: NO_STORE })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { text?: unknown }
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 200) : ''
  const date = new Date().toISOString().split('T')[0]
  await setNiggleStatus({ text, date })
  return NextResponse.json({ ok: true, text, date }, { headers: NO_STORE })
}
