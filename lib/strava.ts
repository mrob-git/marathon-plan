// Strava API helper with automatic token refresh
//
// Tokens expire every 6 hours. This module reads credentials from .env.local,
// checks expiry, refreshes if needed, and updates the .env.local file so the
// new tokens persist across restarts.

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
const STRAVA_API_BASE = 'https://www.strava.com/api/v3'

interface StravaTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

function readEnv(): Record<string, string> {
  const envPath = join(process.cwd(), '.env.local')
  const content = readFileSync(envPath, 'utf-8')
  const env: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=')
      env[key] = rest.join('=')
    }
  }
  return env
}

function writeTokensToEnv(tokens: StravaTokens): void {
  const envPath = join(process.cwd(), '.env.local')
  const content = readFileSync(envPath, 'utf-8')
  const lines = content.split('\n')
  const updated: string[] = []
  const handled = new Set<string>()

  for (const line of lines) {
    if (line.startsWith('STRAVA_ACCESS_TOKEN=')) {
      updated.push(`STRAVA_ACCESS_TOKEN=${tokens.accessToken}`)
      handled.add('STRAVA_ACCESS_TOKEN')
    } else if (line.startsWith('STRAVA_REFRESH_TOKEN=')) {
      updated.push(`STRAVA_REFRESH_TOKEN=${tokens.refreshToken}`)
      handled.add('STRAVA_REFRESH_TOKEN')
    } else if (line.startsWith('STRAVA_EXPIRES_AT=')) {
      updated.push(`STRAVA_EXPIRES_AT=${tokens.expiresAt}`)
      handled.add('STRAVA_EXPIRES_AT')
    } else {
      updated.push(line)
    }
  }

  if (!handled.has('STRAVA_ACCESS_TOKEN')) updated.push(`STRAVA_ACCESS_TOKEN=${tokens.accessToken}`)
  if (!handled.has('STRAVA_REFRESH_TOKEN')) updated.push(`STRAVA_REFRESH_TOKEN=${tokens.refreshToken}`)
  if (!handled.has('STRAVA_EXPIRES_AT')) updated.push(`STRAVA_EXPIRES_AT=${tokens.expiresAt}`)

  writeFileSync(envPath, updated.join('\n'))
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
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strava token refresh failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  }
}

// Returns a valid access token, refreshing if expired
export async function getStravaToken(): Promise<string> {
  const env = readEnv()

  const accessToken = env.STRAVA_ACCESS_TOKEN
  const refreshTokenVal = env.STRAVA_REFRESH_TOKEN
  const expiresAt = parseInt(env.STRAVA_EXPIRES_AT || '0', 10)
  const clientId = env.STRAVA_CLIENT_ID
  const clientSecret = env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret || !refreshTokenVal) {
    throw new Error('Missing Strava credentials in .env.local')
  }

  const now = Math.floor(Date.now() / 1000)

  // Refresh if token expires within 5 minutes
  if (accessToken && expiresAt > now + 300) {
    return accessToken
  }

  console.log('[strava] Token expired or expiring soon, refreshing...')
  const tokens = await refreshTokens(clientId, clientSecret, refreshTokenVal)
  writeTokensToEnv(tokens)
  console.log('[strava] Token refreshed, new expiry:', new Date(tokens.expiresAt * 1000).toISOString())
  return tokens.accessToken
}

// Convenience: make an authenticated GET request to the Strava API
export async function stravaGet<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
  const token = await getStravaToken()
  const url = new URL(`${STRAVA_API_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strava API error (${res.status}): ${text}`)
  }

  return res.json() as Promise<T>
}
