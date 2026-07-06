import { useEffect, useRef, useState } from 'react'
import {
  ImagePlus,
  ChevronLeft,
  Folder,
  Play,
  CheckSquare,
  Square,
  X,
  Trash2,
  FolderInput,
  Pencil,
  MoreVertical,
} from 'lucide-react'
import {
  getPhotos,
  getAlbums,
  getPhotosByAlbum,
  loadPhotos,
  onPhotosChange,
  photoUrl,
  isVideo,
  movePhotosToAlbum,
  renameAlbum,
  emptyAlbum,
  deletePhotos,
} from '../lib/photos'
import PhotoUpload from '../components/PhotoUpload'
import Lightbox from '../components/Lightbox'
import AlbumPicker from '../components/AlbumPicker'

const ALL = '__all__'
const NONE = '__none__'

export default function Photos() {
  const [, setV] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [view, setView] = useState(ALL)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [movingSelection, setMovingSelection] = useState(false)
  const [albumMenu, setAlbumMenu] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [busy, setBusy] = useState(false)
  const longPressRef = useRef(null)

  useEffect(() => {
    loadPhotos()
    return onPhotosChange(() => setV((v) => v + 1))
  }, [])

  // Al salir del modo seleccionar, limpiar selección.
  useEffect(() => {
    if (!selectMode) setSelected(new Set())
  }, [selectMode])

  // Al cambiar de vista, salir del modo seleccionar.
  useEffect(() => {
    setSelectMode(false)
    setAlbumMenu(false)
  }, [view])

  const albums = getAlbums()
  const visiblePhotos =
    view === ALL ? getPhotos() : view === NONE ? getPhotosByAlbum(null) : getPhotosByAlbum(view)

  const isFilteredView = view !== ALL
  const currentAlbumName = view === NONE ? 'Sin álbum' : view === ALL ? null : view
  const isNamedAlbum = view !== ALL && view !== NONE
  const hasAnyAlbums = albums.some((a) => a.name !== null)

  function togglePhoto(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function startLongPress(id) {
    clearTimeout(longPressRef.current)
    longPressRef.current = setTimeout(() => {
      setSelectMode(true)
      setSelected(new Set([id]))
    }, 400)
  }
  function cancelLongPress() {
    clearTimeout(longPressRef.current)
  }

  async function handleMoveSelection(albumName) {
    setBusy(true)
    try {
      await movePhotosToAlbum([...selected], albumName)
      setSelectMode(false)
      setMovingSelection(false)
    } catch (e) {
      console.error(e)
      window.alert('No se pudo mover.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteSelection() {
    if (!window.confirm(`¿Borrar ${selected.size} recuerdo${selected.size !== 1 ? 's' : ''}? No se puede deshacer.`)) return
    setBusy(true)
    try {
      const list = getPhotos().filter((p) => selected.has(p.id))
      await deletePhotos(list)
      setSelectMode(false)
    } catch (e) {
      console.error(e)
      window.alert('No se pudo borrar.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRenameAlbum() {
    const clean = renameValue.trim()
    if (!clean || clean === view) {
      setRenaming(false)
      return
    }
    setBusy(true)
    try {
      await renameAlbum(view, clean)
      setView(clean)
      setRenaming(false)
    } catch (e) {
      console.error(e)
      window.alert('No se pudo renombrar.')
    } finally {
      setBusy(false)
    }
  }

  async function handleEmptyAlbum() {
    if (!isNamedAlbum) return
    if (!window.confirm(`¿Vaciar el álbum "${view}"? Las fotos van a quedar en "Sin álbum".`)) return
    setBusy(true)
    try {
      await emptyAlbum(view)
      setView(ALL)
    } catch (e) {
      console.error(e)
      window.alert('No se pudo vaciar.')
    } finally {
      setBusy(false)
    }
  }

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
            <div className="flex items-center justify-between gap-3">
              {renaming ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameAlbum()}
                    className="min-w-0 flex-1 rounded-lg border border-white/40 bg-white/20 px-2 py-1 text-lg font-bold text-white placeholder:text-white/50 focus:outline-none"
                    placeholder="Nombre del álbum"
                  />
                  <button
                    onClick={handleRenameAlbum}
                    disabled={busy}
                    className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-gray-900 disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setRenaming(false)}
                    className="rounded-lg bg-white/20 p-1.5 text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="min-w-0 flex-1 truncate text-2xl font-bold drop-shadow-sm">
                    📁 {currentAlbumName}
                  </h1>
                  {isNamedAlbum && (
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setAlbumMenu((v) => !v)}
                        className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30"
                        aria-label="Opciones del álbum"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {albumMenu && (
                        <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl bg-white shadow-2xl">
                          <button
                            onClick={() => {
                              setRenameValue(view)
                              setRenaming(true)
                              setAlbumMenu(false)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil size={14} /> Renombrar
                          </button>
                          <button
                            onClick={() => {
                              handleEmptyAlbum()
                              setAlbumMenu(false)
                            }}
                            className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={14} /> Vaciar álbum
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-white/90">
              {visiblePhotos.length} {visiblePhotos.length === 1 ? 'recuerdo' : 'recuerdos'} en este álbum
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

      {/* Botones acción principal */}
      <div className="px-4">
        {!selectMode ? (
          <div className="-mt-4 flex gap-2">
            <button
              onClick={() => setUploading(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800"
            >
              <ImagePlus size={18} /> Subir
            </button>
            {visiblePhotos.length > 0 && (
              <button
                onClick={() => setSelectMode(true)}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-lg ring-1 ring-gray-200 hover:bg-gray-50"
              >
                <CheckSquare size={16} /> Elegir
              </button>
            )}
          </div>
        ) : (
          <div className="-mt-4 flex items-center gap-2 rounded-2xl bg-gray-900 p-2 shadow-lg">
            <button
              onClick={() => setSelectMode(false)}
              className="rounded-full p-2 text-white hover:bg-white/10"
              aria-label="Cancelar selección"
            >
              <X size={18} />
            </button>
            <span className="min-w-0 flex-1 text-sm font-bold text-white">
              {selected.size} {selected.size === 1 ? 'elegido' : 'elegidos'}
            </span>
            <button
              onClick={() => setSelected(new Set(visiblePhotos.map((p) => p.id)))}
              className="rounded-lg px-2 py-1 text-xs font-bold text-white/80 hover:bg-white/10"
            >
              Todo
            </button>
            <button
              onClick={() => setMovingSelection(true)}
              disabled={selected.size === 0 || busy}
              className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-gray-900 disabled:opacity-40"
            >
              <FolderInput size={14} /> Mover
            </button>
            <button
              onClick={handleDeleteSelection}
              disabled={selected.size === 0 || busy}
              className="rounded-lg bg-rose-500 p-2 text-white disabled:opacity-40"
              aria-label="Borrar seleccionados"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Álbumes (solo en vista TODOS, fuera del modo seleccionar) */}
      {!isFilteredView && !selectMode && hasAnyAlbums && (
        <div className="mt-5 px-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Álbumes</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {albums.map((a) => (
              <button
                key={a.name ?? '__none__'}
                onClick={() => setView(a.name ?? NONE)}
                className="group relative flex w-28 shrink-0 flex-col overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-1 ring-black/5 active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-gray-200">
                  {a.cover && !isVideo(a.cover) ? (
                    <img src={photoUrl(a.cover.path)} alt={a.name || 'álbum'} className="h-full w-full object-cover" loading="lazy" />
                  ) : a.cover ? (
                    <>
                      <video src={photoUrl(a.cover.path)} muted playsInline preload="metadata" className="h-full w-full object-cover" />
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
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-400"
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
          {visiblePhotos.map((p, i) => {
            const checked = selected.has(p.id)
            const onTap = () => {
              if (selectMode) togglePhoto(p.id)
              else {
                const kind = view === ALL ? 'all' : view === NONE ? 'none' : 'album'
                const name = isNamedAlbum ? view : null
                setLightbox({ kind, name, index: i })
              }
            }
            return (
              <button
                key={p.id}
                onClick={onTap}
                onTouchStart={() => !selectMode && startLongPress(p.id)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onMouseDown={() => !selectMode && startLongPress(p.id)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                className={[
                  'relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-transform',
                  selectMode && checked ? 'ring-2 ring-emerald-500 ring-offset-1' : '',
                  selectMode && !checked ? 'opacity-70' : '',
                ].join(' ')}
              >
                {isVideo(p) ? (
                  <>
                    <video src={photoUrl(p.path)} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                      <Play size={26} className="text-white drop-shadow" fill="white" />
                    </span>
                  </>
                ) : (
                  <img src={photoUrl(p.path)} alt={p.caption || 'foto'} loading="lazy" className="h-full w-full object-cover transition-transform active:scale-95" />
                )}
                {selectMode && (
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow">
                    {checked ? (
                      <CheckSquare size={16} className="text-emerald-500" />
                    ) : (
                      <Square size={16} className="text-gray-400" />
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {uploading && (
        <PhotoUpload
          defaultAlbum={isNamedAlbum ? view : null}
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
      {movingSelection && (
        <AlbumPicker
          title={`Mover ${selected.size} recuerdo${selected.size !== 1 ? 's' : ''}`}
          currentAlbum={isNamedAlbum ? view : view === NONE ? null : undefined}
          onPick={handleMoveSelection}
          onClose={() => setMovingSelection(false)}
        />
      )}
    </div>
  )
}
