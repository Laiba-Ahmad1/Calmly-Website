// lib/ai/compareJournalGrowth.ts

interface JournalSnapshot {
  feelings: string;
  reflection: string;
}

interface PreviousEntry extends JournalSnapshot {
  date: Date;
}

interface CompareParams {
  today: JournalSnapshot;
  previousEntries: PreviousEntry[];
}

const SYSTEM_PROMPT = `You are a careful, conservative mental-health journal analyst. You compare what a patient wrote today to what they've written recently. You are strict — only say "yes" if today's writing shows a genuine, clear improvement. When in doubt, say "no". You never diagnose or give advice — you only judge whether today's writing looks better than the recent pattern.`;

function buildPrompt({ today, previousEntries }: CompareParams) {
  const history = previousEntries
    .map(
      (e, i) =>
        `Entry ${i + 1} (${e.date.toISOString().slice(0, 10)}):\nFeelings: ${e.feelings}\nReflection: ${e.reflection}`
    )
    .join("\n\n");

  return `Here is what a patient wrote in their last ${previousEntries.length} journal entries, oldest to newest:

${history}

Here is what they wrote today:
Feelings: ${today.feelings}
Reflection: ${today.reflection}

Compare today's writing to the pattern in the previous entries. Does today's writing show a MORE positive attitude, GREATER awareness of anxiety triggers, or genuine overall mental-growth improvement, compared to the recent pattern?

Respond with ONLY the single word "yes" or "no" — no punctuation, no explanation.`;
}

async function askGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY_2}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini request failed: ${res.status}`);

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text.trim().toLowerCase();
}

async function askGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY_2}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    }),
  });

  if (!res.ok) throw new Error(`Groq request failed: ${res.status}`);

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  return text.trim().toLowerCase();
}

export async function compareJournalGrowth(params: CompareParams): Promise<boolean> {
  const prompt = buildPrompt(params);

  try {
    const answer = await askGemini(prompt);
    return answer.startsWith("yes");
  } catch (geminiErr) {
    console.error("Gemini comparison failed, falling back to Groq:", geminiErr);
    try {
      const answer = await askGroq(prompt);
      return answer.startsWith("yes");
    } catch (groqErr) {
      console.error("Groq fallback also failed — no improvement bonus awarded:", groqErr);
      return false;
    }
  }
}