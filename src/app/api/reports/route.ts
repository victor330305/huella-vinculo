import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const createReportSchema = z.object({
  dogId: z.string().min(1),
  initialState: z.string().optional(),
  objectives: z.string().optional(),
  activitiesPerformed: z.string().optional(),
  changesObserved: z.string().optional(),
  pendingDifficulties: z.string().optional(),
  nextObjectives: z.string().optional(),
  professionalNotes: z.string().optional(),
  isVisibleToOwner: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dogId = searchParams.get("dogId");

  const where: Prisma.ReportWhereInput = {};

  if (session.role === "OWNER") {
    const owner = await prisma.owner.findUnique({ where: { userId: session.id } });
    if (!owner) {
      return NextResponse.json({ error: "Propietario no encontrado" }, { status: 403 });
    }

    where.isVisibleToOwner = true;

    if (dogId) {
      const dog = await prisma.dog.findUnique({ where: { id: dogId } });
      if (!dog) {
        return NextResponse.json({ error: "Perro no encontrado" }, { status: 404 });
      }
      if (dog.ownerId !== owner.id) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
      }
      where.dogId = dogId;
    } else {
      where.dog = { ownerId: owner.id };
    }
  } else {
    // ADMIN
    if (dogId) where.dogId = dogId;
  }

  const reports = await prisma.report.findMany({
    where,
    orderBy: { generatedAt: "desc" },
    include: { dog: { select: { name: true } } },
  });

  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { dogId, ...rest } = parsed.data;

    const dog = await prisma.dog.findUnique({ where: { id: dogId } });
    if (!dog) {
      return NextResponse.json({ error: "Perro no encontrado" }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: { dogId, ...rest },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
