import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const INTERVALS_MCP_URL = 'https://intervals-mcp.vercel.app/mcp'

async function callMCP(toolName: string, args: Record<string, unknown>) {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: toolName, arguments: args },
  }

  const res = await fetch(INTERVALS_MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`intervals-mcp returned ${res.status}`)

  const json = await res.json()
  const text = json.result?.content?.find((c: { type: string }) => c.type === 'text')?.text
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const [trends, runs] = await Promise.all([
      callMCP('get_fitness_trends', { days: 42 }),
      callMCP('get_recent_runs', { limit: 10 }),
    ])

    return NextResponse.json(
      { trends: trends ?? [], runs: runs ?? [] },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
