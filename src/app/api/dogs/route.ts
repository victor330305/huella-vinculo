import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const createDogSchema = z.object({
  ownerId: z.string().min(1),
  name: z.string().min(1),
  breed: z.string().min(1),
  sex: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().datetime().optional(),
  approximateAge: z.string().optional(),
  color: z.string().optional(),
  weight: z.number().positive().optional(),
  microchip: z.string().optional(),
  profilePhotoUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const ownerId = searchParams.get('ownerId');
  const activeParam = searchParams.get('active');

  const where: Prisma.DogWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { breed: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (ownerId) {
    where.ownerId = ownerId;
  }

  if (activeParam !== null) {
    where.isActive = activeParam === 'true';
  }

  const dogs = await prisma.dog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json(dogs);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createDogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { ownerId, name, breed, sex, birthDate, approximateAge, color, weight, microchip, profilePhotoUrl, notes } = parsed.data;

    const dog = await prisma.dog.create({
      data: {
        ownerId,
        name,
        breed,
        sex,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        approximateAge,
        color,
        weight,
        microchip,
        profilePhotoUrl,
        notes,
      },
    });

    await prisma.dogProfile.create({ data: { dogId: dog.id } });

    return NextResponse.json(dog, { status: 201 });
  } catch (error) {
    console.error('POST /api/dogs error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
