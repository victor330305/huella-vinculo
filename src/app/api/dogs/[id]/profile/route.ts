import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const updateProfileSchema = z.object({
  initialEvaluation: z.string().optional(),
  background: z.string().optional(),
  identifiedNeeds: z.string().optional(),
  agreedObjectives: z.string().optional(),
  workPlan: z.string().optional(),
  homeRecommendations: z.string().optional(),
});

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
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const dog = await prisma.dog.findUnique({ where: { id } });
    if (!dog) {
      return NextResponse.json({ error: 'Perro no encontrado' }, { status: 404 });
    }

    const profile = await prisma.dogProfile.upsert({
      where: { dogId: id },
      update: parsed.data,
      create: { dogId: id, ...parsed.data },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('PUT /api/dogs/[id]/profile error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
