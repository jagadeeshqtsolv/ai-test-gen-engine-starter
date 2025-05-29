export function generatePrompt(funcCode: string): string {
  return `
You are an expert JavaScript/TypeScript test engineer.

Generate:
- A test title
- 3-5 clear test steps (human-readable)
- Expected result
- Jest or Playwright test code

Function:
\`\`\`ts
${funcCode}
\`\`\`
`;
}
