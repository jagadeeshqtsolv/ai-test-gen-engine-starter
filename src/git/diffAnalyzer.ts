import { execSync } from "child_process";

const WORKDIR = process.env.WORKDIR || ".";

export function getChangedFiles(baseRef: string, headRef: string): string[] {
  // Use refs with origin/ prefix to ensure remote refs are compared
  const cmd = `git diff --name-only origin/${baseRef} origin/${headRef}`;
  try {
    const output = execSync(cmd, { cwd: WORKDIR }).toString();
    return output.split("\n").filter(Boolean);
  } catch (err) {
    console.error("Error fetching changed files:", err);
    return [];
  }
}

export function getFileContentAtRef(filePath: string, ref: string): string {
  // Use origin/ prefix to read from remote branch ref
  const cmd = `git show origin/${ref}:${filePath}`;
  try {
    return execSync(cmd, { cwd: WORKDIR }).toString();
  } catch (err) {
    console.error(`Error fetching content for ${filePath} at ${ref}:`, err);
    return "";
  }
}
