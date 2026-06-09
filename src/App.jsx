import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Itinerary from './pages/Itinerary'
import MapRatings from './pages/MapRatings'

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
        <Routes>
          <Route path="/" element={<Itinerary />} />
          <Route path="/mapa" element={<MapRatings />} />
        </Routes>
        <Footer />
      </main>
      <BottomNav />
    </div>
  )
}
