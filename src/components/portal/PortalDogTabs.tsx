'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, getYouTubeId } from '@/lib/utils'
import { Loader2, ExternalLink } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type ExerciseStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'
type SessionType = 'EVALUATION' | 'TRAINING' | 'FOLLOW_UP'
type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

interface DogProfile {
  initialEvaluation: string | null
  background: string | null
  identifiedNeeds: string | null
  agreedObjectives: string | null
  workPlan: string | null
  homeRecommendations: string | null
}

interface Report {
  id: string
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

interface Exercise {
  id: string
  name: string
  objective: string
  instructions: string
  status: ExerciseStatus
  frequency: string | null
  videoUrl: string | null
  professionalNotes: string | null
}

interface Session {
  id: string
  date: string | Date
  type: SessionType
  status: SessionStatus
  professional: { name: string } | null
}

interface Appointment {
  id: string
  date: string | Date
  serviceType: string
  status: AppointmentStatus
}

interface Dog {
  id: string
  name: string
  breed: string
  birthDate: string | Date | null
  approximateAge: string | null
  sex: 'MALE' | 'FEMALE'
  profilePhotoUrl: string | null
  ownerId: string
  profile: DogProfile | null
  sessions: Session[]
  exercises: Exercise[]
  appointments: Appointment[]
  reports: Report[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function appointmentStatusVariant(status: AppointmentStatus) {
  if (status === 'COMPLETED') return 'success' as const
  if (status === 'CANCELLED' || status === 'NO_SHOW') return 'destructive' as const
  if (status === 'CONFIRMED') return 'default' as const
  return 'secondary' as const
}

function appointmentStatusLabel(status: AppointmentStatus) {
  const map: Record<AppointmentStatus, string> = {
    SCHEDULED: 'Programado',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'No asistió',
  }
  return map[status]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExpedienteTab({ profile, reports }: { profile: DogProfile | null; reports: Report[] }) {
  const profileFields: { key: keyof DogProfile; label: string }[] = [
    { key: 'initialEvaluation', label: 'Evaluación inicial' },
    { key: 'background', label: 'Antecedentes' },
    { key: 'identifiedNeeds', label: 'Necesidades identificadas' },
    { key: 'agreedObjectives', label: 'Objetivos acordados' },
    { key: 'workPlan', label: 'Plan de trabajo' },
    { key: 'homeRecommendations', label: 'Recomendaciones para el hogar' },
  ]

  const reportFields: { key: keyof Omit<Report, 'id' | 'generatedAt' | 'isVisibleToOwner'>; label: string }[] = [
    { key: 'initialState', label: 'Estado inicial' },
    { key: 'objectives', label: 'Objetivos' },
    { key: 'activitiesPerformed', label: 'Actividades realizadas' },
    { key: 'changesObserved', label: 'Cambios observados' },
    { key: 'pendingDifficulties', label: 'Dificultades pendientes' },
    { key: 'nextObjectives', label: 'Próximos objetivos' },
    { key: 'professionalNotes', label: 'Notas del profesional' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expediente evolutivo</CardTitle>
        </CardHeader>
        <CardContent>
          {!profile ? (
            <p className="text-sm text-gray-500 py-4 text-center">Sin expediente</p>
          ) : (
            <dl className="space-y-4">
              {profileFields.map(({ key, label }) =>
                profile[key] ? (
                  <div key={key}>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
                    <dd className="text-sm text-gray-700 mt-1 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
                      {profile[key]}
                    </dd>
                  </div>
                ) : null
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-primary-700">Informes de progreso</h2>
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {formatDateTime(report.generatedAt)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {reportFields.map(({ key, label }) =>
                    report[key] ? (
                      <div key={key}>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
                        <dd className="text-sm text-gray-700 mt-1 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
                          {report[key] as string}
                        </dd>
                      </div>
                    ) : null
                  )}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function EjerciciosTab({ exercises, dogId }: { exercises: Exercise[]; dogId: string }) {
  const [notesMap, setNotesMap] = useState<Record<string, string>>(
    () => Object.fromEntries(exercises.map((ex) => [ex.id, ex.professionalNotes ?? '']))
  )
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({})
  const [loggingId, setLoggingId] = useState<string | null>(null)
  const [logNote, setLogNote] = useState<Record<string, string>>({})
  const [logCounts, setLogCounts] = useState<Record<string, number>>({})
  const [statusMap, setStatusMap] = useState<Record<string, ExerciseStatus>>(
    () => Object.fromEntries(exercises.map((ex) => [ex.id, ex.status]))
  )
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({})

  const handleRegisterPractice = async (exerciseId: string) => {
    setLoggingId(exerciseId)
    try {
      const res = await fetch('/api/exercise-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId, note: logNote[exerciseId] || undefined }),
      })
      if (res.ok) {
        setLogCounts((prev) => ({ ...prev, [exerciseId]: (prev[exerciseId] ?? 0) + 1 }))
        setLogNote((prev) => ({ ...prev, [exerciseId]: '' }))
        setStatusMap((prev) => ({ ...prev, [exerciseId]: 'IN_PROGRESS' }))
        setSuccessMap((prev) => ({ ...prev, [exerciseId]: true }))
        setTimeout(() => setSuccessMap((prev) => ({ ...prev, [exerciseId]: false })), 2000)
      }
    } finally {
      setLoggingId(null)
    }
  }

  const handleSaveNotes = async (exerciseId: string) => {
    setSavingNotes((prev) => ({ ...prev, [exerciseId]: true }))
    try {
      await fetch(`/api/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalNotes: notesMap[exerciseId] ?? '' }),
      })
    } finally {
      setSavingNotes((prev) => ({ ...prev, [exerciseId]: false }))
    }
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-gray-500">
          Sin ejercicios asignados aún.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {exercises.map((ex) => {
        const currentStatus = statusMap[ex.id]
        const ytId = ex.videoUrl ? getYouTubeId(ex.videoUrl) : null
        const practiceCount = logCounts[ex.id] ?? 0

        return (
          <Card key={ex.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-base">{ex.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {practiceCount > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                      +{practiceCount} práctica{practiceCount > 1 ? 's' : ''} hoy
                    </span>
                  )}
                  <Badge variant={exerciseStatusVariant(currentStatus)}>
                    {exerciseStatusLabel(currentStatus)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Objetivo</dt>
                  <dd className="text-sm text-gray-700 mt-0.5">{ex.objective}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Instrucciones</dt>
                  <dd className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{ex.instructions}</dd>
                </div>
                {ex.frequency && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Frecuencia</dt>
                    <dd className="text-sm text-gray-700 mt-0.5">{ex.frequency}</dd>
                  </div>
                )}
              </dl>

              {/* Video */}
              {ex.videoUrl && (
                <div>
                  {ytId ? (
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={ex.name}
                        className="h-full w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 underline">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver video
                    </a>
                  )}
                </div>
              )}

              {/* Registrar práctica */}
              {currentStatus !== 'COMPLETED' && (
                <div className="bg-primary-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-primary-800">¿Practicaste hoy?</p>
                  <textarea
                    rows={2}
                    value={logNote[ex.id] ?? ''}
                    onChange={(e) => setLogNote((prev) => ({ ...prev, [ex.id]: e.target.value }))}
                    placeholder="Comentario opcional (cómo salió, qué pasó…)"
                    className="w-full rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    type="button"
                    disabled={loggingId === ex.id}
                    onClick={() => handleRegisterPractice(ex.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
                  >
                    {loggingId === ex.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : successMap[ex.id] ? (
                      '✓ Registrado'
                    ) : (
                      'Registrar práctica'
                    )}
                  </button>
                </div>
              )}

              {/* Notas generales */}
              <div className="space-y-2">
                <label htmlFor={`notes-${ex.id}`}
                  className="block text-xs text-gray-400 uppercase tracking-wide">
                  Mis notas generales
                </label>
                <textarea
                  id={`notes-${ex.id}`}
                  rows={2}
                  value={notesMap[ex.id] ?? ''}
                  onChange={(e) => setNotesMap((prev) => ({ ...prev, [ex.id]: e.target.value }))}
                  placeholder="Notas que querés compartir con Paula…"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <div className="flex justify-end">
                  <button type="button" disabled={savingNotes[ex.id]}
                    onClick={() => handleSaveNotes(ex.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors">
                    {savingNotes[ex.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Guardar nota
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function SesionesTab({ sessions }: { sessions: Session[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesiones ({sessions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Sin sesiones registradas.</p>
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
                  <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(s.date)}</p>
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
  )
}

function TurnosTab({ appointments }: { appointments: Appointment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos turnos ({appointments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Sin turnos próximos.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {appointments.map((apt) => (
              <li key={apt.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">{apt.serviceType}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(apt.date)}</p>
                </div>
                <Badge variant={appointmentStatusVariant(apt.status)}>
                  {appointmentStatusLabel(apt.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main PortalDogTabs component ────────────────────────────────────────────

export function PortalDogTabs({ dog, initialTab }: { dog: Dog; initialTab: string }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="expediente">Expediente</TabsTrigger>
        <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
        <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
        <TabsTrigger value="turnos">Turnos</TabsTrigger>
      </TabsList>

      <TabsContent value="expediente">
        <ExpedienteTab profile={dog.profile} reports={dog.reports} />
      </TabsContent>

      <TabsContent value="ejercicios">
        <EjerciciosTab exercises={dog.exercises} dogId={dog.id} />
      </TabsContent>

      <TabsContent value="sesiones">
        <SesionesTab sessions={dog.sessions} />
      </TabsContent>

      <TabsContent value="turnos">
        <TurnosTab appointments={dog.appointments} />
      </TabsContent>
    </Tabs>
  )
}
