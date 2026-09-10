import { GoogleGenAI, Type } from "@google/genai";

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = (error as { status?: number }).status;
      if (status !== 503 && status !== 429) throw error;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }

  throw lastError;
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type Requirement = {
  text: string;
  kind: "must" | "nice";
  skill: string;
};

export async function extractRequirements(rawJd: string): Promise<Requirement[]> {
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `Extract every requirement from this job description.
For each one: the requirement text, whether it is a "must" or a "nice" to have,
and the single skill it maps to (e.g. "python", "sql", "communication").

JOB DESCRIPTION:
${rawJd}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            kind: { type: Type.STRING, enum: ["must", "nice"] },
            skill: { type: Type.STRING },
          },
          required: ["text", "kind", "skill"],
        },
      },
    },
  }));

  return JSON.parse(response.text ?? "[]") as Requirement[];
}