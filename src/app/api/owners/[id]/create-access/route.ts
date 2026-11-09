import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
function generateTempPassword(length = 12): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = await params;

  const owner = await prisma.owner.findUnique({ where: { id } });
  if (!owner) return NextResponse.json({ error: "Propietario no encontrado" }, { status: 404 });
  if (owner.userId) return NextResponse.json({ error: "El propietario ya tiene acceso al portal", hasAccess: true }, { status: 409 });

  const existingUser = await prisma.user.findUnique({ where: { email: owner.email } });
  if (existingUser) return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  try {
    await prisma.user.create({
      data: {
        email: owner.email,
        hashedPassword,
        name: `${owner.firstName} ${owner.lastName}`,
        role: "OWNER",
        owner: { connect: { id: owner.id } },
      },
    });
    return NextResponse.json(
      { ok: true, email: owner.email, tempPassword, message: "Acceso creado. Mostrá esta contraseña una sola vez." },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
    }
    console.error("create-access error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
