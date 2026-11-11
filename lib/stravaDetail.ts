// Per-run detail from Strava (splits, shoes, elevation, HR drift) plus the
// weather at the start, stored on the run log by the sync route.

import { stravaGet } from './strava'
import { StravaDetail } from './types'

interface SummaryActivity {
  id: number
  name: string
  type: string
  sport_type?: string
  start_date_local: string
  moving_time: number
  distance: number
}

interface DetailedActivity extends SummaryActivity {
  total_elevation_gain?: number
  start_latlng?: [number, number] | []
  gear?: { id: string; name: string } | null
  splits_metric?: { distance: number; moving_time: number; elapsed_time: number; average_heartrate?: number; split: number }[]
}

const epoch = (iso: string, dayOffset: number) =>
  Math.floor((new Date(iso + 'T00:00:00Z').getTime() + dayOffset * 86400000) / 1000)

export async function fetchStravaDetail(date: string): Promise<StravaDetail | null> {
  const activities = await stravaGet<SummaryActivity[]>('/athlete/activities', {
    after: String(epoch(date, -1)),
    before: String(epoch(date, 2)),
    per_page: '10',
  })
  const runs = activities.filter(
    (a) => (a.sport_type ?? a.type) === 'Run' && a.start_date_local.startsWith(date)
  )
  if (!runs.length) return null
  const main = runs.sort((a, b) => b.moving_time - a.moving_time)[0]

  const act = await stravaGet<DetailedActivity>(`/activities/${main.id}`)

  const splits = (act.splits_metric ?? [])
    .filter((s) => s.distance >= 950)
    .map((s) => ({
      km: s.split,
      secs: Math.round(s.moving_time * (1000 / s.distance)), // normalise the last partial km
      hr: s.average_heartrate ? Math.round(s.average_heartrate) : undefined,
    }))

  let hrDrift: number | undefined
  const withHr = splits.filter((s) => s.hr)
  if (withHr.length >= 6) {
    const avg = (xs: typeof withHr) => xs.reduce((a, s) => a + (s.hr ?? 0), 0) / xs.length
    hrDrift = Math.round(avg(withHr.slice(-3)) - avg(withHr.slice(0, 3)))
  }

  const detail: StravaDetail = {
    id: act.id,
    name: act.name,
    shoes: act.gear?.name,
    elevation: act.total_elevation_gain !== undefined ? Math.round(act.total_elevation_gain) : undefined,
    splits,
    hrDrift,
    fetchedAt: Date.now(),
  }

  const ll = act.start_latlng
  if (ll && ll.length === 2) {
    try {
      const w = await fetchWeather(ll[0], ll[1], act.start_date_local)
      if (w) { detail.tempC = w.tempC; detail.weather = w.weather; detail.windKph = w.windKph }
    } catch (e) {
      console.log('[strava] weather lookup failed:', e instanceof Error ? e.message : e)
    }
  }

  return detail
}

// Open-Meteo, no key. Forecast endpoint covers the last week; archive covers the rest (5-day lag).
async function fetchWeather(lat: number, lon: number, startLocal: string) {
  const date = startLocal.slice(0, 10)
  const hour = parseInt(startLocal.slice(11, 13), 10) || 0
  const ageDays = (Date.now() - new Date(date + 'T00:00:00Z').getTime()) / 86400000
  const base = ageDays <= 6
    ? `https://api.open-meteo.com/v1/forecast?past_days=7`
    : `https://archive-api.open-meteo.com/v1/archive?start_date=${date}&end_date=${date}`
  const url = `${base}&latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&timezone=Europe%2FLondon`
  const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null
  const json = await res.json() as { hourly?: { time: string[]; temperature_2m: number[]; precipitation: number[]; wind_speed_10m: number[]; weather_code: number[] } }
  const h = json.hourly
  if (!h) return null
  const idx = h.time.findIndex((t) => t.startsWith(`${date}T${String(hour).padStart(2, '0')}`))
  if (idx < 0) return null
  return {
    tempC: Math.round(h.temperature_2m[idx] * 10) / 10,
    windKph: Math.round(h.wind_speed_10m[idx]),
    weather: describeWeather(h.weather_code[idx], h.precipitation[idx]),
  }
}

function describeWeather(code: number, precipMm: number): string {
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code <= 48) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 67) return precipMm >= 2 ? 'heavy rain' : 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'showers'
  if (code <= 86) return 'snow showers'
  return 'thunder'
}
