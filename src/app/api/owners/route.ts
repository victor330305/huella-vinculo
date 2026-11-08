import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const createOwnerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10));
  const activeParam = searchParams.get('active');

  const where: Prisma.OwnerWhereInput = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (activeParam !== null) {
    where.isActive = activeParam === 'true';
  }

  const [owners, total] = await Promise.all([
    prisma.owner.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { dogs: true } },
      },
    }),
    prisma.owner.count({ where }),
  ]);

  return NextResponse.json({ owners, total, page, pageSize });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createOwnerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, address, notes } = parsed.data;

    const existing = await prisma.owner.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un propietario con ese email' },
        { status: 409 }
      );
    }

    const owner = await prisma.owner.create({
      data: { firstName, lastName, email, phone, address, notes },
    });

    return NextResponse.json(owner, { status: 201 });
  } catch (error) {
    console.error('POST /api/owners error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
