import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTestCase(func: { name: string; code: string }): Promise<string> {
  const prompt = `
Generate a Jest test case for the following JavaScript/TypeScript function:

${func.code}

Please provide a complete and executable test.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
  });

  const testCase = response.choices[0].message?.content;
  if (!testCase) throw new Error("No test case generated");
  return testCase;
}
