'use client'

import type { PostedTruck } from '@/lib/types/dat'
import CityAutocomplete from '../shared/CityAutocomplete'

interface Props {
  origin: string
  dest: string
  equip: string
  date: string
  loading: boolean
  message: string
  postedTrucks: PostedTruck[]
  onOriginChange: (v: string) => void
  onDestChange: (v: string) => void
  onEquipChange: (v: string) => void
  onDateChange: (v: string) => void
  onPost: () => void
}

export default function DatPostTruckView({
  origin, dest, equip, date, loading, message, postedTrucks,
  onOriginChange, onDestChange, onEquipChange, onDateChange, onPost,
}: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-8">
      <h2 className="font-extrabold text-2xl m-0 mb-5">Post a Truck</h2>
      <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-3xl">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <label className="block text-xs font-bold text-slate-500 mb-1">Origin (City, ST)</label>
            <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3">
              <CityAutocomplete
                label=""
                value={origin}
                onChange={onOriginChange}
                placeholder="e.g. Dallas, TX"
                wrapperClassName="w-full"
              />
            </div>
          </div>
          <div className="flex-1 relative">
            <label className="block text-xs font-bold text-slate-500 mb-1">Destination</label>
            <div className="relative border border-slate-300 rounded bg-white flex items-center h-10 px-3">
              <CityAutocomplete
                label=""
                value={dest}
                onChange={onDestChange}
                placeholder="Anywhere"
                wrapperClassName="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-5">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Equipment</label>
            <select
              value={equip}
              onChange={e => onEquipChange(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded box-border"
            >
              <option value="Dry Van">Dry Van</option>
              <option value="Reefer">Reefer</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Power Only">Power Only</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Date Available</label>
            <input
              type="text"
              value={date}
              onChange={e => onDateChange(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded box-border"
            />
          </div>
        </div>

        {message && (
          <div className={`mb-4 px-3 py-2 rounded text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        <div className="text-right">
          <button
            onClick={onPost}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-3 font-bold text-base rounded border-none cursor-pointer"
          >
            {loading ? 'Posting...' : '⊕ POST TRUCK'}
          </button>
        </div>
      </div>

      {/* Posted trucks list */}
      {postedTrucks.length > 0 && (
        <div className="mt-8 max-w-3xl">
          <h3 className="font-bold text-lg mb-3">Recently Posted</h3>
          <div className="flex flex-col gap-3">
            {postedTrucks.map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold">{t.equipment}</span>
                  <span className="text-slate-500 text-sm ml-3">{t.origin} → {t.destination}</span>
                </div>
                <span className="text-xs text-slate-400">{t.date_available}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
