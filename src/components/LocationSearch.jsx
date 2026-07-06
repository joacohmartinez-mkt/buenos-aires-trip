import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Search, X, MapPin, Loader2, Sparkles } from 'lucide-react'
import { getMapEvents } from '../lib/events'
import { typeStyle } from '../lib/styles'

const freePin = L.divIcon({
  className: 'picker-pin',
  html: '<div></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

function eventIcon(ev, active) {
  const s = typeStyle(ev.type)
  return L.divIcon({
    className: `spot-marker${active ? ' is-active' : ''}`,
    html: `<div style="background:${s.marker}">${s.emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Vuela al target cuando cambia (sin re-encuadrar en cada render).
function Flyer({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.6 })
  }, [target, map])
  return null
}

function Resizer() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120)
    return () => clearTimeout(t)
  }, [map])
  return null
}

// Recorta el nombre largo de Nominatim a algo compacto.
function shortName(item) {
  const parts = (item.display_name || '').split(',').map((s) => s.trim())
  return parts.slice(0, 2).join(', ')
}
function subLabel(item) {
  const parts = (item.display_name || '').split(',').map((s) => s.trim())
  return parts.slice(2, 4).join(', ')
}

/**
 * Buscador de ubicación con autocomplete (Nominatim) + mapa + actividades del viaje.
 * value: { eventId } | { lat, lng, label? } | null
 */
export default function LocationSearch({ value, onChange }) {
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [showList, setShowList] = useState(false)
  const [flyTarget, setFlyTarget] = useState(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)
  const searchBoxRef = useRef(null)

  // Cerrar el dropdown si se toca fuera del buscador.
  useEffect(() => {
    if (!showList) return
    function handler(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowList(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [showList])

  const events = useMemo(() => getMapEvents(), [])
  const selectedEvent = value?.eventId ? events.find((e) => e.id === value.eventId) : null
  const freeLoc = value && value.lat != null ? value : null

  // Debounce + fetch a Nominatim para autocomplete.
  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      setSearching(true)
      try {
        // viewbox = bounding box aprox Buenos Aires (izq,arriba,der,abajo)
        // Con bounded=1 restringe fuerte a esa zona.
        const url =
          'https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1' +
          '&countrycodes=ar&viewbox=-58.60,-34.45,-58.30,-34.75&bounded=1&q=' +
          encodeURIComponent(q.trim())
        const r = await fetch(url, {
          signal: ac.signal,
          headers: { 'Accept-Language': 'es' },
        })
        const data = await r.json()
        setSuggestions(Array.isArray(data) ? data : [])
      } catch (e) {
        if (e.name !== 'AbortError') setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [q])

  function pickSuggestion(item) {
    const loc = {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      label: shortName(item),
    }
    onChange(loc)
    setFlyTarget(loc)
    setQ(shortName(item))
    setShowList(false)
  }

  function pickMap(loc) {
    onChange({ lat: loc.lat, lng: loc.lng })
    setQ('')
    setShowList(false)
  }

  function pickEvent(ev) {
    onChange({ eventId: ev.id })
    setFlyTarget({ lat: ev.lat, lng: ev.lng })
    setQ('')
    setShowList(false)
  }

  function clear() {
    onChange(null)
    setQ('')
    setSuggestions([])
    setShowList(false)
  }

  const center = value?.lat != null
    ? [value.lat, value.lng]
    : selectedEvent
    ? [selectedEvent.lat, selectedEvent.lng]
    : [-34.6, -58.42]

  return (
    <div>
      {/* Buscador */}
      <div ref={searchBoxRef} className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-gray-400 focus-within:bg-white">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setShowList(true)
            }}
            onFocus={() => setShowList(true)}
            placeholder="Buscar lugar, calle, museo…"
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          {searching && <Loader2 size={14} className="shrink-0 animate-spin text-gray-400" />}
          {q && !searching && (
            <button onClick={() => { setQ(''); setSuggestions([]) }} className="shrink-0 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown de sugerencias. z-index alto para tapar Leaflet (usa 400-1000). */}
        {showList && (suggestions.length > 0 || (q.length >= 2 && !searching)) && (
          <div className="absolute inset-x-0 top-full z-[1200] mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl">
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <button
                  key={item.place_id}
                  onClick={() => pickSuggestion(item)}
                  className="flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2.5 text-left last:border-none hover:bg-gray-50"
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-rose-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{shortName(item)}</p>
                    <p className="truncate text-[11px] text-gray-500">{subLabel(item)}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-gray-400">Sin resultados en Buenos Aires.</div>
            )}
          </div>
        )}
      </div>

      {/* Atajos: actividades del viaje. Se oculta cuando hay dropdown abierto para no tapar. */}
      {events.length > 0 && !(showList && suggestions.length > 0) && (
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Sparkles size={12} className="shrink-0 text-amber-500" />
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500">De tu viaje:</span>
          {events.slice(0, 12).map((ev) => {
            const active = selectedEvent?.id === ev.id
            const s = typeStyle(ev.type)
            return (
              <button
                key={ev.id}
                onClick={() => pickEvent(ev)}
                className={[
                  'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                  active
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                ].join(' ')}
              >
                <span className="mr-1">{s.emoji}</span>
                {ev.title}
              </button>
            )
          })}
        </div>
      )}

      {/* Mapa */}
      <div className="mt-2 h-44 overflow-hidden rounded-xl ring-1 ring-gray-200">
        <MapContainer center={center} zoom={value ? 15 : 12} scrollWheelZoom className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <ClickCatcher onPick={pickMap} />
          <Flyer target={flyTarget} />
          <Resizer />
          {events.map((ev) => (
            <Marker
              key={ev.id}
              position={[ev.lat, ev.lng]}
              icon={eventIcon(ev, selectedEvent?.id === ev.id)}
              eventHandlers={{ click: () => pickEvent(ev) }}
            />
          ))}
          {freeLoc && (
            <Marker
              position={[freeLoc.lat, freeLoc.lng]}
              icon={freePin}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target.getLatLng()
                  onChange({ lat: m.lat, lng: m.lng })
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Estado / clear */}
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
        <p className="min-w-0 flex-1 truncate font-medium text-gray-500">
          {selectedEvent ? (
            <span className="text-emerald-600">📌 {selectedEvent.title}</span>
          ) : freeLoc?.label ? (
            <span className="text-emerald-600">📍 {freeLoc.label}</span>
          ) : freeLoc ? (
            <span className="text-emerald-600">📍 Punto en el mapa</span>
          ) : (
            <span className="text-gray-400">Buscá, tocá el mapa o eligí una actividad</span>
          )}
        </p>
        {value && (
          <button onClick={clear} className="shrink-0 text-gray-400 hover:text-rose-500">
            Quitar
          </button>
        )}
      </div>
    </div>
  )
}
