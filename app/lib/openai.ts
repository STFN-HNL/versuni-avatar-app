import { OpenAI } from "openai";

let openaiInstance: OpenAI | null = null;

export const getOpenAI = (): OpenAI => {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is missing or empty");
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
};
