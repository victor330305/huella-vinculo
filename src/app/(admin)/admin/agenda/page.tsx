import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarDays, Plus } from 'lucide-react'
import { AgendaView } from '@/components/admin/AgendaView'
import type { AppointmentWithRelations, OwnerWithDogs } from '@/components/admin/AgendaView'

export default async function AgendaPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const now = new Date()
  const in30Days = new Date(now)
  in30Days.setDate(in30Days.getDate() + 30)

  const [rawAppointments, rawOwners] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: { gte: now },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      include: {
        owner: { select: { firstName: true, lastName: true, phone: true } },
        dog: { select: { name: true, breed: true } },
      },
      orderBy: { date: 'asc' },
      take: 50,
    }),
    prisma.owner.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dogs: {
          where: { isActive: true },
          select: { id: true, name: true },
        },
      },
      orderBy: [{ firstName: 'asc' }],
    }),
  ])

  // Serialize dates to ISO strings so they can be passed to Client Components
  const appointments: AppointmentWithRelations[] = rawAppointments.map(
    (a: typeof rawAppointments[number]) => ({
      ...a,
      date: a.date.toISOString(),
    })
  )

  const owners: OwnerWithDogs[] = rawOwners

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-primary-50 p-2">
            <CalendarDays className="h-6 w-6 text-primary-600" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            <p className="text-sm text-gray-500">
              Próximos {appointments.length} turno{appointments.length !== 1 ? 's' : ''} (30 días)
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="#nuevo-turno">
            <Plus className="h-4 w-4" />
            Nuevo turno
          </Link>
        </Button>
      </div>

      {/* Client view: list + form */}
      <AgendaView appointments={appointments} owners={owners} />
    </div>
  )
}
