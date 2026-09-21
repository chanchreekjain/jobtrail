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

/** A search result handed to the model, numbered so it can cite it. */
export type NumberedSource = {
  n: number;
  title: string;
  url: string;
  content: string;
};

/**
 * What the model returns. Note what's missing: URLs. The model cites a
 * source by its number and the caller looks the URL up — so a link it
 * didn't actually receive cannot appear in the output, however
 * confident it sounds.
 */
export type CompanySummary = {
  summary: string;
  facts: { claim: string; source: number }[];
  careersSource: number | null;
  recruitingContact: string | null;
};

export async function summariseCompany(
  companyName: string,
  sources: NumberedSource[],
): Promise<CompanySummary> {
  const numbered = sources
    .map((s) => `[${s.n}] ${s.title}\n${s.url}\n${s.content}`)
    .join("\n\n");

  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `You are researching the company "${companyName}" for a job applicant.
Use ONLY the numbered sources below. Do not use anything you already know.

summary — two or three plain sentences: what the company does and anything
  an applicant should know. Only what the sources support.
facts — short, specific statements (recent news, size, funding, products),
  each with the number of the source that states it. Skip anything no
  source states. Five at most.
careersSource — the number of a source that is the company's own careers
  or jobs page, or null if none is.
recruitingContact — an email address the company itself publishes for
  job applicants (e.g. careers@, jobs@), copied exactly from a source, or
  null. Never an individual employee's personal address. Never guessed.

If the sources are about a different company with a similar name, return
an empty facts list and say so in the summary.

SOURCES:
${numbered}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          facts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claim: { type: Type.STRING },
                source: { type: Type.INTEGER },
              },
              required: ["claim", "source"],
            },
          },
          careersSource: { type: Type.INTEGER, nullable: true },
          recruitingContact: { type: Type.STRING, nullable: true },
        },
        required: ["summary", "facts", "careersSource", "recruitingContact"],
      },
    },
  }));

  return JSON.parse(response.text ?? "{}") as CompanySummary;
}
