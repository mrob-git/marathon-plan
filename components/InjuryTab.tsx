'use client'

import { useEffect, useState } from 'react'
import { NiggleEntry } from '@/lib/types'
import NigglesCard from './NiggleLog'

// Mike's own history, oldest first. Live entries come from the niggle log below.
const HISTORY = [
  { when: 'May 2026', what: 'Knee, Base W3', note: 'Settled after a down week; Thursday skipped, Saturday short test run.' },
  { when: 'Sep 2026', what: 'Hamstring', note: 'After the NSM reps. Resolved by 5 Oct.' },
  { when: 'Sep 2026', what: 'Calf', note: 'Race week before Vitality 10K. Resolved by 5 Oct.' },
  { when: '27 Sep 2026', what: 'Peroneal', note: 'A mechanics change at Vitality (not the carbon shoes). Resolved by 5 Oct.' },
  { when: '23–24 Oct 2026', what: 'Achilles / soleus', note: 'Felt walking the dog, aggravated by isometric calf raises and backwards farmer\'s carries at the gym. Long run skipped, test run clean 25 Oct, symptom-free since.' },
]

export default function InjuryTab() {
  const [log, setLog] = useState<NiggleEntry[] | null>(null)
  const [showOthers, setShowOthers] = useState(false)

  useEffect(() => {
    fetch('/api/niggles', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: NiggleEntry[]) => setLog(Array.isArray(d) ? d : []))
      .catch(() => setLog([]))
  }, [])

  // The three that have actually happened to Mike come first.
  const mine = [
    {
      condition: 'Achilles / soleus (Oct 2026)',
      symptoms: 'Achilles: pinch-tender 2–6 cm above the heel, stiff first steps in the morning. Soleus: deep lower-calf ache, worse with the knee bent. Both flare after calf loading at the gym more than after runs.',
      acute: [
        'Pain over 3/10 or a change in gait: stop, walk home, skip the next run and do not make it up.',
        'No calf isometrics, heavy raises or backwards farmer\'s carries at the gym until symptom-free for a week.',
        'No stretching into pain. Bike if pain-free.',
        'Test before returning: first steps, stairs, 10 single-leg heel raises (straight and bent knee), 10 hops. Under 2/10 and not worse after: 30–40 min easy, flat, Megablast.',
      ],
      rehab: [
        'Double-leg bodyweight heel raises first, then single-leg, 3×15 straight-knee and 3×15 bent-knee (soleus), every other day.',
        'Add load slowly over 2–3 weeks; morning stiffness the next day is the signal to hold the load, not add to it.',
        'Hills and speed come back last, after two clean easy weeks.',
        'Keep the Running Revamp daily routine; it is the calf-foot work that prevents this.',
      ],
      flag: 'Sudden sharp or "kicked" feeling, swelling or a lump on the tendon, or cannot do one single-leg heel raise → physio within 48 h.',
    },
    {
      condition: 'Peroneal tendon (Sep 2026)',
      symptoms: 'Ache or burning behind and below the outer ankle bone, sometimes up the outside of the lower leg. Worse on cambered roads and uneven ground. Yours came from a mechanics change, not the shoes.',
      acute: [
        'Drop intensity to easy for 3–5 days and stay on flat, even surfaces (no camber, no trail).',
        'Ice 10–15 min after runs for the first 48 h if it is sore.',
        'Check what changed: new shoes, a drill or cue that altered your foot strike, a sudden increase in strides.',
      ],
      rehab: [
        'Resisted eversion with a band, 3×15 each side, daily.',
        'Single-leg balance 3×30 s, eyes open then closed.',
        'Calf raises with the weight through the big toe, 3×15.',
        'Return to normal roads before any quality work.',
      ],
      flag: 'Ankle gives way, snapping over the ankle bone, or no better after 2 weeks of easy running → physio.',
    },
    {
      condition: 'Knee (Base W3, May 2026)',
      symptoms: 'Lateral knee pain, worse on downhills and after a jump in load. Your pattern: it came with the first volume step-up of the block.',
      acute: [
        'Stop the run if pain goes over 3/10. Walk home.',
        'Skip the next quality session; keep easy runs if pain-free.',
        'Take the down week early rather than late.',
      ],
      rehab: [
        'Clamshells 3×15 and side-lying hip abduction 3×15, daily.',
        'Single-leg squat with control; watch the knee tracking over the second toe.',
        'Foam roll lateral quad and TFL, 60 s each side.',
        'Return on the flat, no back-to-back run days for the first week.',
      ],
      flag: 'Pain persists beyond 7 days of easy running → physio referral.',
    },
  ]

  const others = [
    {
      condition: 'Plantar Fasciitis',
      symptoms: 'Sharp heel pain on first steps in morning. May ease during run then return after.',
      acute: [
        'Reduce volume by 30–50%. No speed work.',
        'Ice massage (frozen bottle) under foot 10 min after running.',
        'Avoid barefoot on hard floors.',
      ],
      rehab: [
        'Calf raises (eccentric) 3×15, both legs, over edge of step.',
        'Plantar fascia stretch — seated, pull toes back 3×30s.',
        'Towel scrunches 2×30s per foot.',
        'Supportive footwear 100% of the time.',
        'Gradual return after 2–3 pain-free days.',
      ],
      flag: 'Pain lasts beyond 3 weeks or worsens → physio.',
    },
    {
      condition: 'Shin Splints (MTSS)',
      symptoms: 'Diffuse ache along medial tibia, worse at start and after runs. Not a sharp localised pain.',
      acute: [
        'Reduce volume 40–50% immediately.',
        'Ice after runs.',
        'No speed work until pain-free.',
      ],
      rehab: [
        'Calf raises (concentric and eccentric) — progressive loading.',
        'Toe walks and heel walks 2×20m.',
        'Check footwear — replace if over 600 km.',
        'Run on softer surfaces if possible.',
        'No back-to-back run days during recovery.',
      ],
      flag: 'Sharp localised pain or pain at rest → rule out stress fracture with scan.',
    },
    {
      condition: 'Hamstring Tightness / Strain',
      symptoms: 'Tightness or ache in posterior thigh. Grade 1 strain: ache during and after. Grade 2: sharp pain stops run.',
      acute: [
        'Grade 1: reduce intensity, no tempo/intervals for 5–7 days.',
        'Grade 2: stop running, ice, seek physio within 48h.',
        'Avoid aggressive stretching in first 72h.',
      ],
      rehab: [
        'Nordic hamstring curls — progressive. 3×5 to 3×10.',
        'Romanian deadlift (light) 3×10.',
        'Glute bridges 3×12.',
        'Walking lunges with control.',
        'Return to tempo only when pain-free on easy runs.',
      ],
      flag: 'Grade 2 or above always warrants physio assessment.',
    },
    {
      condition: 'General Fatigue / Overtraining',
      symptoms: 'Elevated resting HR (> 5 bpm above baseline), poor sleep, flat legs, no motivation, low HRV.',
      acute: [
        'Take 2–3 days complete rest — no guilt.',
        'Prioritise sleep (8–9h).',
        'Reduce next week volume by 30%.',
      ],
      rehab: [
        'Check fuelling — are you under-eating on high-volume days?',
        'Review training load — did volume jump > 10% in a week?',
        'Consider sleep quality and stress load.',
        'Easy runs only for 5–7 days on return.',
      ],
      flag: 'Fatigue persists > 2 weeks despite rest → blood test (iron, ferritin, thyroid).',
    },
  ]

  const generalRules = [
    'Never increase weekly volume more than 10% week-on-week.',
    'Every 3rd or 4th week is a recovery week — protect these.',
    'Pain > 3/10 during a run: stop. Walk home. Do not push through.',
    'A missed session is recoverable. A serious injury is not.',
    'Replace shoes every 600–800 km. Track mileage on each pair.',
    'Sleep 8+ hours. Recovery is built in sleep, not in training.',
    'If HR is elevated on an easy run, slow down — do not force the pace.',
    'Always warm up properly for intervals and marathon pace sessions.',
  ]

  const protocols = showOthers ? [...mine, ...others] : mine

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Live log */}
      <div style={{ marginBottom: '12px' }}>
        <NigglesCard log={log} onChange={setLog} compact={false} />
      </div>

      {/* History */}
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '8px' }}>YOUR HISTORY</div>
        <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '10px', lineHeight: 1.5 }}>
          Every niggle so far has followed a change in intensity or a new gym load on top of fatigue, never steady volume. That is what the readiness call and the Dev 11 gate watch for.
        </div>
        {HISTORY.map((h, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 0', borderTop: i ? '1px solid #1a1a24' : 'none' }}>
            <div style={{ color: '#64748b', fontSize: '10px', width: '92px', flexShrink: 0, paddingTop: '2px' }}>{h.when}</div>
            <div>
              <div style={{ color: '#e2e8f0', fontSize: '12px' }}>{h.what}</div>
              <div style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.4 }}>{h.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* General rules */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #f87171',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ color: '#f87171', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '10px' }}>
          INJURY PREVENTION RULES
        </div>
        <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {generalRules.map((r, i) => (
            <li key={i} style={{ color: '#94a3b8', fontSize: '12px' }}>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Protocol cards */}
      <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginBottom: '8px' }}>PROTOCOLS FOR YOUR INJURIES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {protocols.map((p) => (
          <div
            key={p.condition}
            style={{
              background: '#111118',
              border: '1px solid #2a2a3a',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: '#1a1a24',
                padding: '10px 16px',
                borderBottom: '1px solid #2a2a3a',
              }}
            >
              <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 'bold' }}>{p.condition}</div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '3px' }}>{p.symptoms}</div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
                padding: '12px 16px',
              }}
            >
              <div>
                <div style={{ color: '#f87171', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  ACUTE MANAGEMENT
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {p.acute.map((a, i) => (
                    <li key={i} style={{ color: '#94a3b8', fontSize: '11px' }}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ color: '#4ade80', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  REHAB EXERCISES
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {p.rehab.map((r, i) => (
                    <li key={i} style={{ color: '#94a3b8', fontSize: '11px' }}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              style={{
                background: '#120a0a',
                borderTop: '1px solid #2a2a3a',
                padding: '8px 16px',
              }}
            >
              <span style={{ color: '#f87171', fontSize: '10px', letterSpacing: '0.5px' }}>FLAG: </span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{p.flag}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowOthers((v) => !v)}
        style={{ marginTop: '16px', background: 'transparent', border: '1px solid #2a2a3a', color: '#94a3b8', borderRadius: '4px', padding: '6px 12px', fontFamily: 'inherit', fontSize: '10px', letterSpacing: '0.5px', cursor: 'pointer' }}
      >
        {showOthers ? 'HIDE OTHER PROTOCOLS' : 'SHOW OTHER PROTOCOLS (PLANTAR, SHINS, HAMSTRING, FATIGUE)'}
      </button>
    </div>
  )
}
