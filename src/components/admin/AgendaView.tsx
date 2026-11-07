'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarDays, Clock, Loader2, Save, Plus, PawPrint, User } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppointmentWithRelations {
  id: string
  date: string | Date
  serviceType: string
  durationMinutes: number
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  location?: string | null
  notes?: string | null
  owner: {
    firstName: string
    lastName: string
    phone: string
  }
  dog: {
    name: string
    breed: string
  }
}

export interface OwnerWithDogs {
  id: string
  firstName: string
  lastName: string
  dogs: {
    id: string
    name: string
  }[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<AppointmentWithRelations['status'], string> = {
  SCHEDULED: 'Programado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Ausente',
}

const STATUS_BADGE_VARIANT: Record<
  AppointmentWithRelations['status'],
  'default' | 'success' | 'secondary' | 'destructive' | 'warning' | 'outline' | 'accent'
> = {
  SCHEDULED: 'default',    // azul (primary)
  CONFIRMED: 'success',    // verde
  COMPLETED: 'secondary',  // gris
  CANCELLED: 'destructive',
  NO_SHOW: 'warning',
}

const SERVICE_TYPES = [
  'Evaluación inicial',
  'Sesión de entrenamiento',
  'Seguimiento',
  'Consulta',
] as const

const DURATIONS = [
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '60 minutos' },
  { value: '90', label: '90 minutos' },
]

const NEXT_STATUSES: Record<
  AppointmentWithRelations['status'],
  AppointmentWithRelations['status'][]
> = {
  SCHEDULED: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: ['SCHEDULED'],
  NO_SHOW: ['SCHEDULED'],
}

// ─── New Appointment Form Schema ─────────────────────────────────────────────

const appointmentSchema = z.object({
  ownerId: z.string().min(1, 'Seleccioná un propietario'),
  dogId: z.string().min(1, 'Seleccioná un perro'),
  date: z.string().min(1, 'La fecha y hora son requeridas'),
  serviceType: z.string().min(2, 'Seleccioná el tipo de servicio'),
  durationMinutes: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

// ─── Status Changer ───────────────────────────────────────────────────────────

function StatusChanger({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string
  currentStatus: AppointmentWithRelations['status']
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const options = NEXT_STATUSES[currentStatus]

  if (options.length === 0) return null

  const handleChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      router.refresh()
    } finally {
      setUpdating(false)
    }
  }

  return (
    <select
      disabled={updating}
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) handleChange(e.target.value)
      }}
      className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 cursor-pointer"
      aria-label="Cambiar estado del turno"
    >
      <option value="" disabled>
        Cambiar estado…
      </option>
      {options.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}

// ─── New Appointment Form ─────────────────────────────────────────────────────

function NewAppointmentForm({ owners }: { owners: OwnerWithDogs[] }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('')

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      ownerId: '',
      dogId: '',
      date: '',
      serviceType: '',
      durationMinutes: '60',
      location: '',
      notes: '',
    },
  })

  const selectedOwner = owners.find((o) => o.id === selectedOwnerId)
  const availableDogs = selectedOwner?.dogs ?? []

  const handleOwnerChange = (ownerId: string) => {
    setSelectedOwnerId(ownerId)
    setValue('dogId', '')
  }

  const onSubmit = async (data: AppointmentFormValues) => {
    setServerError(null)
    try {
      // Convert datetime-local value to ISO string
      const dateISO = new Date(data.date).toISOString()
      const payload = {
        ownerId: data.ownerId,
        dogId: data.dogId,
        date: dateISO,
        serviceType: data.serviceType,
        durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : 60,
        location: data.location || undefined,
        notes: data.notes || undefined,
      }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Error al guardar el turno. Intentá de nuevo.')
        return
      }

      reset()
      setSelectedOwnerId('')
      router.refresh()
    } catch {
      setServerError('Error de red. Revisá tu conexión.')
    }
  }

  return (
    <form
      id="nuevo-turno"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      <h2 className="text-lg font-semibold text-gray-900">Nuevo turno</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Propietario */}
        <div className="space-y-1.5">
          <Label htmlFor="ownerId">Propietario *</Label>
          <Controller
            name="ownerId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val)
                  handleOwnerChange(val)
                }}
              >
                <SelectTrigger id="ownerId" error={errors.ownerId?.message}>
                  <SelectValue placeholder="Seleccioná un propietario…" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.lastName}, {owner.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Perro (cascada) */}
        <div className="space-y-1.5">
          <Label htmlFor="dogId">Perro *</Label>
          <Controller
            name="dogId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={availableDogs.length === 0}
              >
                <SelectTrigger id="dogId" error={errors.dogId?.message}>
                  <SelectValue
                    placeholder={
                      selectedOwnerId
                        ? availableDogs.length === 0
                          ? 'Sin perros activos'
                          : 'Seleccioná un perro…'
                        : 'Primero seleccioná un propietario…'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableDogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Fecha y hora */}
        <div className="space-y-1.5">
          <Label htmlFor="date">Fecha y hora *</Label>
          <Input
            id="date"
            type="datetime-local"
            {...register('date')}
            error={errors.date?.message}
          />
        </div>

        {/* Tipo de servicio */}
        <div className="space-y-1.5">
          <Label htmlFor="serviceType">Tipo de servicio *</Label>
          <Controller
            name="serviceType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="serviceType" error={errors.serviceType?.message}>
                  <SelectValue placeholder="Seleccioná el servicio…" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Duración */}
        <div className="space-y-1.5">
          <Label htmlFor="durationMinutes">Duración</Label>
          <Controller
            name="durationMinutes"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? '60'} onValueChange={field.onChange}>
                <SelectTrigger id="durationMinutes">
                  <SelectValue placeholder="60 minutos" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Ubicación */}
        <div className="space-y-1.5">
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            placeholder="Domicilio del cliente / Virtual"
            {...register('location')}
            error={errors.location?.message}
          />
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Observaciones adicionales sobre el turno…"
          rows={3}
          {...register('notes')}
          error={errors.notes?.message}
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar turno
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// ─── Appointment List ─────────────────────────────────────────────────────────

function groupByDay(appointments: AppointmentWithRelations[]) {
  const groups: Record<string, AppointmentWithRelations[]> = {}
  for (const appt of appointments) {
    const date = new Date(appt.date)
    const key = format(date, 'yyyy-MM-dd')
    if (!groups[key]) groups[key] = []
    groups[key].push(appt)
  }
  return groups
}

// ─── Main AgendaView ─────────────────────────────────────────────────────────

interface AgendaViewProps {
  appointments: AppointmentWithRelations[]
  owners: OwnerWithDogs[]
}

export function AgendaView({ appointments, owners }: AgendaViewProps) {
  const grouped = groupByDay(appointments)
  const days = Object.keys(grouped).sort()

  return (
    <div className="space-y-8">
      {/* Appointments list */}
      <section>
        {days.length === 0 ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
              <span className="rounded-full bg-primary-50 p-5">
                <CalendarDays className="h-10 w-10 text-primary-300" />
              </span>
              <div>
                <p className="font-semibold text-gray-700">Sin turnos próximos</p>
                <p className="text-sm text-gray-400 mt-1">
                  No hay turnos programados en los próximos 30 días.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById('nuevo-turno')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <Plus className="h-4 w-4" />
                Agendar turno
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {days.map((dayKey) => {
              const dayDate = new Date(dayKey + 'T12:00:00')
              const dayLabel = format(dayDate, 'EEEE d MMMM', { locale: es })
              const dayAppts = grouped[dayKey]

              return (
                <div key={dayKey}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">
                    {dayLabel}
                  </h3>
                  <Card>
                    <CardContent className="p-0">
                      <ul className="divide-y divide-gray-50">
                        {dayAppts.map((appt) => {
                          const apptDate = new Date(appt.date)
                          const timeLabel = format(apptDate, 'HH:mm')

                          return (
                            <li
                              key={appt.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4"
                            >
                              {/* Time */}
                              <div className="flex items-center gap-1.5 shrink-0 w-16">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {timeLabel}
                                </span>
                              </div>

                              {/* Owner & Dog */}
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {appt.owner.firstName} {appt.owner.lastName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <PawPrint className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                  <span className="text-sm text-gray-600 truncate">
                                    {appt.dog.name}{appt.dog.breed ? ` · ${appt.dog.breed}` : ''}
                                  </span>
                                </div>
                              </div>

                              {/* Service & Duration */}
                              <div className="text-sm text-gray-600 shrink-0">
                                <div>{appt.serviceType}</div>
                                <div className="text-xs text-gray-400">{appt.durationMinutes} min</div>
                              </div>

                              {/* Status badge */}
                              <Badge variant={STATUS_BADGE_VARIANT[appt.status]}>
                                {STATUS_LABELS[appt.status]}
                              </Badge>

                              {/* Status changer */}
                              <StatusChanger
                                appointmentId={appt.id}
                                currentStatus={appt.status}
                              />
                            </li>
                          )
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* New appointment form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary-600" />
            Nuevo turno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NewAppointmentForm owners={owners} />
        </CardContent>
      </Card>
    </div>
  )
}
