"use client"
import React, { useEffect } from "react";
import { Input } from "../ui/input";
import { useDispatch} from "react-redux";
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
  role: "owner" | "editor" | "viewer" | null;
};

const CellEditor = React.memo(({ value, row, col, handleChange, inputRefs ,role}: CellProps) => {

  console.log("cell rendered", row, col);

  const dispatch = useDispatch()



  const cellId = `${row}-${col}`;


  const handleClick = () => {
    dispatch(setActiveCell(cellId));
  };



  const stopEditing = () => {
    dispatch(setEditingCell(null));
  }
const viewer = role === "viewer";

  console.log("ineditor")
  return (
    <Input
      data-cell-id={cellId}
      disabled = {viewer}
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