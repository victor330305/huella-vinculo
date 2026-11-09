'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  date: z.string().min(1, 'Requerido'),
  location: z.string().optional(),
  situation: z.string().min(1, 'Requerido'),
  stimulus: z.string().optional(),
  distance: z.string().optional(),
  behavior: z.string().min(1, 'Requerido'),
  ownerResponse: z.string().optional(),
  recoveryTime: z.string().optional(),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes())
  );
}

export function NewBehaviorLogForm({
  dogId,
  onSuccess,
}: {
  dogId: string;
  onSuccess: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: toDatetimeLocalValue(new Date()),
    },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/behavior-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          dogId,
          date: new Date(data.date).toISOString(),
          mediaUrls: [],
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setServerError(json.error ?? 'Ocurrió un error al guardar. Intentá de nuevo.');
        return;
      }

      reset({ date: toDatetimeLocalValue(new Date()) });
      onSuccess();
    } catch {
      setServerError('Error de conexión. Intentá de nuevo.');
    }
  };

  const fieldClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-primary-700 mb-1';
  const errorClass = 'mt-1 text-xs text-red-500';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Fecha */}
      <div>
        <label htmlFor="log-date" className={labelClass}>
          Fecha <span className="text-red-500">*</span>
        </label>
        <input
          id="log-date"
          type="datetime-local"
          {...register('date')}
          className={fieldClass}
        />
        {errors.date && <p className={errorClass}>{errors.date.message}</p>}
      </div>

      {/* Lugar */}
      <div>
        <label htmlFor="log-location" className={labelClass}>
          Lugar
        </label>
        <input
          id="log-location"
          type="text"
          placeholder="Ej: parque, calle, veterinaria…"
          {...register('location')}
          className={fieldClass}
        />
      </div>

      {/* Situación */}
      <div>
        <label htmlFor="log-situation" className={labelClass}>
          Situación <span className="text-red-500">*</span>
        </label>
        <textarea
          id="log-situation"
          rows={3}
          placeholder="Describí qué estaba pasando…"
          {...register('situation')}
          className={`${fieldClass} resize-none`}
        />
        {errors.situation && <p className={errorClass}>{errors.situation.message}</p>}
      </div>

      {/* Estímulo */}
      <div>
        <label htmlFor="log-stimulus" className={labelClass}>
          Estímulo
        </label>
        <input
          id="log-stimulus"
          type="text"
          placeholder="Ej: otro perro, persona, sonido…"
          {...register('stimulus')}
          className={fieldClass}
        />
      </div>

      {/* Distancia */}
      <div>
        <label htmlFor="log-distance" className={labelClass}>
          Distancia
        </label>
        <input
          id="log-distance"
          type="text"
          placeholder="Ej: 5 metros"
          {...register('distance')}
          className={fieldClass}
        />
      </div>

      {/* Comportamiento */}
      <div>
        <label htmlFor="log-behavior" className={labelClass}>
          Comportamiento <span className="text-red-500">*</span>
        </label>
        <textarea
          id="log-behavior"
          rows={3}
          placeholder="¿Qué hizo el perro?"
          {...register('behavior')}
          className={`${fieldClass} resize-none`}
        />
        {errors.behavior && <p className={errorClass}>{errors.behavior.message}</p>}
      </div>

      {/* Respuesta del propietario */}
      <div>
        <label htmlFor="log-owner-response" className={labelClass}>
          Respuesta del propietario
        </label>
        <input
          id="log-owner-response"
          type="text"
          placeholder="¿Cómo reaccionaste?"
          {...register('ownerResponse')}
          className={fieldClass}
        />
      </div>

      {/* Tiempo de recuperación */}
      <div>
        <label htmlFor="log-recovery-time" className={labelClass}>
          Tiempo de recuperación
        </label>
        <input
          id="log-recovery-time"
          type="text"
          placeholder="Ej: 5 minutos, inmediato…"
          {...register('recoveryTime')}
          className={fieldClass}
        />
      </div>

      {/* Comentarios */}
      <div>
        <label htmlFor="log-comments" className={labelClass}>
          Comentarios
        </label>
        <textarea
          id="log-comments"
          rows={3}
          placeholder="Cualquier detalle adicional…"
          {...register('comments')}
          className={`${fieldClass} resize-none`}
        />
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar entrada
        </button>
      </div>
    </form>
  );
}
