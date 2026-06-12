"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Spinner } from "../ui/spinner";
import Cell from "./cell";
import { useDispatch, useSelector } from "react-redux";
import SelectionOverlay from "../ui/SelectionOverlay";
import { ydoc, ycells, awareness } from "@/yjs/ydoc";
import { socket } from "@/lib/socket";
import * as Y from "yjs";
import useAuth from "@/hooks/useAuth";
import { applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from "y-protocols/awareness.js";
import { clientCellMap } from "@/lib/presenceStore";
import { getUserColor } from "@/lib/getColour";
import { setPresentUsers } from "@/redux/slices/presenceSlice";
import { number } from "zod";


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
  const dispatch = useDispatch();
  const activeCell = useSelector((state: any) => state.selection.activeCell)
  const { selectionStart, selectionEnd } = useSelector((state: any) => state.selection);
  const undoManagerRef = useRef<Y.UndoManager | null>(null);



  const handleCopy = async () => {

    const [startRow, startCol] = selectionStart.split("-").map(Number);
    const [endRow, endCol] = selectionEnd.split("-").map(Number)

    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    let result = "";
    for (let r = minRow; r <= maxRow; r++) {
      const rowValues = [];
      for (let c = minCol; c <= maxCol; c++) {
        const cellId = `${r}-${c}`;
        rowValues.push(cells[cellId] || "")
      }
      const rowText = rowValues.join("\t");
      result += rowText;
      if (r < maxRow) {
        result += "\n";
      }
    }

    await navigator.clipboard.writeText(result)
  }

  const handlePaste = async () => {
    const value = await navigator.clipboard.readText();
    const rows = value.split(/\r?\n/);

    const [baseRow, baseCol] = activeCell.split("-").map(Number);

    rows.forEach((rowText, rowIndex) => {
      const cols = rowText.split("\t");
      cols.forEach((text, colIndex) => {
        const targetRow = baseRow + rowIndex;
        const targetCol = baseCol + colIndex;

        ycells.set(`${targetRow}-${targetCol}`, text);
      });
    });
  }

  const handleCut = async () => {
    const [startRow, startCol] = selectionStart.split("-").map(Number);
    const [endRow, endCol] = selectionEnd.split("-").map(Number)

    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    let result = "";
    for (let r = minRow; r <= maxRow; r++) {
      const rowValues = [];
      for (let c = minCol; c <= maxCol; c++) {
        const cellId = `${r}-${c}`;
        rowValues.push(cells[cellId] || "")
      }
      const rowText = rowValues.join("\t");
      result += rowText;
      if (r < maxRow) {
        result += "\n";
      }
    }

    await navigator.clipboard.writeText(result)

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cellId = `${r}-${c}`;

        ycells.set(cellId, "");
      }
    }

  }


  useEffect(() => {

    const handleKeyDown = (e: any) => {
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleCopy()
      }

      if (e.ctrlKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        handlePaste()
      }

      if (e.ctrlKey && e.key.toLowerCase() === "x") {
        e.preventDefault();
        handleCut()
      }






    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)


  }, [activeCell, cells, selectionStart, selectionEnd])





















  useEffect(() => {
    undoManagerRef.current = new Y.UndoManager(ycells);
  }, []);


  useEffect(() => {
    const handleKeyDown = (e: any) => {

      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undoManagerRef.current?.undo();
      }

      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        undoManagerRef.current?.redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);






















  useEffect(() => {
     if (!user) return;
    const fetchSheet = async () => {
      try {
        setLoading(true)
        console.log(sheetId)
        const res = await api.post(`/sheets/loadSheet`, { sheetId });
        isHydrating.current = true;

        const binary = res.data.sheet.yjsState?.data;

        if (binary?.length) {
          Y.applyUpdate(ydoc, new Uint8Array(binary), "load");
        }


        setCells(Object.fromEntries(ycells.entries()));

      } catch (error: any) {
        console.log(error.response?.data);
        console.log(error);
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
      userName: user.userName,
      color: getUserColor(user.id),
    });
  }, [user]);




  useEffect(() => {

    if (!activeCell) return;
    const [activeRow, activeCol] = activeCell.split("-").map(Number);
    awareness.setLocalStateField("selection", {
      row: activeRow,
      col: activeCol
    })

  }, [activeCell])





  useEffect(() => {

    const handelAwarnessChange = ({ added, updated, removed }: any, origin: any) => {


      console.log("added", added);
      console.log("updated", updated);
      console.log("removed", removed);
      console.log("states", [...awareness.getStates().entries()]);

      type PresentUser = {
        id: string;
        userName: string;
        color: string;
      };


      const user: PresentUser[] = []

      awareness.getStates().forEach((state: any) => {
        if (state?.user) {
          user.push(state.user)
        }
      })

      dispatch(setPresentUsers(user))


      added.forEach((clientId: any) => {
        if (clientId == awareness.clientID) return
        const state = awareness.getStates().get(clientId)

        if (!state?.selection) return;
        const cellId = `${state.selection.row}-${state.selection.col}`;
        const color = state.user?.color

        const ele = document.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement;
        if (ele) {
          ele.classList.add("border-2", "border-dashed")
          ele.style.borderColor = color;
        }

        clientCellMap.set(clientId, cellId);

      })


      updated.forEach((clientId: any) => {

        if (clientId == awareness.clientID) return
        const state = awareness.getStates().get(clientId);

        if (!state?.selection) return;

        const newCellId = `${state.selection.row}-${state.selection.col}`;
        const oldCellId = clientCellMap.get(clientId)
        const color = state.user?.color

        if (oldCellId) {
          const ele = document.querySelector(`[data-cell-id="${oldCellId}"]`) as HTMLElement;

          ele?.classList.remove("border-2", "border-dashed");
          if (ele) {
            ele.style.borderColor = "";
          }
        }


        const ele = document.querySelector(`[data-cell-id="${newCellId}"]`) as HTMLElement;
        if (ele) {
          ele.classList.add("border-2", "border-dashed")
          ele.style.borderColor = color;
        }



        console.log("old", oldCellId);
        console.log("new", newCellId);

        clientCellMap.set(clientId, newCellId);
      });



      removed.forEach((clientId: any) => {
        if (clientId == awareness.clientID) return
        const state = awareness.getStates().get(clientId);
        const color = state?.user?.color
        if (!state) {

          const oldCellId = clientCellMap.get(clientId);
          const ele = document.querySelector(`[data-cell-id="${oldCellId}"]`) as HTMLElement;
          if (ele) {
            ele.classList.remove("border-2", "border-dashed");
            ele.style.borderColor = "";
          }

          clientCellMap.delete(clientId);
        }
      });


      if (origin == "remote") return;

      const changedClients = [
        ...added,
        ...updated,
        ...removed,
      ];

      const update = encodeAwarenessUpdate(awareness, changedClients);
      socket.emit("awareness-update", update, sheetId);
    }

    awareness.on("change", handelAwarnessChange)
    return () => {
      awareness.off("change", handelAwarnessChange);
    };


  }, [socket, sheetId])







  useEffect(() => {


    const handelAwarness = (update: any) => {

      applyAwarenessUpdate(awareness, new Uint8Array(update), "remote");
    };

    socket.on("awareness-update", handelAwarness
    );

    return () => {
      socket.off(
        "awareness-update",
        handelAwarness
      );
    };

  }, [socket]);



  useEffect(() => {
    const handleClientDisconnect = (clientId: number) => {
      removeAwarenessStates(awareness, [clientId], "remote");
    };

    socket.on("awareness-client-disconnected", handleClientDisconnect);

    return () => {
      socket.off(
        "awareness-client-disconnected",
        handleClientDisconnect
      );
    };
  }, []);


  useEffect(() => {

    const update = encodeAwarenessUpdate(
      awareness,
      [awareness.clientID]
    );

    socket.emit("awareness-update", update, sheetId);


    const interval = setInterval(() => {
      const update = encodeAwarenessUpdate(awareness, [awareness.clientID]);

      socket.emit("awareness-update", update, sheetId);
    }, 15000);

    return () => clearInterval(interval);
  }, []);












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