import { useEffect, useMemo, useRef, useState } from 'react'
import {
  X,
  ImagePlus,
  Camera,
  Film,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Loader2,
  Check,
} from 'lucide-react'
import { uploadPhotos, getAlbums, onPhotosChange } from '../lib/photos'
import LocationSearch from './LocationSearch'
import useLockBodyScroll from '../lib/useLockBodyScroll'

const STEPS = [
  { key: 'files', label: 'Elegir' },
  { key: 'place', label: 'Ubicación' },
  { key: 'meta', label: 'Detalles' },
]

export default function PhotoUpload({ defaultEventId = null, defaultAlbum = null, onClose }) {
  useLockBodyScroll(true)
  const fileRef = useRef(null)
  const addMoreRef = useRef(null)

  const [step, setStep] = useState(0)
  const [items, setItems] = useState([]) // { file, preview, isVideo, id }
  const [place, setPlace] = useState(defaultEventId ? { eventId: defaultEventId } : null)
  const [caption, setCaption] = useState('')
  const [album, setAlbum] = useState(defaultAlbum || '')

  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState('')

  // Re-lee albums cuando cambia la caché (subida en otra tab, etc.)
  const [albumsTick, setAlbumsTick] = useState(0)
  useEffect(() => onPhotosChange(() => setAlbumsTick((v) => v + 1)), [])
  const existingAlbums = useMemo(
    () => getAlbums().map((a) => a.name).filter(Boolean),
    [albumsTick]
  )

  // Liberá los ObjectURL de previews al desmontar el wizard (memory leak fix).
  const itemsRef = useRef(items)
  itemsRef.current = items
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.preview))
    }
  }, [])

  function addFiles(fileList) {
    const arr = Array.from(fileList || [])
    if (!arr.length) return
    const mapped = arr.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      isVideo: (f.type || '').startsWith('video/'),
      id: crypto.randomUUID(),
    }))
    setItems((prev) => [...prev, ...mapped])
    setError('')
  }

  function removeItem(id) {
    setItems((prev) => {
      const gone = prev.find((x) => x.id === id)
      if (gone) URL.revokeObjectURL(gone.preview)
      return prev.filter((x) => x.id !== id)
    })
  }

  function next() {
    if (step === 0 && items.length === 0) {
      setError('Elegí al menos una foto o video.')
      return
    }
    if (step === 1 && !place) {
      setError('Tocá una actividad, buscá un lugar o marcá un punto en el mapa.')
      return
    }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  function prev() {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleUpload() {
    if (busy) return
    setBusy(true)
    setError('')
    setProgress({ done: 0, total: items.length })
    try {
      const res = await uploadPhotos(
        items.map((x) => x.file),
        {
          eventId: place.eventId ?? null,
          lat: place.lat ?? null,
          lng: place.lng ?? null,
          caption: caption.trim(),
          album: album.trim() || null,
        },
        (done, total) => setProgress({ done, total })
      )
      if (res.errors.length && res.errors.length === res.total) {
        setError('No se pudo subir nada. Probá de nuevo.')
        setBusy(false)
        return
      }
      onClose()
    } catch (e) {
      console.error(e)
      setError('No se pudo subir. Probá de nuevo.')
      setBusy(false)
    }
  }

  const stats = useMemo(() => {
    const v = items.filter((x) => x.isVideo).length
    const p = items.length - v
    return { fotos: p, videos: v }
  }, [items])

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="animate-fade-in flex max-h-[94vh] w-full max-w-app flex-col rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con progreso */}
        <div className="border-b border-gray-100 px-5 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">
              {step === 0 ? 'Elegí tus recuerdos' : step === 1 ? '¿Dónde fue?' : 'Últimos detalles'}
            </h3>
            <button
              onClick={onClose}
              disabled={busy}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-40"
            >
              <X size={20} />
            </button>
          </div>
          <ProgressBar step={step} steps={STEPS} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4">
          {step === 0 && (
            <StepFiles
              items={items}
              stats={stats}
              addFiles={addFiles}
              removeItem={removeItem}
              fileRef={fileRef}
              addMoreRef={addMoreRef}
            />
          )}
          {step === 1 && <StepPlace place={place} setPlace={setPlace} />}
          {step === 2 && (
            <StepMeta
              items={items}
              stats={stats}
              album={album}
              setAlbum={setAlbum}
              caption={caption}
              setCaption={setCaption}
              existingAlbums={existingAlbums}
              progress={progress}
              busy={busy}
            />
          )}

          {error && <p className="mt-3 text-xs font-medium text-rose-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={prev}
            disabled={busy || step === 0}
            className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Atrás
          </button>
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-1 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleUpload}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {progress.total > 0 ? `Subiendo ${progress.done}/${progress.total}` : 'Subiendo…'}
                </>
              ) : (
                <>
                  <Check size={16} /> Subir {items.length > 1 ? `${items.length} recuerdos` : 'recuerdo'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

function ProgressBar({ step, steps }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < step
        const active = i === step
        return (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div
              className={[
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-500',
              ].join(' ')}
            >
              {done ? <Check size={12} /> : i + 1}
            </div>
            <span
              className={[
                'truncate text-[11px] font-semibold transition-colors',
                active ? 'text-gray-900' : done ? 'text-emerald-600' : 'text-gray-400',
              ].join(' ')}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={['h-0.5 flex-1 rounded', done ? 'bg-emerald-500' : 'bg-gray-200'].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

function StepFiles({ items, stats, addFiles, removeItem, fileRef, addMoreRef }) {
  const isEmpty = items.length === 0
  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ''
        }}
        className="hidden"
      />
      <input
        ref={addMoreRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ''
        }}
        className="hidden"
      />

      {isEmpty ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
        >
          <div className="flex items-center gap-2">
            <ImagePlus size={28} />
            <Film size={28} />
          </div>
          <span className="text-sm font-semibold">Elegí tus fotos o videos</span>
          <span className="flex items-center gap-1 text-[11px]">
            <Camera size={12} /> podés elegir varios de una
          </span>
        </button>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
              {items.length} {items.length === 1 ? 'seleccionado' : 'seleccionados'}
              {stats.videos > 0 && (
                <span className="ml-1 font-normal text-gray-400">
                  · {stats.fotos} foto{stats.fotos !== 1 ? 's' : ''} + {stats.videos} video{stats.videos !== 1 ? 's' : ''}
                </span>
              )}
            </p>
            <button
              onClick={() => addMoreRef.current?.click()}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-200"
            >
              <Plus size={12} /> Agregar más
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {items.map((it) => (
              <div key={it.id} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                {it.isVideo ? (
                  <>
                    <video src={it.preview} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                      <Play size={22} className="text-white drop-shadow" fill="white" />
                    </span>
                  </>
                ) : (
                  <img src={it.preview} alt="preview" className="h-full w-full object-cover" />
                )}
                <button
                  onClick={() => removeItem(it.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  aria-label="Quitar"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addMoreRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
              aria-label="Agregar más"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

function StepPlace({ place, setPlace }) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">
        Buscá el lugar, tocá el mapa o elegí una actividad de tu viaje.
      </p>
      <LocationSearch value={place} onChange={setPlace} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

function StepMeta({ items, stats, album, setAlbum, caption, setCaption, existingAlbums, progress, busy }) {
  const label = 'text-xs font-semibold uppercase tracking-wide text-gray-400'
  const totalMB = useMemo(
    () => (items.reduce((s, it) => s + (it.file?.size || 0), 0) / (1024 * 1024)).toFixed(1),
    [items]
  )

  return (
    <div>
      {/* Resumen visual */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
        <div className="flex -space-x-3">
          {items.slice(0, 3).map((it) => (
            <div key={it.id} className="h-12 w-12 overflow-hidden rounded-lg border-2 border-white bg-gray-200 ring-1 ring-black/5">
              {it.isVideo ? (
                <video src={it.preview} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              ) : (
                <img src={it.preview} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          ))}
          {items.length > 3 && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-gray-900 text-xs font-bold text-white ring-1 ring-black/5">
              +{items.length - 3}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <p className="font-bold text-gray-800">
            {stats.fotos > 0 && `${stats.fotos} foto${stats.fotos !== 1 ? 's' : ''}`}
            {stats.fotos > 0 && stats.videos > 0 && ' · '}
            {stats.videos > 0 && `${stats.videos} video${stats.videos !== 1 ? 's' : ''}`}
          </p>
          <p className="text-gray-500">~ {totalMB} MB (las fotos se optimizan al subirlas)</p>
        </div>
      </div>

      {/* Álbum */}
      <p className={`${label} flex items-center gap-1.5`}>
        <FolderPlus size={12} /> Álbum <span className="font-normal lowercase text-gray-300">(opcional)</span>
      </p>
      <input
        list="album-suggestions"
        value={album}
        onChange={(e) => setAlbum(e.target.value)}
        placeholder="Ej: Rosedal, Cena, San Telmo…"
        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
      />
      <datalist id="album-suggestions">
        {existingAlbums.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
      {existingAlbums.length > 0 && !album && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {existingAlbums.slice(0, 6).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAlbum(a)}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-200"
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Título */}
      <p className={`${label} mt-4`}>
        Título <span className="font-normal lowercase text-gray-300">(opcional, para todos)</span>
      </p>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Ej: el atardecer en el Rosedal 🌅"
        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
      />

      {/* Progreso durante subida */}
      {busy && progress.total > 0 && (
        <div className="mt-4 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-1.5 bg-emerald-500 transition-all"
            style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
