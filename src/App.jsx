import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import EditFab from './components/EditFab'
import ConfirmHost from './components/ConfirmHost'
import Itinerary from './pages/Itinerary'

// La landing (Itinerary) va en el bundle inicial — es la ruta más visitada.
// El resto se code-splittea: baja el TTI de la portada y evita cargar
// react-leaflet (~150 KB) hasta que se abre el mapa.
const MapRatings = lazy(() => import('./pages/MapRatings'))
const Photos = lazy(() => import('./pages/Photos'))
const Recuerdos = lazy(() => import('./pages/Recuerdos'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-rose-400" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Footer() {
  return (
    <footer className="px-4 py-6 text-center text-xs text-gray-400">
      Hecho con <span className="text-rose-400">❤️</span> para mi futura novia · Buenos Aires 2026
    </footer>
  )
}

export default function App() {
  return (
    <div className="relative mx-auto min-h-screen max-w-app bg-gray-50 shadow-xl shadow-gray-300/40">
      <ScrollToTop />
      <main className="pb-24">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Itinerary />} />
            <Route path="/mapa" element={<MapRatings />} />
            <Route path="/fotos" element={<Photos />} />
            <Route path="/recuerdos" element={<Recuerdos />} />
          </Routes>
        </Suspense>
        <Footer />
      </main>
      <EditFab />
      <BottomNav />
      <ConfirmHost />
    </div>
  )
}
