import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { generateTestCase } from "./ai/testGenerator"; // Adjust path as needed
import { splitTestOutput } from "./utils/testSplitter"; // Adjust path as needed

function runGitCommand(cmd: string, cwd: string): string {
    try {
        return execSync(cmd, { cwd, stdio: "pipe" }).toString().trim();
    } catch (e: any) {
        throw new Error(`Git command failed: ${cmd}\n${e.message}`);
    }
}

function cloneRepo(repoUrl: string, targetDir: string) {
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }
    runGitCommand(`git clone ${repoUrl} ${targetDir}`, process.cwd());
}

function getChangedFiles(baseBranch: string, headBranch: string, cwd: string): string[] {
    const diffCmd = `git diff --name-only ${baseBranch} ${headBranch} -- '*.ts'`;
    const output = runGitCommand(diffCmd, cwd);
    if (!output) return [];
    return output.split("\n").filter(f => f.trim() !== "");
}

function extractExportedFunctions(sourceCode: string): { name: string; code: string }[] {
    const functionDeclRegex = /export function (\w+)\s*\([^)]*\)\s*:\s*[^ {]+\s*\{[\s\S]*?\}/gm;
    const functionExprRegex = /export const (\w+)\s*=\s*\([^)]*\)\s*:\s*[^=]+\s*=>\s*\{[\s\S]*?\}/gm;

    const results: { name: string; code: string }[] = [];

    let match;
    while ((match = functionDeclRegex.exec(sourceCode)) !== null) {
        results.push({ name: match[1], code: match[0] });
    }
    while ((match = functionExprRegex.exec(sourceCode)) !== null) {
        results.push({ name: match[1], code: match[0] });
    }

    return results;
}

function getFileContentAtRef(filePath: string, ref: string, cwd: string): string {
    return runGitCommand(`git show ${ref}:${filePath}`, cwd);
}

async function main() {
    try {
        const repoUrl = process.env.GITHUB_REPO_URL || "https://github.com/jagadeeshqtsolv/ky.git";
        const baseRef = process.env.BASE_REF || "main";
        const headRef = process.env.HEAD_REF || "feature/add-utils-function";

        const tmpDir = path.join(os.tmpdir(), "ky-repo");

        console.log(`Cloning repo ${repoUrl} into ${tmpDir}`);
        cloneRepo(repoUrl, tmpDir);

        runGitCommand(`git fetch origin`, tmpDir);

        runGitCommand(`git checkout -B temp-base origin/${baseRef}`, tmpDir);
        runGitCommand(`git checkout -B temp-head origin/${headRef}`, tmpDir);

        const changedFiles = getChangedFiles("temp-base", "temp-head", tmpDir);
        console.log("📂 Changed .ts files:", changedFiles);

        for (const file of changedFiles) {
            if (!file.endsWith(".ts")) continue;

            const content = getFileContentAtRef(file, "temp-head", tmpDir);
            const exportedFunctions = extractExportedFunctions(content);
            if (exportedFunctions.length === 0) {
                console.log(`⚠️ No exported functions found in ${file}, skipping`);
                continue;
            }

            const sourceDir = path.dirname(file);
            const sourceFileName = path.basename(file, ".ts");
            const testDir = path.join("tests", sourceDir);
            fs.mkdirSync(testDir, { recursive: true });

            for (const func of exportedFunctions) {
                console.log(`🚀 Generating test for function: ${func.name} in file: ${file}`);

                let aiOutput = "";
                try {
                    aiOutput = await generateTestCase(func);
                } catch (err) {
                    console.error(`❌ Failed to generate test for ${func.name}:`, err);
                    continue;
                }

                let metadata = "";
                let testCode = "";
                try {
                    const split = splitTestOutput(aiOutput);
                    metadata = split.metadata;
                    testCode = split.testCode;
                } catch (err) {
                    console.error(`❌ Failed to split AI output for ${func.name}:`, err);
                    continue;
                }

                const testFilePath = path.join(testDir, `${sourceFileName}.${func.name}.test.ts`);
                const metaFilePath = path.join(testDir, `${sourceFileName}.${func.name}.test.meta.md`);

                fs.writeFileSync(testFilePath, testCode, "utf-8");
                fs.writeFileSync(metaFilePath, metadata, "utf-8");

                console.log(`✅ Test generated: ${testFilePath}`);
                console.log(`🧾 Metadata generated: ${metaFilePath}`);
            }
        }
    } catch (err: any) {
        console.error("Fatal error in run.ts:", err);
        process.exit(1);
    }
}

main();
