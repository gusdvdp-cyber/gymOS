'use client'

import { useState, useTransition } from 'react'
import { ClipboardList } from 'lucide-react'
import { assignRoutine } from '@/app/(dashboard)/dashboard/clients/actions'

interface Routine { id: string; name: string; days_per_week: number }
interface Assignment { routine_id: string; routines: { name: string; days_per_week: number } }

interface AssignRoutineProps {
  clientId: string
  routines: Routine[]
  currentAssignment: Assignment | null
}

export default function AssignRoutine({ clientId, routines, currentAssignment }: AssignRoutineProps) {
  const [selected, setSelected] = useState(currentAssignment?.routine_id ?? '')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAssign() {
    if (!selected) return
    startTransition(async () => {
      const result = await assignRoutine(clientId, selected)
      if (result.error) {
        setMessage({ type: 'error', text: result.error.message })
      } else {
        setMessage({ type: 'success', text: 'Rutina asignada correctamente' })
      }
    })
  }

  return (
    <div className="surface p-5">
      <p className="label-dark" style={{ marginBottom: 12 }}>Rutina asignada</p>

      {currentAssignment && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <ClipboardList size={14} style={{ color: 'var(--color-accent)' }} />
          <div>
            <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }}>{currentAssignment.routines.name}</p>
            <p style={{ color: '#888888', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{currentAssignment.routines.days_per_week} días/semana</p>
          </div>
        </div>
      )}

      {message && (
        <div className={`mb-3 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="input-dark"
        >
          <option value="">— Seleccionar rutina —</option>
          {routines.map((r) => (
            <option key={r.id} value={r.id}>{r.name} ({r.days_per_week} días)</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAssign}
          disabled={!selected || isPending}
          className="btn-accent"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {isPending ? 'Asignando...' : currentAssignment ? 'Cambiar rutina' : 'Asignar rutina'}
        </button>
      </div>

      {routines.length === 0 && (
        <p style={{ color: '#444444', fontSize: 11, marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          No hay rutinas activas. Creá una primero.
        </p>
      )}
    </div>
  )
}
