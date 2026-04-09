'use client'

import { useState, useTransition } from 'react'
import type { GymBrandingRow } from '@gymos/types'
import { upsertBranding, uploadLogo } from '@/app/(superadmin)/superadmin/gyms/[gymId]/branding/actions'
import BrandingPreview from './branding-preview'
import { isValidHexColor } from '@gymos/utils'

interface BrandingEditorProps {
  gymId: string
  initialBranding: GymBrandingRow | null
}

export default function BrandingEditor({ gymId, initialBranding }: BrandingEditorProps) {
  const [primary, setPrimary] = useState(initialBranding?.primary_color ?? '#3B82F6')
  const [secondary, setSecondary] = useState(initialBranding?.secondary_color ?? '#1E3A5F')
  const [logoUrl, setLogoUrl] = useState(initialBranding?.logo_url ?? null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSaveColors() {
    if (!isValidHexColor(primary) || !isValidHexColor(secondary)) {
      setMessage({ type: 'error', text: 'Ingresá colores válidos en formato #RRGGBB' })
      return
    }
    startTransition(async () => {
      const result = await upsertBranding(gymId, primary, secondary)
      if (result.error) {
        setMessage({ type: 'error', text: result.error.message })
      } else {
        setMessage({ type: 'success', text: 'Branding guardado correctamente' })
      }
    })
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    startTransition(async () => {
      const result = await uploadLogo(gymId, formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error.message })
      } else {
        setLogoUrl(result.data!.logoUrl)
        setMessage({ type: 'success', text: 'Logo subido correctamente' })
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Editor */}
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-5">
        {message && (
          <div
            className={`rounded-md px-4 py-3 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
            Color primario
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
            />
            <input
              id="primaryColor"
              type="text"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="#3B82F6"
              maxLength={7}
            />
          </div>
        </div>

        <div>
          <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
            Color secundario
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
            />
            <input
              id="secondaryColor"
              type="text"
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="#1E3A5F"
              maxLength={7}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logo (PNG/JPG, máx. 2MB)</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleLogoUpload}
            disabled={isPending}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={handleSaveColors}
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar colores'}
        </button>
      </div>

      {/* Preview */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Vista previa</p>
        <BrandingPreview
          primaryColor={primary}
          secondaryColor={secondary}
          logoUrl={logoUrl}
        />
      </div>
    </div>
  )
}
