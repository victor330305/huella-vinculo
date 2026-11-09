import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const createBehaviorLogSchema = z.object({
  dogId: z.string().min(1),
  date: z.string().datetime(),
  location: z.string().optional(),
  situation: z.string().min(1),
  stimulus: z.string().optional(),
  distance: z.string().optional(),
  behavior: z.string().min(1),
  ownerResponse: z.string().optional(),
  recoveryTime: z.string().optional(),
  comments: z.string().optional(),
  mediaUrls: z.array(z.string().url()).default([]),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dogId = searchParams.get("dogId");
  const ownerId = searchParams.get("ownerId");

  const where: Prisma.BehaviorLogWhereInput = {};

  if (session.role === "OWNER") {
    const owner = await prisma.owner.findUnique({ where: { userId: session.id } });
    if (!owner) {
      return NextResponse.json({ error: "Propietario no encontrado" }, { status: 403 });
    }

    if (dogId) {
      const dog = await prisma.dog.findUnique({ where: { id: dogId } });
      if (!dog) {
        return NextResponse.json({ error: "Perro no encontrado" }, { status: 404 });
      }
      if (dog.ownerId !== owner.id) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
      }
      where.dogId = dogId;
    }

    where.ownerId = owner.id;
  } else {
    // ADMIN
    if (dogId) where.dogId = dogId;
    if (ownerId) where.ownerId = ownerId;
  }

  const logs = await prisma.behaviorLog.findMany({
    where,
    orderBy: { date: "desc" },
    include: { dog: { select: { name: true } } },
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createBehaviorLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { dogId, date, ...rest } = parsed.data;

    const owner = await prisma.owner.findUnique({ where: { userId: session.id } });
    if (!owner) {
      return NextResponse.json({ error: "Propietario no encontrado" }, { status: 403 });
    }

    const dog = await prisma.dog.findUnique({ where: { id: dogId } });
    if (!dog || !dog.isActive) {
      return NextResponse.json({ error: "Perro no encontrado" }, { status: 404 });
    }

    if (dog.ownerId !== owner.id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const log = await prisma.behaviorLog.create({
      data: {
        dogId,
        ownerId: owner.id,
        date: new Date(date),
        ...rest,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("POST /api/behavior-logs error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
