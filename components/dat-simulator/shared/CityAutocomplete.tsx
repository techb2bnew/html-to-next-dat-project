'use client'

import { useState, useEffect, useRef } from 'react'
import { apiCitySuggestions } from '@/lib/api/dat'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  label: string
  inputClassName?: string
  wrapperClassName?: string
}

export default function CityAutocomplete({ value, onChange, placeholder, label, inputClassName, wrapperClassName }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [show, setShow] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      const results = await apiCitySuggestions(value).catch(() => [])
      setSuggestions(results)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [value])

  return (
    <div className={`relative${wrapperClassName ? ' ' + wrapperClassName : ''}`}>
      <span className="absolute -top-[7px] left-2 bg-white px-1 text-[0.65rem] font-semibold text-slate-400 z-10">{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        placeholder={placeholder}
        className={inputClassName || 'border-none outline-none w-full text-sm font-[Inter] text-slate-800 bg-transparent'}
      />
      {show && suggestions.length > 0 && (
        <div className="absolute top-[45px] left-0 w-full bg-white border border-slate-300 rounded shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] z-[100] max-h-[200px] overflow-y-auto">
          {suggestions.map(s => (
            <div
              key={s}
              className="px-3 py-[10px] text-[0.85rem] cursor-pointer border-b border-slate-50 hover:bg-blue-50"
              onMouseDown={() => { onChange(s); setSuggestions([]); setShow(false) }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
