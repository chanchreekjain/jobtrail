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

/**
 * Models to try, in order. When the first is overloaded (503) or
 * rate-limited (429), fall through to the next — a different model is
 * usually served from different capacity, so it's often fine when the
 * first isn't. Lite is smaller and a little less capable, but a slightly
 * plainer answer beats an error.
 */
const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];

type Request = Omit<Parameters<typeof ai.models.generateContent>[0], "model">;

async function generate(request: Request) {
  let lastError: unknown;

  for (const model of MODELS) {
    try {
      // Two tries per model rather than three: with a fallback waiting,
      // there's no point making the user sit through a long backoff.
      return await withRetry(
        () => ai.models.generateContent({ ...request, model }),
        2,
      );
    } catch (error) {
      lastError = error;
      const status = (error as { status?: number }).status;
      if (status !== 503 && status !== 429) throw error;
      console.warn(`[ai] ${model} unavailable (${status}), trying next model`);
    }
  }

  throw lastError;
}

export type Requirement = {
  text: string;
  kind: "must" | "nice";
  skill: string;
};

export type WorkMode = "remote" | "hybrid" | "onsite";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type SalaryPeriod = "year" | "month" | "hour";

export type ExtractedJob = {
  company: string | null;
  position: string | null;
  deadline: string | null;
  location: string | null;
  workMode: WorkMode | null;
  employmentType: EmploymentType | null;
  experienceMin: number | null;
  salaryRaw: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriod | null;
  contactEmail: string | null;
  notes: string | null;
  requirements: Requirement[];
};

const WORK_MODES: WorkMode[] = ["remote", "hybrid", "onsite"];
const EMPLOYMENT_TYPES: EmploymentType[] = ["full_time", "part_time", "contract", "internship"];
const SALARY_PERIODS: SalaryPeriod[] = ["year", "month", "hour"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A value from a fixed list, or null — never something the database will refuse. */
function oneOf<T extends string>(value: unknown, allowed: T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

function positiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function extractJob(rawJd: string): Promise<ExtractedJob> {
  const response = await generate({
    contents: `Extract structured data from this job description.

company  — the hiring company's name.
position — the job title as written.
deadline — the application deadline as YYYY-MM-DD, only if an explicit date is given.
location — where the job is, as written (e.g. "Bengaluru", "London or Remote").
workMode — "remote", "hybrid" or "onsite", only if the JD says which.
employmentType — "full_time", "part_time", "contract" or "internship".
experienceMin — the minimum years of experience required, as a whole number.
salaryRaw — the pay exactly as written (e.g. "12–18 LPA", "$90k–$120k").
salaryMin, salaryMax — the same pay as plain numbers in full units
  (12 LPA = 1200000; $90k = 90000). One number means min and max are equal.
salaryCurrency — ISO code: "INR", "USD", "EUR", …
salaryPeriod — "year", "month" or "hour".
contactEmail — an email address the JD gives for applying or questions,
  copied exactly.
notes — at most two short sentences on important conditions that fit none
  of the fields above (travel, languages, relocation, shifts, bond).
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
          location: { type: Type.STRING, nullable: true },
          workMode: { type: Type.STRING, enum: WORK_MODES, nullable: true },
          employmentType: { type: Type.STRING, enum: EMPLOYMENT_TYPES, nullable: true },
          experienceMin: { type: Type.INTEGER, nullable: true },
          salaryRaw: { type: Type.STRING, nullable: true },
          salaryMin: { type: Type.NUMBER, nullable: true },
          salaryMax: { type: Type.NUMBER, nullable: true },
          salaryCurrency: { type: Type.STRING, nullable: true },
          salaryPeriod: { type: Type.STRING, enum: SALARY_PERIODS, nullable: true },
          contactEmail: { type: Type.STRING, nullable: true },
          notes: { type: Type.STRING, nullable: true },
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
        required: [
          "company", "position", "deadline", "location", "workMode",
          "employmentType", "experienceMin", "salaryRaw", "salaryMin",
          "salaryMax", "salaryCurrency", "salaryPeriod", "contactEmail",
          "notes", "requirements",
        ],
      },
    },
  });

  const raw = JSON.parse(response.text ?? "{}") as Record<string, unknown>;

  // The schema asks for these shapes; this makes sure of them before the
  // database's check constraints ever see a value.
  const contact = text(raw.contactEmail);
  const contactIsReal =
    contact !== null &&
    EMAIL.test(contact) &&
    rawJd.toLowerCase().includes(contact.toLowerCase());

  const experience = positiveNumber(raw.experienceMin);

  return {
    company: text(raw.company),
    position: text(raw.position),
    deadline: text(raw.deadline),
    location: text(raw.location),
    workMode: oneOf(raw.workMode, WORK_MODES),
    employmentType: oneOf(raw.employmentType, EMPLOYMENT_TYPES),
    experienceMin: experience === null ? null : Math.round(experience),
    salaryRaw: text(raw.salaryRaw),
    salaryMin: positiveNumber(raw.salaryMin),
    salaryMax: positiveNumber(raw.salaryMax),
    salaryCurrency: text(raw.salaryCurrency)?.toUpperCase() ?? null,
    salaryPeriod: oneOf(raw.salaryPeriod, SALARY_PERIODS),
    // Kept only if it's copied from the JD, not written by the model.
    contactEmail: contactIsReal ? contact : null,
    notes: text(raw.notes),
    requirements: Array.isArray(raw.requirements)
      ? (raw.requirements as Requirement[])
      : [],
  };
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
  /** The company's name as the sources write it — fixes the user's typos. */
  companyName: string;
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

  const response = await generate({
    contents: `You are researching the company "${companyName}" for a job applicant.
Use ONLY the numbered sources below. Do not use anything you already know.

companyName — the company's name spelled exactly as the sources write it
  (the user may have misspelled it). If the sources don't name it, repeat
  the name you were given.
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
          companyName: { type: Type.STRING },
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
        required: ["companyName", "summary", "facts", "careersSource", "recruitingContact"],
      },
    },
  });

  return JSON.parse(response.text ?? "{}") as CompanySummary;
}
