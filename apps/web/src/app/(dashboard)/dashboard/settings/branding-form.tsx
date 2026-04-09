'use client'

import { useState, useTransition } from 'react'
import { updateBranding } from './actions'

export default function BrandingForm({
  initialPrimary,
  initialSecondary,
}: {
  initialPrimary: string
  initialSecondary: string
}) {
  const [primary, setPrimary] = useState(initialPrimary)
  const [secondary, setSecondary] = useState(initialSecondary)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateBranding(data)
      if (result?.error) { setError(result.error) } else { setSaved(true) }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-6">
        <div className="flex-1">
          <label className="label-dark">Color de acento</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="primary_color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border p-0.5"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888888', textTransform: 'uppercase' }}>{primary}</span>
          </div>
        </div>

        <div className="flex-1">
          <label className="label-dark">Color sidebar</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="secondary_color"
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border p-0.5"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888888', textTransform: 'uppercase' }}>{secondary}</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="overflow-hidden rounded-lg" style={{ border: '1px solid #2a2a2a' }}>
        <div
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold"
          style={{ backgroundColor: secondary, color: '#ffffff' }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>G</div>
          Vista previa del sidebar
        </div>
        <div className="px-4 py-2.5 text-xs font-bold" style={{ backgroundColor: primary, color: '#0a0a0a' }}>
          Botón de acción / acento
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {saved && <div className="alert-success">Colores guardados. Recargá para verlos aplicados.</div>}

      <button type="submit" disabled={isPending} className="btn-accent">
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
