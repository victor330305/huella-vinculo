import { generateContent } from "../src/lib/gemini";

async function main() {
  console.log("API Key presente:", !!process.env.GEMINI_API_KEY);
  console.log("Primeros 10 chars:", process.env.GEMINI_API_KEY?.slice(0, 10));
  
  try {
    const result = await generateContent("Decí hola en español en una sola frase.");
    console.log("✅ Respuesta de Gemini:", result);
  } catch (e: unknown) {
    const err = e as Error;
    console.error("❌ Error:", err.message);
  }
}

main();
