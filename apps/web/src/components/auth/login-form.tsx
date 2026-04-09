'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signInWithEmail } from '@/app/(auth)/login/actions'

const ERROR_MESSAGES: Record<string, string> = {
  credenciales_invalidas: 'Email o contraseña incorrectos.',
  auth_callback_error: 'Error de autenticación. Intentá de nuevo.',
}

export default function LoginForm() {
  const searchParams = useSearchParams()
  const errorKey = searchParams.get('error')
  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? 'Ocurrió un error inesperado.') : null
  const registered = searchParams.get('registered')
  const reset = searchParams.get('reset')

  return (
    <form action={signInWithEmail} className="space-y-5">
      {registered && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ Cuenta creada correctamente. Podés ingresar ahora.
        </div>
      )}
      {reset && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ Contraseña actualizada correctamente. Ingresá con tu nueva contraseña.
        </div>
      )}
      {errorMessage && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
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

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-end">
        <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Ingresar
      </button>
    </form>
  )
}
