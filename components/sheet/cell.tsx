"use client"
import React from "react";
import {useSelector } from "react-redux";
import CellEditor from "./cellEditor";
import CellView from "./cellView";


type CellProps = {
  value: string;
  displayValue:string
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

const Cell = React.memo(({ value, row, col, handleChange, isSelectingRef, inputRefs,displayValue}: CellProps) => {

  console.log("cell rendered", row, col);

  const cellId = `${row}-${col}`;

 const isEditing = useSelector((state:any)=> state.selection.editingCell === cellId)
 
if(isEditing){
  return(
   <CellEditor
   
   value = {value}
  row = {row}
  col = {col}
  handleChange = {handleChange}
  inputRefs={inputRefs}
   ></CellEditor>
  )
}


return(
  <CellView
 value = {displayValue}
  row = {row}
  col = {col}
  isSelectingRef={isSelectingRef}
  
  ></CellView>
)


}
);



export default Cell;