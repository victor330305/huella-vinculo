import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateContent(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no configurada en variables de entorno')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  // Usar el modelo estable disponible en el free tier
  const model = genAI.getGenerativeModel({ model: 'models/gemini-3.8-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}
