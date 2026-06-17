import React from "react";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCell} from "@/redux/slices/selectionSlice";


type CellProps = {
  value: string;
  row: number;
  col: number;
  handleChange: (
    row: number,
    col: number,
    value: string
  ) => void;
  inputRefs: React.RefObject<Record<string, HTMLInputElement | null>>;

};

const CellEditor = React.memo(({ value, row, col, handleChange,  inputRefs }: CellProps) => {

  console.log("cell rendered", row, col);

  const dispatch = useDispatch()



  const cellId = `${row}-${col}`;

 
  const handleClick = () => {
    dispatch(setActiveCell(cellId));
  };


  const ROWS = 10;
  const COLS = 10;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newRow = row;
    let newCol = col;
    const input = e.currentTarget as HTMLInputElement;
    const valueLength = input.value.length;

    switch (e.key) {
      case "ArrowUp":
        newRow = row === 0 ? ROWS - 1 : row - 1;
        break;

      case "ArrowDown":
        newRow = row === ROWS - 1 ? 0 : row + 1;
        break;

      case "ArrowLeft":
        if (valueLength > 0) {
          return;
        }
        newCol = col === 0 ? COLS - 1 : col - 1;
        break;

      case "ArrowRight":
        if (valueLength > 0) {
          return;
        }
        newCol = col === COLS - 1 ? 0 : col + 1;
        break;

      default:
        return;
    }

    e.preventDefault();

    const newCellId = `${newRow}-${newCol}`;

    dispatch(setActiveCell(newCellId));
   
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
      onKeyDown={handleKeyDown}
      className={`
  h-12
  w-20
  px-2
  rounded-none
  
`}
    />
  );
}
);



export default CellEditor;