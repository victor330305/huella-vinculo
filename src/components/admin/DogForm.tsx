'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'

const dogSchema = z.object({
  ownerId: z.string().min(1, 'El propietario es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  breed: z.string().min(1, 'La raza es requerida'),
  sex: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().optional(),
  approximateAge: z.string().optional(),
  color: z.string().optional(),
  weight: z.string().optional(),
  microchip: z.string().optional(),
  notes: z.string().optional(),
})

type DogFormValues = z.infer<typeof dogSchema>

interface OwnerOption {
  id: string
  firstName: string
  lastName: string
}

interface DogFormProps {
  mode: 'create' | 'edit'
  owners: OwnerOption[]
  defaultValues?: Partial<DogFormValues> & { id?: string }
  defaultOwnerId?: string
}

export function DogForm({ mode, owners, defaultValues, defaultOwnerId }: DogFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DogFormValues>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      ownerId: defaultValues?.ownerId ?? defaultOwnerId ?? '',
      name: defaultValues?.name ?? '',
      breed: defaultValues?.breed ?? '',
      sex: defaultValues?.sex,
      birthDate: defaultValues?.birthDate ?? '',
      approximateAge: defaultValues?.approximateAge ?? '',
      color: defaultValues?.color ?? '',
      weight: defaultValues?.weight,
      microchip: defaultValues?.microchip ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  const onSubmit = async (data: DogFormValues) => {
    setServerError(null)
    try {
      const url = mode === 'create' ? '/api/dogs' : `/api/dogs/${defaultValues?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      // Convert birthDate to ISO datetime if provided, weight to number
      const payload = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
        weight: data.weight && data.weight !== '' ? parseFloat(data.weight) : undefined,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Error al guardar. Intentá de nuevo.')
        return
      }

      const created = await res.json()
      const targetId = mode === 'create' ? created.id : defaultValues?.id
      router.push(`/admin/perros/${targetId}`)
    } catch {
      setServerError('Error de red. Revisá tu conexión.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Propietario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="ownerId">Propietario *</Label>
              <Controller
                name="ownerId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="ownerId"
                      error={errors.ownerId?.message}
                    >
                      <SelectValue placeholder="Seleccioná un propietario…" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.lastName}, {owner.firstName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos del perro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Rex"
                  {...register('name')}
                  error={errors.name?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="breed">Raza *</Label>
                <Input
                  id="breed"
                  placeholder="Labrador Retriever"
                  {...register('breed')}
                  error={errors.breed?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sex">Sexo *</Label>
                <Controller
                  name="sex"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="sex" error={errors.sex?.message}>
                        <SelectValue placeholder="Seleccioná…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Macho</SelectItem>
                        <SelectItem value="FEMALE">Hembra</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  error={errors.birthDate?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="approximateAge">Edad aproximada</Label>
                <Input
                  id="approximateAge"
                  placeholder="2 años"
                  {...register('approximateAge')}
                  error={errors.approximateAge?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="Negro y blanco"
                  {...register('color')}
                  error={errors.color?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="12.5"
                  {...register('weight')}
                  error={errors.weight?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="microchip">Microchip</Label>
                <Input
                  id="microchip"
                  placeholder="900123456789012"
                  {...register('microchip')}
                  error={errors.microchip?.message}
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
                placeholder="Observaciones relevantes sobre el perro…"
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
                {mode === 'create' ? 'Crear perro' : 'Guardar cambios'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
