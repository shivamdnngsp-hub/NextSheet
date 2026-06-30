"use client";

import { ModeToggle } from "@/components/modeToggle";
import FormulaBar from "@/components/sheet/formulaBar";
import SheetGrid from "@/components/sheet/sheetGrid";
import ToolBar from "@/components/toolBar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
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
  const [saving,setSaving] = useState(false);
const [title, setTitle] = useState("");
  const [role, setRole] = useState<"owner" | "editor" | "viewer" | null>(null);

useEffect(() => {
  const fetchMeta = async () => {
    const res = await api.post("/sheets/fetchSheetInfo", {sheetId});
    setTitle(res.data.title);
    setRole(res.data.role);
  };

  fetchMeta();
}, [sheetId]);




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
  <div className="w-full">
    <div className="border-b bg-background">

     
      <div className="flex items-center justify-between gap-4 px-4 py-3">

      
        <div className="flex min-w-0 items-center gap-3">

        
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900/40 text-base font-bold text-emerald-400">
            {title?.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <h1 className="truncate text-lg font-semibold">
                {title}
              </h1>

              <div className="flex -space-x-2 sm:hidden">
                {presentUserExcludingMe.map((Puser: any) => (
                  <div
                    key={Puser.id}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold text-white"
                    style={{ backgroundColor: Puser.color }}
                    title={Puser.userName}
                  >
                    {Puser.userName[0].toUpperCase()}
                  </div>
                ))}
              </div>

            </div>

            <p className="truncate text-xs text-muted-foreground">
              Collaborative Spreadsheet
            </p>

          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">

          <div className="hidden items-center -space-x-2 sm:flex">
            {presentUserExcludingMe.map((Puser: any) => (
              <div
                key={Puser.id}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: Puser.color }}
                title={Puser.userName}
              >
                {Puser.userName[0].toUpperCase()}
              </div>
            ))}
          </div>

          <span className="whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
            {saving ? "Saving..." : "✓ Saved"}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? "Copied" : "Share"}
          </Button>

          <ModeToggle />
        </div>
      </div>

      <div className="overflow-x-auto border-y">
        <ToolBar styles={styles} />
      </div>

   
      <div className="relative border-b">
  <FormulaBar cells={cells} />

  <div className="absolute right-4 top-1/2 -translate-y-1/2">
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        role === "owner"
          ? "bg-emerald-500/15 text-emerald-500"
          : role === "editor"
          ? "bg-blue-500/15 text-blue-500"
          : "bg-amber-500/15 text-amber-500"
      }`}
    >
      {role}
    </span>
  </div>
</div>
    </div>


    <div className="overflow-auto">
      <SheetGrid
        cells={cells}
        setCells={setCells}
        styles={styles}
        setStyles={setStyles}
        setSaving={setSaving}
        role={role}
      />
    </div>
  </div>
);
};

export default Sheet;