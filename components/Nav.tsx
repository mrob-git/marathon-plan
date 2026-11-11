'use client'

import { TabId } from '@/lib/types'

const TABS: { id: TabId; label: string; icon: JSX.Element }[] = [
  { id: 'dashboard', label: 'TODAY', icon: <Icon d="M4 10 12 3l8 7v10a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" /> },
  { id: 'schedule', label: 'PLAN', icon: <Icon d="M4 5h16v15H4zM4 10h16M8 3v4M16 3v4" /> },
  { id: 'nutrition', label: 'FUEL', icon: <Icon d="M7 4h10l-1 16H8zM6 9h12" /> },
  { id: 'bodycomp', label: 'BODY', icon: <Icon d="M5 7h14v10H5zM12 7v10M8 12h8" /> },
  { id: 'more', label: 'MORE', icon: <Icon d="M5 12h.01M12 12h.01M19 12h.01" /> },
]

// Tabs that live under MORE keep MORE highlighted.
const UNDER_MORE: TabId[] = ['more', 'analytics', 'paces', 'injury']

interface NavProps {
  active: TabId
  onSelect: (id: TabId) => void
  onSync: () => void
  syncing: boolean
  lastSync: string | null
  daysToGo: number
}

export default function Nav({ active, onSelect, onSync, syncing, lastSync, daysToGo }: NavProps) {
  return (
    <>
      <header className="app-header">
        <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>LDN 2027</span>
        <span style={{ color: '#64748b', fontSize: '11px' }}>3:10 · {daysToGo} days</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lastSync && (
            <span style={{ color: '#64748b', fontSize: '10px' }}>synced {formatRelative(lastSync)}</span>
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
      </header>

      <nav className="tab-bar" aria-label="Main">
        {TABS.map((tab) => {
          const isActive = tab.id === 'more' ? UNDER_MORE.includes(active) : active === tab.id
          return (
            <button key={tab.id} className={isActive ? 'active' : undefined} onClick={() => onSelect(tab.id)}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
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
