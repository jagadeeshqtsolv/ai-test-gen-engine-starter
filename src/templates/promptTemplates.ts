export function generatePrompt(funcCode: string): string {
  return `
You are an expert JavaScript/TypeScript test engineer.

Given the following function, generate two outputs with exact section headers:

=== PART 1: METADATA ===
- Test Title
- 3–5 human-readable test steps
- Expected Result

Format:
Test Title: <title>
Test Steps:
1. ...
2. ...
3. ...
Expected Result: ...

=== PART 2: TEST CODE ===
- Include ONLY:
  - necessary \`import\` statements (no explanations)
  - \`describe\` and \`it\` blocks with meaningful tests
- DO NOT include the function implementation again
- DO NOT include markdown code fences (e.g., \`\`\`ts)
- Output clean, minimal, executable code

Function to test:
\`\`\`ts
${funcCode}
\`\`\`
`;
}
