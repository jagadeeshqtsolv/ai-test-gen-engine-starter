export function splitTestOutput(output: string): { metadata: string; testCode: string } {
    const normalizedOutput = output.replace(/\r\n/g, "\n").trim();

    // Regex to match parts, allowing optional spaces before/after header lines
    const part1Regex = /^\s*={3} PART 1: METADATA ={3}\s*\n([\s\S]*?)\n^\s*={3} PART 2: TEST CODE ={3}\s*$/m;
    const part2Regex = /^\s*={3} PART 2: TEST CODE ={3}\s*\n([\s\S]*)$/m;

    const part1Match = normalizedOutput.match(part1Regex);
    const part2Match = normalizedOutput.match(part2Regex);

    if (!part1Match || !part2Match) {
        console.log("Full AI Output:\n", output);
        throw new Error("Could not find expected metadata or code blocks in AI output");
    }

    return {
        metadata: part1Match[1].trim(),
        testCode: part2Match[1].trim(),
    };
}
