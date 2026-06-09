import { useEffect, useState } from 'react'
import { ImagePlus, Camera } from 'lucide-react'
import { getPhotos, loadPhotos, onPhotosChange, photoUrl } from '../lib/photos'
import { useEditMode } from '../lib/editAccess'
import PhotoUpload from '../components/PhotoUpload'
import Lightbox from '../components/Lightbox'

export default function Photos() {
  const [, setV] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null) // index | null
  const editing = useEditMode()

  useEffect(() => {
    loadPhotos()
    return onPhotosChange(() => setV((v) => v + 1))
  }, [])

  const photos = getPhotos()

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 to-amber-400 px-5 pb-6 pt-7 text-white">
        <h1 className="text-2xl font-bold drop-shadow-sm">Nuestras fotos 📸</h1>
        <p className="text-sm font-medium text-white/90">
          {photos.length === 0
            ? 'Todavía no hay fotos del viaje'
            : `${photos.length} ${photos.length === 1 ? 'recuerdo guardado' : 'recuerdos guardados'}`}
        </p>
      </div>

      {editing && (
        <div className="px-4">
          <button
            onClick={() => setUploading(true)}
            className="-mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800"
          >
            <ImagePlus size={18} /> Subir foto
          </button>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="mx-4 mt-6 flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-gray-200 py-14 text-center text-gray-400">
          <Camera size={32} />
          <p className="text-sm font-medium">Subí la primera foto del viaje</p>
          {!editing && <p className="text-xs">Tocá “🔒 Editar” para empezar a subir</p>}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-1.5 px-4">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setLightbox(i)}
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                src={photoUrl(p.path)}
                alt={p.caption || 'foto'}
                loading="lazy"
                className="h-full w-full object-cover transition-transform active:scale-95"
              />
            </button>
          ))}
        </div>
      )}

      {uploading && <PhotoUpload onClose={() => setUploading(false)} />}
      {lightbox != null && (
        <Lightbox photos={photos} initialIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
