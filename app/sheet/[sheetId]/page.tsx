"use client";

import { ModeToggle } from "@/components/modeToggle";
import SheetGrid from "@/components/sheet/sheetGrid";
import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import { socket } from "@/lib/socket";
import { clearSelection } from "@/redux/slices/selectionSlice";
import getYSheet from "@/yjs/ydoc";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Sheet = () => {
  const params = useParams();
  const dispatch = useDispatch()
  const presentUser = useSelector((state: any) => state.presence.presentUser)
  const {user,loading} = useAuth();
  const sheetId = params.sheetId as string
  const {awareness} = getYSheet(sheetId)
 const presentUserExcludingMe = presentUser

  .filter((present:any) =>present?.id?.toString() !== user?.id?.toString())
  .filter((present: any, index: number, arr: any[]) =>index === arr.findIndex((p) => p.id === present.id));
 

 console.log("auth user", user?.id);
console.log("presence users", presentUser);


useEffect(()=>{
if(!params.sheetId){
  return;
}

socket.emit("join-sheet", {sheetId: params.sheetId,clientId: awareness.clientID,});

  return () => {
    socket.emit("leave-sheet", params.sheetId);
  };

},[params.sheetId])

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


  return (
  <div>
  <div className="flex items-center justify-between p-4">
    <p>{params.sheetId}</p>

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

      <ModeToggle />
    </div>
  </div>

  <SheetGrid />
</div>
  );
};

export default Sheet;