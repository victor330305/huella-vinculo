import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { OwnerForm } from '@/components/admin/OwnerForm'
import { ChevronLeft } from 'lucide-react'

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params

  const owner = await prisma.owner.findUnique({
    where: { id },
  })

  if (!owner) notFound()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/clientes" className="hover:text-primary-600 flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Clientes
        </Link>
        <span>/</span>
        <Link
          href={`/admin/clientes/${owner.id}`}
          className="hover:text-primary-600"
        >
          {owner.firstName} {owner.lastName}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Editar</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar cliente</h1>
        <p className="text-sm text-gray-500 mt-1">
          {owner.firstName} {owner.lastName}
        </p>
      </div>

      <OwnerForm
        mode="edit"
        defaultValues={{
          id: owner.id,
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
          phone: owner.phone,
          address: owner.address ?? undefined,
          notes: owner.notes ?? undefined,
        }}
      />
    </div>
  )
}
