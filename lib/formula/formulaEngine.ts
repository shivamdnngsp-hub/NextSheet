export const isFormula = (value?: string) => {
    if (!value) return false;
    return value.startsWith("=");
}

export const getReferences = (formula: string) => {
    return formula.match(/[A-Z]+\d+/g) || [];
}
export const getCellValue = (ref: string, cells: Record<string, string>,visited = new Set<string>()): string => {

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
        result = evaluateFormula( value, cells, visited);
    }
    else {
        result = value;
    }

    visited.delete(ref);

    return result;
}


export const evaluateFormula = (formula: string, cells: Record<string, string>, visited = new Set<string>()): string => {

    const refs = getReferences(formula);

    let exp = formula.slice(1);
    for (const ref of refs) {

       const value = getCellValue( ref, cells, visited) || "0";
          
       if (value === "#CIRCULAR") {
        return "#CIRCULAR";
     }


        exp = exp.replace(ref, value)
    }
    try {
        return String(Function(`return ${exp}`)());
    } catch {
        return formula;
    }
}