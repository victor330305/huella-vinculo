import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials, formatDate, formatDateTime } from '@/lib/utils'
import { CreateAccessButton } from '@/components/admin/CreateAccessButton'
import {
  ChevronLeft,
  Pencil,
  PawPrint,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Plus,
  User,
  ShieldCheck,
} from 'lucide-react'

type DogRow = {
  id: string
  name: string
  breed: string
}

type AppointmentRow = {
  id: string
  serviceType: string
  status: string
  date: Date
  dog: { name: string }
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params

  const owner = await prisma.owner.findUnique({
    where: { id },
    include: {
      dogs: { where: { isActive: true } },
      appointments: {
        orderBy: { date: 'desc' },
        take: 5,
        include: { dog: true },
      },
      user: true,
    },
  })

  if (!owner) notFound()

  const fullName = `${owner.firstName} ${owner.lastName}`

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/clientes" className="hover:text-primary-600 flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Clientes
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{fullName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-lg font-bold">
            {getInitials(fullName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <Badge variant={owner.isActive ? 'success' : 'secondary'}>
                {owner.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Cliente desde {formatDate(owner.createdAt)}
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/clientes/${owner.id}/editar`}>
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Contact info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600" />
            Datos de contacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide">Email</dt>
                <dd className="text-sm font-medium text-gray-800">{owner.email}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide">Teléfono</dt>
                <dd className="text-sm font-medium text-gray-800">{owner.phone}</dd>
              </div>
            </div>
            {owner.address && (
              <div className="flex items-center gap-3 sm:col-span-2">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Dirección</dt>
                  <dd className="text-sm font-medium text-gray-800">{owner.address}</dd>
                </div>
              </div>
            )}
            {owner.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notas internas</dt>
                <dd className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{owner.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Portal access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
            Acceso al portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {owner.userId ? (
            <div className="flex items-center gap-3">
              <Badge variant="success">Con acceso</Badge>
              {owner.user?.email && (
                <span className="text-sm text-gray-600">{owner.user.email}</span>
              )}
            </div>
          ) : (
            <CreateAccessButton ownerId={owner.id} />
          )}
        </CardContent>
      </Card>

      {/* Dogs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-primary-600" />
              Perros ({owner.dogs.length})
            </CardTitle>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/admin/perros/nuevo?ownerId=${owner.id}`}>
                <Plus className="h-4 w-4" />
                Agregar perro
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {owner.dogs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="rounded-full bg-primary-50 p-4">
                <PawPrint className="h-8 w-8 text-primary-300" />
              </span>
              <p className="text-sm text-gray-500">
                Este cliente aún no tiene perros registrados.
              </p>
              <Button asChild size="sm">
                <Link href={`/admin/perros/nuevo?ownerId=${owner.id}`}>
                  <Plus className="h-4 w-4" />
                  Agregar perro
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(owner.dogs as DogRow[]).map((dog) => (
                <div
                  key={dog.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-accent-700 text-xs font-bold">
                      {getInitials(dog.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{dog.name}</p>
                      <p className="text-xs text-gray-500">{dog.breed}</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/perros/${dog.id}`}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0"
                  >
                    Ver perfil
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary-600" />
            Últimos turnos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {owner.appointments.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              Sin turnos registrados aún.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {(owner.appointments as AppointmentRow[]).map((appt) => (
                <li key={appt.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{appt.serviceType}</p>
                    <p className="text-xs text-gray-500">
                      {appt.dog.name} · {formatDateTime(appt.date)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      appt.status === 'COMPLETED'
                        ? 'success'
                        : appt.status === 'CANCELLED'
                        ? 'destructive'
                        : appt.status === 'CONFIRMED'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {appt.status === 'SCHEDULED'
                      ? 'Programado'
                      : appt.status === 'CONFIRMED'
                      ? 'Confirmado'
                      : appt.status === 'COMPLETED'
                      ? 'Completado'
                      : appt.status === 'CANCELLED'
                      ? 'Cancelado'
                      : 'No asistió'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
