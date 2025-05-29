export interface FuncInfo {
  name: string;
  code: string;
}

export function extractFunctions(code: string): FuncInfo[] {
  const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{[^}]*}/gms;
  const funcs: FuncInfo[] = [];
  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    funcs.push({ name: match[1], code: match[0] });
  }
  return funcs;
}
