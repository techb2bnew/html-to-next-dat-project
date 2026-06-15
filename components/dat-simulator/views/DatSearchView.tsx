'use client'

import { useState } from 'react'
import type { SearchTab, DatLoad } from '@/lib/types/dat'
import CityAutocomplete from '../shared/CityAutocomplete'

interface Props {
  searchTabs: SearchTab[]
  activeTabId: number
  activeTab: SearchTab | undefined
  expandedLoadId: string | null
  searchLoading: boolean
  isAutoScanning: boolean
  onSwitchTab: (id: number) => void
  onAddTab: () => void
  onCloseTab: (id: number) => void
  onUpdateTabField: (field: keyof SearchTab, value: string) => void
  onSearch: () => void
  onToggleAutoScan: () => void
  onToggleExpandedRow: (id: string) => void
  onCallBroker: (load: DatLoad) => void
  onEmailBroker: (load: DatLoad) => void
}

const EQUIP_OPTIONS: { val: string; label: string; key: string }[] = [
  { val: 'Dry Van', label: 'Vans (Standard)', key: 'V' },
  { val: 'Flatbed', label: 'Flatbeds', key: 'F' },
  { val: 'Reefer', label: 'Reefers', key: 'R' },
  { val: 'Conestoga', label: 'Conestogas', key: 'N' },
  { val: 'Container', label: 'Containers', key: 'C' },
  { val: 'Decks Spec', label: 'Decks (Specialized)', key: 'K' },
  { val: 'Decks Std', label: 'Decks (Standard)', key: 'D' },
]

const LOADTYPE_OPTIONS = [
  { val: 'Both', label: 'Full & Partial' },
  { val: 'Full', label: 'Full' },
  { val: 'Partial', label: 'Partial' },
]

function ExpandedRow({ load, onCall, onEmail }: { load: DatLoad; onCall: () => void; onEmail: () => void }) {
  const rate = load.rate || 0
  const miles = load.trip_miles || load.distance || 0
  const rpm = miles > 0 ? (rate / miles).toFixed(2) : '-'
  const origin = `${load.origin?.city || '-'}, ${load.origin?.state || ''}`
  const dest = `${load.destination?.city || '-'}, ${load.destination?.state || ''}`
  const b = load.broker || {}
  const cs = (b as any).credit_score
  const dtp = (b as any).dtp

  return (
    <div className="expanded-content">
      <div className="expanded-header">
        <span>Load Details</span>
        <div className="text-[1.4rem] text-emerald-500 font-extrabold">
          ${rate.toLocaleString()} <span className="text-[0.9rem] text-slate-500 font-normal">${rpm}/mi</span>
        </div>
      </div>
      <div className="expanded-grid">
        {/* Route */}
        <div className="expanded-col">
          <div className="expanded-section">
            <h4>ROUTE</h4>
            <div className="route-visual">
              <div className="route-line">
                <span className="dot">●</span>
                <span className="line" />
                <span className="dot">●</span>
              </div>
              <div className="route-details">
                <div className="route-point">
                  <span>{origin}</span>
                  <span className="text-slate-500 font-normal text-xs">DH-O: {load.origin?.dh_o ?? '-'} mi</span>
                </div>
                <div className="route-point mt-auto">
                  <span>{dest}</span>
                  <span className="text-slate-500 font-normal text-xs">DH-D: {load.destination?.dh_d ?? '-'} mi</span>
                </div>
              </div>
            </div>
            <div className="info-row"><span className="info-label">Trip Miles</span><span className="info-val">{miles > 0 ? miles.toLocaleString() + ' mi' : '-'}</span></div>
            <div className="info-row"><span className="info-label">Pickup Date</span><span className="info-val">{load.pickup_date || 'Flexible'}</span></div>
          </div>
        </div>

        {/* Equipment */}
        <div className="expanded-col">
          <div className="expanded-section">
            <h4>EQUIPMENT</h4>
            <div className="info-row"><span className="info-label">Type</span><span className="info-val">{load.equipment?.type || 'Dry Van'}</span></div>
            <div className="info-row"><span className="info-label">Load Type</span><span className="info-val">{load.equipment?.load_type || '-'}</span></div>
            <div className="info-row"><span className="info-label">Length</span><span className="info-val">{load.equipment?.length || '-'}</span></div>
            <div className="info-row"><span className="info-label">Weight</span><span className="info-val">{load.equipment?.weight || '-'}</span></div>
          </div>
        </div>

        {/* Broker + Actions */}
        <div className="expanded-col">
          <div className="expanded-section">
            <h4>
              BROKER INFO
              {cs != null && (
                <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded ${cs >= 80 ? 'bg-green-100 text-green-800' : cs >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  CS: {cs} | DTP: {dtp ?? '-'}d
                </span>
              )}
            </h4>
            <div className="info-row"><span className="info-label">Company</span><span className="info-val">{b.company || '-'}</span></div>
            <div className="info-row"><span className="info-label">Contact</span><span className="info-val">{b.name || '-'}</span></div>
            <div className="info-row"><span className="info-label">Phone</span><span className="info-val">{b.phone || '-'}</span></div>
            <div className="info-row"><span className="info-label">Location</span><span className="info-val">{b.location || '-'}</span></div>
            <div className="info-row"><span className="info-label">MC #</span><span className="info-val">{b.mc || '-'}</span></div>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={onCall}
              className="bg-[#0044cc] text-white border-none rounded-[6px] py-[10px] font-bold text-[0.9rem] cursor-pointer hover:bg-blue-700"
            >📞 Call Broker</button>
            <button
              onClick={onEmail}
              className="bg-white text-[#0044cc] border-2 border-[#0044cc] rounded-[6px] py-[10px] font-bold text-[0.9rem] cursor-pointer hover:bg-blue-50"
            >✉️ Email Broker</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DatSearchView({
  searchTabs, activeTabId, activeTab,
  expandedLoadId, searchLoading, isAutoScanning,
  onSwitchTab, onAddTab, onCloseTab, onUpdateTabField,
  onSearch, onToggleAutoScan,
  onToggleExpandedRow, onCallBroker, onEmailBroker,
}: Props) {
  const [equipOpen, setEquipOpen] = useState(false)
  const [loadTypeOpen, setLoadTypeOpen] = useState(false)

  const tab = activeTab
  const loads = tab?.results ?? []
  const hasSearched = tab?.hasSearched ?? false

  const loadId = (l: DatLoad) => l.load_id || l.reference_number || String(Math.random())

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs Bar */}
      <div className="flex items-end bg-slate-200 border-b border-slate-300 pt-2 pl-2 h-[42px] flex-shrink-0">
        {searchTabs.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-1 px-4 py-1.5 text-xs font-semibold cursor-pointer rounded-t-md border border-b-0 mr-0.5 select-none ${
              t.id === activeTabId
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-50'
            }`}
            onClick={() => onSwitchTab(t.id)}
          >
            <span>{t.title}</span>
            {searchTabs.length > 1 && (
              <span
                className="text-slate-400 hover:text-red-500 ml-1 leading-none"
                onMouseDown={e => { e.stopPropagation(); onCloseTab(t.id) }}
              >✕</span>
            )}
          </div>
        ))}
        <div
          className="px-3 py-1.5 text-xs font-bold text-slate-500 cursor-pointer hover:text-slate-800 rounded-t-md"
          onClick={onAddTab}
        >+</div>
      </div>

      {/* Search Form */}
      <div className="bg-white px-5 py-5 border-b border-slate-200 flex-shrink-0">
        {/* Row 1 — origin / dho / dest / dhd */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 flex-1 min-w-[250px] focus-within:border-blue-500 focus-within:shadow-[0_0_0_1px_#2563eb]">
            <CityAutocomplete
              label="Origin"
              value={tab?.origin || ''}
              onChange={v => onUpdateTabField('origin', v)}
              placeholder="City, State or Zip"
            />
          </div>

          <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 w-[70px] text-center focus-within:border-blue-500">
            <span className="absolute -top-[7px] left-2 bg-white px-1 text-[0.65rem] font-semibold text-slate-400">DH-O</span>
            <input
              type="number"
              value={tab?.dh_o || ''}
              onChange={e => onUpdateTabField('dh_o', e.target.value)}
              className="border-none outline-none w-full text-sm text-center bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <span className="text-blue-500 font-black px-0.5 cursor-pointer text-lg">⇄</span>

          <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 flex-1 min-w-[250px] focus-within:border-blue-500 focus-within:shadow-[0_0_0_1px_#2563eb]">
            <CityAutocomplete
              label="Destination"
              value={tab?.destination || ''}
              onChange={v => onUpdateTabField('destination', v)}
              placeholder="City, State or Zip"
            />
          </div>

          <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 w-[70px] text-center focus-within:border-blue-500">
            <span className="absolute -top-[7px] left-2 bg-white px-1 text-[0.65rem] font-semibold text-slate-400">DH-D</span>
            <input
              type="number"
              value={tab?.dh_d || ''}
              onChange={e => onUpdateTabField('dh_d', e.target.value)}
              className="border-none outline-none w-full text-sm text-center bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Row 2 — filters */}
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          {/* Equipment custom dropdown */}
          <div className="relative" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setEquipOpen(false) }} tabIndex={-1}>
            <div
              className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 w-[200px] cursor-pointer"
              onClick={() => setEquipOpen(prev => !prev)}
            >
              <span className="absolute -top-[7px] left-2 bg-white px-1 text-[0.65rem] font-semibold text-slate-400">Equipment Type*</span>
              <span className="text-sm text-slate-800 truncate">
                {EQUIP_OPTIONS.find(o => o.val === tab?.equipment)?.label || 'Vans (Standard)'}
              </span>
            </div>
            {equipOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-[200] min-w-[240px] py-1">
                <div
                  className="px-4 py-2.5 text-sm text-blue-700 font-bold cursor-pointer hover:bg-indigo-50"
                  onMouseDown={() => { onUpdateTabField('equipment', 'ALL'); setEquipOpen(false) }}
                >ALL</div>
                {EQUIP_OPTIONS.map(o => (
                  <div
                    key={o.val}
                    className={`px-4 py-2.5 text-sm text-slate-800 flex justify-between items-center cursor-pointer hover:bg-indigo-50${tab?.equipment === o.val ? ' bg-indigo-50 font-bold' : ''}`}
                    onMouseDown={() => { onUpdateTabField('equipment', o.val); setEquipOpen(false) }}
                  >
                    <span>{o.label}</span>
                    <span className="text-slate-400 text-xs">{o.key}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load Type */}
          <div className="relative" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setLoadTypeOpen(false) }} tabIndex={-1}>
            <div
              className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 w-[140px] cursor-pointer"
              onClick={() => setLoadTypeOpen(prev => !prev)}
            >
              <span className="absolute -top-[7px] left-2 bg-white px-1 text-[0.65rem] font-semibold text-slate-400">Load Type</span>
              <span className="text-sm text-slate-800 truncate">
                {LOADTYPE_OPTIONS.find(o => o.val === tab?.load_type)?.label || 'Full & Partial'}
              </span>
            </div>
            {loadTypeOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-[200] min-w-[140px] py-1">
                {LOADTYPE_OPTIONS.map(o => (
                  <div
                    key={o.val}
                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-indigo-50${tab?.load_type === o.val ? ' bg-indigo-50 font-bold' : ''}`}
                    onMouseDown={() => { onUpdateTabField('load_type', o.val); setLoadTypeOpen(false) }}
                  >
                    {o.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 w-[100px] focus-within:border-blue-500">
            <span className="absolute -top-[7px] left-2 bg-white px-1 text-[0.65rem] font-semibold text-slate-400">Length ft</span>
            <input
              type="number"
              value={tab?.length === 'Any' ? '' : tab?.length || ''}
              onChange={e => onUpdateTabField('length', e.target.value || 'Any')}
              className="border-none outline-none w-full text-sm bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Any"
            />
          </div>

          <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 w-[100px] focus-within:border-blue-500">
            <span className="absolute -top-[7px] left-2 bg-white px-1 text-[0.65rem] font-semibold text-slate-400">Weight lbs</span>
            <input
              type="number"
              value={tab?.weight === 'Any' ? '' : tab?.weight || ''}
              onChange={e => onUpdateTabField('weight', e.target.value || 'Any')}
              className="border-none outline-none w-full text-sm bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Any"
            />
          </div>

          <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3 w-[200px] focus-within:border-blue-500">
            <span className="absolute -top-[7px] left-2 bg-white px-1 text-[0.65rem] font-semibold text-slate-400">Date Range*</span>
            <input
              type="date"
              value={tab?.date_range === 'Today' ? '' : tab?.date_range || ''}
              onChange={e => onUpdateTabField('date_range', e.target.value || 'Today')}
              className="border-none outline-none w-full text-sm bg-transparent pr-2"
            />
          </div>

          <button
            onClick={onSearch}
            disabled={searchLoading}
            className="bg-[#0044cc] hover:bg-blue-700 disabled:opacity-60 text-white border-none rounded-full px-6 h-10 text-sm font-bold cursor-pointer flex items-center gap-2 ml-2.5"
          >
            {searchLoading ? '⏳ Searching...' : '🔍 SEARCH'}
          </button>

          <button
            onClick={onToggleAutoScan}
            className={`border-none rounded-full px-6 h-10 text-sm font-bold cursor-pointer flex items-center gap-2 ml-2.5 ${
              isAutoScanning
                ? 'bg-green-100 text-green-700 border border-green-400'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            ⚡ Auto-Scan: {isAutoScanning ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Content area */}
      {!hasSearched ? (
        <div className="flex-1 flex flex-col items-center bg-white overflow-y-auto pt-5">
          <div className="flex justify-center border-b border-slate-200 mb-12 w-full">
            <div className="px-10 py-4 text-sm font-bold text-slate-500 cursor-pointer relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-600">SAVED SEARCHES</div>
            <div className="px-10 py-4 text-sm font-bold text-slate-500 cursor-pointer">RECENT SEARCHES</div>
          </div>
          <div className="w-full flex flex-col items-center">
            <img src="/save_search_graphic.png" alt="Save search" className="w-[500px] block mx-auto rounded shadow-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <p className="text-slate-500 w-[400px] text-center text-base mt-8 leading-relaxed">
              Enter an origin and destination, then click <strong>&quot;SEARCH&quot;</strong> to find available loads.
            </p>
          </div>
        </div>
      ) : loads.length === 0 && !searchLoading ? (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center text-slate-500">
            <div className="text-5xl mb-4">🔍</div>
            <div className="font-bold text-lg mb-2">No loads found</div>
            <div className="text-sm">Try adjusting your search criteria or expanding DH-O / DH-D radius.</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Results header */}
          <div className="flex justify-between items-center px-5 py-3 bg-white flex-shrink-0">
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2.5 py-1 font-extrabold text-lg rounded">{loads.length} Results</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-white border-t border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky top-0 bg-white text-slate-500 text-xs font-semibold p-2.5 text-left border-b-2 border-slate-200 z-10 w-10 text-center">
                    <input type="checkbox" />
                  </th>
                  {['Age','Rate','ⓘ','Trip','Origin','DH-O','Destination','DH-D','Pick Up','Equipment','Company','Contact','CS / DTP'].map(h => (
                    <th key={h} className="sticky top-0 bg-white text-slate-500 text-xs font-semibold p-2.5 text-left border-b-2 border-slate-200 z-10 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loads.map((load) => {
                  const id = loadId(load)
                  const isExpanded = expandedLoadId === id
                  const rate = load.rate || 0
                  const miles = load.trip_miles || load.distance || 0
                  const rpm = miles > 0 ? (rate / miles).toFixed(2) : '-'
                  const origin = `${load.origin?.city || ''}, ${load.origin?.state || ''}`
                  const dest = `${load.destination?.city || ''}, ${load.destination?.state || ''}`
                  const b = load.broker || {}
                  const cs = (b as any).credit_score
                  const dtp = (b as any).dtp

                  return (
                    <>
                      <tr
                        key={id}
                        className={`main-row border-b border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors${isExpanded ? ' active' : ''}`}
                        onClick={() => onToggleExpandedRow(id)}
                      >
                        <td className="p-2.5 text-center" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" />
                        </td>
                        <td className="p-2.5 text-xs text-slate-500">{load.age || '1m'}</td>
                        <td className="p-2.5 font-bold text-green-700 whitespace-nowrap">
                          ${rate.toLocaleString()}
                          <span className="text-slate-400 font-normal text-[0.7rem] ml-1">${rpm}/mi</span>
                        </td>
                        <td className="p-2.5 text-xs text-slate-400">ⓘ</td>
                        <td className="p-2.5 text-xs">{miles > 0 ? miles.toLocaleString() + ' mi' : '-'}</td>
                        <td className="p-2.5 text-xs font-medium">{origin}</td>
                        <td className="p-2.5 text-xs text-slate-500">{load.origin?.dh_o ?? '-'}</td>
                        <td className="p-2.5 text-xs font-medium">{dest}</td>
                        <td className="p-2.5 text-xs text-slate-500">{load.destination?.dh_d ?? '-'}</td>
                        <td className="p-2.5 text-xs">{load.pickup_date || 'Today'}</td>
                        <td className="p-2.5 text-xs">{load.equipment?.type || '-'}</td>
                        <td className="p-2.5 text-xs font-medium">{b.company || '-'}</td>
                        <td className="p-2.5 text-xs">{b.phone || '-'}</td>
                        <td className="p-2.5 text-xs">
                          {cs != null && (
                            <span className={`text-[0.65rem] font-bold px-[5px] py-0.5 rounded-sm ${cs >= 80 ? 'bg-green-100 text-green-800' : cs >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {cs} / {dtp ?? '-'}d
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${id}-exp`} className="expanded-row-container">
                          <td colSpan={14}>
                            <ExpandedRow
                              load={load}
                              onCall={() => onCallBroker(load)}
                              onEmail={() => onEmailBroker(load)}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
