import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ExerciseStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const updateExerciseSchema = z.object({
  status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED']).optional(),
  instructions: z.string().optional(),
  observations: z.string().optional(),
  professionalNotes: z.string().optional(),
  reviewDate: z.string().datetime().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { dog: true },
  });

  if (!exercise) {
    return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 });
  }

  return NextResponse.json(exercise);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateExerciseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 });
    }

    const { reviewDate, status: statusValue, ...rest } = parsed.data;

    const updated = await prisma.exercise.update({
      where: { id },
      data: {
        ...rest,
        ...(statusValue !== undefined ? { status: statusValue as ExerciseStatus } : {}),
        ...(reviewDate !== undefined
          ? { reviewDate: reviewDate ? new Date(reviewDate) : null }
          : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/exercises/[id] error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
