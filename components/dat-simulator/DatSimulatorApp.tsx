'use client'

import DatLoginView from './DatLoginView'
import DatSidebar from './DatSidebar'
import DatDashboardView from './views/DatDashboardView'
import DatSearchView from './views/DatSearchView'
import DatTrucksView from './views/DatTrucksView'
import DatPostTruckView from './views/DatPostTruckView'
import DatLoadsView from './views/DatLoadsView'
import DatNetworkView from './views/DatNetworkView'
import DatToolsView from './views/DatToolsView'
import DatAiCallModal from './modals/DatAiCallModal'
import DatBookedModal from './modals/DatBookedModal'
import DatDocModal from './modals/DatDocModal'

export default function DatSimulatorApp() {
  return (
    <div className="dat-simulator-root">
      <DatLoginView />

      <div id="dat-app" className="dat-view">
        <button className="dat-mobile-hamburger" onClick={() => (window as any).toggleDatSidebar?.()}>☰</button>
        <div id="dat-sidebar-overlay" className="dat-sidebar-overlay" onClick={() => (window as any).toggleDatSidebar?.()}></div>

        <DatSidebar />

        <div className="dat-main">
          <DatDashboardView />
          <DatSearchView />
          <DatTrucksView />
          <DatPostTruckView />
          <DatLoadsView />
          <DatNetworkView />
          <DatToolsView />
        </div>
      </div>

      <DatAiCallModal />
      <DatBookedModal />
      <DatDocModal />
    </div>
  )
}
