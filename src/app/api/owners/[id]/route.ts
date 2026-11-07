import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const updateOwnerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
  userId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const owner = await prisma.owner.findUnique({
    where: { id: params.id },
    include: {
      dogs: {
        where: { isActive: true },
      },
      appointments: {
        orderBy: { date: 'desc' },
        take: 10,
      },
    },
  });

  if (!owner) {
    return NextResponse.json({ error: 'Propietario no encontrado' }, { status: 404 });
  }

  return NextResponse.json(owner);
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
    const parsed = updateOwnerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.owner.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Propietario no encontrado' }, { status: 404 });
    }

    const owner = await prisma.owner.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(owner);
  } catch (error) {
    console.error('PUT /api/owners/[id] error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
