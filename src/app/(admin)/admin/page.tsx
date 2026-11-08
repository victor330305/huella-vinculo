import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Dog, CalendarDays, Plus, Clock, ArrowRight } from 'lucide-react'

type UpcomingAppointment = {
  id: string
  date: Date
  serviceType: string
  status: string
  owner: { firstName: string; lastName: string }
  dog: { name: string }
}

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [totalOwners, totalDogs, upcomingAppointmentsRaw, monthSessions] =
    await Promise.all([
      prisma.owner.count({ where: { isActive: true } }),
      prisma.dog.count({ where: { isActive: true } }),
      prisma.appointment.findMany({
        where: {
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        include: {
          owner: { select: { firstName: true, lastName: true } },
          dog: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
        take: 10,
      }),
      prisma.session.count({
        where: {
          date: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
            lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1
            ),
          },
        },
      }),
    ])

  const upcomingAppointments = upcomingAppointmentsRaw as UpcomingAppointment[]

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenida,{' '}
          <span className="text-primary-600">{session.name}</span>
        </h1>
        <p className="text-sm text-gray-500 capitalize">{today}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Clientes activos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Clientes activos
            </CardTitle>
            <span className="rounded-lg bg-primary-50 p-2">
              <Users className="h-5 w-5 text-primary-600" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-700">{totalOwners}</p>
            <p className="text-xs text-gray-400 mt-1">propietarios registrados</p>
          </CardContent>
        </Card>

        {/* Perros */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Perros
            </CardTitle>
            <span className="rounded-lg bg-accent-50 p-2">
              <Dog className="h-5 w-5 text-accent-500" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent-600">{totalDogs}</p>
            <p className="text-xs text-gray-400 mt-1">perros en seguimiento</p>
          </CardContent>
        </Card>

        {/* Sesiones del mes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Sesiones del mes
            </CardTitle>
            <span className="rounded-lg bg-primary-50 p-2">
              <CalendarDays className="h-5 w-5 text-primary-700" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-700">{monthSessions}</p>
            <p className="text-xs text-gray-400 mt-1">sesiones este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            Próximos turnos (7 días)
          </h2>
          <Link
            href="/admin/agenda"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
          >
            Ver agenda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
              <CalendarDays className="h-10 w-10 text-gray-300" />
              <p className="text-gray-500 font-medium">No hay turnos próximos</p>
              <p className="text-sm text-gray-400">
                No tenés turnos agendados para los próximos 7 días.
              </p>
              <Link
                href="/admin/agenda"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Crear turno
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {upcomingAppointments.map((appt) => (
                  <li
                    key={appt.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
                        <CalendarDays className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {appt.owner.firstName} {appt.owner.lastName}
                          {' — '}
                          <span className="text-primary-600">{appt.dog.name}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {appt.serviceType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(appt.date)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appt.date.toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick access */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/clientes/nuevo"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Link>
          <Link
            href="/admin/agenda#nuevo-turno"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <CalendarDays className="h-4 w-4" />
            Nuevo turno
          </Link>
        </div>
      </div>
    </div>
  )
}
