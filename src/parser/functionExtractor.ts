export interface FuncInfo {
    name: string;
    code: string;
}

export function extractExportedFunctions(code: string): FuncInfo[] {
    const regex = /export function (\w+)\([^)]*\)[^{]*\{[^}]*\}/gms;
    const functions: FuncInfo[] = [];
    let match;

    while ((match = regex.exec(code)) !== null) {
        // match[0] is the full function code including 'export function ...'
        functions.push({ name: match[1], code: match[0] });
    }

    return functions;
}
