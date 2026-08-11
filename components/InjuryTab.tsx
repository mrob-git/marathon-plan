export default function InjuryTab() {
  const protocols = [
    {
      condition: 'IT Band Syndrome',
      symptoms: 'Sharp lateral knee pain, worse on downhills. Often starts after week-on-week mileage jumps.',
      acute: [
        'Stop run if pain > 3/10. Walk home.',
        'Ice 15 min, 3× daily for 48 hours.',
        'Rest 3–5 days from running.',
      ],
      rehab: [
        'Foam roll lateral quad, TFL — 60s each side, daily.',
        'Clamshells 3×15 each side.',
        'Side-lying hip abduction 3×15.',
        'Single-leg squat with control — check knee tracking.',
        'Gradual return: start on flat, no back-to-back days.',
      ],
      flag: 'Pain persists beyond 7 days rest → physio referral.',
    },
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

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
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
                gridTemplateColumns: '1fr 1fr',
                gap: '0',
                padding: '12px 16px',
              }}
            >
              <div style={{ borderRight: '1px solid #2a2a3a', paddingRight: '16px' }}>
                <div style={{ color: '#f87171', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  ACUTE MANAGEMENT
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {p.acute.map((a, i) => (
                    <li key={i} style={{ color: '#94a3b8', fontSize: '11px' }}>{a}</li>
                  ))}
                </ul>
              </div>
              <div style={{ paddingLeft: '16px' }}>
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
    </div>
  )
}
