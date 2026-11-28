'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  GymSession, GymItem, GymLog, GymSet, GymLogSpec,
  sessionById, pickerSessions, allItemIds, defaultSessionId,
  COUNT_LABEL, setFilled, setLabel, bestSet, bestKg, previousSets, exerciseCatalogue,
} from '@/lib/gym'
import { exerciseInfo, ExerciseInfo } from '@/lib/gymExercises'
import { todayIso, fromIso, DOW, MON } from '@/lib/nutrition'

type SubTab = 'session' | 'progress'
type Store = Record<string, GymLog>

const C = {
  bg: '#0a0a0f', surface: '#111118', surface2: '#1a1a24', border: '#2a2a3a',
  green: '#4ade80', greenSoft: '#0f2a1a', text: '#e2e8f0', muted: '#64748b', dim: '#94a3b8',
  amber: '#fbbf24', amberSoft: '#2a2110', red: '#f87171',
}
const CACHE_KEY = 'gymLog:v1'
const REST_OPTIONS = [60, 90, 180]
const fmtShort = (s: string) => { const d = fromIso(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}` }
const blankLog = (date: string): GymLog => ({ date, ticks: [], sets: {} })

export default function GymTab() {
  const [sub, setSub] = useState<SubTab>('session')
  const [store, setStore] = useState<Store>({})
  const [sessionId, setSessionId] = useState<string | undefined>(() => defaultSessionId(todayIso()))
  const [status, setStatus] = useState<'loading' | 'synced' | 'saving' | 'error' | 'offline'>('loading')
  const storeRef = useRef<Store>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Cached copy renders instantly; the server answer replaces anything older.
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
      if (c && typeof c === 'object') { storeRef.current = c; setStore(c) }
    } catch { /* no cache */ }
    fetch('/api/gym', { cache: 'no-store' })
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
        const res = await fetch('/api/gym', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec),
        })
        setStatus(res.ok ? 'synced' : 'error')
      } catch { setStatus('error') }
    }, 700)
  }, [])

  const update = useCallback((d: string, fn: (r: GymLog) => void) => {
    const cur = storeRef.current[d]
    const rec: GymLog = cur
      ? { ...cur, ticks: [...cur.ticks], sets: Object.fromEntries(Object.entries(cur.sets ?? {}).map(([k, v]) => [k, v.map((s) => ({ ...s }))])) }
      : blankLog(d)
    fn(rec)
    rec.updatedAt = Date.now()
    const next = { ...storeRef.current, [d]: rec }
    storeRef.current = next
    setStore(next)
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
    persist(d)
  }, [persist])

  const session = sessionId ? sessionById(sessionId) : undefined

  return (
    <div style={{ padding: '12px 16px 24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {(['session', 'progress'] as SubTab[]).map((t) => (
          <button key={t} onClick={() => setSub(t)} style={pill(sub === t)}>
            {t === 'session' ? 'SESSION' : 'PROGRESS'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '10px', color: status === 'error' ? C.red : C.muted }}>
          {status === 'saving' ? 'saving…' : status === 'error' ? 'not saved, retrying on next change' : status === 'offline' ? 'offline, saved on this phone' : status === 'synced' ? 'saved' : ''}
        </span>
      </div>

      {sub === 'session' && (
        <>
          <SessionPicker selected={sessionId} onSelect={setSessionId} store={store} />
          {session ? (
            <SessionView session={session} log={store[session.date] ?? blankLog(session.date)} store={store} update={(fn) => update(session.date, fn)} />
          ) : (
            <div style={{ color: C.muted, fontSize: '12px', padding: '32px 0', textAlign: 'center' }}>No sessions written yet.</div>
          )}
        </>
      )}

      {sub === 'progress' && <ProgressView store={store} />}

      <RestTimer />
    </div>
  )
}

// --- Session picker ----------------------------------------------------------

function SessionPicker({ selected, onSelect, store }: { selected?: string; onSelect: (id: string) => void; store: Store }) {
  const today = todayIso()
  const sorted = pickerSessions(today, Object.keys(store))
  // The list is long once run days are in it, so bring the selected day into view.
  const activeRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' }) }, [selected])
  return (
    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '12px' }}>
      {sorted.map((s) => {
        const total = allItemIds(s).length
        const done = (store[s.date]?.ticks ?? []).filter((t) => allItemIds(s).includes(t)).length
        const active = s.id === selected
        return (
          <button
            key={s.id}
            ref={active ? activeRef : undefined}
            onClick={() => onSelect(s.id)}
            style={{
              flex: '0 0 auto', minWidth: '96px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              background: active ? C.surface2 : C.surface, border: `1px solid ${active ? C.green : C.border}`,
              borderRadius: '8px', padding: '8px 10px',
            }}
          >
            <div style={{ color: active ? C.green : C.text, fontSize: '12px', fontWeight: 'bold' }}>
              {fmtShort(s.date)}{s.date === today ? ' · today' : ''}
            </div>
            <div style={{ color: s.kind === 'run' ? C.dim : C.muted, fontSize: '9px', letterSpacing: '0.5px', marginTop: '2px' }}>{s.kind === 'run' ? 'RUN DAY' : 'GYM'}</div>
            <div style={{ color: done === total ? C.green : C.muted, fontSize: '10px', marginTop: '2px' }}>
              {done === 0 ? (s.date < today ? 'not logged' : `${total} items`) : done === total ? 'done ✓' : `${done}/${total} done`}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// --- One session -------------------------------------------------------------

function SessionView({ session, log, store, update }: {
  session: GymSession; log: GymLog; store: Store; update: (fn: (r: GymLog) => void) => void
}) {
  const ids = allItemIds(session)
  const done = log.ticks.filter((t) => ids.includes(t)).length
  const pct = ids.length ? (done / ids.length) * 100 : 0

  const toggle = (id: string) => update((r) => {
    r.ticks = r.ticks.includes(id) ? r.ticks.filter((t) => t !== id) : [...r.ticks, id]
  })

  const setValue = (item: GymItem, idx: number, field: keyof GymSet, value: string) => update((r) => {
    const spec = item.log!
    const sets = r.sets ?? (r.sets = {})
    const arr = sets[item.id] ?? Array.from({ length: spec.sets }, () => ({}))
    while (arr.length < spec.sets) arr.push({})
    arr[idx] = { ...arr[idx], [field]: value }
    sets[item.id] = arr
    // Every set has a number in it: tick the exercise off.
    if (arr.slice(0, spec.sets).every(setFilled) && !r.ticks.includes(item.id)) r.ticks = [...r.ticks, item.id]
  })

  const copyLast = (item: GymItem, prev: GymSet[]) => update((r) => {
    const spec = item.log!
    const sets = r.sets ?? (r.sets = {})
    sets[item.id] = Array.from({ length: spec.sets }, (_, i) => ({ ...(prev[i] ?? prev[prev.length - 1]) }))
    if (!r.ticks.includes(item.id)) r.ticks = [...r.ticks, item.id]
  })

  return (
    <>
      <header style={{ marginBottom: '12px' }}>
        <div style={{ color: C.green, fontSize: '10px', letterSpacing: '1px' }}>{session.eyebrow.toUpperCase()} · {fmtShort(session.date).toUpperCase()}</div>
        <div style={{ color: C.text, fontSize: '22px', fontWeight: 'bold', lineHeight: 1.15, marginTop: '4px' }}>{session.title}</div>
        <div style={{ color: C.dim, fontSize: '12px', lineHeight: 1.5, marginTop: '6px' }}>{session.summary}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {session.chips.map((c) => (
            <span key={c.text} style={{
              fontSize: '10px', padding: '3px 8px', borderRadius: '999px', fontWeight: 'bold',
              background: c.warn ? C.amberSoft : C.greenSoft, color: c.warn ? C.amber : C.green,
            }}>{c.text}</span>
          ))}
        </div>
      </header>

      <div style={{ position: 'sticky', top: 'calc(46px + env(safe-area-inset-top))', zIndex: 5, background: C.bg, padding: '6px 0 10px' }}>
        <div style={{ height: '6px', background: C.surface2, borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: C.green, transition: 'width .25s' }} />
        </div>
        <div style={{ color: done === ids.length ? C.green : C.muted, fontSize: '10px', marginTop: '4px' }}>
          {done} of {ids.length} done{done === ids.length && ids.length > 0 ? (session.kind === 'run' ? '. All done for today.' : '. Good session.') : ''}
        </div>
      </div>

      {session.blocks.map((block, bi) => (
        <section key={block.title} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px 4px' }}>
            <div style={{ color: C.text, fontSize: '14px', fontWeight: 'bold' }}>{bi + 1} · {block.title}</div>
            {block.minutes && <div style={{ color: C.muted, fontSize: '10px' }}>{block.minutes}</div>}
          </div>
          {block.note && <div style={{ color: C.muted, fontSize: '11px', lineHeight: 1.5, padding: '0 14px 8px' }}>{block.note}</div>}
          {block.items.map((item) => (
            <ExerciseRow
              key={item.id}
              item={item}
              done={log.ticks.includes(item.id)}
              sets={log.sets?.[item.id]}
              prev={item.log ? previousSets(store, item.id, session.date) : null}
              onToggle={() => toggle(item.id)}
              onSet={(i, f, v) => setValue(item, i, f, v)}
              onCopyLast={(p) => copyLast(item, p)}
            />
          ))}
        </section>
      ))}

      {session.leftOut && (
        <div style={{ ...card, padding: '12px 14px', borderColor: '#3a3220', color: C.amber, fontSize: '11px', lineHeight: 1.5 }}>
          {session.leftOut}
        </div>
      )}

      <section style={{ ...card, padding: '12px 14px' }}>
        <div style={{ color: C.text, fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>{session.kind === 'run' ? 'Rules' : 'Stop rules'}</div>
        <ul style={{ margin: 0, paddingLeft: '18px', color: C.dim, fontSize: '11px', lineHeight: 1.6, listStyleType: 'disc' }}>
          {session.rules.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>

      <section style={{ ...card, padding: '12px 14px' }}>
        <label style={{ color: C.text, fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }} htmlFor="gym-note">Notes</label>
        <textarea
          id="gym-note"
          value={log.note ?? ''}
          onChange={(e) => update((r) => { r.note = e.target.value })}
          placeholder="How it felt, anything that twinged, test numbers"
          rows={3}
          style={{ ...input, width: '100%', resize: 'vertical', fontSize: '13px', textAlign: 'left' }}
        />
      </section>

      {session.next && <div style={{ color: C.muted, fontSize: '11px', textAlign: 'center', lineHeight: 1.5, margin: '4px 0 8px' }}>{session.next}</div>}
    </>
  )
}

function ExerciseRow({ item, done, sets, prev, onToggle, onSet, onCopyLast }: {
  item: GymItem; done: boolean; sets?: GymSet[]; prev: { date: string; sets: GymSet[] } | null
  onToggle: () => void; onSet: (i: number, f: keyof GymSet, v: string) => void; onCopyLast: (p: GymSet[]) => void
}) {
  const spec = item.log
  const info = exerciseInfo(item.id)
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 14px' }}>
      <div
        role="checkbox"
        aria-checked={done}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle() } }}
        style={{ display: 'grid', gridTemplateColumns: '26px 1fr auto', gap: '10px', alignItems: 'start', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
      >
        <span style={{
          width: '22px', height: '22px', borderRadius: '6px', marginTop: '1px', display: 'grid', placeItems: 'center',
          border: `2px solid ${done ? C.green : C.border}`, background: done ? C.green : 'transparent', color: C.bg, fontSize: '14px', fontWeight: 'bold',
        }}>{done ? '✓' : ''}</span>
        <span style={{ minWidth: 0 }}>
          <span style={{ color: done ? C.muted : C.text, fontSize: '13px', fontWeight: 'bold', textDecoration: done ? 'line-through' : 'none' }}>{item.name}</span>
          {item.how && <span style={{ display: 'block', color: C.muted, fontSize: '11px', lineHeight: 1.45, marginTop: '2px' }}>{item.how}</span>}
        </span>
        <span style={{ color: done ? C.muted : C.dim, fontSize: '11px', whiteSpace: 'nowrap', paddingTop: '2px' }}>{item.dose}</span>
      </div>

      {info && (
        <div style={{ marginLeft: '36px', marginTop: '6px' }}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            style={{ background: 'transparent', border: 'none', padding: '4px 0', color: C.dim, fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          >
            <span style={{ display: 'inline-block', width: '12px', color: C.green }}>{open ? '▾' : '▸'}</span>
            {open ? 'Hide details' : 'How to do it'}
          </button>
          {open && <ExerciseDetails info={info} />}
        </div>
      )}

      {spec && <SetTable spec={spec} sets={sets} prev={prev} onSet={onSet} onCopyLast={onCopyLast} />}
    </div>
  )
}

function ExerciseDetails({ info }: { info: ExerciseInfo }) {
  const head: React.CSSProperties = { color: C.muted, fontSize: '9px', letterSpacing: '0.5px', margin: '10px 0 4px' }
  const body: React.CSSProperties = { color: C.dim, fontSize: '12px', lineHeight: 1.5, margin: 0 }
  const list: React.CSSProperties = { ...body, paddingLeft: '18px' }
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 12px', marginTop: '4px' }}>
      <p style={{ ...body, color: C.text }}>{info.why}</p>
      <div style={head}>HOW</div>
      <ol style={{ ...list, listStyleType: 'decimal' }}>{info.steps.map((t, i) => <li key={i} style={{ marginBottom: '3px' }}>{t}</li>)}</ol>
      {info.feel && (<><div style={head}>SHOULD FEEL LIKE</div><p style={body}>{info.feel}</p></>)}
      {info.avoid && info.avoid.length > 0 && (
        <><div style={{ ...head, color: C.amber }}>WATCH FOR</div>
          <ul style={{ ...list, listStyleType: 'disc' }}>{info.avoid.map((t, i) => <li key={i} style={{ marginBottom: '3px' }}>{t}</li>)}</ul></>
      )}
      {info.video && (
        <a
          href={info.video.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: '10px', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${C.border}`, background: C.surface, color: C.green, fontSize: '11px', textDecoration: 'none', lineHeight: 1.4 }}
        >
          {info.video.kind === 'video' ? `▶ Watch: ${info.video.title}` : `Search YouTube: ${info.video.title}`}
        </a>
      )}
    </div>
  )
}

function SetTable({ spec, sets, prev, onSet, onCopyLast }: {
  spec: GymLogSpec; sets?: GymSet[]; prev: { date: string; sets: GymSet[] } | null
  onSet: (i: number, f: keyof GymSet, v: string) => void; onCopyLast: (p: GymSet[]) => void
}) {
  const countLabel = spec.count === 'reps' ? 'REPS' : spec.count === 'secs' ? 'SECS' : 'METRES'
  const cols = spec.weighted ? '44px 1fr 1fr' : '44px 1fr'
  const anyFilled = (sets ?? []).some(setFilled)
  return (
    <div style={{ marginLeft: '36px', marginTop: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '20px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span style={{ color: C.muted, fontSize: '10px' }}>
          {prev ? <>Last ({fmtShort(prev.date)}): <span style={{ color: C.dim }}>{prev.sets.map((s) => setLabel(s, spec)).join(', ')}</span></> : 'First time logging this'}
        </span>
        {prev && !anyFilled && (
          <button onClick={() => onCopyLast(prev.sets)} style={{ ...pill(false), padding: '3px 8px', fontSize: '10px' }}>SAME AS LAST</button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '6px', color: C.muted, fontSize: '9px', letterSpacing: '0.5px', marginBottom: '4px' }}>
        <span>SET</span>
        {spec.weighted && <span>KG</span>}
        <span>{countLabel}</span>
      </div>
      {Array.from({ length: spec.sets }, (_, i) => {
        const s = sets?.[i] ?? {}
        const p = prev?.sets[i]
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
            <span style={{ color: setFilled(s) ? C.green : C.muted, fontSize: '12px', fontWeight: 'bold' }}>{i + 1}</span>
            {spec.weighted && (
              <input
                inputMode="decimal"
                aria-label={`Set ${i + 1} kg`}
                value={s.kg ?? ''}
                placeholder={p?.kg ?? (spec.kgHint != null ? String(spec.kgHint) : '–')}
                onChange={(e) => onSet(i, 'kg', e.target.value)}
                style={input}
              />
            )}
            <input
              inputMode="numeric"
              aria-label={`Set ${i + 1} ${COUNT_LABEL[spec.count]}`}
              value={s.n ?? ''}
              placeholder={p?.n ?? '–'}
              onChange={(e) => onSet(i, 'n', e.target.value)}
              style={input}
            />
          </div>
        )
      })}
    </div>
  )
}

// --- Progress: best set per exercise, session by session ---------------------

function ProgressView({ store }: { store: Store }) {
  const exercises = exerciseCatalogue()
  const rows = exercises.map((ex) => {
    const history = Object.keys(store).sort()
      .map((d) => ({ date: d, sets: store[d]?.sets?.[ex.id] }))
      .filter((h) => h.sets?.some(setFilled)) as { date: string; sets: GymSet[] }[]
    return { ...ex, history }
  })
  const logged = rows.filter((r) => r.history.length)
  const empty = rows.filter((r) => !r.history.length)

  return (
    <>
      {logged.length === 0 && (
        <div style={{ ...card, padding: '16px', color: C.dim, fontSize: '12px', lineHeight: 1.6 }}>
          Nothing logged yet. Put the kg and reps in as you go in a session and each lift&apos;s history builds up here, with your best set and the change since last time.
        </div>
      )}
      {logged.map((ex) => {
        const latest = ex.history[ex.history.length - 1]
        const before = ex.history[ex.history.length - 2]
        const kNow = bestKg(latest.sets), kBefore = before ? bestKg(before.sets) : null
        const delta = kNow != null && kBefore != null ? kNow - kBefore : null
        const maxKg = Math.max(0, ...ex.history.map((h) => bestKg(h.sets) ?? 0))
        const best = bestSet(latest.sets)
        return (
          <section key={ex.id} style={{ ...card, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ color: C.text, fontSize: '13px', fontWeight: 'bold' }}>{ex.name}</div>
              {delta != null && delta !== 0 && (
                <div style={{ color: delta > 0 ? C.green : C.amber, fontSize: '11px', fontWeight: 'bold' }}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta)} kg</div>
              )}
            </div>
            <div style={{ color: C.dim, fontSize: '11px', marginTop: '2px' }}>
              Latest best: <span style={{ color: C.text }}>{best ? setLabel(best, ex.spec) : '–'}</span> · {fmtShort(latest.date)}
            </div>
            {ex.spec.weighted && maxKg > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px', marginTop: '10px' }} aria-hidden="true">
                {ex.history.slice(-12).map((h) => {
                  const k = bestKg(h.sets) ?? 0
                  return <div key={h.date} title={`${fmtShort(h.date)}: ${k} kg`} style={{ flex: '1 1 0', maxWidth: '24px', height: `${Math.max(8, (k / maxKg) * 100)}%`, background: h === latest ? C.green : '#2f5d43', borderRadius: '2px' }} />
                })}
              </div>
            )}
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {ex.history.slice(-5).reverse().map((h) => (
                <div key={h.date} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '11px' }}>
                  <span style={{ color: C.muted }}>{fmtShort(h.date)}</span>
                  <span style={{ color: C.dim, textAlign: 'right' }}>{h.sets.filter(setFilled).map((s) => setLabel(s, ex.spec)).join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )
      })}
      {logged.length > 0 && empty.length > 0 && (
        <div style={{ color: C.muted, fontSize: '10px', textAlign: 'center', marginTop: '4px' }}>
          Not logged yet: {empty.map((e) => e.name).join(', ')}
        </div>
      )}
    </>
  )
}

// --- Rest timer: floats above the tab bar ------------------------------------

function RestTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!endsAt) return
    const t = setInterval(() => {
      const n = Date.now()
      setNow(n)
      if (n >= endsAt) {
        setEndsAt(null)
        try { navigator.vibrate?.([200, 100, 200]) } catch { /* not supported */ }
      }
    }, 250)
    return () => clearInterval(t)
  }, [endsAt])

  const left = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  return (
    <div className="rest-timer">
      {endsAt ? (
        <button onClick={() => setEndsAt(null)} style={{ ...timerBtn, background: C.green, color: C.bg }} aria-label="Stop rest timer">
          REST {mmss} ✕
        </button>
      ) : open ? (
        <div style={{ display: 'flex', gap: '6px' }}>
          {REST_OPTIONS.map((s) => (
            <button key={s} onClick={() => { setNow(Date.now()); setEndsAt(Date.now() + s * 1000); setOpen(false) }} style={timerBtn}>
              {s < 120 ? `${s}s` : `${s / 60} min`}
            </button>
          ))}
          <button onClick={() => setOpen(false)} style={timerBtn} aria-label="Close">✕</button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={timerBtn}>⏱ REST</button>
      )}
    </div>
  )
}

// --- Styles ------------------------------------------------------------------

const card: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', marginBottom: '10px', overflow: 'hidden',
}

const input: React.CSSProperties = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.text,
  fontFamily: 'inherit', fontSize: '16px', padding: '9px 10px', minHeight: '40px', width: '100%', textAlign: 'center',
}

const timerBtn: React.CSSProperties = {
  background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: '999px',
  padding: '10px 14px', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(0,0,0,.5)',
}

function pill(active: boolean): React.CSSProperties {
  return {
    background: active ? C.green : C.surface2, color: active ? C.bg : C.dim,
    border: `1px solid ${active ? C.green : C.border}`, borderRadius: '999px', padding: '6px 12px',
    fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', cursor: 'pointer',
  }
}
