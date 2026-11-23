// Gym sessions (Mon and Fri) as tick-off checklists.
//
// To add a session: append a GymSession to GYM_SESSIONS with its date as the id.
// Item ids only need to be unique within a session; they are what the ticks store,
// so keep an id stable once a session has been used (renaming text is fine).
//
// Reusable blocks/items live at the top so Monday, Friday and the P1 prehab
// (from Mon 30 Nov) can be composed without retyping them.

// How an exercise is logged. Every logged set has an optional kg and a count:
// reps, seconds (holds) or metres (carries). weighted: false hides the kg box.
export interface GymLogSpec {
  sets: number
  count: 'reps' | 'secs' | 'm'
  weighted: boolean
  kgHint?: number // shown as the placeholder until you type
}

export interface GymItem {
  id: string // also the exercise key for history: reuse it for the same lift in every session
  name: string
  dose: string
  how?: string
  log?: GymLogSpec
}

export interface GymBlock {
  title: string
  minutes?: string
  note?: string
  items: GymItem[]
}

export interface GymSession {
  id: string // YYYY-MM-DD, also the KV key suffix
  date: string // YYYY-MM-DD
  eyebrow: string // e.g. "Dev 12 · Recovery week"
  title: string
  summary: string
  chips: { text: string; warn?: boolean }[]
  blocks: GymBlock[]
  leftOut?: string // what is deliberately missing today, and when it comes back
  rules: string[]
  next?: string
}

export interface GymSet {
  kg?: string
  n?: string // reps, seconds or metres, per GymLogSpec.count
}

// What gets saved per session: ticked item ids, sets per exercise, a free-text note.
export interface GymLog {
  date: string
  ticks: string[]
  sets?: Record<string, GymSet[]>
  note?: string
  updatedAt?: number
}

// --- Reusable pieces --------------------------------------------------------

const PREP: GymBlock = {
  title: 'Prep',
  minutes: '~12 min',
  items: [
    { id: 'ball-head', name: 'Ball on head', how: 'Slow, find the tender spots', dose: '2-3 min' },
    { id: 'hip-openers', name: 'Sideline hip openers', dose: '2-3 min' },
    { id: 'hip-dissoc', name: 'Hip dissociations', dose: '2-3 min' },
    { id: 'pelvic-floor', name: 'Pelvic floor co-contractions', how: 'Split stance if you can', dose: '2-3 min' },
    { id: 'glute-release', name: 'Deep gluteal release', dose: '1-2 min/side' },
  ],
}

const CALF_WARMUP: GymItem[] = [
  { id: 'kw-rocks-bent', name: 'Bent-knee knee-to-wall rocks', dose: '10 each' },
  { id: 'kw-rocks-straight', name: 'Straight-leg wall rocks', dose: '10 each' },
  { id: 'calf-rolls', name: 'Rotational calf rolls', dose: '8 each' },
]

const ISOMETRIC_14 = (sets: number): GymItem => ({
  id: 'iso-hold',
  name: 'Forefoot isometric holds, 14 kg',
  how: 'Never below neutral. Weight through the base of the big toe. Left side first',
  dose: `${sets} x 30-45 s each`,
  log: { sets, count: 'secs', weighted: true, kgHint: 14 },
})

const BAND_EVERSION: GymItem = {
  id: 'band-eversion',
  name: 'Band eversion',
  how: 'Your usual peroneal band work, slow and controlled',
  dose: '2 x 15 each',
}

const PUSH_UPS = (sets: number): GymItem => ({
  id: 'push-ups', name: 'Piked push-ups', dose: `${sets} x 6-8`, log: { sets, count: 'reps', weighted: false },
})
const ROWS = (sets: number): GymItem => ({
  id: 'rows', name: 'TRX or prone rows', dose: `${sets} x 6-8`, log: { sets, count: 'reps', weighted: false },
})

const CARRY: GymItem = {
  id: 'carry',
  name: "Farmer's carry + backward walk",
  how: 'Short, comfortable steps going backwards',
  dose: '2 x 30 m',
  log: { sets: 2, count: 'm', weighted: true },
}

const STANDARD_RULES = [
  'Back off a set if your toes grip, your jaw clenches or you hold your breath.',
  'Total calf work stays under 30-40 reps.',
  'Pain above 2/10, or stiffer the next morning: drop the newest item for a week and say so in the thread.',
]

// --- Sessions ---------------------------------------------------------------

export const GYM_SESSIONS: GymSession[] = [
  {
    id: '2026-11-23',
    date: '2026-11-23',
    eyebrow: 'Dev 12 · Recovery week',
    title: 'Tier B, eased off',
    summary: 'Your usual session at about 80%. Two working sets, 2-3 reps in reserve on everything, nothing heavier than last Monday.',
    chips: [{ text: '~55 min' }, { text: 'Isometrics 14 kg' }, { text: 'Baseline tests due', warn: true }],
    blocks: [
      PREP,
      {
        title: 'Ankle tests + calf warm-up',
        minutes: '~10 min',
        note: 'Knee to wall first, cold. Then the 3-minute warm-up, then knee to wall again and the balance test. Put the numbers in the notes box.',
        items: [
          { id: 'test-kw-cold', name: 'Test: knee to wall, cold', how: 'Both sides, left first', dose: 'L + R' },
          ...CALF_WARMUP,
          { id: 'test-kw-warm', name: 'Test: knee to wall, warm', dose: 'L + R' },
          { id: 'test-balance', name: 'Test: single-leg balance, eyes closed', how: 'Best of 2 tries per side', dose: 'L + R' },
        ],
      },
      {
        title: 'Main lifts',
        minutes: '~25 min',
        note: 'Recovery week drops each lift to 2 working sets. Breathe out on the way down.',
        items: [
          { id: 'hex-bar', name: 'Hex bar deadlift', how: '2 x 6 warm-up first. 3-4 s down, 3 min rest. Usual weight or a touch less', dose: '2 x 5-6', log: { sets: 2, count: 'reps', weighted: true } },
          { id: 'hip-swings', name: 'Single-leg hip swings', how: 'Front foot on a 14-inch box. Springy; stop when the pop drops', dose: '2 x 8-10', log: { sets: 2, count: 'reps', weighted: true } },
          { id: 'split-squats', name: 'Split squats', how: '3 s down, pause, drive up', dose: '2 x 6 each', log: { sets: 2, count: 'reps', weighted: true } },
          { id: 'cossack', name: 'Cossack squats', how: 'Bodyweight or light kettlebell, only as deep as stays smooth', dose: '2 x 8 each', log: { sets: 2, count: 'reps', weighted: true } },
        ],
      },
      { title: 'Accessory + calf', minutes: '~10 min', items: [PUSH_UPS(2), ROWS(2), ISOMETRIC_14(2)] },
      { title: 'Finish', minutes: '~3 min', items: [CARRY] },
    ],
    rules: STANDARD_RULES,
    next: 'From Mon 30 Nov: foot doming, band eversion and bent-knee calf raises join this session.',
  },
  {
    id: '2026-11-27',
    date: '2026-11-27',
    eyebrow: 'Dev 12 · Recovery week · Day before the 5K TT',
    title: 'Mobility, upper body, prehab',
    summary: 'A light session so your legs are fresh for tomorrow. No heavy single-leg work, no Cossacks, no hex bar. You should walk out feeling better than you walked in.',
    chips: [{ text: '~35 min' }, { text: 'Isometrics 14 kg' }, { text: '5K TT tomorrow', warn: true }],
    blocks: [
      PREP,
      {
        title: 'Calf warm-up',
        minutes: '~3 min',
        note: 'Same 3 minutes as Monday. Keep it easy, this is mobility, not loading.',
        items: CALF_WARMUP,
      },
      {
        title: 'Upper body',
        minutes: '~10 min',
        note: '2 sets, leave 3 reps in the tank. Full rest between sets.',
        items: [PUSH_UPS(2), ROWS(2), { ...CARRY, how: 'Moderate weight, not a grind. Short, comfortable steps going backwards' }],
      },
      {
        title: 'Prehab',
        minutes: '~8 min',
        note: 'Holds only, no new calf load before the TT.',
        items: [ISOMETRIC_14(2), BAND_EVERSION],
      },
    ],
    leftOut: 'Hex bar, hip swings, split squats and Cossacks are left out on purpose. They come back on Mon 30 Nov.',
    rules: [
      'If the calf or Achilles feels stiff, skip the isometrics and just do the prep and upper body.',
      ...STANDARD_RULES.slice(0, 1),
      'Nothing should feel hard today. If a set does, stop there.',
    ],
    next: 'Tomorrow: carbons and chest strap. 15 min easy with 4 strides, 5K all out (first km 4:15-4:18), 10 min easy.',
  },
]

// --- Helpers ----------------------------------------------------------------

export const sessionById = (id: string): GymSession | undefined => GYM_SESSIONS.find((s) => s.id === id)

export const COUNT_LABEL: Record<GymLogSpec['count'], string> = { reps: 'reps', secs: 's', m: 'm' }

const num = (v?: string): number | null => {
  if (v == null || v.trim() === '') return null
  const n = parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export const setFilled = (s?: GymSet): boolean => !!s && (num(s.kg) != null || num(s.n) != null)

// "60 kg x 6" / "x 8" / "14 kg x 40 s"
export function setLabel(s: GymSet, spec: GymLogSpec): string {
  const kg = num(s.kg), n = num(s.n)
  const unit = spec.count === 'reps' ? '' : ` ${COUNT_LABEL[spec.count]}`
  if (kg != null && n != null) return `${kg} kg x ${n}${unit}`
  if (kg != null) return `${kg} kg`
  if (n != null) return `x ${n}${unit}`
  return ''
}

// Best set: heaviest kg, then most reps/secs/metres.
export function bestSet(sets: GymSet[] | undefined): GymSet | null {
  const filled = (sets ?? []).filter(setFilled)
  if (!filled.length) return null
  return filled.reduce((a, b) => {
    const ka = num(a.kg) ?? 0, kb = num(b.kg) ?? 0
    if (kb !== ka) return kb > ka ? b : a
    return (num(b.n) ?? 0) > (num(a.n) ?? 0) ? b : a
  })
}

export const bestKg = (sets: GymSet[] | undefined): number | null => {
  const b = bestSet(sets)
  return b ? num(b.kg) : null
}

// The most recent earlier log with any set filled for this exercise.
export function previousSets(logs: Record<string, GymLog>, itemId: string, before: string): { date: string; sets: GymSet[] } | null {
  const dates = Object.keys(logs).filter((d) => d < before).sort().reverse()
  for (const d of dates) {
    const sets = logs[d]?.sets?.[itemId]
    if (sets?.some(setFilled)) return { date: d, sets: sets.filter(setFilled) }
  }
  return null
}

// Every logged exercise across all sessions, for the Progress view.
export function exerciseCatalogue(): { id: string; name: string; spec: GymLogSpec }[] {
  const seen = new Map<string, { id: string; name: string; spec: GymLogSpec }>()
  for (const s of GYM_SESSIONS) for (const b of s.blocks) for (const i of b.items) {
    if (i.log && !seen.has(i.id)) seen.set(i.id, { id: i.id, name: i.name.replace(/, \d+ kg$/, ''), spec: i.log })
  }
  return Array.from(seen.values())
}

export const allItemIds = (s: GymSession): string[] => s.blocks.flatMap((b) => b.items.map((i) => i.id))

// Today's session if there is one, else the next one coming up, else the latest.
export function defaultSessionId(today: string): string | undefined {
  const sorted = [...GYM_SESSIONS].sort((a, b) => a.date.localeCompare(b.date))
  return (sorted.find((s) => s.date >= today) ?? sorted[sorted.length - 1])?.id
}
