import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCell, setEditingCell, setSelectionEnd, setSelectionStart, } from "@/redux/slices/selectionSlice";

type CellViewProps = {
  value: string;
  row: number;
  col: number;
  isSelectingRef: React.RefObject<boolean>;
  role: "owner" | "editor" | "viewer" | null;
};



const CellView = React.memo(({ value, row, col, isSelectingRef , role}: CellViewProps) => {
  const dispatch = useDispatch();

  const cellId = `${row}-${col}`;

  const isActive = useSelector(
    (state: any) => state.selection.activeCell === cellId
  );
  const handleClick = () => {
    dispatch(setActiveCell(cellId));
  };
  const handleDoubleClick = () => {
    if(role === "viewer") return 
    dispatch(setActiveCell(cellId));
    dispatch(setEditingCell(cellId));
  };


  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    isSelectingRef.current = true;

    dispatch(setSelectionStart(cellId));
    dispatch(setSelectionEnd(cellId));
  };

  const handlePointerEnter = () => {
    if (!isSelectingRef.current) return;
    dispatch(setSelectionEnd(cellId));
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isSelectingRef.current) return;

    const element = document.elementFromPoint(
      e.clientX,
      e.clientY
    );

    const hoveredCellId =
      element?.getAttribute("data-cell-id");

    if (hoveredCellId) {
      dispatch(setSelectionEnd(hoveredCellId));
    }
  };

  
  console.log("inCellView")

  return (
    <div
      data-cell-id={cellId}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      className={`
          h-12 w-20 px-2 flex items-center overflow-hidden whitespace-nowrap border border-input bg-background text-foreground
          select-none
          ${isActive
          ? "border-2 border-blue-500 border-dashed"
          : ""
        }
        `}
    >
      {value}
    </div>
  );
}
);

export default CellView;