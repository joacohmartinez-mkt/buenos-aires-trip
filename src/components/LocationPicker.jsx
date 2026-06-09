import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Search, X } from 'lucide-react'

const pinIcon = L.divIcon({
  className: 'picker-pin',
  html: '<div></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

// Captura clicks en el mapa para soltar el pin.
function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Vuela el mapa cuando llega un resultado de búsqueda (no en cada click/drag).
function Flyer({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.6 })
  }, [target, map])
  return null
}

// Leaflet a veces arranca con tamaño 0 dentro de un modal animado.
function Resizer() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120)
    return () => clearTimeout(t)
  }, [map])
  return null
}

export default function LocationPicker({ value, onChange }) {
  const [q, setQ] = useState('')
  const [searching, setSearching] = useState(false)
  const [flyTarget, setFlyTarget] = useState(value)
  const [error, setError] = useState('')

  const center = value ? [value.lat, value.lng] : [-34.59, -58.42]

  async function search(e) {
    e.preventDefault()
    if (!q.trim()) return
    setSearching(true)
    setError('')
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=' +
        encodeURIComponent(`${q}, Buenos Aires`)
      const r = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const data = await r.json()
      if (data && data[0]) {
        const loc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
        onChange(loc)
        setFlyTarget(loc)
      } else {
        setError('No encontré esa dirección, probá tocando el mapa.')
      }
    } catch {
      setError('No pude buscar; tocá el mapa para marcar el lugar.')
    }
    setSearching(false)
  }

  return (
    <div>
      <form onSubmit={search} className="mb-2 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar dirección (ej: Lafinur 3223)…"
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-gray-900 px-3 text-sm font-semibold text-white disabled:bg-gray-300"
        >
          <Search size={16} />
        </button>
      </form>

      <div className="h-48 overflow-hidden rounded-xl ring-1 ring-gray-200">
        <MapContainer center={center} zoom={value ? 15 : 12} scrollWheelZoom className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <ClickCatcher onPick={onChange} />
          <Flyer target={flyTarget} />
          <Resizer />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              icon={pinIcon}
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

      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          {value ? '📍 Tocá el mapa o arrastrá el pin para ajustar' : 'Tocá el mapa o buscá una dirección'}
        </p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-rose-500"
          >
            <X size={12} /> Quitar del mapa
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-500">{error}</p>}
    </div>
  )
}
