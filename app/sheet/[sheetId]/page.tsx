"use client";

import { ModeToggle } from "@/components/modeToggle";
import SheetGrid from "@/components/sheet/sheetGrid";
import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const Sheet = () => {
  const params = useParams();

useEffect(()=>{
if(!params.sheetId){
  return;
}

socket.emit("join-sheet",params.sheetId)


  return () => {
    socket.emit("leave-sheet", params.sheetId);
  };

},[params.sheetId])




  return (
  <div>
  <div className="flex items-center justify-between p-4">
    <p>{params.sheetId}</p>
    <ModeToggle />
  </div>

  <SheetGrid />
</div>
  );
};

export default Sheet;