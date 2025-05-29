import { execSync } from "child_process";

export function runGitCommand(command: string): string {
    return execSync(command, { stdio: "pipe" }).toString().trim();
}

export function createAndCheckoutTempBranch(): string {
    const timestamp = Date.now();
    const branchName = `ai/generated-tests/${timestamp}`;
    runGitCommand(`git checkout -b ${branchName}`);
    return branchName;
}

export function commitAndPushChanges(branchName: string, commitMessage: string) {
    runGitCommand(`git add tests`);
    runGitCommand(`git commit -m "${commitMessage}"`);
    runGitCommand(`git push origin ${branchName}`);
}
