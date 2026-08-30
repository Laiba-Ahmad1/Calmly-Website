// lib/quiz/aiClient.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

interface CallAIOptions {
  maxTokens?: number;
  temperature?: number;
}

/**
 * Tries Gemini 2.5 Flash first, falls back to Groq (Llama 3.3 70B) if
 * Gemini fails or is rate-limited. Returns raw text or null if both fail.
 */
export async function callAI(
  prompt: string,
  options: CallAIOptions = {}
): Promise<string | null> {
  const { maxTokens = 500, temperature = 0.7 } = options;

  // --- try Gemini first ---
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-3.6-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // thinking budget pinned to the minimum so reasoning doesn't eat the
      // output token budget and truncate structured JSON responses
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
        thinkingConfig: { thinkingBudget: 1 },
      } as any,
    });
    const text = result.response.text();
    if (text?.trim()) return text.trim();
  } catch (err) {
    console.warn("Gemini call failed, falling back to Groq:", err);
  }

  // --- fallback: Groq ---
  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
      // gpt-oss is a reasoning model — keep reasoning short so it doesn't eat
      // the token budget meant for the actual response
      reasoning_effort: "low",
    } as any);
    const text = completion.choices[0]?.message?.content;
    if (text?.trim()) return text.trim();
  } catch (err) {
    console.error("Groq fallback also failed:", err);
  }

  return null; // caller must handle: skip AI personalization this round
}