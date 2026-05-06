import "server-only";

import OpenAI from "openai";
import { externalServiceError, missingProvider } from "@/lib/errors";

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw missingProvider("OPENAI_API_KEY");
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}

export async function generateStructuredJson<T>({
  name,
  schema,
  system,
  user,
}: {
  name: string;
  schema: Record<string, unknown>;
  system: string;
  user: string;
}) {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name,
        strict: true,
        schema,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw externalServiceError("OpenAI", "empty response");
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw externalServiceError("OpenAI", "response was not valid JSON");
  }
}
