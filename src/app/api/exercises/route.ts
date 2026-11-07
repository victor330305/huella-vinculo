import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const createExerciseSchema = z.object({
  dogId: z.string().min(1),
  name: z.string().min(1),
  objective: z.string().min(1),
  instructions: z.string().min(1),
  videoUrl: z.string().url().optional(),
  frequency: z.string().optional(),
  observations: z.string().optional(),
  reviewDate: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dogId = searchParams.get('dogId');
  const status = searchParams.get('status');

  const where: Parameters<typeof prisma.exercise.findMany>[0]['where'] = {};

  if (dogId) where.dogId = dogId;
  if (status) where.status = status as Parameters<typeof where.status>;

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { assignedAt: 'desc' },
    include: {
      dog: { select: { name: true } },
    },
  });

  return NextResponse.json(exercises);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createExerciseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { dogId, name, objective, instructions, videoUrl, frequency, observations, reviewDate } =
      parsed.data;

    const exercise = await prisma.exercise.create({
      data: {
        dogId,
        name,
        objective,
        instructions,
        videoUrl,
        frequency,
        observations,
        reviewDate: reviewDate ? new Date(reviewDate) : undefined,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('POST /api/exercises error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
