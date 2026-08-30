// lib/quiz/generatePersonalizedQuestion.ts
import QuizQuestion from "@/models/QuizQuestion";
import Journal from "@/models/Journal";
import { callAI } from "@/lib/quiz/aiClient";
import { AnxietyType } from "@/lib/anxiety";

const STANDARD_OPTIONS = [
  { text: "Never", score: 0 },
  { text: "Rarely", score: 1 },
  { text: "Sometimes", score: 2 },
  { text: "Often", score: 3 },
  { text: "Almost always", score: 4 },
];

interface GenerateParams {
  userId: string;
  anxietyType: AnxietyType;
  dimension: string;
  struggleScore: number;
}

export async function generatePersonalizedQuestion({
  userId,
  anxietyType,
  dimension,
  struggleScore,
}: GenerateParams) {
  const [recentJournal, priorGenerated] = await Promise.all([
    Journal.find({ patientId: userId })
      .sort({ date: -1 })
      .limit(5)
      .select("feelings reflection mood sleepQuality date"),
    QuizQuestion.find({ generatedForUserId: userId, dimension })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("question"),
  ]);

  const journalContext = recentJournal.length
    ? recentJournal
        .map(
          (e: any) =>
            `- Mood: ${e.mood}/5
  Sleep: ${e.sleepQuality}/5
  Feelings: ${e.feelings}
  Reflection: ${e.reflection}`
        )
        .join("\n")
    : "(no recent journal entries)";

  const avoidRepeats = priorGenerated.length
    ? priorGenerated.map((q) => `- ${q.question}`).join("\n")
    : "(none yet)";

  const prompt = `You write single check-in questions for a mental health app's weekly quiz. Questions are answered on a fixed frequency scale: Never / Rarely / Sometimes / Often / Almost always.

Anxiety type: ${anxietyType}
Dimension being measured: "${dimension}"
This user's current struggle level in this dimension: ${(struggleScore * 100).toFixed(0)}/100 (higher = more difficulty)

Recent journal excerpts from this user (for tone/context only — do not quote or reference them directly in the question):
${journalContext}

Questions already asked this user for this dimension (write something different in angle/phrasing):
${avoidRepeats}

Write ONE new question that:
- Fits naturally on the Never/Rarely/Sometimes/Often/Almost always scale (i.e., asks "how often did you...")
- Stays strictly within the "${dimension}" dimension — don't drift into a different theme
- Is warm, non-clinical, second-person ("you"), one sentence
- Does NOT mention or imply a diagnosis
- Does NOT directly reference or quote the journal content — use it only to pick a natural angle

Respond with ONLY the question text. No quotes, no JSON, no preamble.`;

  const raw = await callAI(prompt, { maxTokens: 150, temperature: 0.8 });
  if (!raw) return null;

  const questionText = raw.trim().replace(/^["']|["']$/g, "");
  // Reasoning models sometimes burn the token budget mid-sentence and return
  // fragments like "How often did you". Reject anything that isn't a complete
  // question so the caller falls back to the shared question bank.
  if (!questionText || questionText.length < 20 || !questionText.endsWith("?")) {
    return null;
  }

  const created = await QuizQuestion.create({
    question: questionText,
    anxietyType,
    dimension,
    options: STANDARD_OPTIONS,
    active: true,
    generated: true,
    generatedForUserId: userId,
    generatedContext: `struggleScore=${struggleScore.toFixed(2)}`,
  });

  return created;
}