import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, SessionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const createSessionSchema = z.object({
  dogId: z.string().min(1),
  date: z.string().datetime(),
  type: z.enum(['EVALUATION', 'TRAINING', 'FOLLOW_UP']).optional(),
  durationMinutes: z.number().int().positive().optional(),
  observations: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dogId = searchParams.get('dogId');
  const professionalId = searchParams.get('professionalId');
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: Prisma.SessionWhereInput = {};

  if (dogId) where.dogId = dogId;
  if (professionalId) where.professionalId = professionalId;
  if (status) where.status = status as SessionStatus;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const sessions = await prisma.session.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      dog: { select: { name: true, breed: true } },
      professional: { select: { name: true } },
    },
  });

  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { dogId, date, type, durationMinutes, observations, notes } = parsed.data;

    const newSession = await prisma.session.create({
      data: {
        dogId,
        professionalId: session.id,
        date: new Date(date),
        ...(type !== undefined ? { type } : {}),
        ...(durationMinutes !== undefined ? { durationMinutes } : {}),
        observations,
        notes,
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('POST /api/sessions error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
