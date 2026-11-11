// Nutrition plan constants and maths — mirrors the "Nutrition plan for the marathon build" doc
// (23 Oct 2026, Wed starch added 28 Oct, Chocomel 8 Nov, SiS pre-run drink 10 Nov).
// Four fixed meals a day; porridge before runs; only dinner starch changes with the day type.

import { TRAINING_PLAN } from './trainingData'

export type DayType = 'gym' | 'easy' | 'rest' | 'steady' | 'long'
export type DinnerProtein = 'lean' | 'oily' | 'bolognese'
export type StarchType = 'rice' | 'pasta' | 'potato'

export interface Macros {
  k: number // kcal
  c: number // carbs g
  p: number // protein g
  f: number // fat g
}

export interface Extra extends Macros {
  name: string
}

export interface NutritionDay {
  date: string // YYYY-MM-DD
  type: DayType
  recovery: boolean // unwell: deficit paused, eat at maintenance
  porridge: boolean
  preRun: 'porridge' | 'drink'
  shake: boolean
  sunDrink: 'chocomel' | 'oj'
  lunch: boolean
  lunchProtein: 'eggs' | 'chicken'
  yoghurt: boolean
  dinner: boolean
  dinnerProtein: DinnerProtein
  starchType: StarchType
  starchG: number
  extras: Extra[]
  note: string
  updatedAt: number
}

const M = (k: number, c: number, p: number, f: number): Macros => ({ k, c, p, f })
export const ZERO = M(0, 0, 0, 0)
export const add = (...xs: Macros[]): Macros =>
  xs.reduce((a, b) => M(a.k + b.k, a.c + b.c, a.p + b.p, a.f + b.f), ZERO)
const scale = (m: Macros, s: number): Macros => M(m.k * s, m.c * s, m.p * s, m.f * s)

export interface DayTypeDef {
  label: string
  target: Macros
  maint: number // maintenance estimate, kcal
  run: boolean
  starch: number
  starchType: StarchType
  protein: DinnerProtein
}

export const TYPES: Record<DayType, DayTypeDef> = {
  gym:    { label: 'Gym day',    target: M(1965, 190, 140, 65), maint: 2600, run: false, starch: 150, starchType: 'rice',  protein: 'lean' },
  easy:   { label: 'Easy run',   target: M(2400, 275, 155, 70), maint: 2900, run: true,  starch: 200, starchType: 'rice',  protein: 'lean' },
  rest:   { label: 'Rest day',   target: M(1900, 180, 140, 65), maint: 2300, run: false, starch: 100, starchType: 'rice',  protein: 'lean' },
  steady: { label: 'Steady run', target: M(2510, 300, 155, 70), maint: 2950, run: true,  starch: 250, starchType: 'rice',  protein: 'lean' },
  long:   { label: 'Long run',   target: M(2915, 380, 170, 75), maint: 3150, run: true,  starch: 350, starchType: 'pasta', protein: 'bolognese' },
}
export const TYPE_ORDER: DayType[] = ['rest', 'gym', 'easy', 'steady', 'long']
// Non-run days: Monday and Friday are gym days, anything else is rest.
const DOW_NO_RUN: DayType[] = ['rest', 'gym', 'rest', 'rest', 'rest', 'gym', 'rest'] // Sun..Sat
// Planned session type (lib/trainingData.ts) → fuel day type.
const SESSION_TYPE: Record<string, DayType> = {
  Easy: 'easy', Strides: 'easy', Fartlek: 'easy', Recovery: 'easy',
  Long: 'long', Race: 'long',
  Steady: 'steady', Intervals: 'steady', 'Marathon Pace': 'steady', Tempo: 'steady',
}

// Unwell / recovery day: +400 kcal, nearly all carbs, protein unchanged; dinner +100 g starch.
export const BOOST = M(400, 90, 0, 5)
export const BOOST_STARCH = 100
export const targetFor = (r: NutritionDay): Macros =>
  r.recovery ? add(TYPES[r.type].target, BOOST) : TYPES[r.type].target

export const FOOD = {
  porridge: M(370, 67, 11, 6),
  toastJam: M(130, 26, 3, 1),
  sisDrink: M(145, 36, 0, 0), // SiS GO Electrolyte, 2 scoops
  shake: M(720, 76, 45, 24),
  honey: M(45, 12, 0, 0),
  oj: M(110, 26, 2, 0),
  chocomel: M(230, 37, 9, 5), // 300 ml
  lunchEggs: M(460, 39, 31, 19),
  lunchChicken: M(445, 39, 50, 9),
  yoghurt: M(310, 26, 23, 13),
  dinnerBase: { lean: M(280, 10, 40, 7), oily: M(295, 10, 31, 12.5), bolognese: M(360, 16, 52, 10) } as Record<DinnerProtein, Macros>,
  starchPerG: { rice: M(1.3, 0.28, 0.03, 0.004), pasta: M(1.3, 0.28, 0.03, 0.004), potato: M(0.65, 0.14, 0.015, 0.002) } as Record<StarchType, Macros>,
}

export const PROTEIN_LABEL: Record<DinnerProtein, string> = {
  lean: 'Chicken, turkey, white fish or 5% beef',
  oily: 'Salmon or mackerel (no oil)',
  bolognese: '5% beef bolognese',
}

export const QUICK_EXTRAS: Extra[] = [
  { name: 'Dark chocolate, 2 squares', k: 110, c: 9, p: 1, f: 7 },
  { name: 'Toast + honey', k: 125, c: 26, p: 3, f: 1 },
  { name: 'Banana + honey (skipped porridge)', k: 135, c: 33, p: 1, f: 0 },
  { name: 'Banana', k: 90, c: 21, p: 1, f: 0 },
  { name: 'Coffee with milk', k: 30, c: 2, p: 2, f: 1 },
  { name: 'Glass of wine', k: 160, c: 4, p: 0, f: 0 },
  { name: 'Pint of beer', k: 200, c: 16, p: 2, f: 0 },
  { name: 'Energy gel', k: 100, c: 25, p: 0, f: 0 },
]

// --- meal maths ---
export function porridgeFor(t: DayType, kind: NutritionDay['preRun']): Macros {
  if (kind === 'drink') return FOOD.sisDrink
  return t === 'long' ? add(FOOD.porridge, FOOD.toastJam) : FOOD.porridge
}
export function shakeFor(t: DayType, drink: NutritionDay['sunDrink']): Macros {
  if (t === 'steady') return add(FOOD.shake, FOOD.honey)
  if (t === 'long') return add(FOOD.shake, drink === 'oj' ? FOOD.oj : FOOD.chocomel)
  return FOOD.shake
}
export const lunchFor = (p: NutritionDay['lunchProtein']): Macros =>
  p === 'chicken' ? FOOD.lunchChicken : FOOD.lunchEggs
export const dinnerFor = (r: NutritionDay): Macros =>
  add(FOOD.dinnerBase[r.dinnerProtein] ?? FOOD.dinnerBase.lean,
      scale(FOOD.starchPerG[r.starchType] ?? FOOD.starchPerG.rice, r.starchG || 0))
export const extrasFor = (r: NutritionDay): Macros =>
  (r.extras || []).reduce((a, e) => add(a, M(+e.k || 0, +e.c || 0, +e.p || 0, +e.f || 0)), ZERO)

export function eaten(r: NutritionDay): Macros {
  const parts: Macros[] = []
  if (r.porridge) parts.push(porridgeFor(r.type, r.preRun))
  if (r.shake) parts.push(shakeFor(r.type, r.sunDrink))
  if (r.lunch) parts.push(lunchFor(r.lunchProtein))
  if (r.yoghurt) parts.push(FOOD.yoghurt)
  if (r.dinner) parts.push(dinnerFor(r))
  parts.push(extrasFor(r))
  return add(...parts)
}

export const isLogged = (r: NutritionDay): boolean =>
  !!(r.porridge || r.shake || r.lunch || r.yoghurt || r.dinner || (r.extras && r.extras.length))

// --- dates (local time) ---
const pad = (n: number) => String(n).padStart(2, '0')
export const toIso = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromIso = (s: string): Date => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const todayIso = (): string => toIso(new Date())
export const shiftDays = (s: string, n: number): string => { const d = fromIso(s); d.setDate(d.getDate() + n); return toIso(d) }
export const mondayOf = (s: string): string => { const d = fromIso(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toIso(d) }
// Day type comes from the training plan, so a swapped Thursday or a moved long run
// changes the fuel targets with it. Days with no planned run fall back to the weekday routine.
export function planSessionFor(date: string) {
  for (const phase of Object.values(TRAINING_PLAN)) {
    if (date < phase.startDate || date > phase.endDate) continue
    for (const wk of phase.weeks) {
      const s = wk.sessions.find((x) => x.date === date)
      if (s) return s
    }
  }
  return null
}
export const defaultType = (s: string): DayType => {
  const session = planSessionFor(s)
  if (session) return SESSION_TYPE[session.type] ?? 'easy'
  return DOW_NO_RUN[fromIso(s).getDay()]
}
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function blankDay(date: string): NutritionDay {
  const t = defaultType(date), T = TYPES[t]
  return {
    date, type: t, recovery: false,
    porridge: false, preRun: 'porridge', shake: false, sunDrink: 'chocomel',
    lunch: false, lunchProtein: 'eggs', yoghurt: false,
    dinner: false, dinnerProtein: T.protein, starchType: T.starchType, starchG: T.starch,
    extras: [], note: '', updatedAt: 0,
  }
}

// Fill any missing fields (older records predate some options).
export const normaliseDay = (date: string, stored?: Partial<NutritionDay> | null): NutritionDay =>
  stored ? { ...blankDay(date), ...stored, date } : blankDay(date)
