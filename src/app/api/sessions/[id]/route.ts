import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const updateSessionSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  observations: z.string().optional(),
  notes: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const found = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      dog: { include: { owner: true } },
      professional: { select: { name: true } },
    },
  });

  if (!found) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
  }

  return NextResponse.json(found);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.session.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }

    const updated = await prisma.session.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/sessions/[id] error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
