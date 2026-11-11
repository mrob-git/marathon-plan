'use client'

import { useState, useEffect } from 'react'
import { TabId } from '@/lib/types'
import Nav from './Nav'
import ScheduleTab from './ScheduleTab'
import PacesTab from './PacesTab'
import NutritionTab from './NutritionTab'
import InjuryTab from './InjuryTab'
import AnalyticsTab from './AnalyticsTab'
import BodyCompTab from './BodyCompTab'
import DashboardTab from './DashboardTab'
import MoreTab from './MoreTab'

const RACE_DATE = '2027-04-24'

export default function MarathonApp({ initialTab = 'dashboard' }: { initialTab?: TabId }) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('marathonLastSync')
    if (stored) setLastSync(stored)
  }, [])

  async function handleSync() {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        const now = new Date().toISOString()
        setLastSync(now)
        localStorage.setItem('marathonLastSync', now)
        setSyncMessage(data.message ?? 'Sync complete')
        setRefreshKey((k) => k + 1)
      } else {
        setSyncMessage(`Error: ${data.error ?? 'Sync failed'}`)
      }
    } catch {
      setSyncMessage('Network error — sync failed')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(null), 5000)
    }
  }

  function renderTab() {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab refreshKey={refreshKey} onOpenTab={setActiveTab} />
      case 'schedule':
        return <ScheduleTab refreshKey={refreshKey} />
      case 'more':
        return <MoreTab onSelect={setActiveTab} lastSync={lastSync} />
      case 'analytics':
        return <AnalyticsTab />
      case 'bodycomp':
        return <BodyCompTab />
      case 'paces':
        return <PacesTab />
      case 'nutrition':
        return <NutritionTab />
      case 'injury':
        return <InjuryTab />
      default:
        return <ScheduleTab />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Nav
        active={activeTab}
        onSelect={setActiveTab}
        onSync={handleSync}
        syncing={syncing}
        lastSync={lastSync}
        daysToGo={Math.max(0, Math.ceil((new Date(RACE_DATE + 'T09:35:00').getTime() - Date.now()) / 86400000))}
      />

      {syncMessage && (
        <div
          style={{
            background: syncMessage.startsWith('Error') ? '#1a0a0a' : '#0a1a0a',
            borderBottom: `1px solid ${syncMessage.startsWith('Error') ? '#7f1d1d' : '#14532d'}`,
            padding: '8px 16px',
            color: syncMessage.startsWith('Error') ? '#f87171' : '#4ade80',
            fontSize: '11px',
            letterSpacing: '0.3px',
          }}
        >
          {syncMessage}
        </div>
      )}

      <main className="app-main">{renderTab()}</main>
    </div>
  )
}
