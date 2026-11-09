'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Copy, Check, FileText, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Action = 'summary' | 'next-session' | 'report-draft' | 'exercise-suggestions'

const SPECIALTY_OPTIONS = [
  { value: 'comportamiento', label: 'Comportamiento general' },
  { value: 'obediencia', label: 'Obediencia básica' },
  { value: 'socializacion', label: 'Socialización' },
  { value: 'ansiedad', label: 'Ansiedad / miedo' },
  { value: 'agresividad', label: 'Manejo de reactividad' },
  { value: 'enriquecimiento', label: 'Enriquecimiento ambiental' },
]

export function AiAssistant({ dogId }: { dogId: string }) {
  const router = useRouter()
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [specialty, setSpecialty] = useState('comportamiento')
  const [copied, setCopied] = useState(false)
  const [creatingReport, setCreatingReport] = useState(false)
  const [reportCreated, setReportCreated] = useState(false)

  const handleAction = async (action: Action) => {
    setActiveAction(action)
    setIsLoading(true)
    setError(null)
    setResult(null)
    setReportCreated(false)

    try {
      const body: Record<string, string> = { dogId }
      if (action === 'exercise-suggestions') {
        body.specialty = specialty
      }

      const res = await fetch(`/api/ai/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al generar contenido.')
        return
      }

      setResult(json.result)
    } catch {
      setError('Error de red. Revisá tu conexión.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback silente
    }
  }

  const handleCreateReport = async () => {
    if (!result) return
    setCreatingReport(true)
    setError(null)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogId,
          professionalNotes: result,
          isVisibleToOwner: false,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al crear el informe.')
        return
      }

      setReportCreated(true)
      router.refresh()
    } catch {
      setError('Error de red. Revisá tu conexión.')
    } finally {
      setCreatingReport(false)
    }
  }

  const actions: { id: Action; label: string }[] = [
    { id: 'summary', label: 'Resumen del historial' },
    { id: 'next-session', label: 'Puntos para próxima sesión' },
    { id: 'report-draft', label: 'Borrador de informe' },
    { id: 'exercise-suggestions', label: 'Sugerencias de ejercicios' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-400" />
          Asistente IA
        </CardTitle>
        <p className="text-sm text-gray-500">Borradores generados por IA para revisión profesional</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Specialty selector — only shown before exercise-suggestions */}
        <div className="space-y-1.5">
          <label
            htmlFor="ai-specialty"
            className="text-xs text-gray-500 uppercase tracking-wide"
          >
            Especialidad (para sugerencias de ejercicios)
          </label>
          <select
            id="ai-specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {SPECIALTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map(({ id, label }) => (
            <Button
              key={id}
              onClick={() => handleAction(id)}
              disabled={isLoading}
              variant={activeAction === id ? 'default' : 'secondary'}
            >
              {isLoading && activeAction === id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {label}
            </Button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-3 text-sm text-gray-500 bg-primary-50 rounded-lg px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            Analizando historial…
          </div>
        )}

        {/* Error state */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* Result area */}
        {result && (
          <div className="bg-cream rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Resultado</p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>

                {activeAction === 'report-draft' && (
                  <Button
                    size="sm"
                    onClick={handleCreateReport}
                    disabled={creatingReport || reportCreated}
                  >
                    {creatingReport ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    {reportCreated
                      ? 'Informe creado ✓'
                      : 'Crear informe con este borrador'}
                  </Button>
                )}
              </div>
            </div>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
              {result}
            </pre>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-400">
          ⚠️ Este contenido es un borrador generado por IA. Revisá y ajustá antes de usar.
        </p>
      </CardContent>
    </Card>
  )
}
