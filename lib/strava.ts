// Strava API helper with automatic token refresh.
//
// Credentials come from the environment (Vercel) or .env.local (Mac). Strava
// rotates the refresh token on every refresh, so the latest token pair is kept
// in KV on Vercel, where the filesystem is read-only, and written back to
// .env.local when that file exists (local dev and the Claude Code skills).

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { kv } from '@vercel/kv'

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
const STRAVA_API_BASE = 'https://www.strava.com/api/v3'
const KV_TOKENS = 'strava:tokens'

interface StravaTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const envPath = () => join(process.cwd(), '.env.local')

function readFileEnv(): Record<string, string> {
  const path = envPath()
  if (!existsSync(path)) return {}
  const env: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=')
      env[key] = rest.join('=')
    }
  }
  return env
}

function writeTokensToEnvFile(tokens: StravaTokens): void {
  const path = envPath()
  if (!existsSync(path)) return
  const lines = readFileSync(path, 'utf-8').split('\n')
  const updated: string[] = []
  const handled = new Set<string>()
  for (const line of lines) {
    if (line.startsWith('STRAVA_ACCESS_TOKEN=')) { updated.push(`STRAVA_ACCESS_TOKEN=${tokens.accessToken}`); handled.add('a') }
    else if (line.startsWith('STRAVA_REFRESH_TOKEN=')) { updated.push(`STRAVA_REFRESH_TOKEN=${tokens.refreshToken}`); handled.add('r') }
    else if (line.startsWith('STRAVA_EXPIRES_AT=')) { updated.push(`STRAVA_EXPIRES_AT=${tokens.expiresAt}`); handled.add('e') }
    else updated.push(line)
  }
  if (!handled.has('a')) updated.push(`STRAVA_ACCESS_TOKEN=${tokens.accessToken}`)
  if (!handled.has('r')) updated.push(`STRAVA_REFRESH_TOKEN=${tokens.refreshToken}`)
  if (!handled.has('e')) updated.push(`STRAVA_EXPIRES_AT=${tokens.expiresAt}`)
  try { writeFileSync(path, updated.join('\n')) } catch { /* read-only filesystem */ }
}

function credentials() {
  const file = readFileEnv()
  const get = (k: string) => process.env[k] || file[k] || ''
  return {
    clientId: get('STRAVA_CLIENT_ID'),
    clientSecret: get('STRAVA_CLIENT_SECRET'),
    accessToken: get('STRAVA_ACCESS_TOKEN'),
    refreshToken: get('STRAVA_REFRESH_TOKEN'),
    expiresAt: parseInt(get('STRAVA_EXPIRES_AT') || '0', 10),
  }
}

// True when the app can talk to Strava at all (used to skip enrichment quietly).
export function stravaConfigured(): boolean {
  const c = credentials()
  return !!(c.clientId && c.clientSecret && c.refreshToken)
}

async function kvGetTokens(): Promise<StravaTokens | null> {
  try { return await kv.get<StravaTokens>(KV_TOKENS) } catch { return null }
}

async function kvSetTokens(tokens: StravaTokens): Promise<void> {
  try { await kv.set(KV_TOKENS, tokens) } catch { /* KV not configured locally */ }
}

async function refreshTokens(clientId: string, clientSecret: string, refreshToken: string): Promise<StravaTokens> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strava token refresh failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: data.expires_at }
}

// Returns a valid access token, refreshing if expired
export async function getStravaToken(): Promise<string> {
  const c = credentials()
  if (!c.clientId || !c.clientSecret || !c.refreshToken) {
    throw new Error('Missing Strava credentials (STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN)')
  }

  // The newest token pair wins: KV (rotated on Vercel) over env/file.
  const stored = await kvGetTokens()
  const current: StravaTokens = stored ?? { accessToken: c.accessToken, refreshToken: c.refreshToken, expiresAt: c.expiresAt }

  const now = Math.floor(Date.now() / 1000)
  if (current.accessToken && current.expiresAt > now + 300) return current.accessToken

  console.log('[strava] Token expired or expiring soon, refreshing...')
  const tokens = await refreshTokens(c.clientId, c.clientSecret, current.refreshToken || c.refreshToken)
  await kvSetTokens(tokens)
  writeTokensToEnvFile(tokens)
  console.log('[strava] Token refreshed, new expiry:', new Date(tokens.expiresAt * 1000).toISOString())
  return tokens.accessToken
}

// Convenience: make an authenticated GET request to the Strava API
export async function stravaGet<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
  const token = await getStravaToken()
  const url = new URL(`${STRAVA_API_BASE}${path}`)
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strava API error (${res.status}): ${text}`)
  }
  return res.json() as Promise<T>
}
