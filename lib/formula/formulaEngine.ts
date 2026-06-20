export const isFormula = (value?: string) => {
    if (!value) return false;
    return value.startsWith("=");
}

export const getReferences = (formula: string) => {
    return formula.match(/[A-Z]+\d+/g) || [];
}
export const getCellValue = (ref: string, cells: Record<string, string>, visited = new Set<string>()): string => {

    if (visited.has(ref)) {
        return "#CIRCULAR"
    }

    visited.add(ref);

    const col = ref.charCodeAt(0) - 65;
    const row = parseInt(ref.slice(1)) - 1;

    const cellId = `${row}-${col}`;
    const value = cells[cellId];
    let result: string;
    if (!value) {
        result = "0";
    }
    else if (isFormula(value)) {
        result = evaluateFormula(value, cells, visited);
    }
    else {
        result = value;
    }

    visited.delete(ref);

    return result;
}

export const evaluateFormula = (formula: string, cells: Record<string, string>, visited = new Set<string>()): string => {

    let exp = formula.slice(1);
    exp = exp.replace(/SUM\((.*?)\)/g, (_, args): string => {
        const values = getValues(args, cells, visited);

        return String(values.reduce((sum, value) => sum + value, 0));
    });

    exp = exp.replace(/AVG\((.*?)\)/g, (_, args): string => {
        const values = getValues(args, cells, visited);

        if (values.length === 0) {
            return "0";
        }

        const sum = values.reduce((sum, value) => sum + value, 0);

        return String(sum / values.length);
    });

    exp = exp.replace(/MIN\((.*?)\)/g, (_, args): string => {
        const values = getValues(args, cells, visited);

        if (values.length === 0) {
            return "0";
        }

        return String(Math.min(...values));
    });

    exp = exp.replace(/MAX\((.*?)\)/g, (_, args): string => {
        const values = getValues(args, cells, visited);

        if (values.length === 0) {
            return "0";
        }

        return String(Math.max(...values));
    });

    exp = exp.replace(/COUNT\((.*?)\)/g, (_, args): string => {
        const values = getValues(args, cells, visited);

        return String(values.length);
    });

    const refs = getReferences(formula);

    for (const ref of refs) {
        const value =
            getCellValue(ref, cells, visited) || "0";

        if (value === "#CIRCULAR") {
            return "#CIRCULAR";
        }

        exp = exp.replaceAll(ref, value);
    }

    try {
        return String(
            Function(`return ${exp}`)()
        );
    } catch {
        return formula;
    }
}





export const expandRange = (exp: string): string[] => {
    const refs = exp.split(":").map((r: string) => r.trim())
    const start = refs[0];
    const end = refs[1];
    const startRow = parseInt(start.slice(1));
    const endRow = parseInt(end.slice(1));
    const startCol = start[0];
    const endCol = end[0];

    const result: string[] = [];

    for (let i = startCol.charCodeAt(0); i <= endCol.charCodeAt(0); i++) {
        const col = String.fromCharCode(i);
        for (let j = startRow; j <= endRow; j++) {
            result.push(`${col}${j}`);
        }
    }

    return result

}


export const getValues = (args: string, cells: Record<string, string>, visited: Set<string>): number[] => {
    const refs = args.split(",").map(r => r.trim())
    const values: number[] = []

    for (const ref of refs) {
        if (ref.includes(":")) {
            const parts = ref.split(":")
            if (!parts[0] || !parts[1]) {
                continue
            }

            const expanded = expandRange(ref)

            for (const cellRef of expanded) {
                const value = Number(getCellValue(cellRef, cells, visited));

                if (!Number.isNaN(value)) {
                    values.push(value);
                }
            }
        } else {
            const value = Number(getCellValue(ref, cells, visited));
            if (!Number.isNaN(value)) {
                values.push(value);
            }
        }
    }

    return values;
};