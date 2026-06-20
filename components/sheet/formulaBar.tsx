
import { useSelector } from "react-redux"
type FormulaBarProps = {
    cells: Record<string, string>;
};

const FormulaBar = ({ cells }: FormulaBarProps) => {

    const activeCell = useSelector((state: any) => state.selection.activeCell)

    const display = cells[activeCell] || "";

    return (
        <div className="flex items-center gap-2 px-2 py-1 border-b">
            <div className="text-sm text-muted-foreground">fx</div>

            <div className="min-w-50 max-w-75 rounded border px-2 py-1 text-sm h-7">
                {display}
            </div>
        </div>
    );
};


export default FormulaBar;