export default function PacesTab() {
  const zones = [
    {
      name: 'Recovery',
      bpm: '< 125',
      color: '#64748b',
      pace: '> 5:30/km',
      description: 'Complete recovery. Post-hard effort days. Feel very easy.',
    },
    {
      name: 'Aerobic 1',
      bpm: '126–139',
      color: '#60a5fa',
      pace: '5:00–5:30/km',
      description: 'Base building. Conversational. Easy run default zone. All easy days target here.',
    },
    {
      name: 'Aerobic 2',
      bpm: '140–156',
      color: '#4ade80',
      pace: '4:30–5:00/km',
      description: 'Upper aerobic. LT1 ceiling at 156 bpm (2.0 mMol/L lactate). Comfortable but purposeful.',
    },
    {
      name: 'Tempo',
      bpm: '157–169',
      color: '#fbbf24',
      pace: '4:15–4:30/km',
      description: 'Comfortably hard. Between LT1 and LT2. Marathon pace is top of this zone.',
    },
    {
      name: 'LT2 / Race',
      bpm: '170+',
      color: '#f87171',
      pace: '< 4:15/km',
      description: 'At or above LT2 (4.0 mMol/L at 170 bpm). Interval work. Unsustainable beyond ~60 min.',
    },
  ]

  const targetPaces = [
    { label: 'Marathon target (2:58)', pace: '4:14/km', hr: '~170 bpm', notes: 'LT2 / race ceiling' },
    { label: 'Marathon pace zone', pace: '4:10–4:20/km', hr: '165–170 bpm', notes: 'Race effort' },
    { label: 'Tempo (LT1–LT2)', pace: '4:15–4:30/km', hr: '157–169 bpm', notes: 'Quality sessions' },
    { label: 'Long run', pace: '4:45–5:10/km', hr: '140–156 bpm', notes: 'Aerobic 2 zone' },
    { label: 'Easy run', pace: '5:00–5:30/km', hr: '126–139 bpm', notes: 'Aerobic 1 zone' },
    { label: 'Recovery jog', pace: '> 5:30/km', hr: '< 125 bpm', notes: 'Full recovery' },
  ]

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ color: '#4ade80', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>
          HR ZONES — LAB CONFIRMED
        </div>
        <div style={{ color: '#64748b', fontSize: '11px' }}>
          Focused Running lactate test · May 2024 · Max HR: 191 bpm · LT1: 156 bpm · LT2: 170 bpm
        </div>
      </div>

      {/* Zone cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {zones.map((z) => (
          <div
            key={z.name}
            style={{
              background: '#111118',
              border: `1px solid ${z.color}33`,
              borderLeft: `3px solid ${z.color}`,
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ color: z.color, fontSize: '13px', fontWeight: 'bold', marginBottom: '3px' }}>
                {z.name}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>{z.description}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ color: z.color, fontSize: '14px', fontWeight: 'bold' }}>{z.bpm} bpm</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>{z.pace}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Target paces table */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', marginBottom: '12px' }}>
          TARGET PACES
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
              {['SESSION TYPE', 'TARGET PACE', 'TARGET HR', 'NOTES'].map((h) => (
                <th
                  key={h}
                  style={{
                    color: '#64748b',
                    fontSize: '10px',
                    letterSpacing: '0.5px',
                    textAlign: 'left',
                    padding: '4px 8px 8px 0',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {targetPaces.map((p, i) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid #1a1a24' }}
              >
                <td style={{ color: '#e2e8f0', padding: '8px 8px 8px 0' }}>{p.label}</td>
                <td style={{ color: '#4ade80', padding: '8px 8px 8px 0', fontWeight: 'bold' }}>{p.pace}</td>
                <td style={{ color: '#fbbf24', padding: '8px 8px 8px 0' }}>{p.hr}</td>
                <td style={{ color: '#64748b', padding: '8px 8px 8px 0' }}>{p.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key data */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', marginBottom: '12px' }}>
          ATHLETE DATA
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Max HR', value: '191 bpm' },
            { label: 'LT1', value: '156 bpm' },
            { label: 'LT2', value: '170 bpm' },
            { label: 'Easy ceiling', value: '134 bpm (70% max)' },
            { label: 'Weight', value: '71.2 kg' },
            { label: 'Height', value: '178 cm' },
            { label: 'Age', value: '34' },
            { label: 'BMR', value: '1,734 kcal' },
            { label: 'Target', value: 'Sub-3 · 2:58:00' },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px' }}>{item.label.toUpperCase()}</div>
              <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
