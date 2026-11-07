'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Loader2, Save, Plus, CheckCircle2 } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type SessionType = 'EVALUATION' | 'TRAINING' | 'FOLLOW_UP'
type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
type ExerciseStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'

interface Session {
  id: string
  date: string | Date
  type: SessionType
  status: SessionStatus
  durationMinutes: number
  observations: string | null
  notes: string | null
  professional: { name: string } | null
}

interface Exercise {
  id: string
  name: string
  objective: string
  instructions: string
  status: ExerciseStatus
  frequency: string | null
  videoUrl: string | null
  assignedAt: string | Date
}

interface DogProfile {
  initialEvaluation: string | null
  background: string | null
  identifiedNeeds: string | null
  agreedObjectives: string | null
  workPlan: string | null
  homeRecommendations: string | null
}

interface Dog {
  id: string
  name: string
  breed: string
  sex: 'MALE' | 'FEMALE'
  birthDate: string | Date | null
  approximateAge: string | null
  color: string | null
  weight: number | null
  microchip: string | null
  notes: string | null
  owner: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  profile: DogProfile | null
  sessions: Session[]
  exercises: Exercise[]
}

// ─── Profile form schema ─────────────────────────────────────────────────────

const profileSchema = z.object({
  initialEvaluation: z.string().optional(),
  background: z.string().optional(),
  identifiedNeeds: z.string().optional(),
  agreedObjectives: z.string().optional(),
  workPlan: z.string().optional(),
  homeRecommendations: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// ─── Session form schema ─────────────────────────────────────────────────────

const sessionSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  type: z.enum(['EVALUATION', 'TRAINING', 'FOLLOW_UP']),
  durationMinutes: z.string().optional(),
  observations: z.string().optional(),
  notes: z.string().optional(),
})

type SessionFormValues = z.infer<typeof sessionSchema>

// ─── Exercise form schema ─────────────────────────────────────────────────────

const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  objective: z.string().min(1, 'El objetivo es requerido'),
  instructions: z.string().min(1, 'Las instrucciones son requeridas'),
  frequency: z.string().optional(),
  videoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  observations: z.string().optional(),
})

type ExerciseFormValues = z.infer<typeof exerciseSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sessionTypeLabel(type: SessionType) {
  const map: Record<SessionType, string> = {
    EVALUATION: 'Evaluación',
    TRAINING: 'Entrenamiento',
    FOLLOW_UP: 'Seguimiento',
  }
  return map[type]
}

function sessionStatusVariant(status: SessionStatus) {
  if (status === 'COMPLETED') return 'success' as const
  if (status === 'CANCELLED') return 'destructive' as const
  return 'secondary' as const
}

function sessionStatusLabel(status: SessionStatus) {
  const map: Record<SessionStatus, string> = {
    SCHEDULED: 'Programada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  }
  return map[status]
}

function exerciseStatusVariant(status: ExerciseStatus) {
  if (status === 'COMPLETED') return 'success' as const
  if (status === 'IN_PROGRESS') return 'default' as const
  if (status === 'PAUSED') return 'warning' as const
  return 'secondary' as const
}

function exerciseStatusLabel(status: ExerciseStatus) {
  const map: Record<ExerciseStatus, string> = {
    ASSIGNED: 'Asignado',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completado',
    PAUSED: 'Pausado',
  }
  return map[status]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileTab({
  dogId,
  profile,
}: {
  dogId: string
  profile: DogProfile | null
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      initialEvaluation: profile?.initialEvaluation ?? '',
      background: profile?.background ?? '',
      identifiedNeeds: profile?.identifiedNeeds ?? '',
      agreedObjectives: profile?.agreedObjectives ?? '',
      workPlan: profile?.workPlan ?? '',
      homeRecommendations: profile?.homeRecommendations ?? '',
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setServerError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/dogs/${dogId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Error al guardar.')
        return
      }
      setSaved(true)
      router.refresh()
    } catch {
      setServerError('Error de red. Revisá tu conexión.')
    }
  }

  const fields: { key: keyof ProfileFormValues; label: string; placeholder: string }[] = [
    { key: 'initialEvaluation', label: 'Evaluación inicial', placeholder: 'Descripción de la evaluación inicial…' },
    { key: 'background', label: 'Antecedentes', placeholder: 'Historial y antecedentes relevantes…' },
    { key: 'identifiedNeeds', label: 'Necesidades identificadas', placeholder: 'Necesidades detectadas en la evaluación…' },
    { key: 'agreedObjectives', label: 'Objetivos acordados', placeholder: 'Objetivos de trabajo acordados con el propietario…' },
    { key: 'workPlan', label: 'Plan de trabajo', placeholder: 'Plan detallado de intervención…' },
    { key: 'homeRecommendations', label: 'Recomendaciones para el hogar', placeholder: 'Pautas y recomendaciones para el propietario…' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key}>{label}</Label>
            <Textarea
              id={key}
              rows={4}
              placeholder={placeholder}
              {...register(key)}
              error={errors[key]?.message}
            />
          </div>
        ))}

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {serverError}
          </p>
        )}
        {saved && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Expediente guardado correctamente.
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar expediente
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

function SessionsTab({ dogId, sessions }: { dogId: string; sessions: Session[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      date: '',
      type: 'TRAINING',
      durationMinutes: '60',
      observations: '',
      notes: '',
    },
  })

  const onSubmit = async (data: SessionFormValues) => {
    setServerError(null)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogId,
          date: new Date(data.date).toISOString(),
          type: data.type,
          durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : 60,
          observations: data.observations || undefined,
          notes: data.notes || undefined,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Error al guardar.')
        return
      }
      reset()
      setShowForm(false)
      router.refresh()
    } catch {
      setServerError('Error de red. Revisá tu conexión.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Sessions list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sesiones ({sessions.length})</CardTitle>
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" />
              Nueva sesión
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              Sin sesiones registradas aún.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sessions.map((s) => (
                <li key={s.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {sessionTypeLabel(s.type)}
                      {s.professional && (
                        <span className="text-gray-500 font-normal"> · {s.professional.name}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDateTime(s.date)} · {s.durationMinutes} min
                    </p>
                    {s.observations && (
                      <p className="text-xs text-gray-600 mt-1 max-w-prose">{s.observations}</p>
                    )}
                  </div>
                  <Badge variant={sessionStatusVariant(s.status)}>
                    {sessionStatusLabel(s.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* New session form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="session-date">Fecha y hora *</Label>
                  <Input
                    id="session-date"
                    type="datetime-local"
                    {...register('date')}
                    error={errors.date?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="session-type">Tipo *</Label>
                  <select
                    id="session-type"
                    {...register('type')}
                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="TRAINING">Entrenamiento</option>
                    <option value="EVALUATION">Evaluación</option>
                    <option value="FOLLOW_UP">Seguimiento</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="session-duration">Duración (min)</Label>
                  <Input
                    id="session-duration"
                    type="number"
                    min={1}
                    defaultValue="60"
                    {...register('durationMinutes')}
                    error={errors.durationMinutes?.message}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="session-observations">Observaciones</Label>
                  <Textarea
                    id="session-observations"
                    rows={3}
                    placeholder="Notas de la sesión…"
                    {...register('observations')}
                    error={errors.observations?.message}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="session-notes">Notas internas</Label>
                  <Textarea
                    id="session-notes"
                    rows={2}
                    placeholder="Notas privadas para el profesional…"
                    {...register('notes')}
                    error={errors.notes?.message}
                  />
                </div>
              </div>

              {serverError && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3 mt-5 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
                      Guardar sesión
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ExercisesTab({ dogId, exercises }: { dogId: string; exercises: Exercise[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: '',
      objective: '',
      instructions: '',
      frequency: '',
      videoUrl: '',
      observations: '',
    },
  })

  const onSubmit = async (data: ExerciseFormValues) => {
    setServerError(null)
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogId,
          name: data.name,
          objective: data.objective,
          instructions: data.instructions,
          frequency: data.frequency || undefined,
          videoUrl: data.videoUrl || undefined,
          observations: data.observations || undefined,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Error al guardar.')
        return
      }
      reset()
      setShowForm(false)
      router.refresh()
    } catch {
      setServerError('Error de red. Revisá tu conexión.')
    }
  }

  const updateStatus = async (id: string, status: ExerciseStatus) => {
    setUpdatingId(id)
    try {
      await fetch(`/api/exercises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } finally {
      setUpdatingId(null)
    }
  }

  const nextStatus: Record<ExerciseStatus, ExerciseStatus | null> = {
    ASSIGNED: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED: null,
    PAUSED: 'IN_PROGRESS',
  }

  const nextStatusLabel: Record<ExerciseStatus, string | null> = {
    ASSIGNED: 'Iniciar',
    IN_PROGRESS: 'Completar',
    COMPLETED: null,
    PAUSED: 'Reanudar',
  }

  return (
    <div className="space-y-6">
      {/* Exercises list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ejercicios ({exercises.length})</CardTitle>
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" />
              Nuevo ejercicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              Sin ejercicios asignados aún.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {exercises.map((ex) => {
                const next = nextStatus[ex.status]
                const nextLabel = nextStatusLabel[ex.status]
                return (
                  <li key={ex.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{ex.name}</p>
                        <Badge variant={exerciseStatusVariant(ex.status)}>
                          {exerciseStatusLabel(ex.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{ex.objective}</p>
                      {ex.frequency && (
                        <p className="text-xs text-gray-500">Frecuencia: {ex.frequency}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Asignado: {formatDate(ex.assignedAt)}
                      </p>
                    </div>
                    {next && nextLabel && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === ex.id}
                        onClick={() => updateStatus(ex.id, next)}
                      >
                        {updatingId === ex.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          nextLabel
                        )}
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* New exercise form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo ejercicio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="ex-name">Nombre *</Label>
                  <Input
                    id="ex-name"
                    placeholder="Nombre del ejercicio"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ex-frequency">Frecuencia</Label>
                  <Input
                    id="ex-frequency"
                    placeholder="3 veces por semana"
                    {...register('frequency')}
                    error={errors.frequency?.message}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ex-objective">Objetivo *</Label>
                  <Input
                    id="ex-objective"
                    placeholder="Objetivo del ejercicio"
                    {...register('objective')}
                    error={errors.objective?.message}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ex-instructions">Instrucciones *</Label>
                  <Textarea
                    id="ex-instructions"
                    rows={4}
                    placeholder="Instrucciones detalladas para el propietario…"
                    {...register('instructions')}
                    error={errors.instructions?.message}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ex-video">URL de video (opcional)</Label>
                  <Input
                    id="ex-video"
                    type="url"
                    placeholder="https://youtube.com/..."
                    {...register('videoUrl')}
                    error={errors.videoUrl?.message}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ex-observations">Observaciones</Label>
                  <Textarea
                    id="ex-observations"
                    rows={2}
                    placeholder="Observaciones adicionales…"
                    {...register('observations')}
                    error={errors.observations?.message}
                  />
                </div>
              </div>

              {serverError && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3 mt-5 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
                      Guardar ejercicio
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Main DogTabs component ──────────────────────────────────────────────────

export function DogTabs({ dog }: { dog: Dog }) {
  return (
    <Tabs defaultValue="info">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="expediente">Expediente</TabsTrigger>
        <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
        <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
      </TabsList>

      {/* ── Info tab ── */}
      <TabsContent value="info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos básicos</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Raza</dt>
                  <dd className="text-sm font-medium text-gray-800 mt-0.5">{dog.breed}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Sexo</dt>
                  <dd className="text-sm font-medium text-gray-800 mt-0.5">
                    {dog.sex === 'MALE' ? 'Macho' : 'Hembra'}
                  </dd>
                </div>
                {dog.birthDate && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">
                      Fecha de nacimiento
                    </dt>
                    <dd className="text-sm font-medium text-gray-800 mt-0.5">
                      {formatDate(dog.birthDate)}
                    </dd>
                  </div>
                )}
                {dog.approximateAge && !dog.birthDate && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">
                      Edad aproximada
                    </dt>
                    <dd className="text-sm font-medium text-gray-800 mt-0.5">
                      {dog.approximateAge}
                    </dd>
                  </div>
                )}
                {dog.color && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Color</dt>
                    <dd className="text-sm font-medium text-gray-800 mt-0.5">{dog.color}</dd>
                  </div>
                )}
                {dog.weight && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Peso</dt>
                    <dd className="text-sm font-medium text-gray-800 mt-0.5">{dog.weight} kg</dd>
                  </div>
                )}
                {dog.microchip && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Microchip</dt>
                    <dd className="text-sm font-medium text-gray-800 mt-0.5">{dog.microchip}</dd>
                  </div>
                )}
                {dog.notes && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Notas</dt>
                    <dd className="text-sm text-gray-700 mt-0.5 bg-gray-50 rounded-lg px-3 py-2">
                      {dog.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propietario</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Nombre</dt>
                  <dd className="text-sm font-medium text-gray-800 mt-0.5">
                    {dog.owner.firstName} {dog.owner.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Email</dt>
                  <dd className="text-sm font-medium text-gray-800 mt-0.5">{dog.owner.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Teléfono</dt>
                  <dd className="text-sm font-medium text-gray-800 mt-0.5">{dog.owner.phone}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── Expediente tab ── */}
      <TabsContent value="expediente">
        <Card>
          <CardHeader>
            <CardTitle>Expediente evolutivo</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileTab dogId={dog.id} profile={dog.profile} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Sesiones tab ── */}
      <TabsContent value="sesiones">
        <SessionsTab dogId={dog.id} sessions={dog.sessions} />
      </TabsContent>

      {/* ── Ejercicios tab ── */}
      <TabsContent value="ejercicios">
        <ExercisesTab dogId={dog.id} exercises={dog.exercises} />
      </TabsContent>
    </Tabs>
  )
}
