import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const results: Record<string, unknown> = {}

  // 1. Write a canary key and read it back — confirms KV is live
  const canaryKey = 'debug:canary'
  const canaryVal = { ts: new Date().toISOString(), ok: true }
  await kv.set(canaryKey, canaryVal, { ex: 60 }) // expires in 60s
  const canaryRead = await kv.get(canaryKey)
  results.canary = { written: canaryVal, read: canaryRead, match: JSON.stringify(canaryRead) === JSON.stringify(canaryVal) }

  // 2. List all runs:* keys
  const allRunKeys = await kv.keys('runs:*')
  results.runKeyCount = allRunKeys.length
  results.runKeys = allRunKeys.sort()

  // 3. Read the first 3 keys to verify data shape
  if (allRunKeys.length > 0) {
    const sample = allRunKeys.slice(0, 3)
    const sampleVals = await kv.mget(...sample)
    results.sampleData = Object.fromEntries(sample.map((k, i) => [k, sampleVals[i]]))
  }

  // 4. Also try phase-scoped pattern
  const baseKeys = await kv.keys('runs:base:*')
  results.baseKeyCount = baseKeys.length
  results.baseKeys = baseKeys.sort()

  // 5. Check env vars are present (values redacted)
  results.env = {
    KV_REST_API_URL: process.env.KV_REST_API_URL ? `set (${process.env.KV_REST_API_URL.slice(0, 30)}...)` : 'MISSING',
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'set' : 'MISSING',
  }

  return NextResponse.json(results, { status: 200 })
}
