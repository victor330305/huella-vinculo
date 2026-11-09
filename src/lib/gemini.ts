import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error('GEMINI_API_KEY no configurada en variables de entorno')
}

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function generateContent(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt)
  return result.response.text()
}
