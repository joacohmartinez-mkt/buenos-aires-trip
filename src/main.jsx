import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
import './index.css'

// HashRouter (URLs con #) para que el deep-link a /mapa funcione en GitHub
// Pages sin necesidad de redirecciones del lado del servidor.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
