import { TileLayer } from 'react-leaflet'

// Mapa base gris claro de Esri (sin API key). Reemplaza a CARTO Positron,
// que desde 2026 exige key y muestra "API KEY REQUIRED" en cada tile.
// Son dos capas: el fondo y, encima, los nombres de calles/barrios.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas'

export default function BaseTiles({ attribution = false }) {
  return (
    <>
      <TileLayer
        url={`${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
        attribution={attribution ? 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap' : undefined}
        maxNativeZoom={16}
        maxZoom={20}
      />
      <TileLayer
        url={`${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`}
        maxNativeZoom={16}
        maxZoom={20}
      />
    </>
  )
}
