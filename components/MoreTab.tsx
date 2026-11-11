'use client'

import { TabId } from '@/lib/types'

const ITEMS: { id: TabId; label: string; blurb: string }[] = [
  { id: 'analytics', label: 'Analytics', blurb: 'Planned vs actual by week, HR trend' },
  { id: 'paces', label: 'Paces and zones', blurb: 'Lab zones, target paces for 3:10' },
  { id: 'injury', label: 'Injury protocols', blurb: 'What to do when something flares up' },
]

export default function MoreTab({ onSelect, lastSync }: { onSelect: (id: TabId) => void; lastSync: string | null }) {
  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              background: '#111118',
              border: '1px solid #2a2a3a',
              borderRadius: '8px',
              padding: '14px 16px',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold' }}>{item.label}</div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{item.blurb}</div>
            </div>
            <span style={{ color: '#64748b', fontSize: '16px' }}>›</span>
          </button>
        ))}
      </div>

      <div style={{ color: '#64748b', fontSize: '10px', marginTop: '20px', lineHeight: 1.6 }}>
        <div>Runs sync from Intervals.icu with the SYNC button at the top{lastSync ? ` (last ${new Date(lastSync).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })})` : ''}.</div>
        <div style={{ marginTop: '6px' }}>On iPhone: Share → Add to Home Screen gives you a full-screen app with its own icon.</div>
      </div>
    </div>
  )
}
