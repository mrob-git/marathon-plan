export default function NutritionTab() {
  const phases = [
    {
      phase: 'Base Phase',
      tdee: '2,687 kcal',
      carbs: '350–400g',
      protein: '145g (2.0g/kg)',
      fat: '75–90g',
      notes: 'Build habit of fuelling easy runs. No need to fuel runs under 75 min.',
    },
    {
      phase: 'Development Phase',
      tdee: '2,900 kcal',
      carbs: '420–470g',
      protein: '150g',
      fat: '80–95g',
      notes: 'Increase CHO as long runs extend past 90 min. Gel/chew from 60 min on long days.',
    },
    {
      phase: 'Peak Phase',
      tdee: '3,100 kcal',
      carbs: '470–520g',
      protein: '155g',
      fat: '85–100g',
      notes: 'High carb days around long runs and marathon pace sessions. Practise race-day nutrition.',
    },
    {
      phase: 'Taper',
      tdee: '2,600 kcal',
      carbs: '400–440g',
      protein: '150g',
      fat: '70–85g',
      notes: 'Carb-load from 3 days out. Avoid novel foods. Familiar, gut-tested options only.',
    },
  ]

  const raceDayPlan = [
    { time: '06:00', item: 'Breakfast', detail: 'Porridge 100g oats + banana + honey + black coffee (200–250mg caffeine)' },
    { time: '08:45', item: 'Pre-race', detail: 'Bagel with peanut butter + 500ml water + caffeine gel if needed' },
    { time: '09:15', item: 'Warm up', detail: 'Light jog. Gel 15 min before gun if not taken already.' },
    { time: '09:30', item: 'GUN', detail: 'London Marathon start' },
    { time: '0–5 km', item: 'Settle', detail: 'Water only. Let HR settle.' },
    { time: '45 min', item: 'Gel 1', detail: 'SiS Beta Fuel or Maurten 100 gel' },
    { time: '75 min', item: 'Gel 2', detail: 'Caffeine gel (100mg)' },
    { time: '105 min', item: 'Gel 3', detail: 'Standard gel' },
    { time: '135 min', item: 'Gel 4', detail: 'Caffeine gel (100mg)' },
    { time: '165 min', item: 'Gel 5 (if needed)', detail: 'Standard gel — optional based on feel' },
    { time: 'Finish', item: 'Recovery', detail: '500ml recovery drink, banana, protein within 30 min' },
  ]

  const hydration = [
    { label: 'Race day target', value: '400–600ml/hour' },
    { label: 'Electrolytes', value: 'SiS Hydro tabs or Nuun on runs > 90 min' },
    { label: 'Pre-run (short)', value: '400–500ml water, no gel needed' },
    { label: 'Pre-run (long)', value: '500ml + electrolytes in bottle' },
    { label: 'Training gel frequency', value: 'Every 30–40 min on runs > 75 min' },
    { label: 'Daily water target', value: '3–3.5L including drinks' },
  ]

  const carbLoading = [
    { day: 'T-3 (Wednesday)', kcal: '3,400', carbs: '600g', notes: 'Start carb-loading. Normal protein/fat.' },
    { day: 'T-2 (Thursday)', kcal: '3,600', carbs: '650g', notes: 'Max carb day. Light or no training.' },
    { day: 'T-1 (Friday)', kcal: '3,200', carbs: '550g', notes: 'Moderate. Rest day. Avoid bloating foods.' },
    { day: 'Race Eve (Saturday)', kcal: '2,800', carbs: '450g', notes: 'Pasta dinner early. Bed by 22:00.' },
  ]

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Baseline data */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <KV label="BMR" value="1,734 kcal" color="#e2e8f0" />
        <KV label="Base TDEE" value="2,687 kcal" color="#4ade80" />
        <KV label="Weight" value="71.2 kg" color="#e2e8f0" />
        <KV label="Protein target" value="2.0 g/kg" color="#fbbf24" />
        <KV label="Carb strategy" value="Periodised" color="#60a5fa" />
      </div>

      {/* Phase nutrition */}
      <SectionHeader>PHASE NUTRITION TARGETS</SectionHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {phases.map((p) => (
          <div
            key={p.phase}
            style={{
              background: '#111118',
              border: '1px solid #2a2a3a',
              borderRadius: '6px',
              padding: '12px 16px',
            }}
          >
            <div style={{ color: '#4ade80', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
              {p.phase}
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <KV label="TDEE" value={p.tdee} color="#e2e8f0" />
              <KV label="Carbs" value={p.carbs} color="#60a5fa" />
              <KV label="Protein" value={p.protein} color="#fbbf24" />
              <KV label="Fat" value={p.fat} color="#a78bfa" />
            </div>
            <div style={{ color: '#64748b', fontSize: '11px' }}>{p.notes}</div>
          </div>
        ))}
      </div>

      {/* Race day */}
      <SectionHeader>RACE DAY NUTRITION PLAN</SectionHeader>
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          marginBottom: '24px',
          overflow: 'hidden',
        }}
      >
        {raceDayPlan.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '10px 16px',
              borderBottom: i < raceDayPlan.length - 1 ? '1px solid #1a1a24' : 'none',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: '#4ade80', fontSize: '11px', minWidth: '60px', fontWeight: 'bold' }}>
              {row.time}
            </span>
            <span style={{ color: '#fbbf24', fontSize: '11px', minWidth: '90px' }}>{row.item}</span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>{row.detail}</span>
          </div>
        ))}
      </div>

      {/* Carb loading */}
      <SectionHeader>CARB-LOADING PROTOCOL (T-3 to T-0)</SectionHeader>
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          marginBottom: '24px',
          overflow: 'hidden',
        }}
      >
        {carbLoading.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '10px 16px',
              borderBottom: i < carbLoading.length - 1 ? '1px solid #1a1a24' : 'none',
            }}
          >
            <span style={{ color: '#4ade80', fontSize: '11px', minWidth: '140px', fontWeight: 'bold' }}>{row.day}</span>
            <span style={{ color: '#60a5fa', fontSize: '11px', minWidth: '60px' }}>{row.carbs}</span>
            <span style={{ color: '#fbbf24', fontSize: '11px', minWidth: '70px' }}>{row.kcal} kcal</span>
            <span style={{ color: '#64748b', fontSize: '11px' }}>{row.notes}</span>
          </div>
        ))}
      </div>

      {/* Hydration */}
      <SectionHeader>HYDRATION GUIDELINES</SectionHeader>
      <div
        style={{
          background: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '6px',
          padding: '16px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {hydration.map((h) => (
            <div key={h.label}>
              <div style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px' }}>{h.label.toUpperCase()}</div>
              <div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 'bold' }}>{h.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KV({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: '9px', letterSpacing: '0.5px' }}>{label.toUpperCase()}</div>
      <div style={{ color, fontSize: '13px', fontWeight: 'bold' }}>{value}</div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', marginBottom: '10px' }}>
      {children}
    </div>
  )
}
