"use client";

import { ModeToggle } from "@/components/modeToggle";
import FormulaBar from "@/components/sheet/formulaBar";
import SheetGrid from "@/components/sheet/sheetGrid";
import ToolBar from "@/components/toolBar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import { socket } from "@/lib/socket";
import { clearSelection, setActiveCell } from "@/redux/slices/selectionSlice";
import getYSheet from "@/yjs/ydoc";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;

  textColor?: string;
  backgroundColor?: string;

  fontSize?: number;
  fontFamily?: string;

  textAlign?: "left" | "center" | "right";
};



const Sheet = () => {
  const params = useParams();
  const dispatch = useDispatch()
  const presentUser = useSelector((state: any) => state.presence.presentUser)
  const {user,loading} = useAuth();
  const sheetId = params.sheetId as string
   const [cells, setCells] = useState<Record<string, string>>({});
   const [styles, setStyles] = useState<Record<string, CellStyle>>({});
  const {awareness} = getYSheet(sheetId)
 const presentUserExcludingMe = presentUser
 .filter((present:any) =>present?.id?.toString() !== user?.id?.toString())
.filter((present: any, index: number, arr: any[]) =>index === arr.findIndex((p) => p.id === present.id));
const [copied,setCopied] = useState<boolean>(false)

 

 console.log("auth user", user?.id);
console.log("presence users", presentUser);




useEffect(() => {
  dispatch(clearSelection());

  return () => {
    dispatch(clearSelection());
  };
}, [params.sheetId]);




useEffect(()=>{
console.log("here",presentUser)
},[presentUser])


if(loading || !user){
  return (
    <Spinner></Spinner>
  )
}
const handleCopy = async ()=>{
  
await  navigator.clipboard.writeText(window.location.href);
setCopied(true)
setTimeout(()=>{
  setCopied(false);
},2000)
}


  return (
  <div>
  <div className="flex items-center justify-between p-4">
    <p>{params.sheetId}</p>
    <ToolBar styles={styles}/>

    <div className="flex items-center gap-2">
      {presentUserExcludingMe.map((Puser: any) => (
        <div
          key={Puser.id}
          className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold cursor-default"
          style={{ backgroundColor: Puser.color }}
          title={Puser.userName}
        >
          {Puser.userName[0].toUpperCase()}
        </div>
      ))}
    
      <Button onClick = {handleCopy}>
        {copied ? "Copied": "Copy Link"}
      </Button>
      <ModeToggle />
    </div>
  </div>
   <FormulaBar cells={cells}></FormulaBar>
  <SheetGrid cells={cells} setCells={setCells} styles={styles} setStyles={setStyles}
/>
</div>
  );
};

export default Sheet;