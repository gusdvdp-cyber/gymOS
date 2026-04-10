'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/callback?next=/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✉️
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revisá tu email</h1>
          <p className="mt-2 text-sm text-gray-500">
            Si el email existe en el sistema, vas a recibir un link para restablecer tu contraseña.
          </p>
        </div>
        <Link href="/login" className="block text-sm font-medium text-blue-600 hover:text-blue-500">
          ← Volver al login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-gray-500">
          Ingresá tu email y te enviamos un link para resetearla.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperación'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          ← Volver al login
        </Link>
      </p>
    </div>
  )
}
