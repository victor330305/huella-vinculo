import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const createAppointmentSchema = z.object({
  ownerId: z.string().min(1),
  dogId: z.string().min(1),
  date: z.string().datetime(),
  serviceType: z.string().min(1),
  durationMinutes: z.number().int().positive().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get('ownerId');
  const dogId = searchParams.get('dogId');
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: Parameters<typeof prisma.appointment.findMany>[0]['where'] = {};

  if (ownerId) where.ownerId = ownerId;
  if (dogId) where.dogId = dogId;
  if (status) where.status = status as Parameters<typeof where.status>;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: 'asc' },
    include: {
      owner: { select: { firstName: true, lastName: true } },
      dog: { select: { name: true, breed: true } },
    },
  });

  return NextResponse.json(appointments);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { ownerId, dogId, date, serviceType, durationMinutes, location, notes } = parsed.data;

    const appointment = await prisma.appointment.create({
      data: {
        ownerId,
        dogId,
        date: new Date(date),
        serviceType,
        ...(durationMinutes !== undefined ? { durationMinutes } : {}),
        location,
        notes,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('POST /api/appointments error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
