'use client'

import { TabId } from '@/lib/types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'base', label: 'Base' },
  { id: 'development', label: 'Development' },
  { id: 'peak', label: 'Peak' },
  { id: 'taper', label: 'Taper' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'bodycomp', label: 'Body Comp' },
  { id: 'paces', label: 'Paces' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'injury', label: 'Injury' },
]

interface NavProps {
  active: TabId
  onSelect: (id: TabId) => void
  onSync: () => void
  syncing: boolean
  lastSync: string | null
}

export default function Nav({ active, onSelect, onSync, syncing, lastSync }: NavProps) {
  return (
    <nav
      style={{
        background: '#111118',
        borderBottom: '1px solid #2a2a3a',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'wrap',
        minHeight: '48px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
        <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>
          LDN 2027
        </span>
        <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>2:58:00</span>
      </div>

      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          style={{
            background: active === tab.id ? '#4ade80' : 'transparent',
            color: active === tab.id ? '#0a0a0f' : '#94a3b8',
            border: 'none',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '11px',
            letterSpacing: '0.5px',
            fontFamily: 'inherit',
            fontWeight: active === tab.id ? 'bold' : 'normal',
            borderRadius: '4px',
          }}
        >
          {tab.label.toUpperCase()}
        </button>
      ))}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {lastSync && (
          <span style={{ color: '#64748b', fontSize: '10px' }}>
            synced {formatRelative(lastSync)}
          </span>
        )}
        <button
          onClick={onSync}
          disabled={syncing}
          style={{
            background: syncing ? '#1a1a24' : '#4ade80',
            color: syncing ? '#64748b' : '#0a0a0f',
            border: 'none',
            padding: '6px 14px',
            cursor: syncing ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit',
            fontWeight: 'bold',
            borderRadius: '4px',
            letterSpacing: '0.5px',
          }}
        >
          {syncing ? 'SYNCING...' : 'SYNC'}
        </button>
      </div>
    </nav>
  )
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
