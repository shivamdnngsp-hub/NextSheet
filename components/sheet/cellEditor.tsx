"use client"
import React, { useEffect } from "react";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCell, setEditingCell } from "@/redux/slices/selectionSlice";


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

const CellEditor = React.memo(({ value, row, col, handleChange, inputRefs }: CellProps) => {

  console.log("cell rendered", row, col);

  const dispatch = useDispatch()



  const cellId = `${row}-${col}`;


  const handleClick = () => {
    dispatch(setActiveCell(cellId));
  };


  const ROWS = 10;
  const COLS = 10;


  const stopEditing = () => {
    dispatch(setEditingCell(null));
  }



  console.log("ineditor")
  return (
    <Input
      data-cell-id={cellId}
      ref={(el) => {
        inputRefs.current[cellId] = el;
      }}
      value={value}
      onChange={(e) => {
        console.log("change", e.target.value);
        handleChange(row, col, e.target.value);
      }}
      onClick={handleClick}
      autoFocus
      onBlur={stopEditing}
      // onKeyDown={handleKeyDown}
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