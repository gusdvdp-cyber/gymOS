import { getInvitation, registerWithInvitation } from './actions'

export default async function UnirsePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const [{ token }, { error: errorParam }] = await Promise.all([params, searchParams])
  const invitation = await getInvitation(token)

  const ERROR_MESSAGES: Record<string, string> = {
    invalid: 'Esta invitación no es válida o ya fue utilizada.',
    email_mismatch: 'El email no coincide con la invitación.',
  }

  const errorMessage = errorParam
    ? (ERROR_MESSAGES[errorParam] ?? decodeURIComponent(errorParam))
    : null

  if (!invitation.isValid) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm text-center space-y-3">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-xl font-bold text-gray-900">Invitación inválida</h1>
          <p className="text-sm text-gray-500">{invitation.errorMessage}</p>
        </div>
      </main>
    )
  }

  const action = registerWithInvitation.bind(null, token)

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: `${invitation.secondaryColor}15` }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header del gym */}
        <div className="text-center space-y-3">
          {invitation.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invitation.logoUrl} alt={invitation.gymName} className="mx-auto h-16 object-contain" />
          ) : (
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{ backgroundColor: invitation.secondaryColor }}
            >
              {invitation.gymName[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invitation.gymName}</h1>
            <p className="text-sm text-gray-500">
              Te invita a unirte como{' '}
              <span className="font-medium">{invitation.role === 'profe' ? 'Profesor/a' : 'Cliente'}</span>
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form action={action} className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          {errorMessage && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre *</label>
              <input
                name="first_name"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': invitation.primaryColor } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido *</label>
              <input
                name="last_name"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              name="email"
              type="email"
              required
              defaultValue={invitation.prefilledEmail ?? ''}
              readOnly={!!invitation.prefilledEmail}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              name="phone"
              type="tel"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              placeholder="+54 351 000 0000"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: invitation.primaryColor }}
          >
            Crear mi cuenta
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          ¿Ya tenés cuenta?{' '}
          <a href="/login" className="underline">Iniciá sesión</a>
        </p>
      </div>
    </main>
  )
}
