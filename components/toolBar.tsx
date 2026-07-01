"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  PaintBucket,
  Type,
  Underline,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";

import { useSelector } from "react-redux";
import { useParams } from "next/navigation";

import getYSheet from "@/yjs/ydoc";
import { styleUpdate } from "@/lib/styles/updateStyles";
import type { CellStyle } from "@/types/cellStyle";

type ToolBarProps = {
  styles: Record<string, CellStyle>;
   role: "owner" | "editor" | "viewer" | null;
};

const fontSizes = [10, 12, 14, 16];

const ToolBar = ({ styles ,role}: ToolBarProps) => {
  const params = useParams();
  const sheetId = params.sheetId as string;

  const activeCell = useSelector(
    (state: any) => state.selection.activeCell
  );

  const { ystyles } = getYSheet(sheetId);

  const currentStyle =activeCell && styles[activeCell] ? styles[activeCell] : {};

  return (
  <div
    className={`flex w-full items-center gap-2 overflow-x-auto border-b bg-background px-4 py-3 whitespace-nowrap transition-opacity ${
      (!activeCell || role == "viewer")? "opacity-50" : "opacity-100"
    }`}
  >
    <Button
      disabled={!activeCell || role == "viewer" }
      size="icon"
      className="h-9 w-9 shrink-0"
      variant={currentStyle.bold ? "default" : "outline"}
      onClick={() =>
        styleUpdate(ystyles, activeCell!, {
          bold: !currentStyle.bold,
        })
      }
    >
      <Bold className="h-4 w-4" />
    </Button>

    <Button
      disabled={!activeCell || role == "viewer" }
      size="icon"
      className="h-9 w-9 shrink-0"
      variant={currentStyle.italic ? "default" : "outline"}
      onClick={() =>
        styleUpdate(ystyles, activeCell!, {
          italic: !currentStyle.italic,
        })
      }
    >
      <Italic className="h-4 w-4" />
    </Button>

    <Button
      disabled={!activeCell || role == "viewer" }
      size="icon"
      className="h-9 w-9 shrink-0"
      variant={currentStyle.underline ? "default" : "outline"}
      onClick={() =>
        styleUpdate(ystyles, activeCell!, {
          underline: !currentStyle.underline,
        })
      }
    >
      <Underline className="h-4 w-4" />
    </Button>

    <Separator orientation="vertical" className="mx-1 h-7" />

    <Select
      disabled={!activeCell || role == "viewer" }
      value={String(currentStyle.fontSize ?? 14)}
      onValueChange={(value) =>
        styleUpdate(ystyles, activeCell!, {
          fontSize: Number(value),
        })
      }
    >
      <SelectTrigger className="h-9 w-20 shrink-0">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {fontSizes.map((size) => (
          <SelectItem key={size} value={String(size)}>
            {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Separator orientation="vertical" className="mx-1 h-7" />

    <div className="flex shrink-0 items-center gap-2 rounded-md border bg-muted/30 px-2 py-1">
      <Type className="h-4 w-4" />

      <Input
        disabled={!activeCell || role == "viewer" }
        type="color"
        className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
        value={currentStyle.textColor ?? "#000000"}
        onChange={(e) =>
          styleUpdate(ystyles, activeCell!, {
            textColor: e.target.value,
          })
        }
      />
    </div>

    <div className="flex shrink-0 items-center gap-2 rounded-md border bg-muted/30 px-2 py-1">
      <PaintBucket className="h-4 w-4" />

      <Input
        disabled={!activeCell || role == "viewer" }
        type="color"
        className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
        value={currentStyle.backgroundColor ?? "#ffffff"}
        onChange={(e) =>
          styleUpdate(ystyles, activeCell!, {
            backgroundColor: e.target.value,
          })
        }
      />
    </div>

    <Separator orientation="vertical" className="mx-1 h-7" />

    <Button
      disabled={!activeCell || role == "viewer" }
      size="icon"
      className="h-9 w-9 shrink-0"
      variant={currentStyle.textAlign === "left" ? "default" : "outline"}
      onClick={() =>
        styleUpdate(ystyles, activeCell!, {
          textAlign: "left",
        })
      }
    >
      <AlignLeft className="h-4 w-4" />
    </Button>

    <Button
      disabled={!activeCell || role == "viewer" }
      size="icon"
      className="h-9 w-9 shrink-0"
      variant={currentStyle.textAlign === "center" ? "default" : "outline"}
      onClick={() =>
        styleUpdate(ystyles, activeCell!, {
          textAlign: "center",
        })
      }
    >
      <AlignCenter className="h-4 w-4" />
    </Button>

    <Button
      disabled={!activeCell || role == "viewer" }
      size="icon"
      className="h-9 w-9 shrink-0"
      variant={currentStyle.textAlign === "right" ? "default" : "outline"}
      onClick={() =>
        styleUpdate(ystyles, activeCell!, {
          textAlign: "right",
        })
      }
    >
      <AlignRight className="h-4 w-4" />
    </Button>
  </div>
);
};

export default ToolBar;