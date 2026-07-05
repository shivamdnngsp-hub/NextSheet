"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Spinner } from "../ui/spinner";
import Cell from "./cell";
import { useDispatch, useSelector } from "react-redux";
import SelectionOverlay from "../ui/SelectionOverlay";

import { socket } from "@/lib/socket";
import * as Y from "yjs";
import useAuth from "@/hooks/useAuth";
import { applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from "y-protocols/awareness.js";
import { clientCellMap } from "@/lib/presenceStore";
import { getUserColor } from "@/lib/getColour";
import { setPresentUsers } from "@/redux/slices/presenceSlice";
import getYSheet from "@/yjs/ydoc";
import { setActiveCell, setEditingCell, setSelectionEnd, setSelectionStart } from "@/redux/slices/selectionSlice";
import { evaluateFormula, getCellValue, getReferences, isFormula } from "@/lib/formula/formulaEngine";
import { dependencyGraph } from "@/lib/formula/dependencyGraph";
import type { CellStyle } from "@/types/cellStyle";
import { useVirtualizer } from "@tanstack/react-virtual";



type SheetGridProps = {
  cells: Record<string, string>;
  setCells: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  styles: Record<string, CellStyle>;
  setStyles: React.Dispatch<
    React.SetStateAction<Record<string, CellStyle>>
  >;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  role: "owner" | "editor" | "viewer" | null;
  undoManagerRef: React.RefObject<Y.UndoManager | null>;
};

const SheetGrid = ({ cells, setCells, styles, setStyles, setSaving, role, undoManagerRef }: SheetGridProps) => {
  const ROWS = 1000;
  const COLS = 26;
  const params = useParams()
  const sheetId = params.sheetId as string
  const [loading, setLoading] = useState(true);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const isHydrating = useRef(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const activeCell = useSelector((state: any) => state.selection.activeCell)
  const { selectionStart, selectionEnd } = useSelector((state: any) => state.selection);
  const { ydoc, ycells, ystyles, awareness } = getYSheet(sheetId);
  const [loadError, setLoadError] = useState("");



  const ROW_HEIGHT = 48;

  const scrollRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: ROWS,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });



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
    if (role === "viewer") return;
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
    if (role === "viewer") return;
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
        const res = await api.post(`/sheets/loadSheet`, { sheetId });
        setLoadError("");
        isHydrating.current = true;
        const binary = res.data.sheet.yjsState?.data;
        console.log("sheet", sheetId);
        console.log("binary length", binary?.length);
        console.log("before hydrate", ycells.size);

        if (binary?.length) {
          Y.applyUpdate(ydoc, new Uint8Array(binary), "remote");
        }

        console.log("after hydrate", ycells.size);


        setCells(Object.fromEntries(ycells.entries()));
        setStyles(Object.fromEntries(ystyles.entries()) as Record<string, CellStyle>);

      } catch (error: any) {
        if (error.response?.status === 404 || error.response?.status === 403) {
          setLoadError("You are not authorized to access this sheet.");
        } else {
          setLoadError("Failed to load sheet.");

        }
      } finally {
        setLoading(false);
        isHydrating.current = false;
      }

    };
    socket.on("collaboration-update", fetchSheet);
    fetchSheet();
    return () => { socket.off("collaboration-update", fetchSheet); }
  }, [sheetId, user]);


  useEffect(() => {
    if (!role) return;

    socket.emit("join-sheet", {
      sheetId,
      clientId: awareness.clientID,
    });

    return () => {
      socket.emit("leave-sheet", sheetId);
    };
  }, [role, sheetId]);



  useEffect(() => {
    if (loading) return;
    if (!role || role === "viewer") return;

    setSaving(true);

    const timer = setTimeout(async () => {
      try {
        const update = Y.encodeStateAsUpdate(ydoc);

        await api.post("/sheets/saveSheet", {
          update: Array.from(update),
          sheetId,
        });
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [cells, role]);



  const handleChange = useCallback((row: number, col: number, value: string) => {
    if (role === "viewer") return;
    const cellId = `${row}-${col}`;

    if (isFormula(value)) {
      const refs = getReferences(value)
      for (const ref of refs) {
        const currentCell = `${String.fromCharCode(65 + col)}${row + 1}`;


        if (!dependencyGraph.has(ref)) {
          dependencyGraph.set(ref, new Set())
        }

        dependencyGraph.get(ref)?.add(currentCell)
      }
      console.log(dependencyGraph)

    }

    ycells.set(cellId, value)
  },
    []
  );






  useEffect(() => {
    if (!role) return;
    if (isHydrating.current) return

    const handler = () => {
      const obj = Object.fromEntries(ycells.entries()) as Record<string, string>;
      setCells(obj);
      setStyles(Object.fromEntries(ystyles.entries()) as Record<string, CellStyle>);
    };

    ycells.observe(handler);
    ystyles.observe(handler);
    return () => {
      ycells.unobserve(handler);
      ystyles.unobserve(handler);
    };

  }, [role])



  useEffect(() => {
    if (!role) return;
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
  }, [sheetId, role]);



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
    if (!role) return;
    if (!user) return;
    awareness.setLocalStateField("user", {
      id: user.id,
      userName: user.userName,
      color: getUserColor(user.id),
    });
  }, [user, role]);




  useEffect(() => {

    if (!activeCell) return;
    const [activeRow, activeCol] = activeCell.split("-").map(Number);
    awareness.setLocalStateField("selection", {
      row: activeRow,
      col: activeCol
    })

  }, [activeCell])





  useEffect(() => {
    if (!role) return;
    const handelAwarnessChange = ({ added, updated, removed }: any, origin: any) => {


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
          ele.style.boxShadow = `inset 0 0 0 2px ${color}`;
          ele.style.backgroundColor = `${color}10`;
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

          if (ele) {
            ele.style.boxShadow = "";
            ele.style.backgroundColor = "";
          }
        }


        const ele = document.querySelector(`[data-cell-id="${newCellId}"]`) as HTMLElement;
        if (ele) {
          ele.style.boxShadow = `inset 0 0 0 2px ${color}`;
          ele.style.backgroundColor = `${color}10`;
        }

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
            ele.style.boxShadow = "";
            ele.style.backgroundColor = "";
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


  }, [socket, sheetId, role])







  useEffect(() => {

    if (!role) return;
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

  }, [socket, role]);



  useEffect(() => {
    if (!role) return;
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
  }, [role]);


  useEffect(() => {
    if (!role) return;
    const update = encodeAwarenessUpdate(awareness, [awareness.clientID]);

    socket.emit("awareness-update", update, sheetId);


    const interval = setInterval(() => {
      const update = encodeAwarenessUpdate(awareness, [awareness.clientID]);

      socket.emit("awareness-update", update, sheetId);
    }, 15000);

    return () => clearInterval(interval);
  }, [role]);


  useEffect(() => {
    if (!role) return;

    const handlePresenceSync = () => {
      const update = encodeAwarenessUpdate(awareness, [awareness.clientID]);

      socket.emit("awareness-update", update, sheetId);
    };

    socket.on("awareness-request", handlePresenceSync);

    return () => {
      socket.off("awareness-request", handlePresenceSync);
    };
  }, [role, sheetId]);



  const editingCell = useSelector(
    (state: any) => state.selection.editingCell
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell) return;

      if (editingCell) {
        switch (e.key) {
          case "Escape":
            e.preventDefault();
            dispatch(setEditingCell(null));
            return;

          case "Enter":
            e.preventDefault();
            dispatch(setEditingCell(null));
            return;

          default:
            return;
        }
      }

      const [row, col] = activeCell.split("-").map(Number);

      let newRow = row;
      let newCol = col;


      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          newRow = row === 0 ? ROWS - 1 : row - 1;
          break;

        case "ArrowDown":
          e.preventDefault();
          newRow = row === ROWS - 1 ? 0 : row + 1;
          break;

        case "ArrowLeft":
          e.preventDefault();
          newCol = col === 0 ? COLS - 1 : col - 1;
          break;

        case "ArrowRight":
          e.preventDefault();
          newCol = col === COLS - 1 ? 0 : col + 1;
          break;

        case "Enter":
          e.preventDefault();
          if (role === "viewer") return;
          dispatch(setEditingCell(activeCell));
          return;
        case "Backspace":
          if (role === "viewer") return;
          e.preventDefault()
          dispatch(setEditingCell(activeCell));
          return;

        default: {
          if (role === "viewer") return;
          const isCharacter =
            e.key.length === 1 &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey;

          if (!isCharacter) return;

          e.preventDefault();

          handleChange(row, col, e.key);

          dispatch(setEditingCell(activeCell));
          return;
        }
      }

      if (newRow !== row) {
        rowVirtualizer.scrollToIndex(newRow, {
          align: "center",
        });
      }

      if (newCol !== col && scrollRef.current) {
        const CELL_WIDTH = 80;
        const ROW_HEADER_WIDTH = 48;

        const cellLeft = ROW_HEADER_WIDTH + newCol * CELL_WIDTH;
        const cellRight = cellLeft + CELL_WIDTH;

        const visibleLeft = scrollRef.current.scrollLeft;
        const visibleRight =
          visibleLeft + scrollRef.current.clientWidth;

        if (cellRight > visibleRight) {
          scrollRef.current.scrollLeft =
            cellRight - scrollRef.current.clientWidth;
        }

        if (cellLeft < visibleLeft) {
          scrollRef.current.scrollLeft = cellLeft;
        }
      }

      const newCellId = `${newRow}-${newCol}`;

      dispatch(setActiveCell(newCellId));
      dispatch(setSelectionStart(newCellId));
      dispatch(setSelectionEnd(newCellId));
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCell, editingCell, dispatch, role, rowVirtualizer]);




  if (loading) {
    return <Spinner></Spinner>;
  }


  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Access Denied
          </h2>

          <p className="text-muted-foreground mt-2">
            {loadError}
          </p>
        </div>
      </div>
    );
  }





  return (
    <div className="w-full overflow-auto h-[75vh]" ref={scrollRef}>
      <div className="relative inline-block min-w-max">



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

        <div
          className="relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          <SelectionOverlay></SelectionOverlay>

          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = virtualRow.index;
            return (
              <div key={virtualRow.key} className="absolute left-0 flex"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="h-12 w-12 border flex items-center justify-center font-bold">
                  {row + 1}
                </div>

                {Array.from({ length: COLS }).map((_, col) => {
                  const cellId = `${row}-${col}`;

                  const value = cells[cellId] || "";
                  const displayValue = isFormula(value) ? evaluateFormula(value, cells) : value;

                  return (
                    <Cell
                      key={cellId}
                      value={value}
                      style={styles[cellId]}
                      displayValue={displayValue}
                      row={row}
                      col={col}
                      handleChange={handleChange}
                      isSelectingRef={isSelectingRef}
                      inputRefs={inputRefs}
                      role={role}
                    />
                  );
                })}
              </div>
            )
          }
          )}
        </div>

      </div>
    </div>
  );
};

export default SheetGrid;
