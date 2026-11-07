import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials } from '@/lib/utils'
import { Users, Plus, Search, ChevronLeft, ChevronRight, PawPrint } from 'lucide-react'

type OwnerRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isActive: boolean
  _count: { dogs: number }
}

const PAGE_SIZE = 20

interface SearchParams {
  search?: string
  page?: string
  active?: string
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const search = searchParams.search ?? ''
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const activeParam = searchParams.active

  const where: Prisma.OwnerWhereInput = {}

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (activeParam === 'true') {
    where.isActive = true
  } else if (activeParam === 'false') {
    where.isActive = false
  }

  const [owners, total] = await Promise.all([
    prisma.owner.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { lastName: 'asc' },
      include: {
        _count: { select: { dogs: true } },
      },
    }),
    prisma.owner.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const buildHref = (params: Record<string, string | undefined>) => {
    const entries = Object.entries({ search, page: String(page), active: activeParam, ...params })
      .filter(([, v]) => v !== undefined && v !== '')
    const qs = new URLSearchParams(entries as [string, string][]).toString()
    return `/admin/clientes${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-primary-50 p-2">
            <Users className="h-6 w-6 text-primary-600" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-sm text-gray-500">{total} propietario{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/clientes/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form method="GET" action="/admin/clientes">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="search"
                defaultValue={search}
                placeholder="Buscar por nombre, apellido o email…"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {activeParam && <input type="hidden" name="active" value={activeParam} />}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table / Empty state */}
      {owners.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
            <span className="rounded-full bg-primary-50 p-5">
              <Users className="h-10 w-10 text-primary-300" />
            </span>
            <div>
              <p className="font-semibold text-gray-700">
                {search ? 'Sin resultados' : 'Aún no hay clientes'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {search
                  ? `No se encontraron propietarios para "${search}".`
                  : 'Empezá agregando tu primer cliente.'}
              </p>
            </div>
            {!search && (
              <Button asChild>
                <Link href="/admin/clientes/nuevo">
                  <Plus className="h-4 w-4" />
                  Nuevo cliente
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Resultados: {total}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Perros</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(owners as OwnerRow[]).map((owner) => {
                    const fullName = `${owner.firstName} ${owner.lastName}`
                    return (
                      <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                              {getInitials(fullName)}
                            </div>
                            <span className="font-medium text-gray-900">{fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{owner.email}</td>
                        <td className="px-6 py-4 text-gray-600">{owner.phone}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <PawPrint className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-700 font-medium">{owner._count.dogs}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={owner.isActive ? 'success' : 'secondary'}>
                            {owner.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/clientes/${owner.id}`}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={!hasPrev}
                  >
                    <Link href={buildHref({ page: String(page - 1) })}>
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={!hasNext}
                  >
                    <Link href={buildHref({ page: String(page + 1) })}>
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
