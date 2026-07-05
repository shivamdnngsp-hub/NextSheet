"use client"

import { useSelector } from "react-redux";

const SelectionOverlay = ()=>{

  const {selectionStart, selectionEnd} = useSelector((state: any) => state.selection);
    if (!selectionStart || !selectionEnd) return null;

    const [startRow, startCol] = selectionStart.split("-").map(Number);
  const [endRow, endCol] = selectionEnd.split("-").map(Number);


  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);


    const cellWidth = 80;
  const cellHeight = 48;

  const left = 48 + minCol * cellWidth;
  const top = minRow * cellHeight;

  const width = (maxCol - minCol + 1) * cellWidth;
  const height = (maxRow - minRow + 1) * cellHeight;

  return (
    <div
      className="absolute border-2  z-10 border-blue-500 pointer-events-none"
      style={{
        left,
        top,
        width,
        height,
      }}
    />
  );


}
export default SelectionOverlay;