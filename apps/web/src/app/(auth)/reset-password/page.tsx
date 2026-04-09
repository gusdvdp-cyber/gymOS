import type { Metadata } from 'next'
import { updatePassword } from './actions'

export const metadata: Metadata = { title: 'Nueva contraseña' }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-gray-500">Elegí una contraseña segura.</p>
      </div>

      <form action={updatePassword} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Nueva contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none"
        >
          Guardar contraseña
        </button>
      </form>
    </div>
  )
}
