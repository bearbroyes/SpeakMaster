import { GoogleGenAI } from "@google/genai";

export async function analyzeTranscript(
  transcript: string,
  theme: string,
  points: string[]
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey?.trim()) return null;

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an English exam teacher reviewing an OGE monologue about "${theme}".
The student was required to cover these aspects:
${points.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Transcript:
"${transcript}"

Give brief constructive feedback in Russian (3-5 sentences): which aspects seem covered, any grammar issues, and one tip for improvement. Do not give a numeric score.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return response.text ?? null;
}
