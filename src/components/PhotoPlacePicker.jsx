import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
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

function FitAll({ events }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize()
      if (events.length > 1) {
        map.fitBounds(L.latLngBounds(events.map((e) => [e.lat, e.lng])), { padding: [40, 40], maxZoom: 14 })
      }
    }, 120)
    return () => clearTimeout(t)
  }, [map])
  return null
}

// value: { eventId } | { lat, lng } | null
export default function PhotoPlacePicker({ value, onChange }) {
  const events = getMapEvents()
  const selectedEventId = value?.eventId ?? null
  const freeLoc = value && value.lat != null ? value : null
  const selEv = selectedEventId ? events.find((e) => e.id === selectedEventId) : null

  return (
    <div>
      <div className="h-52 overflow-hidden rounded-xl ring-1 ring-gray-200">
        <MapContainer center={[-34.6, -58.42]} zoom={12} scrollWheelZoom zoomControl={false} className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <FitAll events={events} />
          <ClickCatcher onPick={(loc) => onChange({ lat: loc.lat, lng: loc.lng })} />
          {events.map((ev) => (
            <Marker
              key={ev.id}
              position={[ev.lat, ev.lng]}
              icon={eventIcon(ev, selectedEventId === ev.id)}
              eventHandlers={{ click: () => onChange({ eventId: ev.id }) }}
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
      <p className="mt-1.5 text-[11px] font-medium text-gray-500">
        {selEv ? (
          <span className="text-emerald-600">📌 Atada a: {selEv.name ?? selEv.title}</span>
        ) : freeLoc ? (
          <span className="text-emerald-600">📍 Punto libre en el mapa</span>
        ) : (
          <span className="text-gray-400">Tocá una actividad para atarla, o cualquier lugar para un punto libre</span>
        )}
      </p>
    </div>
  )
}
