import OpenAI from "openai";
import dotenv from "dotenv";
import { generatePrompt } from "../templates/promptTemplates";

dotenv.config();

const USE_MOCK = process.env.USE_MOCK === "true";

let openai: OpenAI | null = null;

if (!USE_MOCK) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY must be set in .env if USE_MOCK is not true");
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function generateTestCase(func: { name: string; code: string }): Promise<string> {
  if (USE_MOCK) {
    return `
describe("${func.name}", () => {
  it("should work as expected", () => {
    // TODO: Implement real tests here
    expect(true).toBe(true);
  });
});
`;
  }

  const prompt = generatePrompt(func.code); // <--- Call your prompt function here

  const response = await openai!.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
  });

  const testCase = response.choices[0].message?.content;
  if (!testCase) throw new Error("No test case generated");
  return testCase;
}
