import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const updateDogSchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  sex: z.enum(['MALE', 'FEMALE']).optional(),
  birthDate: z.string().datetime().optional().nullable(),
  approximateAge: z.string().optional(),
  color: z.string().optional(),
  weight: z.number().positive().optional().nullable(),
  microchip: z.string().optional(),
  profilePhotoUrl: z.string().url().optional().nullable(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
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

  const dog = await prisma.dog.findUnique({
    where: { id },
    include: {
      owner: true,
      profile: true,
      sessions: {
        orderBy: { date: 'desc' },
        take: 10,
      },
      exercises: {
        orderBy: { assignedAt: 'desc' },
      },
      appointments: {
        orderBy: { date: 'desc' },
        take: 5,
      },
    },
  });

  if (!dog) {
    return NextResponse.json({ error: 'Perro no encontrado' }, { status: 404 });
  }

  return NextResponse.json(dog);
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
    const parsed = updateDogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.dog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Perro no encontrado' }, { status: 404 });
    }

    const { birthDate, ...rest } = parsed.data;

    const dog = await prisma.dog.update({
      where: { id },
      data: {
        ...rest,
        ...(birthDate !== undefined
          ? { birthDate: birthDate ? new Date(birthDate) : null }
          : {}),
      },
    });

    return NextResponse.json(dog);
  } catch (error) {
    console.error('PUT /api/dogs/[id] error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
