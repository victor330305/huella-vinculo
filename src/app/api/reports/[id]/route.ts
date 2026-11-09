import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const updateReportSchema = z.object({
  initialState: z.string().optional(),
  objectives: z.string().optional(),
  activitiesPerformed: z.string().optional(),
  changesObserved: z.string().optional(),
  pendingDifficulties: z.string().optional(),
  nextObjectives: z.string().optional(),
  professionalNotes: z.string().optional(),
  isVisibleToOwner: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const parsed = updateReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.report.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Informe no encontrado' }, { status: 404 })
    }

    const report = await prisma.report.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('PUT /api/reports/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
