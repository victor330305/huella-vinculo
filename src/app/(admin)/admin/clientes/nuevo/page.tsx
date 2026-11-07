import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OwnerForm } from '@/components/admin/OwnerForm'
import { ChevronLeft } from 'lucide-react'

export default async function NuevoClientePage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/clientes" className="hover:text-primary-600 flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Clientes
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Nuevo cliente</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo cliente</h1>
        <p className="text-sm text-gray-500 mt-1">Completá los datos del propietario</p>
      </div>

      <OwnerForm mode="create" />
    </div>
  )
}
