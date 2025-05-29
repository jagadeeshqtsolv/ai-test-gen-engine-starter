import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { getChangedFiles, getFileContentAtRef } from "./git/diffAnalyzer"; // Your existing git helpers
import { extractExportedFunctions, FuncInfo } from "./parser/functionExtractor";
import { generateTestCase } from "./ai/testGenerator";
import { splitTestOutput } from "./utils/testSplitter";

dotenv.config();

(async () => {
    try {
        const baseRef = process.env.BASE_REF;
        const headRef = process.env.HEAD_REF;

        if (!baseRef || !headRef) {
            throw new Error("BASE_REF and HEAD_REF must be defined in .env");
        }

        const files = getChangedFiles(baseRef, headRef);
        console.log("📂 Changed files:", files);

        for (const file of files) {
            if (file.startsWith(".idea/") || !file.endsWith(".ts")) continue;

            const content = getFileContentAtRef(file, headRef);
            console.log(`📄 Content of ${file} at ${headRef} (first 500 chars):\n`, content.substring(0, 500));

            const functions: FuncInfo[] = extractExportedFunctions(content);
            if (functions.length === 0) {
                console.warn(`⚠️ No exported functions found in ${file}`);
                continue;
            }

            for (const func of functions) {
                console.log(`🚀 Generating test for: ${func.name}`);

                let aiOutput = "";
                try {
                    aiOutput = await generateTestCase(func);
                } catch (err) {
                    console.error(`❌ Error generating test case for ${func.name}:`, err);
                    continue;
                }

                let testCode = "";
                let metadata = "";

                try {
                    const result = splitTestOutput(aiOutput);
                    testCode = result.testCode;
                    metadata = result.metadata;
                } catch (err) {
                    console.error(`❌ Error splitting AI output for ${func.name}:`, err);
                    console.log("AI Output was:\n", aiOutput);
                    continue;
                }

                const relativeDir = path.dirname(file);
                const fileName = path.basename(file, ".ts");
                const testDir = path.join("tests", relativeDir);
                const testFilePath = path.join(testDir, `${fileName}.test.ts`);
                const metaFilePath = path.join(testDir, `${fileName}.meta.txt`);

                fs.mkdirSync(testDir, { recursive: true });
                fs.writeFileSync(testFilePath, testCode);
                fs.writeFileSync(metaFilePath, metadata);

                console.log(`✅ Test written to ${testFilePath}`);
                console.log(`📝 Metadata written to ${metaFilePath}`);
            }
        }
    } catch (err) {
        console.error("❌ Fatal error:", err);
    }
})();
