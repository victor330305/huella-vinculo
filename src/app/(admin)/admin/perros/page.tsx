import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials, calculateAge } from '@/lib/utils'
import { PawPrint, Plus, Search } from 'lucide-react'

interface SearchParams {
  search?: string
}

export default async function PerrosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const search = searchParams.search ?? ''

  const where: Prisma.DogWhereInput = {
    isActive: true,
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { breed: { contains: search, mode: 'insensitive' } },
      {
        owner: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ]
  }

  const dogs = await prisma.dog.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-primary-50 p-2">
            <PawPrint className="h-6 w-6 text-primary-600" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Perros</h1>
            <p className="text-sm text-gray-500">
              {dogs.length} perro{dogs.length !== 1 ? 's' : ''} registrado{dogs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/perros/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo perro
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form method="GET" action="/admin/perros">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="search"
                defaultValue={search}
                placeholder="Buscar por nombre, raza o propietario…"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table / Empty state */}
      {dogs.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
            <span className="rounded-full bg-primary-50 p-5">
              <PawPrint className="h-10 w-10 text-primary-300" />
            </span>
            <div>
              <p className="font-semibold text-gray-700">
                {search ? 'Sin resultados' : 'Aún no hay perros registrados'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {search
                  ? `No se encontraron perros para "${search}".`
                  : 'Empezá registrando el primer perro.'}
              </p>
            </div>
            {!search && (
              <Button asChild>
                <Link href="/admin/perros/nuevo">
                  <Plus className="h-4 w-4" />
                  Nuevo perro
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Resultados: {dogs.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Perro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Raza
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Propietario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Sexo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dogs.map((dog: typeof dogs[number]) => {
                    const ownerName = `${dog.owner.firstName} ${dog.owner.lastName}`
                    return (
                      <tr key={dog.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700 text-xs font-bold">
                              {getInitials(dog.name)}
                            </div>
                            <span className="font-medium text-gray-900">{dog.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{dog.breed}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/clientes/${dog.owner.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {ownerName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {calculateAge(dog.birthDate, dog.approximateAge)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">
                            {dog.sex === 'MALE' ? 'Macho' : 'Hembra'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/perros/${dog.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            Ver perfil
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
