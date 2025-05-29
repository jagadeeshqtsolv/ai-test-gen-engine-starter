import dotenv from "dotenv";
dotenv.config();

import { getChangedFiles, getFileContentAtRef } from "./git/diffAnalyzer";
import { extractFunctions } from "./git/extractFunctions";
import { generateTestCase } from "./ai/testGenerator";
import { saveTestFile } from "./utils/formatter";

async function main() {
    const baseRef = process.env.BASE_REF || "origin/main";
    const headRef = process.env.HEAD_REF || "HEAD";

    const changedFiles = getChangedFiles(baseRef, headRef);
    console.log("Changed files:", changedFiles);

    for (const file of changedFiles) {
        if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

        const code = getFileContentAtRef(file, headRef);
        if (!code) continue;

        const funcs = extractFunctions(code);
        for (const func of funcs) {
            console.log(`Generating test for function: ${func.name} in ${file}`);
            const testCode = await generateTestCase(func);
            await saveTestFile(testCode, file);
        }
    }
}

main().catch(console.error);
