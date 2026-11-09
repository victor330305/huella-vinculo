'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, CheckCircle2, KeyRound } from 'lucide-react'

interface Props {
  ownerId: string
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; email: string; password: string }
  | { status: 'error'; message: string }

export function CreateAccessButton({ ownerId }: Props) {
  const [state, setState] = useState<State>({ status: 'idle' })
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    setState({ status: 'loading' })
    try {
      const res = await fetch(`/api/owners/${ownerId}/create-access`, {
        method: 'POST',
      })
      const json = await res.json().catch(() => ({}))

      if (res.status === 409 && json.hasAccess === true) {
        setState({ status: 'error', message: 'El propietario ya tiene acceso.' })
        return
      }

      if (!res.ok) {
        setState({
          status: 'error',
          message: json.error ?? 'Ocurrió un error al crear el acceso.',
        })
        return
      }

      setState({ status: 'success', email: json.email, password: json.password })
    } catch {
      setState({ status: 'error', message: 'Error de red. Revisá tu conexión.' })
    }
  }

  const handleCopy = async () => {
    if (state.status !== 'success') return
    try {
      await navigator.clipboard.writeText(state.password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  if (state.status === 'success') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Acceso creado correctamente
        </div>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs text-gray-400 uppercase tracking-wide">Email</dt>
            <dd className="font-medium text-gray-800">{state.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 uppercase tracking-wide">Contraseña temporal</dt>
            <dd className="flex items-center gap-2 mt-1">
              <code className="font-mono bg-white border border-gray-200 rounded px-2 py-1 text-gray-900 select-all">
                {state.password}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </dd>
          </div>
        </dl>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Esta contraseña se muestra una sola vez. Compartila con el propietario.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={handleCreate}
        disabled={state.status === 'loading'}
      >
        {state.status === 'loading' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando acceso…
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Crear acceso al portal
          </>
        )}
      </Button>
      {state.status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.message}
        </p>
      )}
    </div>
  )
}
