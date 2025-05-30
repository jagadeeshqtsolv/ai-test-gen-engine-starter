import { execSync } from "child_process";

export function getChangedFiles(
    baseBranch: string,
    featureBranch: string,
    remote = "origin",
    cwd = process.cwd()
): string[] {
  try {
    // No need to fetch branches again here, done outside in run.ts

    const diffOutput = execSync(
        `git diff --name-only ${baseBranch} ${featureBranch} --`,
        { encoding: "utf-8", cwd }
    );

    return diffOutput.split("\n").filter(Boolean);
  } catch (error) {
    console.error("Error fetching changed files:", error);
    return [];
  }
}

export function getFileContentAtRef(
    filePath: string,
    ref: string,
    cwd = process.cwd()
): string {
  try {
    return execSync(`git show ${ref}:${filePath}`, {
      encoding: "utf-8",
      cwd,
    });
  } catch (error) {
    console.error(`Error getting file content for ${filePath} at ${ref}`, error);
    return "";
  }
}
