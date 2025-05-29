export function splitTestOutput(output: string): { metadata: string; testCode: string } {
    const normalizedOutput = output.replace(/\r\n/g, "\n");

    const part1Regex = /=== PART 1: METADATA ===\n([\s\S]*?)\n=== PART 2: TEST CODE ===/;
    const part2Regex = /=== PART 2: TEST CODE ===\n([\s\S]*)$/;

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
