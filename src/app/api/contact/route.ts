import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const contactSchema = z.object({
  ownerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  dogName: z.string().min(1),
  breed: z.string().optional(),
  approximateAge: z.string().optional(),
  specialty: z.string().min(1),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { ownerName, email, phone, dogName, breed, approximateAge, specialty, message } =
      parsed.data

    await prisma.contactRequest.create({
      data: { ownerName, email, phone, dogName, breed, approximateAge, specialty, message },
    })

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const adminEmail = process.env.ADMIN_EMAIL ?? 'paula@huellavinculo.com'

        await resend.emails.send({
          from: 'Huella & Vínculo <noreply@huellavinculo.com>',
          to: adminEmail,
          subject: `Nueva consulta de ${ownerName} para ${dogName}`,
          html: `
            <h2>Nueva consulta de contacto</h2>
            <p><strong>Nombre del dueño:</strong> ${ownerName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Nombre del perro:</strong> ${dogName}</p>
            ${breed ? `<p><strong>Raza:</strong> ${breed}</p>` : ''}
            ${approximateAge ? `<p><strong>Edad aproximada:</strong> ${approximateAge}</p>` : ''}
            <p><strong>Especialidad:</strong> ${specialty}</p>
            ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ''}
          `,
        })
      } catch (emailError) {
        console.error('Error sending contact email:', emailError)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
