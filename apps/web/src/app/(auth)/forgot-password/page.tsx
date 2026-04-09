import type { Metadata } from 'next'
import Link from 'next/link'
import { sendPasswordReset } from './actions'

export const metadata: Metadata = { title: 'Recuperar contraseña' }

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { sent, error } = await searchParams

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

      <form action={sendPasswordReset} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none"
        >
          Enviar link de recuperación
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
