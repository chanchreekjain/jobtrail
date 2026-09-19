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

export type ExtractedJob = {
  company: string | null;
  position: string | null;
  deadline: string | null;
  requirements: Requirement[];
};

export async function extractJob(rawJd: string): Promise<ExtractedJob> {
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `Extract structured data from this job description.

company  — the hiring company's name.
position — the job title as written.
deadline — the application deadline as YYYY-MM-DD, only if an explicit date is given.
requirements — every requirement, each with its text, whether it is a "must" or a
"nice" to have, and the single skill it maps to (e.g. "python", "sql", "communication").

If the job description does not state something, return null for it. Do not guess,
infer, or fill in a plausible value.

JOB DESCRIPTION:
${rawJd}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING, nullable: true },
          position: { type: Type.STRING, nullable: true },
          deadline: { type: Type.STRING, nullable: true },
          requirements: {
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
        required: ["company", "position", "deadline", "requirements"],
      },
    },
  }));

  return JSON.parse(response.text ?? "{}") as ExtractedJob;
}
