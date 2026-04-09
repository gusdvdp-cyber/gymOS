'use client'

import { createGymAndRedirect } from '@/app/(superadmin)/superadmin/gyms/actions'
import { slugify } from '@gymos/utils'
import { useState } from 'react'

interface GymFormProps {
  error?: string
}

export default function GymForm({ error }: GymFormProps) {
  const [nameValue, setNameValue] = useState('')

  return (
    <form action={createGymAndRedirect} className="rounded-lg border bg-white p-6 shadow-sm space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700 border-b pb-2 w-full">
          Datos del gimnasio
        </legend>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="CrossFit Córdoba"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug (URL) *
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={slugify(nameValue)}
            key={slugify(nameValue)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="crossfit-cordoba"
          />
        </div>

        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
            Plan *
          </label>
          <select
            id="plan"
            name="plan"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="PART">PART (~$300.000 ARS/mes)</option>
            <option value="FULL">FULL (~$500.000 ARS/mes)</option>
          </select>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email del gym
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="info@mygym.com"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700 border-b pb-2 w-full">
          Admin del gimnasio
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="adminFirstName" className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              id="adminFirstName"
              name="adminFirstName"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="adminLastName" className="block text-sm font-medium text-gray-700">
              Apellido *
            </label>
            <input
              id="adminLastName"
              name="adminLastName"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
            Email del admin *
          </label>
          <input
            id="adminEmail"
            name="adminEmail"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="admin@mygym.com"
          />
        </div>

        <div>
          <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
            Contraseña del admin *
          </label>
          <input
            id="adminPassword"
            name="adminPassword"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Mínimo 8 caracteres"
          />
          <p className="mt-1 text-xs text-gray-400">
            El admin usará esta contraseña para ingresar al dashboard.
          </p>
        </div>
      </fieldset>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Crear gimnasio
        </button>
      </div>
    </form>
  )
}
