'use client'

import { createCoachUser } from '@/app/(dashboard)/dashboard/coaches/actions'

export default function CoachForm({ error }: { error?: string }) {
  return (
    <form action={createCoachUser} className="surface p-6 space-y-5">
      {error && <div className="alert-error">{decodeURIComponent(error)}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-dark">Nombre *</label>
          <input name="first_name" type="text" required className="input-dark" placeholder="Ana" />
        </div>
        <div>
          <label className="label-dark">Apellido *</label>
          <input name="last_name" type="text" required className="input-dark" placeholder="García" />
        </div>
      </div>

      <div>
        <label className="label-dark">Email *</label>
        <input name="email" type="email" required className="input-dark" placeholder="ana@gym.com" />
        <p style={{ color: '#444444', fontSize: 11, marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          El profe recibirá un email para acceder al dashboard.
        </p>
      </div>

      <div>
        <label className="label-dark">Teléfono</label>
        <input name="phone" type="tel" className="input-dark" placeholder="+54 351 000 0000" />
      </div>

      <div className="flex justify-end pt-2" style={{ borderTop: '1px solid #1a1a1a' }}>
        <button type="submit" className="btn-accent">Crear profe</button>
      </div>
    </form>
  )
}
