'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'

const ownerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  address: z.string().optional(),
  notes: z.string().optional(),
})

type OwnerFormValues = z.infer<typeof ownerSchema>

interface OwnerFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<OwnerFormValues> & { id?: string }
}

export function OwnerForm({ mode, defaultValues }: OwnerFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      address: defaultValues?.address ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  const onSubmit = async (data: OwnerFormValues) => {
    setServerError(null)
    try {
      const url =
        mode === 'create' ? '/api/owners' : `/api/owners/${defaultValues?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Error al guardar. Intentá de nuevo.')
        return
      }

      const created = await res.json()
      const targetId = mode === 'create' ? created.id : defaultValues?.id
      router.push(`/admin/clientes/${targetId}`)
    } catch {
      setServerError('Error de red. Revisá tu conexión.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  placeholder="Paula"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="García"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="paula@ejemplo.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  placeholder="+54 11 1234-5678"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Av. Corrientes 1234, CABA"
                  {...register('address')}
                  error={errors.address?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas internas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones internas sobre el cliente…"
                rows={4}
                {...register('notes')}
                error={errors.notes?.message}
              />
            </div>
          </CardContent>
        </Card>

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {serverError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Crear cliente' : 'Guardar cambios'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
