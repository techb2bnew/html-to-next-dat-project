'use client'

import { useDatSim } from '@/lib/hooks/useDatSim'
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
import DatDriverChatModal from './modals/DatDriverChatModal'

export default function DatSimulatorApp() {
  const ctx = useDatSim()

  return (
    <div className="fixed inset-0 flex font-[Inter] bg-white text-slate-700 overflow-hidden z-[1]">
      {!ctx.isLoggedIn ? (
        <DatLoginView
          email={ctx.loginEmail}
          name={ctx.loginName}
          loading={ctx.loginLoading}
          error={ctx.loginError}
          onEmailChange={ctx.setLoginEmail}
          onNameChange={ctx.setLoginName}
          onLogin={() => ctx.login(ctx.loginEmail, ctx.loginName)}
        />
      ) : (
        <div className="flex w-full h-full overflow-hidden">
          {/* Mobile hamburger */}
          <button
            className="fixed top-3 left-3 z-[1000] bg-slate-800 text-white border border-white/15 px-3.5 py-2 rounded-md text-xl cursor-pointer shadow-md items-center justify-center lg:hidden flex"
            onClick={ctx.toggleSidebar}
          >☰</button>

          {/* Mobile overlay */}
          {ctx.sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden"
              onClick={ctx.closeSidebar}
            />
          )}

          <DatSidebar
            view={ctx.view}
            sidebarOpen={ctx.sidebarOpen}
            onNav={ctx.navigate}
            onClose={ctx.closeSidebar}
            onLogout={ctx.logout}
          />

          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {ctx.view === 'dashboard' && (
              <DatDashboardView
                nationalLoads={ctx.nationalLoads}
                natEquipment={ctx.natEquipment}
                natLoading={ctx.natLoading}
                onChangeEquip={ctx.changeNatEquipment}
                recommendedLoads={ctx.recommendedLoads}
                recLoading={ctx.recLoading}
                onRegenerate={ctx.regenerateRecommendedLoads}
                onNav={ctx.navigate}
                onCallBroker={ctx.openCallBroker}
                onEmailBroker={ctx.openEmailBroker}
              />
            )}
            {ctx.view === 'search' && (
              <DatSearchView
                searchTabs={ctx.searchTabs}
                activeTabId={ctx.activeTabId}
                activeTab={ctx.activeTab}
                expandedLoadId={ctx.expandedLoadId}
                searchLoading={ctx.searchLoading}
                isAutoScanning={ctx.isAutoScanning}
                onSwitchTab={ctx.switchTab}
                onAddTab={ctx.addNewTab}
                onCloseTab={ctx.closeTab}
                onUpdateTabField={ctx.updateTabField}
                onSearch={ctx.executeSearch}
                onToggleAutoScan={ctx.toggleAutoScan}
                onToggleExpandedRow={ctx.toggleExpandedRow}
                onCallBroker={ctx.openCallBroker}
                onEmailBroker={ctx.openEmailBroker}
              />
            )}
            {ctx.view === 'trucks' && (
              <DatTrucksView
                carriers={ctx.carriers}
                loading={ctx.trucksLoading}
                postedTrucks={ctx.postedTrucks}
                onDriverChat={ctx.openDriverChat}
              />
            )}
            {ctx.view === 'post_truck' && (
              <DatPostTruckView
                origin={ctx.postOrigin}
                dest={ctx.postDest}
                equip={ctx.postEquip}
                date={ctx.postDate}
                loading={ctx.postLoading}
                message={ctx.postMessage}
                postedTrucks={ctx.postedTrucks}
                onOriginChange={ctx.setPostOrigin}
                onDestChange={ctx.setPostDest}
                onEquipChange={ctx.setPostEquip}
                onDateChange={ctx.setPostDate}
                onPost={ctx.postTruckAction}
              />
            )}
            {ctx.view === 'loads' && (
              <DatLoadsView
                bookedLoads={ctx.bookedLoads}
                loadCount={ctx.loadCount}
                revenue={ctx.revenue}
                loading={ctx.loadsLoading}
              />
            )}
            {ctx.view === 'network' && <DatNetworkView />}
            {ctx.view === 'tools' && <DatToolsView />}
          </div>
        </div>
      )}

      <DatAiCallModal
        callState={ctx.callState}
        currentLoad={ctx.currentLoadData}
        onClose={ctx.closeCallModal}
        onToggleVoice={ctx.toggleVoiceRecognition}
        onSendMessage={ctx.sendCallMessage}
      />

      <DatBookedModal
        isOpen={ctx.bookedModalOpen}
        scoreBadge={ctx.scoreBadge}
        onClose={ctx.closeBookedModal}
        onGenerateDoc={ctx.openDocFromBooked}
      />

      <DatDocModal
        isOpen={ctx.docModalOpen}
        content={ctx.docContent}
        loading={ctx.docLoading}
        onClose={ctx.closeDoc}
      />

      <DatDriverChatModal
        driverChat={ctx.driverChat}
        onClose={ctx.closeDriverChat}
        onSend={ctx.sendDriverChatMessage}
        onInputChange={ctx.setDriverChatInput}
      />
    </div>
  )
}
