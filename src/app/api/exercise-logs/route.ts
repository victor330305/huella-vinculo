import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  exerciseId: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { exerciseId, note } = parsed.data;

  // Verificar que el ejercicio existe
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { dog: { include: { owner: true } } },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Ejercicio no encontrado" }, { status: 404 });
  }

  // OWNER solo puede registrar prácticas de sus propios perros
  if (session.role === "OWNER") {
    const owner = await prisma.owner.findUnique({ where: { userId: session.id } });
    if (!owner || exercise.dog.ownerId !== owner.id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
  }

  const log = await prisma.exerciseLog.create({
    data: {
      exerciseId,
      note: note || null,
      practicedAt: new Date(),
    },
  });

  // Si el ejercicio estaba ASSIGNED, cambiarlo a IN_PROGRESS automáticamente
  if (exercise.status === "ASSIGNED") {
    await prisma.exercise.update({
      where: { id: exerciseId },
      data: { status: "IN_PROGRESS" },
    });
  }

  return NextResponse.json(log, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get("exerciseId");

  if (!exerciseId) {
    return NextResponse.json({ error: "exerciseId requerido" }, { status: 400 });
  }

  // Verificar ownership para OWNER
  if (session.role === "OWNER") {
    const owner = await prisma.owner.findUnique({ where: { userId: session.id } });
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { dog: { select: { ownerId: true } } },
    });
    if (!owner || !exercise || exercise.dog.ownerId !== owner.id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
  }

  const logs = await prisma.exerciseLog.findMany({
    where: { exerciseId },
    orderBy: { practicedAt: "desc" },
  });

  return NextResponse.json(logs);
}
