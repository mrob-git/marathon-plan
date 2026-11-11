import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const INTERVALS_MCP_URL = 'https://intervals-mcp.vercel.app/mcp'

// Daily weight as Intervals.icu receives it from the Garmin scales.
export async function GET() {
  try {
    const res = await fetch(INTERVALS_MCP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: 'get_fitness_trends', arguments: { days: 90 } },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`intervals-mcp returned ${res.status}`)
    const json = await res.json()
    const text = json.result?.content?.find((c: { type: string }) => c.type === 'text')?.text
    const rows = text ? (JSON.parse(text) as { date: string; weight_kg: number | null }[]) : []
    const weights = rows
      .filter((r) => typeof r.weight_kg === 'number' && r.weight_kg > 0)
      .map((r) => ({ date: r.date, kg: Math.round((r.weight_kg as number) * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return NextResponse.json(weights, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
