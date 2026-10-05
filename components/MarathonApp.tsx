'use client'

import { useState, useEffect } from 'react'
import { TabId } from '@/lib/types'
import { TRAINING_PLAN } from '@/lib/trainingData'
import Nav from './Nav'
import ScheduleTab from './ScheduleTab'
import PhaseSummaryTab from './PhaseSummaryTab'
import PacesTab from './PacesTab'
import NutritionTab from './NutritionTab'
import InjuryTab from './InjuryTab'
import AnalyticsTab from './AnalyticsTab'
import BodyCompTab from './BodyCompTab'
import DashboardTab from './DashboardTab'

export default function MarathonApp() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
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
        return <DashboardTab refreshKey={refreshKey} />
      case 'schedule':
        return <ScheduleTab refreshKey={refreshKey} />
      case 'base':
        return <PhaseSummaryTab phase={TRAINING_PLAN.base} />
      case 'development':
        return <PhaseSummaryTab phase={TRAINING_PLAN.development} />
      case 'peak':
        return <PhaseSummaryTab phase={TRAINING_PLAN.peak} />
      case 'taper':
        return <PhaseSummaryTab phase={TRAINING_PLAN.taper} />
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

      <main style={{ paddingTop: '8px' }}>{renderTab()}</main>
    </div>
  )
}
