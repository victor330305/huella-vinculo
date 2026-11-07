import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SessionStatus } from '@prisma/client';
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  const found = await prisma.session.findUnique({
    where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.session.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }

    const { status: statusValue, ...rest } = parsed.data;

    const updated = await prisma.session.update({
      where: { id },
      data: {
        ...rest,
        ...(statusValue !== undefined ? { status: statusValue as SessionStatus } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/sessions/[id] error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
