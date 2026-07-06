import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Star, Plus, ImagePlus } from 'lucide-react'
import { DAY_FILTERS } from '../data/trip'
import { typeStyle } from '../lib/styles'
import { getAverage, onRatingsChange, loadRatings } from '../lib/ratings'
import { getMapEvents, loadEvents, onEventsChange } from '../lib/events'
import {
  getFreePhotos,
  countByEvent,
  thumbUrl,
  loadPhotos,
  onPhotosChange,
  isVideo,
} from '../lib/photos'
import Stars from '../components/Stars'
import RatingModal from '../components/RatingModal'
import Lightbox from '../components/Lightbox'
import PhotoUpload from '../components/PhotoUpload'

const dayMeta = Object.fromEntries(DAY_FILTERS.map((f) => [f.day, f]))

const DAY_BADGE = {
  amber: 'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose: 'bg-rose-100 text-rose-700',
  gray: 'bg-gray-100 text-gray-600',
}

const PILL_ACTIVE = {
  gray: 'bg-gray-900 text-white shadow',
  amber: 'bg-amber-500 text-white shadow',
  emerald: 'bg-emerald-500 text-white shadow',
  rose: 'bg-rose-500 text-white shadow',
}

function makeIcon(spot, active, photoCount = 0) {
  const style = typeStyle(spot.type)
  const badge = photoCount > 0 ? `<span class="photo-badge">📷 ${photoCount}</span>` : ''
  return L.divIcon({
    className: `spot-marker${active ? ' is-active' : ''}`,
    html: `<div style="background:${style.marker}">${style.emoji}</div>${badge}`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

// Controla el encuadre del mapa: acerca al spot elegido y reencuadra todos los
// spots visibles cuando cambia el filtro de día.
function MapController({ selected, spots, fitKey }) {
  const map = useMap()

  useEffect(() => {
    if (selected) map.flyTo([selected.lat, selected.lng], 16, { duration: 1 })
  }, [selected, map])

  useEffect(() => {
    if (!spots.length) return
    if (spots.length === 1) {
      map.setView([spots[0].lat, spots[0].lng], 15, { animate: true })
      return
    }
    const bounds = L.latLngBounds(spots.map((s) => [s.lat, s.lng]))
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
    // Solo reencuadra al cambiar el filtro, no en cada cambio de rating.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map])

  return null
}

export default function MapRatings() {
  const [filterDay, setFilterDay] = useState(0)
  const [selected, setSelected] = useState(null)
  const [modalSpot, setModalSpot] = useState(null)
  const [lightbox, setLightbox] = useState(null) // { kind: 'event'|'single', eventId?, id? }
  const [uploadForEvent, setUploadForEvent] = useState(null)
  const [version, setVersion] = useState(0)

  // Cargar eventos + calificaciones + fotos al montar y refrescar al cambiar.
  useEffect(() => {
    loadRatings()
    loadEvents()
    loadPhotos()
    const offR = onRatingsChange(() => setVersion((v) => v + 1))
    const offE = onEventsChange(() => setVersion((v) => v + 1))
    const offP = onPhotosChange(() => setVersion((v) => v + 1))
    return () => {
      offR()
      offE()
      offP()
    }
  }, [])

  const filtered = useMemo(() => {
    // Eventos con ubicación, normalizados al shape que usa el mapa.
    const spots = getMapEvents().map((e) => ({
      id: e.id,
      name: e.title,
      address: e.place,
      type: e.type,
      day: e.day,
      lat: e.lat,
      lng: e.lng,
    }))
    return filterDay === 0 ? spots : spots.filter((s) => s.day === filterDay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDay, version])

  function selectSpot(spot) {
    setSelected(spot)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="pb-4">
      {/* Banner con foto de Buenos Aires (Casa Rosada) */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-sky-500 to-rose-500">
        <img
          src="./mapa-buenosaires.jpg"
          alt="Buenos Aires — Casa Rosada"
          className="absolute inset-0 h-full w-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <h1 className="font-display text-3xl font-bold text-white drop-shadow-md">Mapa & Ratings</h1>
          <p className="text-sm font-medium text-white/90 drop-shadow">
            {filtered.length} {filtered.length === 1 ? 'lugar' : 'lugares'} para descubrir y calificar
          </p>
        </div>
      </div>

      {/* Filtros sticky con separación clara del mapa */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {DAY_FILTERS.map((f) => {
            const active = filterDay === f.day
            return (
              <button
                key={f.day}
                onClick={() => {
                  setFilterDay(f.day)
                  setSelected(null)
                }}
                className={[
                  'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
                  active
                    ? PILL_ACTIVE[f.color]
                    : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-100',
                ].join(' ')}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mapa */}
      <div className="h-[56vh] min-h-[320px] w-full">
        <MapContainer
          center={[-34.6, -58.41]}
          zoom={12}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
          <MapController selected={selected} spots={filtered} fitKey={filterDay} />
          {filtered.map((spot) => {
            const { avg, count } = getAverage(spot.id)
            const pc = countByEvent(spot.id)
            return (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lng]}
                icon={makeIcon(spot, selected?.id === spot.id, pc)}
                eventHandlers={{ click: () => setSelected(spot) }}
              >
                <Popup>
                  <div className="min-w-[150px]">
                    <p className="text-sm font-bold text-gray-900">{spot.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{spot.address}</p>
                    <div className="mt-1.5">
                      {count > 0 ? (
                        <Stars value={avg} count={count} size={14} />
                      ) : (
                        <span className="text-xs text-gray-400">Sin calificar</span>
                      )}
                    </div>
                    {pc > 0 && (
                      <button
                        onClick={() => setLightbox({ kind: 'event', eventId: spot.id })}
                        className="mt-2 w-full rounded-lg bg-gray-100 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
                      >
                        📷 Ver {pc} {pc === 1 ? 'foto' : 'fotos'}
                      </button>
                    )}
                    <div className="mt-2 flex gap-1.5">
                      <button
                        onClick={() => setUploadForEvent(spot.id)}
                        className="flex-1 rounded-lg bg-rose-100 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-200"
                      >
                        📸 Subir
                      </button>
                      <button
                        onClick={() => setModalSpot(spot)}
                        className="flex-1 rounded-lg bg-gray-900 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                      >
                        ★ Calificar
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Fotos/videos sueltos (sin evento): miniatura propia en el mapa */}
          {getFreePhotos().map((p) => {
            const vid = isVideo(p)
            const t = thumbUrl(p)
            const bg = t
              ? `background-image:url('${t}'); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px; text-shadow:0 1px 4px rgba(0,0,0,0.7);`
              : `background:#111; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px;`
            const inner = vid ? '▶' : ''
            return (
              <Marker
                key={'photo-' + p.id}
                position={[p.lat, p.lng]}
                icon={L.divIcon({
                  className: 'photo-marker',
                  html: `<div style="${bg}">${inner}</div>`,
                  iconSize: [44, 44],
                  iconAnchor: [22, 22],
                })}
                eventHandlers={{ click: () => setLightbox({ kind: 'single', id: p.id }) }}
              />
            )
          })}
        </MapContainer>
      </div>

      {/* Lista de spots */}
      <ul className="mt-4 space-y-2.5 px-4">
        {filtered.map((spot) => {
          const style = typeStyle(spot.type)
          const meta = dayMeta[spot.day] ?? dayMeta[0]
          const { avg, count } = getAverage(spot.id)
          return (
            <li
              key={spot.id}
              onClick={() => selectSpot(spot)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: style.marker + '22' }}
              >
                {style.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-gray-900">{spot.name}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${DAY_BADGE[meta.color]}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="mt-1">
                  {count > 0 ? (
                    <Stars value={avg} count={count} size={14} />
                  ) : (
                    <span className="text-xs text-gray-400">Sin calificar</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setUploadForEvent(spot.id)
                  }}
                  className="flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-200"
                  aria-label="Subir foto o video"
                >
                  <ImagePlus size={14} />
                  Subir
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setModalSpot(spot)
                  }}
                  className="flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                >
                  <Plus size={14} />
                  Reseña
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {modalSpot && <RatingModal spot={modalSpot} onClose={() => setModalSpot(null)} />}
      {lightbox && <Lightbox source={lightbox} onClose={() => setLightbox(null)} />}
      {uploadForEvent && (
        <PhotoUpload defaultEventId={uploadForEvent} onClose={() => setUploadForEvent(null)} />
      )}
    </div>
  )
}
