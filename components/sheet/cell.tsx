import React from "react";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCell, setSelectionEnd, setSelectionStart } from "@/redux/slices/selectionSlice";


type CellProps = {
  value: string;
  row: number;
  col: number;
  handleChange: (
    row: number,
    col: number,
    value: string
  ) => void;
  isSelectingRef: React.RefObject<boolean>;
  inputRefs: React.RefObject<Record<string, HTMLInputElement | null>>;

};

const Cell = React.memo(({ value, row, col, handleChange, isSelectingRef, inputRefs }: CellProps) => {

  console.log("cell rendered", row, col);

  const dispatch = useDispatch()



  const cellId = `${row}-${col}`;

  const isActive = useSelector(
    (state: any) => state.selection.activeCell === cellId
  );

  const handleClick = () => {
    dispatch(setActiveCell(cellId));
  };
const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
  e.currentTarget.setPointerCapture(e.pointerId);
  isSelectingRef.current = true;

  dispatch(setSelectionStart(cellId));
  dispatch(setSelectionEnd(cellId));
};

const handlePointerEnter = () => {
  if (!isSelectingRef.current) return;
  dispatch(setSelectionEnd(cellId));
};
const handlePointerMove = (e: React.PointerEvent) => {
  if (!isSelectingRef.current) return;

  const element = document.elementFromPoint(
    e.clientX,
    e.clientY
  );

  const cellId = element?.getAttribute("data-cell-id");

  if (cellId) {
    dispatch(setSelectionEnd(cellId));
  }
};

  const ROWS = 10;
  const COLS = 10;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newRow = row;
    let newCol = col;

    switch (e.key) {
      case "ArrowUp":
        newRow = row === 0 ? ROWS - 1 : row - 1;
        break;

      case "ArrowDown":
        newRow = row === ROWS - 1 ? 0 : row + 1;
        break;

      case "ArrowLeft":
        newCol = col === 0 ? COLS - 1 : col - 1;
        break;

      case "ArrowRight":
        newCol = col === COLS - 1 ? 0 : col + 1;
        break;

      default:
        return;
    }

    e.preventDefault();

    const newCellId = `${newRow}-${newCol}`;

    dispatch(setActiveCell(newCellId));
    dispatch(setSelectionStart(newCellId));
    dispatch(setSelectionEnd(newCellId));
    inputRefs.current[newCellId]?.focus();
  };



  return (
    <Input
     data-cell-id={cellId}
      ref={(el) => {
        inputRefs.current[cellId] = el;
      }}
      value={value}
      onChange={(e) => handleChange(row, col, e.target.value)}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
  onPointerEnter={handlePointerEnter}
  onPointerMove={handlePointerMove}
  onKeyDown={handleKeyDown}

      className={`
  h-12
  w-20
  px-2
  rounded-none
  ${isActive ? "border-2 border-blue-500 border-dashed" : ""}
`}
    />
  );
}
);



export default Cell;