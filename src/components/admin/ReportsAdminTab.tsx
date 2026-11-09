'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTime } from '@/lib/utils'
import { Loader2, Save, Plus, CheckCircle2 } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Report {
  id: string
  dogId: string
  generatedAt: string | Date
  initialState: string | null
  objectives: string | null
  activitiesPerformed: string | null
  changesObserved: string | null
  pendingDifficulties: string | null
  nextObjectives: string | null
  professionalNotes: string | null
  isVisibleToOwner: boolean
}

// ─── Form schema ─────────────────────────────────────────────────────────────

const reportSchema = z.object({
  initialState: z.string().optional(),
  objectives: z.string().optional(),
  activitiesPerformed: z.string().optional(),
  changesObserved: z.string().optional(),
  pendingDifficulties: z.string().optional(),
  nextObjectives: z.string().optional(),
  professionalNotes: z.string().optional(),
  isVisibleToOwner: z.boolean(),
})

type ReportFormValues = z.infer<typeof reportSchema>

// ─── Report form ─────────────────────────────────────────────────────────────

function ReportForm({
  dogId,
  editingReport,
  onCancel,
  onSaved,
}: {
  dogId: string
  editingReport: Report | null
  onCancel: () => void
  onSaved: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      initialState: editingReport?.initialState ?? '',
      objectives: editingReport?.objectives ?? '',
      activitiesPerformed: editingReport?.activitiesPerformed ?? '',
      changesObserved: editingReport?.changesObserved ?? '',
      pendingDifficulties: editingReport?.pendingDifficulties ?? '',
      nextObjectives: editingReport?.nextObjectives ?? '',
      professionalNotes: editingReport?.professionalNotes ?? '',
      isVisibleToOwner: editingReport?.isVisibleToOwner ?? false,
    },
  })

  const isVisible = watch('isVisibleToOwner')

  const onSubmit = async (data: ReportFormValues) => {
    setServerError(null)
    try {
      const url = editingReport
        ? `/api/reports/${editingReport.id}`
        : '/api/reports'
      const method = editingReport ? 'PUT' : 'POST'
      const body = editingReport ? data : { ...data, dogId }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Error al guardar.')
        return
      }

      onSaved()
    } catch {
      setServerError('Error de red. Revisá tu conexión.')
    }
  }

  const textFields: {
    key: keyof Omit<ReportFormValues, 'isVisibleToOwner'>
    label: string
    placeholder: string
  }[] = [
    { key: 'initialState', label: 'Estado inicial', placeholder: 'Estado del perro al inicio del período…' },
    { key: 'objectives', label: 'Objetivos del período', placeholder: 'Objetivos planteados…' },
    { key: 'activitiesPerformed', label: 'Actividades realizadas', placeholder: 'Descripción de las actividades…' },
    { key: 'changesObserved', label: 'Cambios observados', placeholder: 'Avances y cambios positivos…' },
    { key: 'pendingDifficulties', label: 'Dificultades pendientes', placeholder: 'Aspectos que requieren trabajo…' },
    { key: 'nextObjectives', label: 'Próximos objetivos', placeholder: 'Metas para el siguiente período…' },
    { key: 'professionalNotes', label: 'Notas del profesional', placeholder: 'Notas privadas para uso interno…' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">
        {textFields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`report-${key}`}>{label}</Label>
            <Textarea
              id={`report-${key}`}
              rows={3}
              placeholder={placeholder}
              {...register(key)}
              error={errors[key]?.message}
            />
          </div>
        ))}

        {/* Visibility checkbox */}
        <div className="flex items-center gap-3">
          <input
            id="report-isVisibleToOwner"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-primary-500"
            checked={isVisible}
            {...register('isVisibleToOwner')}
            onChange={(e) => setValue('isVisibleToOwner', e.target.checked)}
          />
          <Label htmlFor="report-isVisibleToOwner" className="cursor-pointer font-normal">
            Visible para el propietario
          </Label>
        </div>

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {serverError}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {editingReport ? 'Actualizar informe' : 'Crear informe'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReportsAdminTab({
  dogId,
  reports,
}: {
  dogId: string
  reports: Report[]
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | null>(null)

  const handleEdit = (report: Report) => {
    setEditingReport(report)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingReport(null)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditingReport(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informes ({reports.length})</CardTitle>
            {!showForm && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingReport(null)
                  setShowForm(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Nuevo informe
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 && !showForm ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              Sin informes registrados aún.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reports.map((report) => (
                <li key={report.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDateTime(report.generatedAt)}
                    </p>
                    <Badge
                      variant={report.isVisibleToOwner ? 'success' : 'secondary'}
                      className="mt-1"
                    >
                      {report.isVisibleToOwner ? 'Visible para el propietario' : 'Privado'}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(report)}
                  >
                    Editar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReport ? 'Editar informe' : 'Nuevo informe'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReportForm
              dogId={dogId}
              editingReport={editingReport}
              onCancel={handleCancel}
              onSaved={handleSaved}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
