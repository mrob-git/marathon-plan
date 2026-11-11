'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  NutritionDay, DayType, Macros, Extra,
  TYPES, TYPE_ORDER, FOOD, PROTEIN_LABEL, QUICK_EXTRAS, BOOST_STARCH,
  targetFor, eaten, porridgeFor, shakeFor, lunchFor, dinnerFor, extrasFor, isLogged,
  todayIso, shiftDays, mondayOf, fromIso, defaultType, normaliseDay, DOW, MON,
} from '@/lib/nutrition'

type SubTab = 'today' | 'week' | 'plan'
type Store = Record<string, NutritionDay>

const C = {
  bg: '#0a0a0f', surface: '#111118', surface2: '#1a1a24', border: '#2a2a3a',
  green: '#4ade80', text: '#e2e8f0', muted: '#64748b', dim: '#94a3b8',
  amber: '#fbbf24', red: '#f87171', blue: '#60a5fa', purple: '#a78bfa',
}
const CACHE_KEY = 'nutritionLog:v1'
const fmt = (n: number) => Math.round(n).toLocaleString('en-GB')
const r0 = (n: number) => Math.round(n)
const fmtLong = (s: string) => { const d = fromIso(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}` }

export default function NutritionTab() {
  const [sub, setSub] = useState<SubTab>('today')
  const [store, setStore] = useState<Store>({})
  const [date, setDate] = useState(todayIso())
  const [weekStart, setWeekStart] = useState(mondayOf(todayIso()))
  const [status, setStatus] = useState<'loading' | 'synced' | 'saving' | 'error' | 'offline'>('loading')
  const storeRef = useRef<Store>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Cached copy renders instantly; the server answer replaces it.
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
      if (c && typeof c === 'object') { storeRef.current = c; setStore(c) }
    } catch { /* no cache */ }
    const from = shiftDays(todayIso(), -90), to = shiftDays(todayIso(), 7)
    fetch(`/api/nutrition?from=${from}&to=${to}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('fetch failed')
        const data = (await res.json()) as Store
        const merged: Store = { ...storeRef.current }
        for (const [d, rec] of Object.entries(data)) {
          const cur = merged[d]
          if (!cur || (rec.updatedAt ?? 0) >= (cur.updatedAt ?? 0)) merged[d] = rec
        }
        storeRef.current = merged
        setStore(merged)
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)) } catch { /* ignore */ }
        setStatus('synced')
      })
      .catch(() => setStatus('offline'))
  }, [])

  const persist = useCallback((d: string) => {
    clearTimeout(timers.current[d])
    timers.current[d] = setTimeout(async () => {
      const rec = storeRef.current[d]
      if (!rec) return
      setStatus('saving')
      try {
        const res = await fetch('/api/nutrition', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec),
        })
        setStatus(res.ok ? 'synced' : 'error')
      } catch { setStatus('error') }
    }, 600)
  }, [])

  const update = useCallback((d: string, fn: (r: NutritionDay) => void) => {
    const rec = normaliseDay(d, storeRef.current[d])
    fn(rec)
    rec.updatedAt = Date.now()
    const next = { ...storeRef.current, [d]: rec }
    storeRef.current = next
    setStore(next)
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
    persist(d)
  }, [persist])

  const rec = (d: string) => normaliseDay(d, store[d])

  return (
    <div style={{ padding: '12px 12px 32px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        {(['today', 'week', 'plan'] as SubTab[]).map((s) => (
          <button key={s} onClick={() => { setSub(s); if (s === 'week') setWeekStart(mondayOf(date)) }}
            style={{ ...btn(sub === s), flex: 1, padding: '9px 0' }}>
            {s.toUpperCase()}
          </button>
        ))}
        <span style={{ color: status === 'error' ? C.red : status === 'synced' ? C.green : C.muted, fontSize: '9px', letterSpacing: '0.5px', marginLeft: '6px', whiteSpace: 'nowrap' }}>
          {status === 'synced' ? 'SYNCED' : status === 'saving' ? 'SAVING' : status === 'error' ? 'NOT SAVED' : status === 'offline' ? 'OFFLINE' : 'LOADING'}
        </span>
      </div>

      {sub === 'today' && <TodayView date={date} setDate={setDate} rec={rec(date)} update={update} />}
      {sub === 'week' && (
        <WeekView weekStart={weekStart} setWeekStart={setWeekStart} rec={rec}
          openDay={(d) => { setDate(d); setSub('today') }} />
      )}
      {sub === 'plan' && <PlanView />}
    </div>
  )
}

/* ---------------- Today ---------------- */

function TodayView({ date, setDate, rec: r, update }: {
  date: string; setDate: (d: string) => void; rec: NutritionDay
  update: (d: string, fn: (r: NutritionDay) => void) => void
}) {
  const [typeOpen, setTypeOpen] = useState(false)
  const [dinnerOpen, setDinnerOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const T = TYPES[r.type], G = targetFor(r), e = eaten(r)
  const left = G.k - e.k, over = left < 0
  const today = todayIso()
  const title = date === today ? 'TODAY' : date === shiftDays(today, -1) ? 'YESTERDAY' : fmtLong(date).toUpperCase()
  const swapped = r.type !== defaultType(date)
  const u = (fn: (r: NutritionDay) => void) => update(date, fn)

  return (
    <div>
      {/* Day header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={() => { setDate(shiftDays(date, -1)); setTypeOpen(false); setDinnerOpen(false) }} style={navBtn}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.text, fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>{title}</div>
          <div style={{ color: C.muted, fontSize: '10px' }}>{fmtLong(date)}</div>
        </div>
        <button onClick={() => { setDate(shiftDays(date, 1)); setTypeOpen(false); setDinnerOpen(false) }} disabled={date >= today} style={{ ...navBtn, opacity: date >= today ? 0.3 : 1 }}>›</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <button onClick={() => setTypeOpen((v) => !v)} style={chip(swapped ? C.green : C.surface2, swapped ? C.bg : C.text)}>
          {T.label.toUpperCase()}{swapped ? ' · SWAPPED' : ''} ▾
        </button>
        <button onClick={() => u((x) => { x.recovery = !x.recovery; if (!x.dinner) x.starchG = Math.max(0, (x.starchG || 0) + (x.recovery ? BOOST_STARCH : -BOOST_STARCH)) })}
          style={chip(r.recovery ? C.amber : C.surface2, r.recovery ? C.bg : C.text)}>
          {r.recovery ? 'UNWELL · MAINTENANCE' : 'UNWELL?'}
        </button>
      </div>
      {r.recovery && (
        <div style={{ color: C.muted, fontSize: '10px', textAlign: 'center', marginBottom: '8px' }}>
          Deficit paused: +400 kcal, nearly all carbs. Dinner +100 g starch and 2 slices of toast with honey. Same protein.
        </div>
      )}
      {typeOpen && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '10px' }}>
          {TYPE_ORDER.map((k) => (
            <button key={k} onClick={() => { setTypeOpen(false); u((x) => { x.type = k; if (!x.dinner) { const D = TYPES[k]; x.starchG = D.starch + (x.recovery ? BOOST_STARCH : 0); x.starchType = D.starchType; x.dinnerProtein = D.protein } }) }}
              style={seg(k === r.type)}>
              {TYPES[k].label} <span style={{ opacity: 0.7 }}>{fmt(TYPES[k].target.k)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Meter */}
      <div style={card({ padding: '14px 16px', marginBottom: '14px' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ color: C.text, fontSize: '26px', fontWeight: 'bold' }}>
            {fmt(e.k)}<span style={{ color: C.muted, fontSize: '12px', fontWeight: 'normal' }}> / {fmt(G.k)} kcal</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: over ? C.red : C.green, fontSize: '16px', fontWeight: 'bold' }}>{fmt(Math.abs(left))}</div>
            <div style={{ color: C.muted, fontSize: '9px', letterSpacing: '0.5px' }}>{over ? 'OVER' : 'LEFT'}</div>
          </div>
        </div>
        <Bar value={e.k} max={G.k} color={over ? C.red : C.green} height={8} style={{ margin: '10px 0 12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <MacroBar label="CARBS" value={e.c} max={G.c} color={C.blue} />
          <MacroBar label="PROTEIN" value={e.p} max={G.p} color={C.amber} />
          <MacroBar label="FAT" value={e.f} max={G.f} color={C.purple} />
        </div>
      </div>

      {/* Fixed meals */}
      <SectionHeader right={<button onClick={() => u((x) => { if (TYPES[x.type].run) x.porridge = true; x.shake = true; x.lunch = true; x.yoghurt = true })} style={linkBtn}>TICK THE USUAL</button>}>
        FIXED MEALS
      </SectionHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {T.run && (
          <MealRow done={r.porridge} onToggle={() => u((x) => { x.porridge = !x.porridge })}
            name={r.preRun === 'drink' ? 'Pre-run drink' : 'Pre-run porridge'}
            desc={r.preRun === 'drink' ? 'SiS GO Electrolyte, 2 scoops: 36 g carbs, 0.6 g salt' : r.type === 'long' ? '40 g oats, milk, banana, honey + white toast and jam' : '40 g oats, 150 ml milk, banana, 15 g honey'}
            m={porridgeFor(r.type, r.preRun)}
            options={
              <Opt label="BEFORE THE RUN" hint={r.preRun === 'drink' ? 'About 225 kcal and 30 g carbs less than the porridge. Fine before an easy run; on Thu or Sun add 50 g rice at dinner.' : undefined}>
                <button onClick={() => u((x) => { x.preRun = 'porridge' })} style={seg(r.preRun !== 'drink')}>Porridge</button>
                <button onClick={() => u((x) => { x.preRun = 'drink' })} style={seg(r.preRun === 'drink')}>SiS drink, 2 scoops</button>
              </Opt>
            }
          />
        )}
        <MealRow done={r.shake} onToggle={() => u((x) => { x.shake = !x.shake })}
          name="Shake"
          desc={(r.type === 'rest' ? 'Breakfast. ' : 'After the session. ') + '300 ml whole milk, 1 heaped scoop, chia, PB, banana, oats, blueberries' + (r.type === 'steady' ? ' + 15 g honey' : r.type === 'long' ? (r.sunDrink === 'oj' ? ' + 250 ml OJ' : ' + 300 ml Chocomel') : '')}
          m={shakeFor(r.type, r.sunDrink)}
          options={r.type === 'long' ? (
            <Opt label="DRINK WITH IT">
              <button onClick={() => u((x) => { x.sunDrink = 'chocomel' })} style={seg(r.sunDrink !== 'oj')}>300 ml Chocomel</button>
              <button onClick={() => u((x) => { x.sunDrink = 'oj' })} style={seg(r.sunDrink === 'oj')}>250 ml OJ</button>
            </Opt>
          ) : undefined}
        />
        <MealRow done={r.lunch} onToggle={() => u((x) => { x.lunch = !x.lunch })}
          name="Lunch"
          desc={r.lunchProtein === 'chicken' ? '2 wholemeal, 170 g chicken, tsp oil, salad' : '2 wholemeal, 3 eggs, sauerkraut, salad'}
          m={lunchFor(r.lunchProtein)}
          options={
            <Opt label="PROTEIN">
              <button onClick={() => u((x) => { x.lunchProtein = 'eggs' })} style={seg(r.lunchProtein !== 'chicken')}>3 eggs</button>
              <button onClick={() => u((x) => { x.lunchProtein = 'chicken' })} style={seg(r.lunchProtein === 'chicken')}>Chicken + oil</button>
            </Opt>
          }
        />
        <MealRow done={r.yoghurt} onToggle={() => u((x) => { x.yoghurt = !x.yoghurt })}
          name="Afternoon yoghurt" desc="250 g 5% Greek yoghurt, apple, cinnamon" m={FOOD.yoghurt} />
        <MealRow done={r.dinner} onToggle={() => u((x) => { x.dinner = !x.dinner })}
          name="Dinner"
          desc={`${PROTEIN_LABEL[r.dinnerProtein]}, veg, ${r.starchG > 0 ? `${r.starchG} g ${r.starchType}` : 'no starch, double veg'}`}
          m={dinnerFor(r)}
          options={
            <div>
              <button onClick={() => setDinnerOpen((v) => !v)} style={{ ...linkBtn, padding: '0 0 8px' }}>
                {dinnerOpen ? 'HIDE OPTIONS' : 'CHANGE PROTEIN OR STARCH'}
              </button>
              {dinnerOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Opt label="PROTEIN (ABOUT 150 G) + VEG">
                    <button onClick={() => u((x) => { x.dinnerProtein = 'lean' })} style={seg(r.dinnerProtein === 'lean')}>Lean + tsp oil</button>
                    <button onClick={() => u((x) => { x.dinnerProtein = 'oily' })} style={seg(r.dinnerProtein === 'oily')}>Oily fish</button>
                    <button onClick={() => u((x) => { x.dinnerProtein = 'bolognese' })} style={seg(r.dinnerProtein === 'bolognese')}>Bolognese</button>
                  </Opt>
                  <Opt label="STARCH, COOKED WEIGHT"
                    hint={`${T.starch + (r.recovery ? BOOST_STARCH : 0) === 0 ? 'The plan has no starch tonight.' : `The plan says ${T.starch + (r.recovery ? BOOST_STARCH : 0)} g ${T.starchType} tonight.`}${r.starchType === 'potato' ? ' Potato counts half: 300 g potato is like 150 g rice.' : ''}`}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}>
                      <button onClick={() => u((x) => { x.starchG = Math.max(0, (x.starchG || 0) - 25) })} style={stepBtn}>−</button>
                      <span style={{ minWidth: '64px', textAlign: 'center', color: C.text, fontSize: '12px', fontWeight: 'bold' }}>{r.starchG} g</span>
                      <button onClick={() => u((x) => { x.starchG = Math.min(600, (x.starchG || 0) + 25) })} style={stepBtn}>+</button>
                    </div>
                    {(['rice', 'pasta', 'potato'] as const).map((s) => (
                      <button key={s} onClick={() => u((x) => { x.starchType = s })} style={seg(r.starchType === s)}>{s[0].toUpperCase() + s.slice(1)}</button>
                    ))}
                    <div style={{ width: '100%', display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {[0, 100, 150, 200, 250, 350].map((g) => (
                        <button key={g} onClick={() => u((x) => { x.starchG = g })} style={seg(r.starchG === g)}>{g === 0 ? 'None' : `${g} g`}</button>
                      ))}
                    </div>
                  </Opt>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Extras */}
      <SectionHeader right={r.extras.length ? <span style={{ color: C.muted, fontSize: '10px' }}>{fmt(extrasFor(r).k)} kcal</span> : undefined}>
        ANYTHING ELSE
      </SectionHeader>
      <div style={card({ marginBottom: '16px', overflow: 'hidden' })}>
        {r.extras.map((x, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: `1px solid ${C.surface2}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.text, fontSize: '12px', fontWeight: 'bold' }}>{x.name || 'Extra'}</div>
              <div style={{ color: C.muted, fontSize: '10px' }}>{r0(x.c)}c · {r0(x.p)}p · {r0(x.f)}f</div>
            </div>
            <div style={{ color: C.text, fontSize: '13px', fontWeight: 'bold' }}>{fmt(x.k)}</div>
            <button onClick={() => u((y) => { y.extras = y.extras.filter((_, j) => j !== i) })} aria-label="Remove"
              style={{ ...navBtn, width: '28px', height: '28px', fontSize: '14px', color: C.muted }}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 14px' }}>
          {QUICK_EXTRAS.map((q) => (
            <button key={q.name} onClick={() => u((x) => { x.extras = [...x.extras, { ...q }] })} style={{ ...seg(false), borderStyle: 'dashed' }}>
              {q.name} <span style={{ opacity: 0.6 }}>{q.k}</span>
            </button>
          ))}
          <button onClick={() => setAddOpen((v) => !v)} style={{ ...seg(false), color: C.green, fontWeight: 'bold' }}>{addOpen ? 'Close' : 'Other…'}</button>
        </div>
        {addOpen && <AddExtra onAdd={(x) => { setAddOpen(false); u((y) => { y.extras = [...y.extras, x] }) }} />}
      </div>

      {/* Note */}
      <SectionHeader>NOTE</SectionHeader>
      <textarea
        value={r.note}
        onChange={(ev) => u((x) => { x.note = ev.target.value })}
        placeholder="Sleep, hunger, how the run felt…"
        style={{ ...input, minHeight: '56px', resize: 'vertical' }}
      />
    </div>
  )
}

function AddExtra({ onAdd }: { onAdd: (x: Extra) => void }) {
  const [f, setF] = useState({ name: '', k: '', c: '', p: '', f: '' })
  const n = (v: string) => Number(v) || 0
  const field = (key: keyof typeof f, placeholder: string, type = 'number') => (
    <input type={type} inputMode={type === 'number' ? 'numeric' : undefined} value={f[key]} placeholder={placeholder}
      onChange={(ev) => setF((s) => ({ ...s, [key]: ev.target.value }))} style={input} />
  )
  return (
    <div style={{ padding: '10px 14px 12px', borderTop: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 72px', gap: '8px' }}>
      {field('name', 'What was it', 'text')}
      {field('k', 'kcal')}
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '8px' }}>
        {field('c', 'carbs g')}{field('p', 'protein g')}{field('f', 'fat g')}
        <button disabled={f.k === ''} onClick={() => onAdd({ name: f.name.trim() || 'Extra', k: n(f.k), c: n(f.c), p: n(f.p), f: n(f.f) })}
          style={{ ...btn(f.k !== ''), padding: '6px 14px' }}>ADD</button>
      </div>
    </div>
  )
}

/* ---------------- Week ---------------- */

function WeekView({ weekStart, setWeekStart, rec, openDay }: {
  weekStart: string; setWeekStart: (d: string) => void
  rec: (d: string) => NutritionDay; openDay: (d: string) => void
}) {
  const today = todayIso()
  const days = Array.from({ length: 7 }, (_, i) => shiftDays(weekStart, i))
  let sumE = 0, sumT = 0, sumM = 0, n = 0
  const rows = days.map((d) => {
    const r = rec(d), T = TYPES[r.type], G = targetFor(r), e = eaten(r), has = isLogged(r)
    if (has) { sumE += e.k; sumT += G.k; sumM += T.maint; n++ }
    return { d, r, T, G, e, has, diff: e.k - G.k, future: d > today }
  })
  const s = fromIso(weekStart), en = fromIso(shiftDays(weekStart, 6))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={() => setWeekStart(shiftDays(weekStart, -7))} style={navBtn}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.text, fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>WEEK</div>
          <div style={{ color: C.muted, fontSize: '10px' }}>{s.getDate()} {MON[s.getMonth()]} – {en.getDate()} {MON[en.getMonth()]}</div>
        </div>
        <button onClick={() => setWeekStart(shiftDays(weekStart, 7))} disabled={weekStart >= mondayOf(today)} style={{ ...navBtn, opacity: weekStart >= mondayOf(today) ? 0.3 : 1 }}>›</button>
      </div>

      <div style={card({ overflow: 'hidden', marginBottom: '12px' })}>
        {rows.map(({ d, r, T, G, e, has, diff, future }) => (
          <button key={d} onClick={() => openDay(d)}
            style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px', gap: '10px', alignItems: 'center', width: '100%', textAlign: 'left',
              padding: '10px 14px', background: 'none', border: 'none', borderBottom: `1px solid ${C.surface2}`, cursor: 'pointer', fontFamily: 'inherit', opacity: future ? 0.45 : 1 }}>
            <div>
              <div style={{ color: d === today ? C.green : C.text, fontSize: '12px', fontWeight: 'bold' }}>{DOW[fromIso(d).getDay()]}</div>
              <div style={{ color: C.muted, fontSize: '9px' }}>{fromIso(d).getDate()} {MON[fromIso(d).getMonth()]}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: '10px', marginBottom: '4px' }}>
                <span>{T.label}{r.recovery ? ' · unwell' : ''}</span>
                <span>{has ? fmt(e.k) : '—'} / {fmt(G.k)}</span>
              </div>
              <Bar value={has ? e.k : 0} max={G.k} color={diff > 0 ? C.red : C.green} height={5} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: has && diff > 0 ? C.red : C.text, fontSize: '12px', fontWeight: 'bold' }}>
                {has ? `${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))}` : ''}
              </div>
              <div style={{ color: C.muted, fontSize: '9px' }}>{has ? (diff > 0 ? 'over' : 'under') : future ? '' : 'not logged'}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <Stat label="EATEN" value={`${fmt(sumE)}`} unit="kcal" color={C.text} />
        <Stat label="VS PLAN" value={n ? `${sumE - sumT > 0 ? '+' : '−'}${fmt(Math.abs(sumE - sumT))}` : '—'} color={sumE - sumT > 0 ? C.red : C.green} />
        <Stat label="DEFICIT SO FAR" value={n ? fmt(sumM - sumE) : '—'} unit={n ? 'kcal' : ''} color={C.blue} />
      </div>
      <div style={{ color: C.muted, fontSize: '10px', marginTop: '10px', lineHeight: 1.5 }}>
        {n} of 7 days logged. A full week on plan is 16,055 kcal and a deficit of about 3,345 kcal, roughly 0.43 kg.
        Deficit uses the plan&apos;s maintenance estimate per day type (2,300 rest, 2,600 gym, 2,900 easy, 2,950 steady, 3,150 long). Tap a day to edit it.
      </div>
    </div>
  )
}

/* ---------------- Plan ---------------- */

const RACE_DAY = [
  { time: '06:00', item: 'Breakfast', detail: 'Porridge 100 g oats + banana + honey + black coffee (200–250 mg caffeine)' },
  { time: '08:45', item: 'Pre-race', detail: 'Bagel with peanut butter + 500 ml water + caffeine gel if needed' },
  { time: '09:15', item: 'Warm up', detail: 'Light jog. Gel 15 min before gun if not taken already.' },
  { time: '09:30', item: 'GUN', detail: 'London Marathon start' },
  { time: '0–5 km', item: 'Settle', detail: 'Water only. Let HR settle.' },
  { time: '45 min', item: 'Gel 1', detail: 'SiS Beta Fuel or Maurten 100 gel' },
  { time: '75 min', item: 'Gel 2', detail: 'Caffeine gel (100 mg)' },
  { time: '105 min', item: 'Gel 3', detail: 'Standard gel' },
  { time: '135 min', item: 'Gel 4', detail: 'Caffeine gel (100 mg)' },
  { time: '165 min', item: 'Gel 5 (if needed)', detail: 'Standard gel — optional based on feel' },
  { time: 'Finish', item: 'Recovery', detail: '500 ml recovery drink, banana, protein within 30 min' },
]
const CARB_LOAD = [
  { day: 'T-3 (Wed)', kcal: '3,400', carbs: '600 g', notes: 'Start carb-loading. Normal protein/fat.' },
  { day: 'T-2 (Thu)', kcal: '3,600', carbs: '650 g', notes: 'Max carb day. Light or no training.' },
  { day: 'T-1 (Fri)', kcal: '3,200', carbs: '550 g', notes: 'Moderate. Rest day. Avoid bloating foods.' },
  { day: 'Race eve (Fri night)', kcal: '2,800', carbs: '450 g', notes: 'Pasta dinner early. Bed by 22:00.' },
]

function PlanView() {
  const [raceOpen, setRaceOpen] = useState(false)
  const t = (k: DayType) => TYPES[k].target
  const rows: [string, string, DayType][] = [
    ['Mon, Fri', 'Gym', 'gym'], ['Tue, Sat', 'Easy run', 'easy'], ['Wed', 'Rest', 'rest'], ['Thu', 'Steady run', 'steady'], ['Sun', 'Long run', 'long'],
  ]
  return (
    <div>
      <p style={{ color: C.dim, fontSize: '11px', lineHeight: 1.6, margin: '0 0 14px' }}>
        Same shake, lunch and afternoon yoghurt every day. Porridge before a run. Dinner changes size with the day.
        Deficit phase 22 Oct to about 6 Dec, target 71 kg, then maintenance.{' '}
        <a href="https://claude.ai/artifact/FpfvY6R9EuyzFj715zL9QE" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>Full write-up</a>.
      </p>

      <SectionHeader>DAILY TARGETS</SectionHeader>
      <Table head={['Day', 'kcal', 'Carbs', 'Protein', 'Fat']} align={[0]}
        rows={rows.map(([d, l, k]) => [<><b style={{ color: C.text }}>{d}</b><div style={{ color: C.muted, fontSize: '10px' }}>{l}</div></>, fmt(t(k).k), `${t(k).c}`, `${t(k).p}`, `${t(k).f}`])} />
      <Note>If you swap days, the run day gets the run-day numbers. Change the day type at the top of Today.</Note>

      <SectionHeader>FIXED MEALS</SectionHeader>
      <Table head={['When', 'What', 'kcal', 'C / P / F']} align={[0, 1]} rows={[
        ['2–3 h before a run', <>Porridge: 40 g oats, 150 ml semi-skimmed, banana, 15 g honey<Sub>Sunday: add a slice of white toast with jam</Sub></>, '370', '67 / 11 / 6'],
        ['Short on time', <>SiS GO Electrolyte, 2 scoops in water, 30–45 min before<Sub>36 g carbs, 0.6 g salt. On Thu or Sun add 50 g rice at dinner</Sub></>, '145', '36 / 0 / 0'],
        [<>After the run or gym<Sub>Breakfast on Wed</Sub></>, <>Shake: 300 ml whole milk, 1 heaped scoop (35 g) Bulk vegan protein, 10 g chia, 10 g peanut butter, banana, 40 g oats, 80 g blueberries<Sub>Thu: +15 g honey. Sun: +300 ml Chocomel (or 250 ml OJ)</Sub></>, '720', '76 / 45 / 24'],
        ['About 3 h later', <>Lunch: 2 slices wholemeal, 3 eggs, sauerkraut, lettuce, beetroot<Sub>Or 170 g chicken + tsp olive oil</Sub></>, '460', '39 / 31 / 19'],
        ['Mid-afternoon', '250 g 5% Greek yoghurt, apple, cinnamon', '310', '26 / 23 / 13'],
      ]} />

      <SectionHeader>DINNER, SIZED TO THE DAY</SectionHeader>
      <Note style={{ marginTop: 0, marginBottom: '8px' }}>About 150 g lean protein, two big handfuls of veg, a teaspoon of olive oil, then the starch (cooked weight).</Note>
      <Table head={['Day', 'Starch', 'kcal', 'C / P / F']} align={[0, 1]} rows={[
        ['Wed', '100 g rice or 200 g potatoes, extra veg', '410', '38 / 43 / 7'],
        ['Mon, Fri', '150 g rice or 300 g potatoes', '475', '52 / 44 / 8'],
        ['Tue, Sat', '200 g rice or pasta', '540', '66 / 45 / 8'],
        ['Thu', '250 g rice or pasta', '605', '80 / 47 / 8'],
        ['Sun', '350 g pasta, 5% beef bolognese', '815', '118 / 56 / 11'],
      ]} />
      <Note>Oily fish twice a week: skip the oil those nights. Weigh the oats, rice and pasta for the first week.</Note>

      <SectionHeader>RULES THAT OVERRIDE THE NUMBERS</SectionHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        {[
          ['Ill (a cold or worse).', 'Tap "Unwell?" on Today: eat at maintenance, +400 kcal mostly carbs, same protein. Back to the deficit after two days with no symptoms.'],
          ['Never trim the shake.', 'If you want to eat less, take it off dinner.'],
          ['A bad night means a fully fuelled day.', 'Under 6 h sleep or HRV below 50: eat the full run-day breakfast and skip the deficit.'],
          ['HRV under 50 for three days, or resting HR up 4+.', 'Two days at maintenance: add 500 kcal of carbs, keep the protein.'],
          ['Losing more than 0.7 kg a week.', 'Add 200 kcal of carbs to every run day.'],
          ['Losing less than 0.25 kg a week after three weeks.', 'Take 150 kcal off dinner on rest and gym days only.'],
          ['Weigh in Wednesday and Sunday mornings.', 'Judge by the two-week average.'],
        ].map(([h, b]) => (
          <div key={h} style={card({ padding: '10px 14px' })}>
            <div style={{ color: C.text, fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{h}</div>
            <div style={{ color: C.dim, fontSize: '11px', lineHeight: 1.5 }}>{b}</div>
          </div>
        ))}
      </div>

      <SectionHeader>TIMING ON A RUN DAY</SectionHeader>
      <Note style={{ marginTop: 0 }}>07:30 porridge · 09:30 run · 10:45 shake · 13:45 lunch · 16:30 yoghurt and apple · 19:00 dinner. Leave about 3 h between the shake and lunch.</Note>

      <button onClick={() => setRaceOpen((v) => !v)} style={{ ...linkBtn, marginTop: '20px', marginBottom: '10px' }}>
        {raceOpen ? '▾' : '▸'} RACE DAY PLAN AND CARB-LOAD (APRIL)
      </button>
      {raceOpen && (
        <>
          <Table head={['Time', 'What', 'Detail']} align={[0, 1, 2]} rows={RACE_DAY.map((r) => [r.time, r.item, r.detail])} />
          <SectionHeader>CARB-LOADING (T-3 TO RACE EVE)</SectionHeader>
          <Table head={['Day', 'Carbs', 'kcal', 'Notes']} align={[0, 3]} rows={CARB_LOAD.map((r) => [r.day, r.carbs, r.kcal, r.notes])} />
          <Note>Race day target 400–600 ml fluid an hour; electrolytes on runs over 90 min; gel every 30–40 min on runs over 75 min.</Note>
        </>
      )}
    </div>
  )
}

/* ---------------- bits ---------------- */

function MealRow({ done, onToggle, name, desc, m, options }: {
  done: boolean; onToggle: () => void; name: string; desc: string; m: Macros; options?: React.ReactNode
}) {
  return (
    <div style={card({ overflow: 'hidden' })}>
      <button onClick={onToggle} aria-pressed={done}
        style={{ display: 'grid', gridTemplateColumns: '26px 1fr auto', gap: '12px', alignItems: 'center', width: '100%', textAlign: 'left',
          padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${done ? C.green : C.border}`, background: done ? C.green : 'transparent',
          display: 'grid', placeItems: 'center', color: C.bg, fontSize: '13px', fontWeight: 'bold' }}>{done ? '✓' : ''}</span>
        <span style={{ minWidth: 0 }}>
          <div style={{ color: done ? C.muted : C.text, fontSize: '13px', fontWeight: 'bold' }}>{name}</div>
          <div style={{ color: C.muted, fontSize: '10px', marginTop: '2px', lineHeight: 1.4 }}>{desc}</div>
        </span>
        <span style={{ textAlign: 'right' }}>
          <div style={{ color: done ? C.muted : C.text, fontSize: '14px', fontWeight: 'bold' }}>{fmt(m.k)}<span style={{ color: C.muted, fontSize: '9px' }}> kcal</span></div>
          <div style={{ color: C.muted, fontSize: '9px' }}>{r0(m.c)}c · {r0(m.p)}p · {r0(m.f)}f</div>
        </span>
      </button>
      {options && <div style={{ borderTop: `1px solid ${C.surface2}`, padding: '10px 14px 12px', background: C.bg }}>{options}</div>}
    </div>
  )
}

function Opt({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: C.muted, fontSize: '9px', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>{children}</div>
      {hint && <div style={{ color: C.muted, fontSize: '10px', marginTop: '6px', lineHeight: 1.4 }}>{hint}</div>}
    </div>
  )
}

function Bar({ value, max, color, height, style }: { value: number; max: number; color: string; height: number; style?: React.CSSProperties }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{ height, background: C.surface2, borderRadius: height, overflow: 'hidden', ...style }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height, transition: 'width .2s' }} />
    </div>
  )
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
        <span style={{ color: C.muted, fontSize: '9px', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ color, fontSize: '11px', fontWeight: 'bold' }}>{r0(value)}<span style={{ color: C.muted, fontWeight: 'normal' }}>/{max}</span></span>
      </div>
      <Bar value={value} max={max} color={color} height={4} />
    </div>
  )
}

function Stat({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <div style={card({ padding: '10px 12px' })}>
      <div style={{ color: C.muted, fontSize: '9px', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color, fontSize: '16px', fontWeight: 'bold' }}>{value}{unit ? <span style={{ color: C.muted, fontSize: '9px', fontWeight: 'normal' }}> {unit}</span> : null}</div>
    </div>
  )
}

function SectionHeader({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: C.dim, fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>
      <span>{children}</span>{right}
    </div>
  )
}

function Table({ head, rows, align }: { head: string[]; rows: React.ReactNode[][]; align?: number[] }) {
  const left = new Set(align ?? [0])
  return (
    <div style={card({ overflowX: 'auto', marginBottom: '8px' })}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
          {head.map((h, i) => <th key={h} style={{ color: C.muted, fontSize: '9px', letterSpacing: '0.5px', padding: '8px 10px', textAlign: left.has(i) ? 'left' : 'right', fontWeight: 'normal' }}>{h.toUpperCase()}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${C.surface2}` : 'none' }}>
              {r.map((c, j) => <td key={j} style={{ color: j === 0 ? C.text : C.dim, padding: '8px 10px', textAlign: left.has(j) ? 'left' : 'right', verticalAlign: 'top', lineHeight: 1.45, whiteSpace: left.has(j) ? 'normal' : 'nowrap' }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Sub = ({ children }: { children: React.ReactNode }) => <div style={{ color: C.muted, fontSize: '10px', marginTop: '2px' }}>{children}</div>
const Note = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) =>
  <p style={{ color: C.muted, fontSize: '10px', lineHeight: 1.5, margin: '6px 0 16px', ...style }}>{children}</p>

const card = (extra: React.CSSProperties = {}): React.CSSProperties =>
  ({ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '6px', ...extra })
const btn = (active: boolean): React.CSSProperties => ({
  background: active ? C.green : C.surface2, color: active ? C.bg : C.dim, border: 'none', borderRadius: '4px',
  fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', fontFamily: 'inherit', cursor: 'pointer', padding: '8px 14px',
})
const seg = (active: boolean): React.CSSProperties => ({
  background: active ? C.green : C.surface, color: active ? C.bg : C.text, border: `1px solid ${active ? C.green : C.border}`,
  borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer',
})
const chip = (bg: string, fg: string): React.CSSProperties => ({
  background: bg, color: fg, border: 'none', borderRadius: '999px', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold',
  letterSpacing: '0.5px', fontFamily: 'inherit', cursor: 'pointer',
})
const navBtn: React.CSSProperties = {
  width: '36px', height: '36px', borderRadius: '50%', background: C.surface2, color: C.text, border: 'none',
  fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit', display: 'grid', placeItems: 'center',
}
const linkBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: C.green, fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px',
  fontFamily: 'inherit', cursor: 'pointer', padding: 0,
}
const stepBtn: React.CSSProperties = {
  width: '34px', height: '30px', background: C.surface, color: C.text, border: 'none', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit',
}
const input: React.CSSProperties = {
  width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '4px', padding: '7px 9px',
  color: C.text, fontSize: '12px', fontFamily: 'inherit', outline: 'none', colorScheme: 'dark', minWidth: 0,
}
