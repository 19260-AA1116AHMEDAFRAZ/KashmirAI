import 'server-only';

// The one place that talks to Google's Gemini API. Needs GEMINI_API_KEY in .env (server side only:
// the key never reaches the browser). Used by the trip cost estimate (estimate.ts) and the Ask
// page (ask.ts).

const API = 'https://generativelanguage.googleapis.com/v1beta/models';
// `gemini-flash-latest` always points at the current Flash model. Override with GEMINI_MODEL in .env.
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

export const geminiConfigured = () => Boolean(process.env.GEMINI_API_KEY?.trim());

export type GeminiTurn = { role: 'user' | 'model'; text: string };

type Options = {
  turns: GeminiTurn[];
  system?: string; // instructions Gemini follows for the whole conversation
  schema?: object; // ask for JSON in this shape (Gemini's OpenAPI-style schema)
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
};

// The answer text, or null if there is no key or the call failed (the reason is logged, never the key).
export async function geminiText({ turns, system, schema, temperature = 0.2, maxOutputTokens, timeoutMs = 25_000 }: Options): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  try {
    const res = await fetch(`${API}/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: {
          temperature,
          ...(maxOutputTokens ? { maxOutputTokens } : {}),
          ...(schema ? { responseMimeType: 'application/json', responseSchema: schema } : {}),
          thinkingConfig: { thinkingBudget: 0 }, // a quick answer is enough here (3s instead of 8s)
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`Gemini call failed: HTTP ${res.status} (${MODEL})`);
      return null;
    }
    const body = await res.json();
    const text = body?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
    return typeof text === 'string' && text.trim() ? text : null;
  } catch (e) {
    console.warn('Gemini call failed:', e instanceof Error ? e.message : e);
    return null;
  }
}
