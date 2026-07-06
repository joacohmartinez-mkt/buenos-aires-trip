import { useEffect, useState } from 'react'
import { ImagePlus, ChevronLeft, Folder, Play } from 'lucide-react'
import {
  getPhotos,
  getAlbums,
  getPhotosByAlbum,
  loadPhotos,
  onPhotosChange,
  photoUrl,
  isVideo,
} from '../lib/photos'
import PhotoUpload from '../components/PhotoUpload'
import Lightbox from '../components/Lightbox'

const ALL = '__all__'
const NONE = '__none__'

export default function Photos() {
  const [, setV] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null) // { source, index } | null
  const [view, setView] = useState(ALL) // ALL | NONE | 'nombre-album'

  useEffect(() => {
    loadPhotos()
    return onPhotosChange(() => setV((v) => v + 1))
  }, [])

  // Se leen fresh cada render — la caché de photos.js es la fuente de verdad
  // y el setV al recibir onPhotosChange dispara el re-render.
  const albums = getAlbums()
  const visiblePhotos =
    view === ALL ? getPhotos() : view === NONE ? getPhotosByAlbum(null) : getPhotosByAlbum(view)

  const isFilteredView = view !== ALL
  const currentAlbumName =
    view === NONE ? 'Sin álbum' : view === ALL ? null : view

  const hasAnyAlbums = albums.some((a) => a.name !== null)

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 to-amber-400 px-5 pb-6 pt-7 text-white">
        {isFilteredView ? (
          <>
            <button
              onClick={() => setView(ALL)}
              className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white"
            >
              <ChevronLeft size={16} /> Todos los recuerdos
            </button>
            <h1 className="text-2xl font-bold drop-shadow-sm">📁 {currentAlbumName}</h1>
            <p className="text-sm font-medium text-white/90">
              {visiblePhotos.length}{' '}
              {visiblePhotos.length === 1 ? 'recuerdo' : 'recuerdos'} en este álbum
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold drop-shadow-sm">Nuestros recuerdos 📸</h1>
            <p className="text-sm font-medium text-white/90">
              {getPhotos().length === 0
                ? 'Todavía no hay nada del viaje'
                : `${getPhotos().length} ${getPhotos().length === 1 ? 'recuerdo' : 'recuerdos'} guardados`}
            </p>
          </>
        )}
      </div>

      <div className="px-4">
        <button
          onClick={() => setUploading(true)}
          className="-mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800"
        >
          <ImagePlus size={18} /> Subir foto o video
        </button>
      </div>

      {/* Álbumes (solo en vista TODOS y si hay al menos uno con nombre) */}
      {!isFilteredView && hasAnyAlbums && (
        <div className="mt-5 px-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">Álbumes</h2>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {albums.map((a) => (
              <button
                key={a.name ?? '__none__'}
                onClick={() => setView(a.name ?? NONE)}
                className="group relative flex w-28 shrink-0 flex-col overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-1 ring-black/5 active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-gray-200">
                  {a.cover && !isVideo(a.cover) ? (
                    <img
                      src={photoUrl(a.cover.path)}
                      alt={a.name || 'álbum'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : a.cover ? (
                    // cover es video: mostrar frame con <video> preload metadata
                    <>
                      <video
                        src={photoUrl(a.cover.path)}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play size={22} className="text-white drop-shadow" fill="white" />
                      </span>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <Folder size={28} />
                    </div>
                  )}
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {a.count}
                  </span>
                </div>
                <div className="px-2 py-1.5 text-left">
                  <p className="truncate text-xs font-bold text-gray-800">
                    {a.name || 'Sin álbum'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {visiblePhotos.length === 0 ? (
        <div className="mt-5 px-4">
          <p className="mb-3 text-center text-sm font-medium text-gray-400">
            Subí el primer recuerdo <span className="text-rose-400">❤️</span>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setUploading(true)}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-400"
            >
              <ImagePlus size={24} />
            </button>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/40" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-1.5 px-4">
          {visiblePhotos.map((p, i) => (
            <button
              key={p.id}
              onClick={() =>
                setLightbox({ kind: view === ALL ? 'all' : view === NONE ? 'none' : 'album', name: view === ALL ? null : view === NONE ? null : view, index: i })
              }
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              {isVideo(p) ? (
                <>
                  <video
                    src={photoUrl(p.path)}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                    <Play size={26} className="text-white drop-shadow" fill="white" />
                  </span>
                </>
              ) : (
                <img
                  src={photoUrl(p.path)}
                  alt={p.caption || 'foto'}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform active:scale-95"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {uploading && (
        <PhotoUpload
          defaultAlbum={view !== ALL && view !== NONE ? view : null}
          onClose={() => setUploading(false)}
        />
      )}
      {lightbox && (
        <Lightbox
          source={lightbox}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
