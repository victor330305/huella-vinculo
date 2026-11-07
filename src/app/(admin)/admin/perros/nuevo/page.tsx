import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DogForm } from '@/components/admin/DogForm'

interface SearchParams {
  ownerId?: string
}

export default async function NuevoPerroPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const owners = await prisma.owner.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: 'asc' },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo perro</h1>
        <p className="text-sm text-gray-500 mt-1">Registrá un nuevo perro en el sistema.</p>
      </div>
      <DogForm mode="create" owners={owners} defaultOwnerId={searchParams.ownerId} />
    </div>
  )
}
