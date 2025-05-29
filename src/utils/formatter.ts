import fs from "fs-extra";
import path from "path";

const WORKDIR = process.env.WORKDIR || ".";

export async function saveTestFile(testCode: string, sourceFilePath: string) {
  const testsDir = path.join(WORKDIR, "generated-tests");
  await fs.ensureDir(testsDir);

  const baseName = path.basename(sourceFilePath).replace(/\.(ts|js)x?$/, ".spec.ts");
  const testFilePath = path.join(testsDir, baseName);

  await fs.writeFile(testFilePath, testCode);
  console.log(`Saved test to ${testFilePath}`);
}
