import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { RunLog } from '@/lib/types'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const phase = searchParams.get('phase')

  if (!phase) {
    return NextResponse.json({ error: 'phase required' }, { status: 400 })
  }

  const pattern = `runs:${phase}:*`
  const keys = await kv.keys(pattern)

  if (!keys.length) {
    return NextResponse.json({}, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    })
  }

  const values = await kv.mget<RunLog[]>(...keys)
  const result: Record<string, RunLog> = {}
  keys.forEach((key, i) => {
    if (values[i]) result[key] = values[i] as RunLog
  })

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const { phaseId, weekNum, day, log } = body as {
    phaseId: string
    weekNum: number
    day: string
    log: RunLog
  }

  if (!phaseId || !weekNum || !day || !log) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const key = `runs:${phaseId}:${weekNum}:${day}`
  await kv.set(key, log)

  return NextResponse.json({ ok: true, key })
}
