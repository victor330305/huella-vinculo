import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateContent } from '@/lib/gemini'
import { buildNextSessionPrompt, DogForAI } from '@/lib/ai-prompts'

const schema = z.object({
  dogId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { dogId } = parsed.data

    const dog = await prisma.dog.findUnique({
      where: { id: dogId },
      include: {
        profile: true,
        sessions: { orderBy: { date: 'desc' }, take: 10 },
        exercises: {
          orderBy: { assignedAt: 'desc' },
          include: { logs: { orderBy: { practicedAt: 'desc' }, take: 5 } },
        },
        behaviorLogs: { orderBy: { date: 'desc' }, take: 10 },
        reports: { orderBy: { generatedAt: 'desc' } },
      },
    })

    if (!dog) {
      return NextResponse.json({ error: 'Perro no encontrado' }, { status: 404 })
    }

    const dogForAI: DogForAI = {
      name: dog.name,
      breed: dog.breed,
      sex: dog.sex,
      birthDate: dog.birthDate,
      approximateAge: dog.approximateAge,
      weight: dog.weight,
      notes: dog.notes,
      profile: dog.profile,
      sessions: dog.sessions,
      exercises: dog.exercises,
      behaviorLogs: dog.behaviorLogs,
      reports: dog.reports,
    }

    const prompt = buildNextSessionPrompt(dogForAI)
    const result = await generateContent(prompt)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('POST /api/ai/next-session error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
