"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Spinner } from "../ui/spinner";
import Cell from "./cell";
import { useSelector } from "react-redux";
import SelectionOverlay from "../ui/SelectionOverlay";
import { ydoc, ycells, awareness } from "@/yjs/ydoc";
import { socket } from "@/lib/socket";
import * as Y from "yjs";
import useAuth from "@/hooks/useAuth";
import { applyAwarenessUpdate, encodeAwarenessUpdate } from "y-protocols/awareness.js";
import { presenceStore} from "@/lib/presenceStore";

const SheetGrid = () => {
  const ROWS = 10;
  const COLS = 10;

  const [cells, setCells] = useState<Record<string, string>>({});
  const params = useParams()
  const sheetId = params.sheetId
  const [loading, setLoading] = useState(true);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const isHydrating = useRef(false);
  const { user } = useAuth();




  useEffect(() => {
    const fetchSheet = async () => {
      try {
        setLoading(true)
        const res = await api.post(`/sheets/loadSheet`, { sheetId });
        isHydrating.current = true;

        const binary = res.data.sheet.yjsState?.data;

        if (binary?.length) {
          Y.applyUpdate(ydoc, new Uint8Array(binary), "load");
        }


        setCells(Object.fromEntries(ycells.entries()));

      } catch (error) {
        console.log("error in fetching sheet")
      } finally {
        setLoading(false);
        isHydrating.current = false;
      }

    };
    fetchSheet();
  }, [sheetId]);



  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(async () => {
      const update = Y.encodeStateAsUpdate(ydoc);

      await api.post(`/sheets/saveSheet`, { update: Array.from(update), sheetId })
    }, 1000)


    return () => clearTimeout(timer);

  }, [cells, sheetId, loading])



  const handleChange = useCallback((row: number, col: number, value: string) => {
    const cellId = `${row}-${col}`;

    ycells.set(cellId, value)
  },
    []
  );

  useEffect(() => {
    if (isHydrating.current) return

    const handler = () => {
      const obj = Object.fromEntries(ycells.entries()) as Record<string, string>;

      setCells(obj);

    };

    ycells.observe(handler);
    return () => ycells.unobserve(handler);

  }, [])



  useEffect(() => {
    if (!sheetId) return;

    const handleSocketUpdate = (update: ArrayBuffer) => {


      try {
        const uint8 = new Uint8Array(update);

        Y.applyUpdate(ydoc, uint8, "remote");


      } catch (err) {
        console.error("APPLY ERROR", err);
      }
    };

    socket.on("yjs-update", handleSocketUpdate);
    const handleYjsUpdate = (update: Uint8Array, origin: unknown) => {
      if (isHydrating.current) return;

      if (origin === "remote") return;

      socket.emit("yjs-update", { sheetId, update, });
    };


    ydoc.on("update", handleYjsUpdate);

    return () => {
      socket.off("yjs-update", handleSocketUpdate);
      ydoc.off("update", handleYjsUpdate);

    };
  }, [sheetId]);



  const isSelectingRef = useRef(false);

  useEffect(() => {
    const handleMouseUp = () => {
      isSelectingRef.current = false;
    };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);



  useEffect(() => {
    if (!user) return;
    awareness.setLocalStateField("user", {
      id: user.id,
    });
  }, [user]);


      const activeCell = useSelector((state: any) => state.selection.activeCell)

  useEffect(() => {

    if (!activeCell) return;
    const [activeRow, activeCol] = activeCell.split("-").map(Number);
    awareness.setLocalStateField("selection", {
      row: activeRow,
      col: activeCol
    })

  }, [activeCell])







useEffect(()=>{

const  handelAwarnessChange = ({added,updated,removed}:any,origin:any) =>{



if(origin == "remote") return;

  const changedClients = [
      ...added,
      ...updated,
      ...removed,
    ];

      const update = encodeAwarenessUpdate( awareness,changedClients);
       socket.emit("awareness-update",update,sheetId);
}

awareness.on("change",handelAwarnessChange)
 return () => {
    awareness.off("change", handelAwarnessChange);
  };


},[socket,sheetId])







useEffect(() => {

  socket.onAny((event) => {
    console.log("CLIENT EVENT:", event);
  });

  const handelAwarness = (update: any) => {

    applyAwarenessUpdate(awareness,new Uint8Array(update),"remote");
  };

  socket.on("awareness-update",handelAwarness
  );

  return () => {
    socket.off(
      "awareness-update",
      handelAwarness
    );
  };

}, [socket]);







  if (loading) {
    return <Spinner></Spinner>;
  }



  return (
    <div className="w-full overflow-x-auto">
      <div className="relative inline-block min-w-max">

        <SelectionOverlay></SelectionOverlay>

        <div className="flex">
          <div className="h-12 w-12 border" />

          {Array.from({ length: COLS }).map((_, col) => (
            <div
              key={col}
              className="h-12 w-20 border flex items-center justify-center font-bold"
            >
              {String.fromCharCode(65 + col)}
            </div>
          ))}
        </div>

        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="flex">
            <div className="h-12 w-12 border flex items-center justify-center font-bold">
              {row + 1}
            </div>

            {Array.from({ length: COLS }).map((_, col) => {
              const cellId = `${row}-${col}`;

              return (
                <Cell
                  key={cellId}
                  value={cells[cellId] || ""}
                  row={row}
                  col={col}
                  handleChange={handleChange}
                  isSelectingRef={isSelectingRef}
                  inputRefs={inputRefs}
                />
              );
            })}
          </div>
        ))}

      </div>
    </div>
  );
};

export default SheetGrid;