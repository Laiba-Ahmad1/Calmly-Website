// lib/quiz/journalDimensions.ts
import JournalEntry from "@/models/JournalEntry";
import { callAI } from "@/lib/quiz/aiClient";

const LOOKBACK_DAYS = 14;
const MAX_ENTRIES = 10;

export async function analyzeJournalDimensions(
  userId: string,
  dimensions: string[]
): Promise<Record<string, number> | null> {
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const entries = await JournalEntry.find({ userId, createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .limit(MAX_ENTRIES)
    .select("content createdAt");

  if (!entries.length) return null;

  const journalText = entries
    .map((e: any) => `[${e.createdAt.toISOString().slice(0, 10)}] ${e.content}`)
    .join("\n\n");

  const prompt = `You are scoring journal entries from a mental health app user against a fixed list of anxiety "dimensions".
For each dimension below, output a struggle score from 0.0 (no signal of difficulty) to 1.0 (strong signal of difficulty), based only on what's in the journal entries. If an entry gives no signal for a dimension, keep it near 0.5 (neutral, not enough info).

Dimensions: ${dimensions.join(", ")}

Journal entries:
"""
${journalText}
"""

Respond with ONLY a JSON object mapping each dimension name to a number between 0 and 1. No other text, no markdown fences, no explanation.`;

  const raw = await callAI(prompt, { maxTokens: 500, temperature: 0.3 });
  if (!raw) return null;

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const result: Record<string, number> = {};
    for (const dim of dimensions) {
      const val = parsed[dim];
      result[dim] = typeof val === "number" ? Math.min(1, Math.max(0, val)) : 0.5;
    }
    return result;
  } catch (err) {
    console.error("Failed to parse journal dimension response:", raw, err);
    return null;
  }
}