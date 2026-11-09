import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials, calculateAge } from '@/lib/utils'
import { DogTabs } from '@/components/admin/DogTabs'
import { ChevronLeft, Pencil } from 'lucide-react'

export default async function PerroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params

  const dog = await prisma.dog.findUnique({
    where: { id },
    include: {
      owner: true,
      profile: true,
      sessions: {
        orderBy: { date: 'desc' },
        take: 20,
        include: { professional: { select: { name: true } } },
      },
      exercises: { orderBy: { assignedAt: 'desc' } },
      behaviorLogs: { orderBy: { date: 'desc' } },
      reports: { orderBy: { generatedAt: 'desc' } },
    },
  })

  if (!dog) notFound()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/perros" className="hover:text-primary-600 flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Perros
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{dog.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700 text-lg font-bold">
            {getInitials(dog.name)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{dog.name}</h1>
              <Badge variant="outline">{dog.sex === 'MALE' ? 'Macho' : 'Hembra'}</Badge>
              <Badge variant={dog.isActive ? 'success' : 'secondary'}>
                {dog.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {dog.breed} · {calculateAge(dog.birthDate, dog.approximateAge)} ·{' '}
              <Link
                href={`/admin/clientes/${dog.owner.id}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {dog.owner.firstName} {dog.owner.lastName}
              </Link>
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/perros/${dog.id}/editar`}>
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Tabs (client component) */}
      <DogTabs dog={dog} />
    </div>
  )
}
